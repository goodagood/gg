# Moving old homes, some owner has different id from user name
# Change to use user name as home dir name
# Continue from s3a.py
# 2016 Mar 31

#import os
import json
from pprint import pprint

import s3a
import users_a
import id_name_switch as conv
import keys
import s3crud

import config_dir
aconf = config_dir.get_aws_conf()
root_bucket = aconf.root_bucket

def tmpfolder(meta, info):
    #print("do tmp folder: {0}".format(meta['path']))

    _meta = meta
    meta = conv.mswitch(meta, info['id'], info['owner'])

    key = keys.tmp_key(meta['path'], 'folder-meta')
    #print("save tmp folder meta, key: ", key);

    para = {
            "Bucket": root_bucket,
            "Body" : json.dumps(meta),
            "Key" : key
            }
    #print(para["Key"], meta['path'])
    #print("do tmp folder: {0} -- {1}".format(_meta['path'], para["Key"]))

    s3a.client.put_object(**para)


def tmpfile(meta, info):
    ''' Copy file to tmp location
    with new meta structure?
    '''
    print("file to tmp: {0}".format(meta['path']))

    _meta = meta
    meta = conv.mswitch(meta, info['id'], info['owner'])

    file_key = keys.get_key(meta['path'], 'file')
    tmp_key = keys.tmp_key(meta['path'], 'file')
    #pprint(tmp_key)
    param = {
            "CopySource": {
                "Key": meta['storage']['key'],
                "Bucket": root_bucket
                },
            "Bucket" : root_bucket,
            "Key" : tmp_key
            }
    #pprint(param)
    s3a.client.copy_object(**param)

    meta_key = keys.get_key(meta['path'], 'file-meta')
    tmp_key = keys.tmp_key(meta['path'], 'file-meta')
    #pprint(tmp_key)
    if 'file_meta_s3key' in meta:
        source_key = meta['file_meta_s3key']
    elif 'meta_s3key' in meta:
        source_key = meta['meta_s3key']
    elif 'Meta_s3key' in meta:
        source_key = meta['Meta_s3key']
    else:
        return

    param = {
            "CopySource": {
                "Key": source_key,
                "Bucket": root_bucket
                },
            "Bucket" : root_bucket,
            "Key" : tmp_key
            }
    #pprint(param)
    s3a.client.copy_object(**param)



def walk_dir(_path, info):
    ''' tmp dir
    _path is old 'path'
    copy a home to tmp prefix
    switch user id to user name in the path
    home, id, owner
    '''
    if not s3crud.key_exists(s3a.prefix + _path):
        print('not exists ', _path)
        return

    meta = s3a.get_meta(_path)

    try:
        tmpfolder(meta, info)
    except Exception:
        print("!! "*8)
        print(Exception)
    #delfolder(meta)

    if 'files' not in meta:
        print('- got no files')
        return

    files = meta['files']
    keys = files.keys()
    for k in keys:
        m = files[k]
        if(m['what'] == 'I-am-goodagood-folder.2014-0625.'):
            print('to recurse a folder ', m['path'])
            walk_dir(m['path'], info) # recursive
        else:
            print(m['path'], ' # not a folder ' )
            try:
                tmpfile(m, info)
            except Exception:
                print("!! "*8)
                print(Exception)


def del_path(_path, info):
    ''' tmp dir
    _path is old 'path'
    copy a home to tmp prefix
    switch user id to user name in the path
    home, id, owner
    '''
    if not s3crud.key_exists(s3a.prefix + _path):
        print('not exists ', _path)
        return

    meta = s3a.get_meta(_path)

    try:
        delfolder(meta, info)
    except Exception:
        print("!! folder deleting ! "*3)
        print(str(Exception))

    if 'files' not in meta:
        print('- got no files')
        return

    files = meta['files']
    keys = files.keys()
    for k in keys:
        m = files[k]
        if(m['what'] == 'I-am-goodagood-folder.2014-0625.'):
            print('to recurse a folder ', m['path'])
            del_path(m['path'], info) # recursive
        else:
            print(m['path'], ' # not a folder ' )
            try:
                delfile(m, info)
            except Exception:
                print("!! file deleting "*8)
                print(str(Exception))

def delfolder(meta):
    if "folder_meta_s3key" in meta:

        print('s3crud.rm(meta["folder_meta_s3key"])', meta["folder_meta_s3key"])
        s3crud.rm(meta["folder_meta_s3key"])
        return
    if "meta_s3key" in meta:
        s3crud.rm(meta["folder_meta_s3key"])
        return
    print('got no key to delete folder')


def delfile(meta, info):
    ''' Copy file to tmp location
    with new meta structure?
    '''
    print("del file: {0}".format(meta['path']))

    s3crud.rm(meta['storage']['key'])
    s3crud.rm(meta['file_meta_s3key'])
    # others? thumb, aux


def chk_tmp_f(user_name):
    users = users_a.get_id_names();

    for u in users:
        if u['owner'] == user_name:
            ui = u

    print("got user information: ", ui)

    meta = s3a.get_meta(ui["home"])
    print(meta['path'], meta['owner'])
    #tmpfolder(meta, ui)

    walk_dir(ui['home'], ui)


def gather_pathes(_path, box):
    ''' 
    '''
    if not s3crud.key_exists(s3a.prefix + _path):
        print('not exists ', _path)
        return

    meta = s3a.get_meta(_path)
    d = dict(path = meta['path'], meta_s3key = meta['meta_s3key'])
    box['folder'].append(d)

    files = meta['files']
    keys = files.keys()
    for k in keys:
        m = files[k]
        if(m['what'] == 'I-am-goodagood-folder.2014-0625.'):
            print('to recurse a folder ', m['path'])
            gather_pathes(m['path'], box) # recursive
        else:
            d = gather_info(m)
            box['file'].append(d)
            #print(m['path'], ' # not a folder ' )


def gather_info(meta):
    d = dict(path = meta['path'])
    if 'meta_s3key' in meta:
        d['meta_s3key'] = meta['meta_s3key']
    if 'file_meta_s3key' in meta:
        d['meta_s3key'] = meta['file_meta_s3key']
    if 'storage' in meta:
        if 'key' in meta['storage']:
            d['content'] = meta['storage']['key']
    if(meta['what'] == 'I-am-goodagood-folder.2014-0625.'):
        d['isfolder'] = True

    return d

def check_gather_a():
    box = dict(folder = [], file = [])
    gather_pathes('tmp', box)
    return box

def check_gather_all():
    box = dict(folder = [], file = [], err=[])

    ins = users_a.get_id_names()
    for i in ins:
        #print(i)
        try:
            gather_pathes(i['home'], box)
        except:
            print('got err, ', i)
            box['err'].append(i)

    return box

def t_del(file_info_list):
    '''
    '''

def count_depth(string):
    ''' Give depth as dir by counting splitted parts with '/'
    '''
    return len(string.split('/'))



def walk_all():
    ins = users_a.get_id_names()
    for i in ins:
        if i['id'] != '17':
            #print(i)
            walk_dir(i['home'], i)

def del_all():
    ins = users_a.get_id_names()
    for i in ins:
        print('del: ', i)
        del_path(i['home'], i)


if __name__ == "__main__":
    print('__name__ == "__main__"')
    #chk_tmp_f('ab')
    #walk_all()
    #del_all()
