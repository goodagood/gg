# Trying to do s3 things.  2016 0329

import os
import json
from pprint import pprint

import boto3

import config_dir
import keys
import id_name_switch as conv
import users_a

aconf = config_dir.get_aws_conf()
root_bucket = aconf.root_bucket


client = boto3.client('s3')

old = { "folder-prefix": ".gg.folder.meta/" }
prefix = ".gg.folder.meta/"

tmp_prefix = ".gg.transport.old.data.0329y6/"



# try to get user 'tmp'
akey = prefix + "tmp"


# a dict to keep parameters
da = {
    "Bucket" : root_bucket,
    "Key" : akey
    }


def geto(key):
    ''' Get the object, with the key
    '''
    response = client.get_object(
            Bucket = root_bucket,
            Key = key
            )
    return response


def get_tmp_obj(_path):
    akey = tmp_prefix + _path
    return geto(akey)


def get_obj(key):
    akey = prefix + key
    return geto(akey)


def get_meta(cwd):
    res = get_obj(cwd)
    body = res["Body"].read()
    meta = json.loads(body)
    return meta


def get_tmp_meta(cwd):
    res = get_tmp_obj(cwd)
    body = res["Body"].read()
    meta = json.loads(body)
    return meta


def copy_folder_tmp(meta, info):
    print("do tmp folder: {0}".format(meta['path']))

    _meta = meta
    meta = conv.mswitch(meta, info['id'], info['owner'])

    key = keys.tmp_key(meta['path'], 'folder-meta')
    #print("save tmp folder meta, key: ", key);

    para = {
            "Bucket": root_bucket,
            "Body" : json.dumps(meta),
            "Key" : key
            }

    client.put_object(**para)


def show_path(_path):
    meta = get_meta(_path)
    print(meta['path'])

    if 'files' not in meta:
        p('- got no files')
        return

    files = meta['files']
    keys = files.keys()
    for k in keys:
        m = files[k]
        if(m['what'] == 'I-am-goodagood-folder.2014-0625.'):
            #print('got a folder')
            #print(m['path'])
            #print(m['path'], m['meta_s3key'])

            show_path(m['path'])
        else:
            print(m['path'], ' # not a folder ' )


def list_file(_path):
    meta = get_meta(_path)
    print(meta['path'])

    if 'files' not in meta:
        p('- got no files')
        return

    files = meta['files']
    keys = files.keys()
    file_list = []
    for k in keys:
        m = files[k]
        file_list.append(m)

    return file_list


def copy_file_tmp(meta, info):
    ''' Copy file to tmp location
    with new meta structure?
    '''
    print("do tmp file: {0}".format(meta['path']))

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
    client.copy_object(**param)

    meta_key = keys.get_key(meta['path'], 'file-meta')
    tmp_key = keys.tmp_key(meta['path'], 'file-meta')
    #pprint(tmp_key)
    param = {
            "CopySource": {
                "Key": meta['file_meta_s3key'],
                "Bucket": root_bucket
                },
            "Bucket" : root_bucket,
            "Key" : tmp_key
            }
    #pprint(param)
    client.copy_object(**param)


def tmp_a_home(_path):
    ''' save file and folder to tmp
    '''
    meta = get_meta(_path)

    #print(meta['path'])
    copy_folder_tmp(meta)

    if 'files' not in meta:
        print('- got no files')
        return 

    files = meta['files']
    keys = files.keys()
    for k in keys:
        m = files[k]
        if(m['what'] == 'I-am-goodagood-folder.2014-0625.'):
            #print('got a folder')
            tmp_a_home(m['path']) # recursive
        else:
            #print(m['path'], ' # not a folder ' )
            copy_file_tmp(m)


def tmphome(_path, info):
    ''' tmp home
    copy a home to tmp prefix
    switch user id to user name in the path
    home, id, owner
    '''
    #ins = users_a.get_id_names()
    meta = get_meta(_path)

    #print(meta['path'])
    copy_folder_tmp(meta, info)

    if 'files' not in meta:
        print('- got no files')
        return

    files = meta['files']
    keys = files.keys()
    for k in keys:
        m = files[k]
        if(m['what'] == 'I-am-goodagood-folder.2014-0625.'):
            #print('got a folder')
            tmphome(m['path'], info) # recursive
        else:
            #print(m['path'], ' # not a folder ' )
            copy_file_tmp(m, info)



#########

def test_a():
    file_metas = list_file('tmp/gg/message')
    copy_file_tmp(file_metas[1])


if __name__ == "__main__":
    print('__name__ == "__main__"')
    #print(root_bucket)
    #test_a()


