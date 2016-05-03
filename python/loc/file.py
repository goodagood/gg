#
# A class represent local file information.
#
# The meta and name spaces will be set up locally.
#

import os
import stat
import mimetypes

import pathes
import prefix

import config_dir
import imgvid.poster
import imgvid.thumb
import util.mis as util
import s3.file.getter


# meta_path
#

class File(object):
    ''' File in local machine, make sure it has target_path.

    target_path is where is will be put online to gg file system.
    For example: local file is /tmp/abc.png,
    target is                  user-name/public/abc.png.

    self.meta: local file's meta
    self.tm:   target file's meta
    self.tf:   target file, self.tf.meta == self.tm
    '''

    def __init__(self, _path=None, info = None):
        self.meta = {}
        if type(info) == dict:
            self.meta = info

        if _path:
            self.meta['path'] = _path
        else:
            return

        if 'name' not in self.meta:
            self.meta['name'] = os.path.basename(self.meta['path'])

        if 'size' not in self.meta:
            self.osstat()
        if 'type' not in self.meta:
            self.mime()

        self.calculate_prefixes()


    def osstat(self):
        s = os.stat(self.meta['path'])

        self.meta['stat']  = s
        self.meta['size']  = s.st_size
        self.meta['ctime'] = s.st_ctime
        self.meta['atime'] = s.st_atime
        self.meta['mtime'] = s.st_mtime
        self.meta['milli'] = int(s.st_ctime * 1000)
        self.meta['isDir'] = stat.S_ISDIR(s.st_mode)
        self.meta['isFile'] = stat.S_ISREG(s.st_mode)


    def mime(self):
        self.meta['type'] = mimetypes.guess_type(self.meta['path'])[0]
        self.meta['mime'] = self.meta['type']


    def set_target_path(self, target_path):
        self.meta['target_path'] = target_path


    def make_target_file(self):
        if 'target_path' in self.meta:
            target_file = s3.file.getter.file_with_meta(self.meta['target_path'])
            self.tf = target_file
            self.tm = self.tf.meta
            return self.tf
        else:
            raise Exception("don't know target file path")


    def calculate_prefixes(self):
        self.prefix = prefix.LocalPrefix(base_prefix)

        # local file's meta
        p = self.meta['pathes'] = {}

        p['file'] = self.prefix.get_file_path(self.remote)
        p['meta'] = self.prefix.get_meta_prefix(self.remote)
        self.meta_path = p['meta']

        p['name_space'] = self.prefix.get_ns_prefix(self.remote)
        self.ns_prefix = p['name_space']


    def prepare_prefixed_dirs(self):
        p = self.lm['pathes']

        file_dir = os.path.dirname(p['file'])
        if not os.path.exists(file_dir):
            print(file_dir)
            os.makedirs(file_dir)

        meta_dir = os.path.dirname(p['meta'])
        if not os.path.exists(meta_dir):
            print(meta_dir)
            os.makedirs(meta_dir)

        ns_dir = p['name_space']
        if not os.path.exists(ns_dir):
            print(ns_dir)
            os.makedirs(ns_dir)


    #test...
    def upload_file(self):
        rmeta = s3.file.getter.file_meta(self.meta['target'])
        s3.crud.put_file(rmeta['s3key'], self.meta['path'])



if __name__ == "__main__":
    loc_file = '/tmp/tt1.mp4'
    target   = 'tmp/public/tt1.mp4'

    def check_loc(loc_file=loc_file, target_path=target):
        f = File(loc_file)
        #f.meta = meta
        f.set_target_path(target_path = target)
        print f.meta
        return f

    f = check_loc()
    tp = f.meta['target_path']
