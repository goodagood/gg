# 2016 0401

import os
import json
import re

#import path_setting

import config_dir

#import getter # recursive module loading?
#import cache_in

import util.mis as myutil
import s3.asker as asker
import s3.keys as keys
import s3.crud as crud


class Folder:
    def __init__(self, _path, opts={}):
        if opts:
            self.meta = opts
        else:
            self.meta = {}

        self.meta['path'] = _path

        self._prefixes = config_dir.get_s3_prefix()


    def get_meta(self):
        return self.meta

    def set_meta(self, meta):
        self.meta = meta

    def set_owner(self, name):
        self.meta['owner'] = name

    def get_owner(self):
        if 'owner' in self.meta:
            return self.meta['owner']
        else:
            return None

    def set_attr(self, name, value):
        self.meta[name] = value

    def get_attr(self, name):
        if name in self.meta:
            return self.meta[name]
        else:
            return None


    def make_up_basic_meta(self):
        '''
        '''
        if 'path' not in self.meta:
            raise Exception('Folder must have PATH')
        if 'name' not in self.meta:
            self.meta['name'] = os.path.basename(self.meta['path'])
        if 'type' not in self.meta:
            self.meta['type'] = 'folder'

        # if there is no owner, we set root, this is a little bit weird.
        if 'owner' not in self.meta:
            self.meta['root'] = getroot(self.meta['path'])

        if 'meta_s3key' not in self.meta:
            self.calculate_meta_s3key()
        if 'name_space_prefix' not in self.meta:
            self.calculate_name_space_prefix()


    def calculate_prefix_and_keys(self):
        self.calculate_meta_s3key()
        self.calculate_prefix_and_keys()

    def calculate_meta_s3key(self):
        self.meta["meta_s3key"] = keys.folder_meta(self.meta['path'])
        return self.meta["meta_s3key"]


    def calculate_name_space_prefix(self):
        '''
        The prefix is head of the key when it stored in s3, the prefix is
        unique.  All keys prefixed become name space for the folder, such as
        files, events, loggings.

        folder's name space depend on root, not owner
        root and owner can be different, for example, user Tom create a
        folder 'by-tom' in Jim's folder: jim/has/the/folder/by-tom
        where Tom is owner, but root is 'jim'
        '''
        if 'uuid' not in self.meta:
            self.meta["uuid"] = myutil.getuuid()

        self.meta['name_space_prefix'] = keys.folder_name_space(
                self.meta['path'], self.meta['uuid'])
        return self.meta['name_space_prefix']


    def save_meta(self):
        '''Haven't done locking
        '''
        jstr = json.dumps(self.meta)
        crud.save(self.meta['meta_s3key'], jstr)
        return self.meta

    def retrieve_meta(self):
        '''Haven't done locking
        '''
        if not 'meta_s3key' in self.meta:
            self.calculate_meta_s3key()

        self.meta = crud.get_json(self.meta['meta_s3key'])
        return self.meta



    def new_sub_folder(self, name, opts=None):
        _path = os.path.join(self.meta['path'], name)

        sub = Folder(_path)
        sub.make_up_basic_meta()
        sub.set_attr('type', 'folder')

        submeta = sub.get_meta()
        if opts:
            for k in opts.keys():
                submeta[k] = opts[k]

        # prepare to add to parent folder
        m = self.pick_up_metas(submeta)

        self.add_file_in_ns(m)
        sub.save_meta()
        return sub


    ## not tested
    # getter recursive load this file
    #def safe_sub_folder(self, name):
    #    ''' Get the sub folder by name, or create it.
    #    '''
    #    if self.name_exists(name):
    #        _path = os.path.join(self.meta['path'], name)
    #        return getter.folder(_path)
    #    else:
    #        return self.new_sub_folder(name)

    def pick_up_metas(self, meta):
        ''' Pick metas in files, sub-folders to save in name space
            [ 'filetype', 'li', 'name', 'posters', 'no_meta_file',
              'owner',    'permission', 'size',  'timestamp','type',
              'poster', 'thumb'];

            poster: the s3key of the poster in 0.0 seconds
            thumb:  the s3key of the thumbnail for poster at 0.0secs,
                    h160 for video, h80 for image file.
        '''
        m = {}
        if 'name' in meta:
            m['name'] = meta['name']
        else:
            m['name'] = os.path.basename(meta['path'])

        if 'size'       in meta: m['size'] = meta['size']
        if 'owner'      in meta: m['owner'] = meta['owner']
        if 'filetype'   in meta: m['filetype'] = meta['filetype']
        if 'type'       in meta: m['type'] = meta['type']
        if 'permission' in meta: m['permission'] = meta['permission']
        if 'timestamp'  in meta: m['timestamp'] = meta['timestamp']
        if 'li'         in meta: m['li'] = meta['li']
        if 'thumb'      in meta: m['thumb'] = meta['thumb']
        if 'poster'     in meta: m['poster'] = meta['poster']
        if 'posters'    in meta: m['posters'] = meta['posters']
        if 'no_meta_file'  in meta: m['no_meta_file'] = meta['no_meta_file']
        return m


    def get_prefix(self, kind='ns'):
        '''
        '''
        # prefix for name space
        if kind in ['name space', 'name-space', 'name_space', 'NameSpace',
                'name_space_prefix', 'ns', 'nsp']:

            return self.meta['name_space_prefix']

        if kind == 'files':
            key = os.path.join(self.meta['name_space_prefix'], 'files')
            return key
        if kind == 'events':
            key = os.path.join(self.meta['name_space_prefix'], 'events')
            return key


    def add_file_in_ns(self, file_meta):
        ''' Add files and sub-folders
            File's meta are added to name space, in 'files' category, so it will
            has key:
                name space prefix/files/file-name.extension

            Not all file information needed to be there, get enough to represent
            a file or folder would be ok.
        '''
        m = self.pick_up_metas(file_meta)
        jstr = json.dumps(m)

        pre = self.get_prefix('files')
        key = os.path.join(pre, m['name'])

        crud.save(key, jstr)
        return self


    #def add_render_file(self, file_meta):
    #    ''' Add a file, cache it's info to meta, render folder listing, then
    #        save folder meta.

    #        We have not lockings here, data might be conflicting for folder
    #        meta.
    #    '''
    #    self.add_file_in_ns(file_meta)
    #    cache_in.cache_render_from_ns(self)


    def get_keys_of_ns_files(self):
        prefix = self.get_prefix('files')
        objs = crud.list_obj(prefix)
        keys = [o['Key'] for o in objs]
        return keys

    #list_files_in_name_space
    def get_names_of_ns_files(self):
        prefix = self.get_prefix('files') + '/'
        keys = self.get_keys_of_ns_files()

        names = [key.replace(prefix, '') for key in keys]
        return names

    def get_infos_of_ns_files(self):
        keys = self.get_keys_of_ns_files()
        infos = [crud.get_json(k) for k in keys]
        return infos

    def name_exists(self, name):
        key = os.path.join(self.get_prefix('files'), name)
        return crud.key_exists(key)

    def get_file_info(self, name):
        key = os.path.join(self.get_prefix('files'), name)
        return crud.get_json(key)


    def grep_file_info(self, pattern):
        ''' user regexp to get file infos

        pattern can be string, raw string is common, such as: r'^reg begin'
        '''
        cp = pattern
        if type(pattern) is str:
            cp = re.compile(pattern)

        namekeys = zip(
                self.get_names_of_ns_files(),
                self.get_keys_of_ns_files())

        # nk[0] is the name, nk[1] is the key, they zipped above.
        res   = [nk for nk in namekeys if cp.search(nk[0])]
        infos = [crud.get_json(nk[1]) for nk in res]
        return infos


    def get_cache(self):
        if 'cache' not in self.meta:
            self.meta['cache'] = cache = {}
            cache['files'] = {}
            cache['renders'] = {}
            return cache
        else:
            return self.meta['cache']

    def as_li(self):
        '''
        '''
        tpl = """
        <li class="folder">
            <a class="folder" href="/ls/{path}">
            <span class="name folder">{name}</span>
            </a>
        </li>
        """
        li = tpl.format(name=self.meta['name'], path=self.meta['path'])

        self.get_cache()['renders']['li'] = li #d
        self.meta['li'] = li
        return li


def getroot(_path):
    return _path.split('/')[0]

''' from js

'''

########

from pprint import pprint

def test_a(owner='tmp', subname='kk'):
    folder = Folder(owner)
    if asker.folder_exists(owner):
        print('exist')
        folder.retrieve_meta()
    else:
        folder.make_up_basic_meta()

    if not folder.name_exists(subname):
        sub = folder.new_sub_folder(subname)
        sub.set_attr('owner', owner)
    else:
        sub = Folder(os.path.join(owner, subname))
        sub.retrieve_meta()
    return folder, sub


if __name__ == "__main__":
    print('__name__ == "__main__"')
    #tmp, kk = test_a()

    wd = 'tmp/public' # working dir
    fo = Folder(wd)
    m  = fo.retrieve_meta()
    print(m['path'])

