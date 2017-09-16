
import os

import klass
import s3.folder.getter
import adder

import cache_in as cache

import users_a as users

# check a
def chka(owner='tmp', subname='kk'):
    '''
    '''
    #folder = klass.Folder(owner)
    root = adder.safe_new_root(owner)
    subs = {}
    for i in ['kk', 'gg', 'public', 'muji']:
        subs[i] = root.safe_sub_folder(subname)
    return root, subs


def start_cache(_path='tmp'):
    print('start name ', _path)
    folder = s3.folder.getter.folder(_path)
    folder.set_attr('type', 'folder')
    cache_fix(_path)
    folder.retrieve_meta()
    folder.as_li()
    cache.cache_in_meta(folder)
    folder.save_meta()

    folder_cache = folder.get_cache()
    if 'files' in folder_cache:
        files = folder_cache['files']
        names = [files[i]['name'] for i in files]
        for name in names:
            subpath = os.path.join(_path, name)
            if name in ['gg', 'public', 'muji']:
                start_cache(subpath)
            else:
                print('-- no in 3 -- ', subpath)


def cache_fix(_path):

    print('cache fix, ', _path)
    folder = s3.folder.getter.folder(_path)
    meta = folder.get_meta()

    #!if 'cache' not in meta:
    #!    start_cache(_path)

    cache = folder.get_cache()
    if 'file-infos' in cache:
        print('file-infos => files ', _path)
        cache['files'] = cache['file-infos']
        del cache['file-infos']
    if 'repr' in cache:
        print('repr => renders ', _path)
        cache['renders'] = cache['repr']
        del cache['repr']
    if 'folder-renders' in cache:
        print('folder-renders => renders ', _path)
        cache['renders'] = cache['folder-renders']
        del cache['folder-renders']

    folder.save_meta()


def add_up_li(_path):
    folder = s3.folder.getter.folder(_path)
    cache = folder.get_cache()
    files = cache['files']
    ul = '<ul class="file-list folder">'
    for f in files:
        ul += "\r\n"
        if 'li' in files[f]:
            ul += li
            continue
        else:
            ul += simple_li(files[f])

    ul += "\r\n</ul>"
    cache['renders']['ul'] = ul
    folder.save_meta()


def simple_li(file_meta):
    '''
    '''
    print('simple li ', file_meta)
    tpl = """
    <li class="file-li file">
        <span class="name">{0}</span>
        <span class="size">{1}</span>
        <span class="type">{2}</span>
    </li>
    """

    kind = size = ''

    if 'size' in file_meta:
        size = file_meta['size']

    if 'type' in file_meta:
        kind = file_meta['type']
    elif 'filetype' in file_meta:
        kind = file_meta['filetype']
    else:
        kind = ''

    li = tpl.format(file_meta['name'], size, kind)
    return li


def attemp01():
    names = users.all_names()
    for name in names:
        start_cache(name)
        #cache_fix(name)


def not_marked_folder():
    #...
    names = users.all_names()
    for name in names:
        check_files_for_a_path(name)


def check_files_for_a_path(_path, collecting):
    print('check for ', _path)
    folder = s3.folder.getter.folder(_path)
    cache  = folder.get_cache()
    files  = cache['files']
    for i in files:
        f = files[i]
        apath = os.path.join(_path, f['name'])
        if 'type' not in f:
            collecting.append(apath)
            print('no type ', apath)
            continue
        if f['type'] == 'folder':
            check_files_for_a_path(apath, collecting)

def get_ul(folder):
    cache  = folder.get_cache()
    meta  = folder.get_meta()
    if 'ul' not in cache['renders']:
        add_up_li(meta['path'])
        #...


import json
def write_folder_meta(cwd='tmp/public', lfile='/tmp/fmeta'):
    folder = s3.folder.getter.folder(cwd)
    folder.meta
    with open(lfile, 'w') as tmp:
        tmp.write(json.dumps(folder.meta, indent=4))

if __name__ == "__main__":
    print('__name__ == "__main__"')
    #tmp, kk = chka()
    f = s3.folder.getter.folder('tmp/public')
    #cache.collect_file_metas(f)

    #tmp = start_cache('t0310y6')
    #attemp01()

    #add_up_li("tmp")

    #fo = s3.folder.getter.folder('tmp/public')
    #write_folder_meta()
