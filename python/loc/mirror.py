#
# A class represent local file information.
#
# The meta and name spaces will be set up locally.
#

import os
import stat
import mimetypes

import metans
import prefix
import up
import down


import s3.file.getter
import config_dir
import imgvid.poster
import imgvid.thumb
import util.mis as util


# meta_path
#

class File(object):
    def __init__(self,
            online_path, # must, naturally
            local_path = None,
            base       = '/tmp'
            ):

        '''
        Once we setup mirror, local file will be copied to 'base'/oneline-path

        It's meaningless if not going to put file oneline

        File in local machine, make sure it has target_path.

        target_path is where is will be put online to gg file system.
        For example: local file is /tmp/abc.png,
        target is                  user-name/public/abc.png.

        self.meta: local file's meta
        self.tm:   target file's meta
        self.tf:   target file, self.tf.meta == self.tm
        '''

        self.meta = {}

        self.online_path_ = online_path
        self.local_path_  = local_path
        self.base_        = base

        self.mns          = metans.MetaNameSpace(self.online_path_, self.base_)

        if not hasattr(self, 'name'):
            self.name_ = os.path.basename(self.online_path_)
        if not hasattr(self, 'type'):
            self.mime()

        # If there is local_path_ when initializing, we get info from it.
        if hasattr(self, 'local_path_'):
            if not hasattr(self, 'size'):
                self.osstat(self.local_path_)



    def upload(self):
        '''This upload file content, do nothing for online meta data and
        folder cache.
        '''
        if not self.online_path_:
            raise Exception('to upload we need online path')
        if not self.local_path_:
            raise Exception('to upload we need local path')
        up.upload(self.local_path_, self.online_path_)


    def download(self):
        '''This download file content
        '''
        if not self.online_path_:
            raise Exception('to download we need online path')
        if not self.local_path_:
            raise Exception('to download we need local path')
        down.download(self.local_path_, self.online_path_)


    def mirror_down(self):
        '''This download file to self.mirror_path_
        '''
        if not self.online_path_:
            raise Exception('to download we need online path')
        if not self.mns.mirror_path_:
            raise Exception("to mirror down we need mirror path, in base")
        down.download(self.online_path_, self.mns.mirror_path_)


    def isfile_mirror_path(self):
        return os.path.isfile(self.mns.mirror_path_)


    def osstat(self, file_path=None):
        '''
        Get stat of the mirrored local file
        '''
        if file_path:
            s = os.stat(file_path)
        else:
            s = os.stat(self.mns.mirror_path_)

        self.meta['stat']  = s
        self.meta['size']  = s.st_size
        self.meta['ctime'] = s.st_ctime
        self.meta['atime'] = s.st_atime
        self.meta['mtime'] = s.st_mtime
        self.meta['milli'] = int(s.st_ctime * 1000)
        self.meta['isDir'] = stat.S_ISDIR(s.st_mode)
        self.meta['isFile'] = stat.S_ISREG(s.st_mode)


    def mime(self):
        self.meta['type'] = mimetypes.guess_type(self.online_path_)[0]
        self.meta['mime'] = self.meta['type']


    def get_target_file(self):
        if hasattr(self, 'online_path_'):
            self.tf = s3.file.getter.file_with_meta(self.online_path_)
            self.tm = self.tf.meta
            return self.tf
        else:
            raise Exception("don't know target file path")


    def build_online_meta(self):

        # All protective ways to set it up
        if not hasattr(self, 'tf'):
            self.get_target_file()

        self.ometa = self.tm

        if 'size' not in self.ometa:
            #.?
            self.osstat()
            self.ometa['size'] = self.meta['size']

        if 'type' not in self.ometa:
            self.mime()
            self.ometa['type'] = self.meta['mime']

        #...



if __name__ == "__main__":
    local_file = '/tmp/tt1.mp4'
    online_img = 'tmp/public/t1.png'

    target   = 'tmp/public/tt1.mp4'

    def check_0505():
        f = File(online_img)
        return f

    i = check_0505()
    i.mirror_down()
