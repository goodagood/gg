
import s3.file.acontrol

import s3.file.getter
import s3.folder.getter


def file_control(file_path):
    '''
    File might have no meta data, so it should inherit folder's control.
    '''
    f = s3.file.getter.get_file(file_path)

    #cwd = os.path.dirname(file_path)
    if not f.is_meta_in_s3():
        return cwd_permission(f)
        #fo = f.get_folder()
        #control = fo.control
        #return control

    # control of permission will be set if 'permission' data in meta
    f.retrieve_meta()
    if 'permission' in f.meta:
        return f.control

    return cwd_permission(f)
    #fo = f.get_folder()

    #if 'permission' in fo.meta:
    #    control = fo.control
    #    return control

    #return inherit_permission_control(fo)



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
        return inherit_permission_control(fo)


def inherit_permission_control(folder_obj):
    '''
    inherit a control object from parent chain
    '''
    # folder object:
    fo = folder_obj
    fm = fo.meta

    while(True):
        if('permission' in fm):
            control = fo.control
            return control
        elif fm['path'].count('/') == 0:
            # it is root
            raise Exception('root folder has no permission setting')
        else:
            # keep going up
            fo = fo.get_parent_folder()
            fm = fo.meta



if __name__ == "__main__":

    username = 'tmp'
    cwd = 'tmp/public'
    file_path = 'tmp/public/a.txt'


    #fo = s3.folder.getter.folder(cwd)
    #fs = fo.meta['cache']['files']

    f = s3.file.getter.get_file(file_path)
    fc = s3.file.acontrol.get_file_control(file_path)

    #print(f.control.get_settings())
    #f.control.add_reader('*')
