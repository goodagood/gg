# An asker asks question to learn conditions.
# Functions to ask if folder or file exists.


import keys
import crud

def folder_exists(_path):
    '''
    '''
    meta_s3key = keys.folder_meta(_path)
    return crud.key_exists(meta_s3key)



if __name__ == "__main__":
    print('__name__ == "__main__", asker.py')
    print(folder_exists('tmp'))
