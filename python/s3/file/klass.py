
import os
import json
import time
import mimetypes

import path_setting

import config_dir
import util.mis as util
import s3.keys  as keys

import s3.crud as crud
import s3.folder.getter


class File(object):
    def __init__(self, _path):
        #print('in init: ')
        self.meta = {'path' : _path}


    # actually not needed, got the habit from node.js
    def get_meta(self):
        return self.meta

    def set_meta(self, meta):
        self.meta = meta

    def set_attr(self, name, value):
        self.meta[name] = value

    def get_attr(self, name):
        if 'name' in self.meta:
            return self.meta['name']
        else:
            return None

    def make_up_basic_meta(self):
        ''' Here we make up meta for file, but a file can have no meta.
        '''
        if 'path' not in self.meta:
            raise Exception('Folder must have PATH')
        if 'name' not in self.meta:
            self.meta['name'] = os.path.basename(self.meta['path'])

        # if there is no owner, we set root, this is a little bit weird.
        if 'owner' not in self.meta:
            self.meta['root'] = util.getroot(self.meta['path'])

        if 'meta_s3key' not in self.meta:
            self.calculate_prefix_and_keys()


    def calculate_prefix_and_keys(self):
        self.calculate_keys()

        if 'uuid' not in self.meta:
            self.meta["uuid"] = util.getuuid()

        # note name space prefix depend on root not owner's name
        self.meta['name_space_prefix'] = keys.file_name_space(
                self.meta['path'], self.meta['uuid'])

        return self


    def calculate_keys(self):
        self.meta["s3key"]      = keys.file_content(self.meta['path'])
        self.meta["meta_s3key"] = keys.file_meta(self.meta['path'])


    def save_meta(self):
        '''Haven't done locking
        '''
        jstr = json.dumps(self.meta)
        crud.save(self.meta['meta_s3key'], jstr)
        return self.meta


    def is_meta_in_s3(self):
        if not 'meta_s3key' in self.meta:
            self.calculate_keys()

        if crud.key_exists(self.meta['meta_s3key']):
            return True
        else:
            return False

    # name space don't need to be set up, it's a prefix,
    # just use it with rules.
    def is_name_space_used(self):
        if not 'name_space_prefix' in self.meta:
            self.calculate_prefix_and_keys()

        # 'key exists' check by count object with the key as prefix
        if crud.key_exists(self.meta['name_space_prefix']):
            return True
        else:
            return False


    def retrieve_meta(self):
        '''
        '''
        if not 'meta_s3key' in self.meta:
            self.calculate_keys()

        # Not to fail silently?
        if not crud.key_exists(self.meta['meta_s3key']):
            raise Exception(
                "meta s3 key not exists: {0}".format(self.meta['path']))
            return None

        self.meta = crud.get_json(self.meta['meta_s3key'])
        return self.meta


    def touch(self):
        self.meta['timestamp'] = time.time() * 1000 # epoch milliseconds

    def read(self):
        ''
        if not 's3key' in self.meta:
            self.calculate_keys()
        return crud.get_txt(self.meta['s3key'])

    def write(self, text):
        ''
        crud.save(self.meta['s3key'], text)

    def get_folder(self):
        ''' Get the folder containing this file.
        '''
        cwd = os.path.dirname(self.meta['path'])
        return s3.folder.getter.folder(cwd)

    def add_to_folder_ns(self):
        ''' Add file info to folder name space.

        Suppose the prefix of folder name space is: 'foprefix'
        file info will be added to: foprefix/files/file-name.extension
        '''
        fo = self.get_folder()
        fo.add_file_in_ns(self.meta)
        return self


    def guess_type(self):
        # guess type return (mime-type, encoding)
        self.meta['type'] = mimetypes.guess_type(self.meta['path'])[0]
        return self.meta['type']


    def as_li(self):
        '''
        '''
        #tpl = """
        #<li class="file">
        #    <span class="name">{name}</span>
        #</li>
        #"""
        #li = tpl.format(name=self.meta['name'], path=self.meta['path'])

        # fix no name condition
        if 'name' not in self.meta:
            self.meta['name'] = os.path.basename(self.meta['path'])

        li = util.simple_li(self.meta)

        self.meta['li'] = li
        return li


    def delete_meta_file(self):
        '''
        '''
        if 'meta_s3key' in self.meta:
            crud.rm(self.meta['meta_s3key'])
        else:
            raise Exception('no meta s3key in self.met')

    def delete_name_space(self):
        '''
        '''
        if 'name_space_prefix' in self.meta:
            crud.rm_all(self.meta['name_space_prefix'])
        else:
            raise Exception('no name space prefix in self.met')


# Utility functions
def retrieve_file(_path):
    f = File(_path)
    f.retrieve_meta()
    return f



if __name__ == "__main__":
    ''
    #fi = retrieve_file('tmp/t.text')

    # another
    #fia = File('tmp/s.text')
    #fia.make_up_basic_meta()
    #fia.write('s test of text file, apr.07 2:15pm')

    #fia = retrieve_file('tmp/s.text')
    #fo = fia.get_folder()

    #print fia.get_meta()
