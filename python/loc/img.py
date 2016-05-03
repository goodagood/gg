
#
# Local image file, which is targeted to be put on {'target': target_path}
#
# meta['target_file'] : the s3 file object
# meta['target_file'].meta : the meta of s3 file object, call it 'tm'
#   tm:
#     {
#      '... regular file attributes, thumbs means saved meta and name space',
#
#      'thumbnails':{
#                    'h80':  {
#                              'key': name-space-prefix/h80.png for example
#                              'height': 80 # then width will be in ratio.
#                             }
#                    'w..h..':{
#                              'key': name-space-prefix/w..h...ext,
#                              'height': 
#                              'width': 
#                             }
#                    ...      
#                   }
#     }

import os

import loc.file
import util.mis as util
import s3.crud
import s3.file.getter
import imgvid.thumb

class File(loc.file.File):
    def __init__(self, _path, info=None):
        ''' If want target path set: info['target'] = 'online file path'
        '''
        print("self.__class__: %s"%self.__class__)
        super(File, self).__init__(_path, info)


    def make_tmp_file_names(self):
        ''' Make tmp files in local machine as: /tmp/uuid.ext
        '''
        # Target is the file path put online
        ext = os.path.splitext(self.meta['target'])[1]

        self.meta['tmp_files'] = tfiles = {}
        tfiles['thumb0'] = os.path.join('/tmp', util.getuuid()) + '.png'
        tfiles['img'] = os.path.join('/tmp', util.getuuid()) + ext


    def thumb0(self, height=80):
        ipath = self.meta['path']
        tpath = self.meta['tmp_files']['thumb0']
        imgvid.thumb.resize_h(ipath, tpath, height)

        name = self.thumb_name(height= height)

        tfm = self.meta['target_file_meta']

        key = os.path.join(tfm['name_space_prefix'], name)

        mark = self.thumb_mark(height=height)

        thumbnails = tfm['thumbnails']
        print('thumb mark: ', mark)
        thumbnails[mark] = {
                "key": key,
                "height": 80
                }
        pass

    def set_thumbnails_data_structure(self):
        tm  = self.meta['target_file_meta']

        if 'thumbnails' not in tm:
            tm['thumbnails'] = thumbnails = {}
        else:
            thumbnails = tm['thumbnails']

        return thumbnails


    def thumb_mark(self, width=None, height=None):
        mark = ""

        if width != None:
            mark += "w%s"%width
        if height != None:
            mark += "h%s"%height
        return mark

    def thumb_name(self, width=None, height=None, img_ext=".png"):
        name = "thumb-"
        name += self.thumb_mark(width, height)
        return name + img_ext


    def set_target_file(self, target_path=None):
        if target_path:
            self.meta['target'] = target_path
        if 'target' in self.meta:
            target_file = s3.file.getter.file_with_meta(self.meta['target'])
            self.meta['target_file'] = target_file
            self.meta['target_file_meta'] = self.meta['target_file'].meta
            return target_file


    def upload(self):
        tm = self.meta['target_file'].meta
        s3.crud.put_file(tm['s3key'], self.meta['path'])


    def upload(self):
        target_file = self.meta['target_file']
        target_meta = self.meta['target_file_meta']
        s3.crud.put_file(target_meta['s3key'], self.meta['path'])
        self.upload_thumb0()
        target_file.save_meta()

        target_folder = target_file.get_folder()
        target_folder.add_file_in_ns(target_meta)

    def upload_thumb0(self): #d
        # target file meta:
        tm = self.meta['target_file_meta']

        #for k in self.meta['tmp_files']:
        #    if k.startswith('thumb'):
        #        #do an upload?

        lthumb = self.meta['tmp_files']['thumb0']
        rthumb = tm['thumbnails']['h80']['key'] # s3 key

        s3.crud.put_file(rthumb, lthumb)
        self.meta['target_file'].save_meta()

    def rm_tmp(self):
        for i in self.meta['tmp_files']:
            _path = self.meta['tmp_files'][i]
            if os.path.exists(_path):
                print("remove %s"%_path)
                os.remove(_path)

    #test...
    def download_img(self):
        ''' Download the target image so it can be processed locally.
        '''
        if 'tmp_files' in self.meta:
            loc_file = self.meta['tmp_files']['img']

            pass

            if 'target_file_meta' in self.meta:
                tfm = self.meta['target_file_meta']
                s3key = tfm.meta['s3key']
                #...
                body = s3.crud.get_body(s3key)
                with open(loc_file, 'w') as file:
                    file.write(body)



if __name__ == "__main__":
    loc_img_file = '/tmp/t.png'
    target = 'tmp/public/t.png'

    limg = File(loc_img_file, {'target': target})
    limg.make_tmp_file_names()
    limg.set_target_file()
    lm = limg.meta
    tm = limg.meta['target_file_meta']

    limg.set_thumbnails_data_structure()
    limg.thumb0()
