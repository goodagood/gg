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
    return res["Body"].read()

def get_json(key):
    res = get_obj(key)
    j   = json.loads(res["Body"].read())
    return j

def rm(key):
    ''' Get the object, with the key
    '''
    return client.delete_object(
            Bucket = root_bucket,
            Key = key
            )


def key_exists(key):

    s3 = boto3.resource('s3')
    bucket = s3.Bucket(root_bucket)
    objs = list(bucket.objects.filter(Prefix=key))
    if len(objs) > 0 and objs[0].key == key:
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
