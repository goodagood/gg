
# When user want file meta list in folder cache, it means no seperate reading
# for file metas.
# 2016 0603


import s3.folder.getter
import ggroot.permission.guess as guess


def _get_cached_files(cwd):
    '''
    cwd: the folder path
    '''
    fo = s3.folder.getter.folder(cwd)
    #m = fo.meta
    c = fo.get_cache()
    #print(c.keys())
    files = c['files']
    return files, fo




def list_metas_for_user(username, cwd):

    # files is dict, {name: {file meta}, ...}
    # fo is the folder object
    files, folder_obj = _get_cached_files(cwd)

    file_metas = files.values()

    collecting = []
    for m in file_metas:
        control = guess.base_on_meta_with_default(m, folder_obj.control)
        if control.can_be_read_by(username):
            collecting.append(m)

    return collecting
