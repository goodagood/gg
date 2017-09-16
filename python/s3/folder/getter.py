# retrieve things like folder meta, file meta and such.
# 2016 0402

import os
import json

import s3.folder.klass as klass




def folder_meta(_path):
    f = folder(_path)
    return f.retrieve_meta()


def folder(_path):
    f = klass.Folder(_path)
    f.retrieve_meta()
    return f


def list_files(cwd, pattern):
    ''' List online files in 'cwd', with regular
    '''
    if type(cwd) is not str:
        raise Exception('string of cwd path needed in list vids')

    fo = folder(cwd)
    infos = fo.grep_file_info(pattern)
    for info in infos:
        file_path = os.path.join(cwd, info['name'])
        info['path'] = file_path

    #print infos
    return infos


### ###

if __name__ == "__main__":
    from pprint import pprint
    print('getter.py __name__ == "__main__"')
    #pprint(folder_meta('tmp'))

    #tp = folder('tmp/public')

    #ms = list_files('tmp/public', '^h') #?

    f = klass.Folder('tmp/public')
    f.calculate_meta_s3key()
    print(f.meta)
