
# folder_list.py
# response to request from 'zmq': folder_list
# it should in a json:
#   {
#     'ask-for': 'folder_list',
#     'path'   : string, the folder to give listing,
#     'username' : who ask for it
#     ...
#   }


import s3.folder.repr


def main(info):
    folder_representation = s3.folder.repr.give_user_folder_repr(info['who'], info['path'])

    info[info['ask-for']] = folder_representation


    #info['wait'] = 'got to do folder listing things'
    return info
