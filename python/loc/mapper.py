#
# A class represent local file information.
#
# The meta and name spaces will be set up locally.
#

import os
#import stat
#import mimetypes

#import pathes
import prefix

import config_dir
#import imgvid.poster
#import imgvid.thumb
#import util.mis as util

import s3.file.getter
import s3.crud


# meta_path
#

class DownMapper(object):
    ''' Map a remote(oneline) file to local machine.

    For example:
      local file is:   /base/file/prefix/user-name/public/abc.png,
      remote file is:                    user-name/public/abc.png.

    self.remote: remote file's path
    self.rf: remote file obj

    self.local:   local file's path
    self.lf:   local file obj

    local file gets pathes:
        self.lm['pathes']
        p['file'] : base-prefix/gg/remote/path/file-name.extension
        p['meta'] : base-prefix/meta/remote/path/file-name.extension.json
        p['name_space'] : base-prefix/ns/remote/path/file-name.extension-ns

    '''

    def __init__(self, remote, base_prefix=None):

        self.prefix = prefix.LocalPrefix(base_prefix)

        self.remote = remote
        self.rf    = None
        self.rm    = {}
        self.local = None
        self.lf    = None
        self.lm    = {}


    def set_base(self, base_path):
        self.prefix.modify_base(base_path)


    def get_remote_file(self):
        remote_file_obj = s3.file.getter.file_with_meta(self.remote)
        self.rf = remote_file_obj
        self.rm = self.rf.meta
        return self.rf


    def calculate_prefixes(self):
        # local file's meta
        p = self.lm['pathes'] = {}

        p['file'] = self.prefix.get_file_path(self.remote)
        p['meta'] = self.prefix.get_meta_prefix(self.remote)
        p['name_space'] = self.prefix.get_ns_prefix(self.remote)



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


    def mk_dir_in_ns(self, dir_name):
        _dir = os.path.join(self.lm['pathes']['name_space'], dir_name)
        os.makedirs(_dir)

    def download_file(self):
        ''
        with open(self.lm['pathes']['file'], 'wb') as f:
            f.write(s3.crud.get_body(self.rm['s3key']).read())



if __name__ == "__main__":
    remote   = 'tmp/public/h5.html'

    def check_0501():
        m = DownMapper(remote)
        m.calculate_prefixes()
        m.prepare_prefixed_dirs()
        m.get_remote_file()
        m.download_file()


        return m


    m = check_0501()
