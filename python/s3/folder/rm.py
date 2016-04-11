#

def rm_folder(_path):
    s3key = keys.folder_meta(_path)
    return crud.rm(s3key)
