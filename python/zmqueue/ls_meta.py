
# folder_list.py
# response to request from 'zmq': folder_list
# it should in a json:
#   {
#     'ask-for': 'folder_list',
#     'path'   : string, the folder to give listing,
#     'username' : who ask for it
#     ...
#   }


import s3.folder.ls


def main(info):
    if not info['who'] or not info['path']:
        info['error'] = 'who and path, must be given'
        return info

    file_metas_for_user = s3.folder.ls.ls_meta_in_cwd(info['who'], info['path'])

    #d 2016 0707
    info[info['ask-for']] = file_metas_for_user


    #info['wait'] = 'got to do folder listing things'
    #return info
    return file_metas_for_user
