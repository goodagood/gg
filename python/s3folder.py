# 2016 0401

import os

import config_dir
import util.mis as myutil
import s3.keys as keys

class Folder:
    def __init__(self, _path):
        self._meta = {}
        self._meta['path'] = _path

        self._prefixes = config_dir.get_s3_prefix()

    def get_meta(self):
        return self._meta

    def set_meta(self, meta):
        self._meta = meta

    def calculate_meta_s3key(self):
        self._meta["meta_s3key"] = keys.folder_meta(self._meta['path'])

        #self._meta["meta_s3key"] = os.path.join(
        #        self._prefixes["folder_meta"],
        #        self._meta["path"])

        return self._meta["meta_s3key"]


    def calculate_name_space_prefix(self):
        '''
        '''
        if 'uuid' not in self._meta:
            self._meta["uuid"] = myutil.getuuid()

        # folder's name space depend on root, not owner
        # root and owner can be different, for example, user Tom create a
        # folder 'by-tom' in Jim's folder: jim/has/the/folder/by-tom
        # where Tom is owner, but root is 'jim'

        #root = getroot(self._meta['path'])
        #if 'owner' not in self._meta:
        #    self._meta["owner"] = root

        #folder_name_space_prefix = self._prefixes['folder_name_space']
        #s3key = os.path.join(
        #        folder_name_space_prefix,
        #        root,
        #        self._meta['uuid'])

        self._meta['name_space_prefix'] = keys.folder_name_space(
                self._meta['path'], self._meta['uuid'])
        return self._meta['name_space_prefix']


def getroot(_path):
    return _path.split('/')[0]

''' from js

/*
 * folder_info:
 *   {
 *      uuid:
 *      path:
 *      //owner: 'actually the root'
 *   }
 */
'''

########

from pprint import pprint

def test_a():
    folder = Folder('tmp')
    folder.calculate_meta_s3key()
    folder.calculate_name_space_prefix()
    pprint(folder.get_meta())

if __name__ == "__main__":
    print('__name__ == "__main__"')
    test_a()
