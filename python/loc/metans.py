#
# 'meta' and 'name space' for local file.
# ./mapper.py got myself confused, do it by 'meta and name space' for
# local files.
# 2016 0505
#

import os

import prefix


class MetaNameSpace(object):
    def __init__(self, online_file_path, base='/tmp'):
        '''
        set up meta and name space for a mirror,
        it is local file pair with the online file.
        '''
        self.online_path_ = online_file_path # target file path
        self.base_  = base

        self.prefix_conf = prefix.LocalPrefix(self.base_)

        # default actions
        self.find_prefixes()
        self.make_auxilary_dirs()


    def find_prefixes(self):
        self.mirror_path_ = self.prefix_conf.get_mirror_file_path(self.online_path_)
        self.meta_path_   = self.prefix_conf.get_meta_path(self.online_path_)
        self.ns_prefix_   = self.prefix_conf.get_ns_prefix(self.online_path_)


    def make_auxilary_dirs(self):

        file_dir = os.path.dirname(self.mirror_path_)
        if not os.path.exists(file_dir):
            print('makedirs: ', file_dir)
            os.makedirs(file_dir)

        meta_dir = os.path.dirname(self.meta_path_)
        if not os.path.exists(meta_dir):
            print('makedirs: ', meta_dir)
            os.makedirs(meta_dir)

        ns_dir = self.ns_prefix_
        if not os.path.exists(ns_dir):
            print(ns_dir)
            os.makedirs(ns_dir)




if __name__ == "__main__":
    online_img = 'tmp/public/t1.png'

    mns = MetaNameSpace(online_img, '/tmp')
    mns.find_prefixes()
    print(mns.mirror_path_, mns.meta_path_, mns.ns_prefix_)
    mns.make_auxilary_dirs()


