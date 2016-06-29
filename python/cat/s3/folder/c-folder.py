
import s3.folder.klass as FC
import s3.folder.getter

import s3.file.getter

import ggroot.permission.guess as guess


def reset_permission(cwd):
    '''
    doing
    '''
    f = FC.Folder(cwd)
    m  = f.retrieve_meta()

    print(m['path'])
    print(m.keys())

    print(m['permission'])
    f.set_permission_control()
    f.save_meta()


def reset_files_permission(cwd):
    '''
    doing, just start
    '''
    f = s3.folder.getter.folder(cwd)
    m = f.meta
    c = f.get_cache()
    print(c.keys())
    files = c['files']


def reset_one_file_permission(file_path):
    fi = s3.file.getter.get_file(file_path)
    if fi.is_meta_in_s3():
        fi.retrieve_meta()
    else:
        print(' no meta in s3: ', file_path)

    m = fi.meta
    if 'owner' not in m:
        fi.make_up_basic_meta()

    fi.set_permission_control()

    # some file can have no meta saved.
    if fi.is_meta_in_s3():
        fi.save_meta()
    return fi


def get_cached_files(cwd):
    '''
    doing, just start
    '''
    f = s3.folder.getter.folder(cwd)
    #m = f.meta
    c = f.get_cache()
    #print(c.keys())
    files = c['files']
    return files, f


def check_file_permission(meta):
    '''
    meta can be simplified
    '''
    files, fo = get_cached_files(cwd)
    tt1webm = files['tt1.webm']
    #ctt1 = guess.base_on_meta(tt1webm)

    for name, meta in files.items():
        c = guess.base_on_meta_with_default(meta, fo.control)
        print("\r\n")
        print(name)
        print(c.get_settings())



def list_meta_for_user(username, folder_obj):
    files, fo = get_cached_files(cwd)

    file_metas = files.values()

    collecting = []
    for m in file_metas:
        control = guess.base_on_meta_with_default(m, fo.control)
        if control.can_be_read_by(username):
            collecting.append(m)

    return fo, files, collecting


if __name__ == "__main__":
    print('__name__ == "__main__"')
    #tmp, kk = test_a()

    cwd = 'tmp/public' # working dir
    file_path = 'tmp/public/tt1.webm'

    #fi = reset_one_file_permission(file_path)

    # tmp is the folder, fis: files
    tmp, fis, okmetas = list_meta_for_user('tmp', 'tmp/public')


