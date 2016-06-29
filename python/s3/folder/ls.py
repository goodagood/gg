
import s3.folder.inherit_perm as folder_permission
from . import getter

def ls_meta_in_cwd(username, folder_path):
    fo = getter.folder(folder_path)
    return ls_meta(username, fo)


def ls_meta(username, fo):
    '''
    Make sure fo (folder object) has control of permission.
    '''
    cwd = fo.meta['path'] #d
    fm = fo.meta
    if 'permission' not in fm:
        folder_control = folder_permission.inherit_permission_control(fo)
    else:
        folder_control = fo.control

    ms = fo.cached_file_metas().values()

    gather = []
    for m in ms:
        control = guess_file_control(m) or folder_control

        if control.can_be_read_by(username):
            gather.append(m)
            pass
        pass

    return gather




import ggroot.permission.per as Perm
def guess_file_control(info):
    '''
    File might have no meta data, so it should inherit folder's control.
    '''

    if 'permission' in info:
        control = Perm.Permission(cfg)
    else:
        return None


