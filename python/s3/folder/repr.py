# folder's repr, representation,
# to show folder as html page, prepare what it need.

import os

#import s3.folder.klass  as F # F.Folder is the class
import s3.folder.getter as getter

import s3.file.getter
import s3.file.rwcmd as rwcmd


def give_user_folder_repr(username, cwd):
    '''
    index.html
    repr.setting: /ls
                  /gallery for video or image
    '''

    f = getter.folder(cwd)
    if f.control.can_be_read_by(username):
        # do reading
        results = find_index_html(f)
        if results['found']:
            print('return')
            return results['text_of_index_html']

        list_folder_for_user(username, f)
        pass
    else:
        # user can not read the folder
        return False


    #d
    print('not returned? give you file obj')
    return f


def find_index_html(folder_obj):
    folder_obj = folder_obj
    if(folder_obj.name_exists('index.html')):
        # read it return 
        #    { 'index.html': True, 'text': 'read to string of index.html' }
        fi_path = os.path.join(folder_obj.meta['path'], 'index.html')

        print('go to rwcmd read_txt ', fi_path)
        text = rwcmd.read_txt(fi_path)
        #text = ''
        return {'found': True, 'text_of_index_html': text}
    else:
        return {'found': False}


def list_folder_for_user(username, folder_obj):
    pass



if __name__ == "__main__":
    from pprint import pprint
    username = 'tmp'
    cwd = 'tmp/public'
    f = give_user_folder_repr(username, cwd)
    pprint(f)

