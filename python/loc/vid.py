
#
# Local image file
#

import os
import re
import mimetypes

import loc.mirror
import util.mis as util
import s3.crud
import s3.file.getter
import imgvid.thumb
import imgvid.poster
import imgvid.vidext as vidext


# data structure:
#          loc-path:         The local file path, including name.extension
#          file-path:        The online file path, including name.extension
#  base/gg/file-path:        The file
#  base/meta/file-path.json: The file meta
#  base/ns/file-path-ns:     The file name space

class File(loc.mirror.File):
    '''
    self.target_path : target (remote) file path
    '''

    #def __init__(self, local_file_path):
    #    super(self.__class__, self).__init__(local_file_path)
    #    self.base = '/tmp'

    version = "mirror-of-video-file.2016.0508"

    def name_poster0(self):
        '''
        name: seconds.milli.png
        '''
        filename = '0.0.png'
        return os.path.join(self.mns.ns_prefix_, 'posters', filename)


    def poster0(self):
        '''
        Make a poster at the start of the video, so it's '00:00...'
        '''
        output_path = self.name_poster0()

        print("make poster %s"%output_path)
        # poster at 0 second
        imgvid.poster.make_poster(self.mns.mirror_path_, '00:00:00.000',
                output_path)


    def name_thumb(self, seconds=0.0, width=None, height=80):
        '''
        name: seconds.milli.w--.h--.png
        w--:  width, such as w128, in pixels
        '''
        name = 'thumb-'
        name += str(seconds)

        if width:
            name += 'w' + str(width)
        if height:
            name += 'h' + str(height)

        name += '.png'
        return os.path.join(self.mns.ns_prefix_, 'posters', name)


    def thumb0(self, height=80):
        '''
        '''
        poster_file = self.name_poster0()
        thumb_file = self.name_thumb(height=height)

        imgvid.thumb.resize_h(poster_file, thumb_file, height)


    def thumb160(self, height=160):
        '''
        '''
        poster_file = self.name_poster0()
        thumb_file = self.name_thumb(height=height)
        #print(poster_file, thumb_file)

        imgvid.thumb.resize_h(poster_file, thumb_file, height)


    # current server run minutes for a single change, and it hang after
    # running.
    def new_extension(self, ext):
        '''
        Change video file format, for example: name.mp4 --> name.webm

        ext: mp4, webm, flv, ogg, ...
        '''
        in_file = self.mns.mirror_path_

        filename = re.sub('\.[^.]+$', self.name_, '.'+ext)
        out_file = os.path.join(self.mns.ns_prefix_, 'formats', filename)

        print(in_file, out_file)
        vidext.clone(in_file, out_file)


    def upload_poster0(self):
        '''
        Upload poster0 and it's thumbnail, which is at 0.0 seconds
        '''
        # target file meta:
        if not hasattr(self, 'tm'):
            self.get_target_file()
        tm = self.tm

        poster_local = self.name_poster0()
        poster_s3key = self.tf.poster0_s3key()

        thumb_local = self.name_thumb()
        thumb_s3key = self.tf.thumb0_s3key()
        print(poster_local, poster_s3key, thumb_local, thumb_s3key)

        s3.crud.put_file(poster_s3key, poster_local)
        s3.crud.put_file(thumb_s3key, thumb_local)

        self.build_online_meta()
        self.tf.save_meta()


    def shortcuts_in_meta(self):
        pass


    #c
    def rm_tmp(self):
        for i in self.meta['mapper']:
            _path = self.meta['mapper'][i]
            if os.path.exists(_path):
                print("remove %s"%_path)
                os.remove(_path)

    #...
    def download_vid(self):
        if 'mapper' in self.meta:
            pass
        if 'target_file' in self.meta:
            fi = self.meta['target_file']
            s3key = fi.meta['s3key']
            #...
            pass


def file_name_ok(file_name):
    mime = mimetypes.guess_type(file_name)[0]
    if not mime:
        return False

    return mime.lower().find('video') >= 0



# not tested
if __name__ == "__main__":
    vidfile = '/tmp/tt1.mp4'

    target  = 'tmp/public/tt1.mp4'
    fp1 = 'tmp/public/cat-food.mp4'

    def make_vid(online_file_path):
        vf = File(online_path=online_file_path)
        #vf.osstat()
        #vf.mime()

        return vf


    vf = make_vid(fp1)
    print vf.name_
    print('name poster0: ', vf.name_poster0())
    print('name thumb0: ', vf.name_thumb(height=80))

    vf.poster0()
    #vf.thumb0()
    #tf = vf.meta['target_file']
    #tm = tf.meta
