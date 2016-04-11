# basic s3 operations
# create, read, update, delete


import boto3

import config_dir

aconf = config_dir.get_aws_conf()
root_bucket = aconf.root_bucket


client = boto3.client('s3')


def geto(key):
    ''' Get the object, with the key
    '''
    response = client.get_object(
            Bucket = root_bucket,
            Key = key
            )
    return response


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

