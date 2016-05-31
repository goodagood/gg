# folder's repr, representation,
# to show folder as html page, prepare what it need.

import os

#import s3.folder.klass  as F # F.Folder is the class
import s3.folder.getter as getter

#import s3.file.getter
#import s3.file.rwcmd as rwcmd


#def give_repr(username, cwd):
#    '''
#    index.html
#    repr.setting: /ls
#                  /gallery for video or image
#    '''
#    f = getter.folder(cwd)
#    if(f.name_exists('index.html')):
#        # read it return 
#        #    { 'index.html': True, 'text': 'read to string of index.html' }
#        fi_path = os.path.join(cwd, 'index.html')
#
#        print('go to rwcmd read_txt ', fi_path)
#        #text = rwcmd.read_txt(fi_path)
#        text = ''
#        return {'index.html': True, 'text': text}
#
#
#    print('not returned? give you file obj')
#    return f


if __name__ == "__main__":
    username = 'tmp'
    cwd = 'tmp/public'
    #f = give_repr(username, cwd)

