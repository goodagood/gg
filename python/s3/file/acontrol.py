
from . import getter

import s3.folder.getter
import s3.folder.inherit_perm as foperm # permission


def get_file_control(file_path):
    '''
    File might have no meta data, so it should inherit folder's control.
    '''
    f = s3.file.getter.get_file(file_path)

    if not f.is_meta_in_s3():
        return cwd_permission(f)

    # control of permission will be set if 'permission' data in meta
    f.retrieve_meta()
    if 'permission' in f.meta:
        return f.control

    return cwd_permission(f)



def cwd_permission (file_obj):
    '''
    get permission from folder, cwd
    '''
    # folder object:
    fo = file_obj.get_folder()
    fm = fo.meta

    if('permission' in fm):
        control = fo.control
        return control
    else:
        return foperm.inherit_permission_control(fo)


