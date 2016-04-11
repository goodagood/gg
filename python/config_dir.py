
import sys
import os
import json

config_dir = "/home/ubuntu/workspace/gg-credentials/pyconf/"

loc_config_dir = "/home/ubuntu/workspace/gg/plain/config"
sys.path.append(config_dir)



def get_aws_conf():
    import aws_conf as aconf
    return aconf


def read_json(abs_file_path):
    j = None

    with open(abs_file_path) as f:
        text = f.read()
        j = json.loads(text)

    return j


def get_s3_prefix():
    '''
    s3 prefix settings
    '''
    s3_prefix_json_config_file = os.path.join(loc_config_dir, "s3-prefix.json")
    return read_json(s3_prefix_json_config_file)

