# copied from ../s3crud.py
# basic s3 operations
# create, read, update, delete

import json

import boto3

import sys
import os

# add parent dir to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))

import config_dir

aconf = config_dir.get_aws_conf()
root_bucket = aconf.root_bucket


client = boto3.client('s3')


def get_obj(key):
    ''' Get the object, with the key
    '''
    response = client.get_object(
            Bucket = root_bucket,
            Key = key
            )
    return response

geto = get_obj # tmp compatibilty


def get_body(key):
    return get_obj(key)["Body"]


def get_txt(key):
    res = get_obj(key)
    readed = res["Body"].read()

    # when upgrading to py v3, read() return bytes, got to decode,
    # and try to keep compatible. 2016 0530
    if hasattr(readed, 'decode'):
        readed = readed.decode('utf-8')

    return readed


def get_json(key):
    txt = get_txt(key)
    j   = json.loads(txt)
    return j


def rm(key):
    ''' Get the object, with the key
    '''
    return client.delete_object(
            Bucket = root_bucket,
            Key = key
            )


def rm_all(key):
    ''' Get the object, with the key
    '''
    return client.delete_objects(
            Bucket = root_bucket,
            Delete = {
                'Objects':[{
                    'Key' : key
                    }
                    ]
                }
            )


def key_exists(key):

    s3 = boto3.resource('s3')
    bucket = s3.Bucket(root_bucket)
    objs = list(bucket.objects.filter(Prefix=key))
    #if len(objs) > 0 and objs[0].key == key
    if len(objs) > 0:
            #print("Exists!")
            return True
    else:
            #print("Doesn't exist")
            return False


def save(key, body):
    ''' Get the object, with the key
    '''
    return client.put_object(
            Bucket = root_bucket,
            Key = key,
            Body = body
            )


def put_file(key, file_path):
    with open(file_path) as file:
        return save(key, file)


def list_obj_raw(prefix, num=1000):
    ''' List the object, with the prefix
    '''
    return client.list_objects(Bucket = root_bucket,
            Prefix = prefix,
            MaxKeys=num)


def list_obj(prefix, num=1000):
    ''' List the object, with the prefix
    '''
    raw = list_obj_raw(prefix, num)
    if 'Contents' in raw:
        return raw['Contents']
    else:
        return []



if __name__ == "__main__":
    print('__name__ == "__main__"')
    import s3.keys

    cwd = 'tmp/public'
    s3key = s3.keys.folder_meta(cwd)
    print(s3key)
    print(key_exists(s3key))
    try:
        o = get_obj(s3key)
        j = get_json(s3key)
    except Exception as e:
        print(e)



