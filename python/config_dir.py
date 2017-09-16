
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



# json settings for local files
#Setting_file_for_Local_pathes = "/home/ubuntu/workspace/gg/python/loc/conf.json"
Setting_file_for_Local_prefix = "/home/ubuntu/workspace/gg/config/loc-prefix.json"
def get_path_settings_for_local_files():
    j = read_json(Setting_file_for_Local_prefix)

    j['base'] = os.path.expanduser(j['base_prefix'])
    j['base'] = os.path.abspath(j['base'])

    meta_prefix = os.path.join(j['base'], j['meta_dir_name'])
    ns_prefix = os.path.join(j['base'], j['ns_dir_name'])

    j['meta_prefix'] = meta_prefix
    j['ns_prefix']   = ns_prefix
    return j


def get_prefix_settings_for_local_files():
    j = read_json(Setting_file_for_Local_prefix)
    return j

