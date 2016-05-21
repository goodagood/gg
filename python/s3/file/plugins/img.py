
import os
from wand.image import Image
import mimetypes

import s3.crud
import s3.file.klass
import util.mis


Tmp_static_img_dir = '/home/ubuntu/workspace/gg/plain/static/tmp/img'
Tmp_static_img_url = '/static/tmp/img/'


def file_name_ok(file_name):
    mime = mimetypes.guess_type(file_name)[0]
    if not mime:
        return False

    return mime.lower().find('image') >= 0


class File(s3.file.klass.File):
    ''' Image file class

    s3.file.klass.File get: __init__(path)
    '''

    def type_ok(self):
        if 'type' not in self.meta:
            super(File, self).guess_type()

        if 'image' in self.meta['type']:
            return True

        return False


    def get_body(self):
        ''' Load image file, make it self.img
        '''
        fi.calculate_keys()
        body = s3.crud.get_body(self.meta['s3key'])
        return body

    def load(self):
        ''' Load image file, make it self.img
        '''
        body = s3.crud.get_body(self.meta['s3key'])
        self.img = Image(file=body)

        #with Image(file=body) as img:
        #    print img.size
        #    self.img = img

        #print self.img.size
        return self.img


    def resize(self, width, height):
        ''' resize to width and height, return a clone

        image must be loaded before hand.
        '''
        img = self.img.clone()
        img.resize(width, height)
        return img


    def resize_h(self, height):

        img = self.img.clone()
        ratio = height * 1.0 / self.img.height
        img.resize(int(ratio * img.width), height)
        return img
        #img.save(filename = thumb_path)


    def thumb_blob(self, height):
        img = self.resize_h(height)
        return img.make_blob()


    def thumb_tmp(self, width, height):
        thumb_name = util.mis.getuuid() + os.path.splitext(
                self.meta['path'])[1]
        thumb_path = os.path.join(Tmp_static_img_dir, thumb_name)
        thumb_url  = os.path.join(Tmp_static_img_url, thumb_name)
        thumb = self.resize(width, height)
        thumb.save(filename = thumb_path)
        return thumb_url

    def as_li(self):
        sli = super(File, self).as_li()
        print sli


def get_image(file_path):
    fi = File(file_path)
    fi.calculate_keys()

    if fi.is_meta_in_s3():
        fi.retrieve_meta()
    else:
        fi.calculate_prefix_and_keys()

    meta = fi.get_meta()
    if s3.crud.key_exists(meta['s3key']):
        fi.load()
        return fi
    else:
        return None
    #fi.resize(80,80)


if __name__ == "__main__":

    file_path = "tmp/public/t1.png"

    #fi = File(file_path)

    def c0419a(file_path = file_path):
        fi = File(file_path)
        fi.calculate_keys()

        if fi.is_meta_in_s3():
            fi.retrieve_meta()
        else:
            fi.calculate_prefix_and_keys()


        #fi.load()
        #fi.resize(80,80)
        return fi

    fi = get_image(file_path)
    url = fi.thumb_tmp(128, 72)
