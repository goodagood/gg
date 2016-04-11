
import path_setting

import s3.asker
import getter
import klass

def new_root(name):
    '''
    '''
    folder = klass.Folder(name)
    folder.set_owner(name)
    folder.set_attr('name', name)
    folder.make_up_basic_meta()
    #folder.calculate_meta_s3key()
    #folder.calculate_name_space_prefix()
    folder.save_meta()
    return folder


def safe_new_root(name):
    if not s3.asker.folder_exists(name):
        r = new_root(name)
    else:
        r = getter.folder(name)
    return r


### ###
from pprint import pprint

def test_a(name='tmp'):
    r = safe_new_root(name)

    r.new_sub_folder('gg')
    #r.new_sub_folder('public')
    #r.new_sub_folder('muji')

    pprint(r.get_meta())

if __name__ == "__main__":
    print('adder.py __name__ == "__main__"')
    test_a()
