# Keys for forlders and files to save data and meta data.
# Things about keys.
# keys contain prefix, it's rules must set up.

import os


import tools # ./tools.py take care sys.path appending
import config_dir
_prefixes = config_dir.get_s3_prefix()


def folder_meta(_path):
    '''get s3key of_folder_meta
    '''
    return os.path.join(_prefixes["folder_meta"], _path)


def name_space(prefix, _path, _uuid):
    root = getroot(_path)
    s3key = os.path.join(
            prefix,
            root,
            _uuid)
    return s3key


def folder_name_space(_path, _uuid):
    ''' get s3key for folder name space
    '''
    prefix = _prefixes['folder_name_space']
    return name_space(prefix, _path, _uuid)


def file_content(_path):
    '''get s3key for file content
    '''
    return os.path.join(_prefixes["file"], _path)


def file_meta(_path):
    '''get s3key for file meta
    '''
    return os.path.join(_prefixes["file_meta"], _path)


def file_name_space(_path, _uuid):
    ''' get s3key for file name space
    '''
    prefix = _prefixes['file_name_space']
    return name_space(prefix, _path, _uuid)

def getroot(_path):
    return _path.split('/')[0]


