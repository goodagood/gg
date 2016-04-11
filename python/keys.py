
import os

'''

# folder meta and name space:
    .gg.folder.meta/username/folder/path
    .gg.folder.name.space/username/folder-uuid


# file, s3 key for file data, meta and name space.

    .gg.file/username/file/full/path/name.extension

## file meta and name space:
    #S3 key of file meta *get* path info

    .gg.file.meta/username/file/full/path/name.extension
    .gg.file.name.space/username/file-uuid


'''

def get_prefix(_type = None):
    prefixes = {
            #folder
            "folder-meta": ".gg.folder.meta",
            "folder-name-space": ".gg.folder.name.space",

            # file, s3 key for file data, meta and name space.
            "file": ".gg.file",
            "file-meta": ".gg.file.meta",
            "file-name-space": ".gg.file.name.space"
            }

    if _type == None: return prefixes

    return prefixes[_type]


def file_meta_key(_path):
    pre = get_prefix("file-meta")
    return os.path.join(pre, _path)

def get_key(_path, _type):
    pre = get_prefix(_type)
    return os.path.join(pre, _path)

tmp_prefix = ".gg.transport.old.data.0329y6/"
def tmp_key(_path, _type):
    return os.path.join(tmp_prefix, get_key(_path, _type))
