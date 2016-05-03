
import os

import getter


def list_sub_pathes(_path):
    folder = getter.folder(_path)
    files  = folder.get_cache()['files']

    sub_pathes = []
    for name in files.keys():
        sub_pathes.append(os.path.join(_path, name))

    return sub_pathes

