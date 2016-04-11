# check and fix meta['cache']
# fix from meta s3key

import re
#import os
from pprint import pprint

import path_setting

import users_a as users
import getter

import s3.crud
import s3.keys

def all_users():
    names = users.get_all_names()
    for name in names:
        recursive_fix(name)

def recursive_fix(_path):
    print(" -- {0} ".format(_path))
    folder = getter.folder(_path)
    sub_pathes = get_possible_sub_folder_pathes(_path)
    redo_add_subs(folder, sub_pathes)
    for p in sub_pathes:
        recursive_fix(p)


def get_possible_sub_folder_pathes(_path):
    ''' get
    '''
    # get dir(folder) object
    dobj = getter.folder(_path)
    meta = dobj.get_meta()
    s3key= meta['meta_s3key']

    # this will bring all of extras:
    # s3key/sub-folders ... This is ok
    # s3keya-something...   These not wanted
    # s3keyb.something...   These not wanted
    # we need to filter it out
    objs = s3.crud.list_obj(s3key)

    # s3key is the path?
    keys = [o['Key'] for o in objs]

    # Still, the filter can leave un-wanted things
    re_path = re.compile( r"\b" + _path + r"\b")
    filted_keys = [k for k in keys if re_path.search(k) and k != s3key]
    #print('filted keys: ', filted_keys)

    prefix_part = s3.keys.folder_meta('')
    pathes = [key.replace(prefix_part, '') for key in filted_keys]
    #print('get the pathes : ', pathes)

    return pathes


def redo_add_subs(folder, pathes):
    pprint(('    redo add subs: ', pathes))
    for p in pathes:
        add_one_sub(folder, p)

    folder.save_meta()


def add_one_sub(folder, sub_path):
    smeta = getter.folder_meta(sub_path)
    folder.add_file(smeta)



if __name__ == "__main__":
    print __name__
    #pa = get_possible_sub_folder_pathes('tmp')
