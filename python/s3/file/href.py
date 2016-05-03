import os

def text_viewer(file_path):
    ''' Give href to view text of file.
        file_path: is full path
    '''
    return os.path.join('/viewtxt/', file_path)


def downloader(file_path):
    ''' Give href to download the file.
        file_path: is full path
    '''
    return os.path.join('/dl/', file_path)
