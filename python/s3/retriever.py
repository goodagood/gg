# retrieve things like folder meta, file meta and such.
# 2016 0402

import json

import keys
import crud
import folder.klass as FolderClass




def folder_meta(_path):
    s3key = keys.folder_meta(_path)
    res   = crud.get_obj(s3key)
    meta  = json.loads(res["Body"].read())
    return meta


def folder(_path):
    f = FolderClass(_path)
    f.retrieve_meta()
    return f

### ###
from pprint import pprint

if __name__ == "__main__":
    print('retriever.py __name__ == "__main__"')
    pprint(folder_meta('tmp'))
