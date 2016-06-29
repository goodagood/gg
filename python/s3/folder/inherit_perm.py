
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

