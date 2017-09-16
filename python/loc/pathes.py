import os
import config_dir as cdir


Path_settings = cdir.get_path_settings_for_local_files()


def get_meta_path(file_target_path):
    p1 = os.path.join(Path_settings['meta_prefix'], file_target_path)
    p2 = p1 + '.json'
    return p2


def get_ns_path(file_target_path):
    p1 = os.path.join(Path_settings['ns_prefix'], file_target_path)
    p2 = p1 + '-ns'
    return p2

if __name__ == "__main__":
    lfile = '/tmp/tt1.mp4'
    tfile = 'tmp/public/tt1.mp4'
    mpath = get_meta_path(tfile)
    npath = get_ns_path(tfile)
    print Path_settings
    print mpath, npath
