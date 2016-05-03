# Replace and conflict with ./pathes.py
# 2016 0501

import os
import config_dir as cdir


class LocalPrefix():
    def __init__(self, base_path=None):
        self.prefix = cdir.get_prefix_settings_for_local_files()

        self.modify_base(base_path = base_path)


    def modify_base(self, base_path=None):
        j = self.prefix
        if base_path:
            j['default_base_path'] = base_path

        base_path = os.path.expanduser(j['default_base_path'])
        base_path = os.path.abspath(base_path)
        j['base_path'] = base_path

        j['file_prefix'] = os.path.join(base_path, j['file_dir_name'])
        j['meta_prefix'] = os.path.join(base_path, j['meta_dir_name'])
        j['ns_prefix']   = os.path.join(base_path, j['ns_dir_name'])

        return j


    def get_file_path(self, file_target_path):
        p1 = os.path.join(self.prefix['file_prefix'], file_target_path)
        return p1


    def get_meta_prefix(self, file_target_path):
        p1 = os.path.join(self.prefix['meta_prefix'], file_target_path)
        p2 = p1 + '.json'
        return p2


    def get_ns_prefix(self, file_target_path):
        p1 = os.path.join(self.prefix['ns_prefix'], file_target_path)
        p2 = p1 + '-ns'
        return p2

if __name__ == "__main__":
    from pprint import pprint

    loc_file = '/tmp/tt1.mp4'
    target_file = 'tmp/public/tt1.mp4'

    p = LocalPrefix()

    fpath = p.get_file_path(target_file)
    mpath = p.get_meta_prefix(target_file)
    npath = p.get_ns_prefix(target_file)
    pprint(p.prefix)
    print fpath, mpath, npath

    p.modify_base('/tmp/tmp2')
    pprint(p.prefix)
    print mpath, npath
