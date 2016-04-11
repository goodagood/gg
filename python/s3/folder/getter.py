# retrieve things like folder meta, file meta and such.
# 2016 0402

import json

import klass




def folder_meta(_path):
    f = folder(_path)
    return f.retrieve_meta()


def folder(_path):
    f = klass.Folder(_path)
    f.retrieve_meta()
    return f


### ###
from pprint import pprint

if __name__ == "__main__":
    print('getter.py __name__ == "__main__"')
    #pprint(folder_meta('tmp'))
    tmp = folder('tmp')
