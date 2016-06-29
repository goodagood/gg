
# to do with name space tasks for folder
# In the same time, it is botherring me: python module import in cycles.
# 2016 0601

import os

import s3.keys as keys
import s3.crud as crud

import s3.folder.getter as dget  # dir getter


class NameSpace:
    '''
    Name space for folder, give me a folder path, make sure uuid is ok.
    '''

    def __init__(self, cwd):
        self.cwd = cwd
        self.folderMeta = dget.folder_meta(cwd)
        self.prefix = self.folderMeta['name_space_prefix']


    def list_key_infos(self):
        return crud.list_obj(self.prefix)

    def list_keys(self):
        infos = self.list_key_infos()
        return [i['Key'] for i in infos]


    # going to use events?
    def event_exists(self):
        self.eprefix = os.path.join(self.prefix, 'events')
        return crud.key_exists(self.eprefix)
