
import s3.folder.ls as ls
import s3.folder.getter



if __name__ == "__main__":

    username = 'tmp'
    cwd = 'tmp/public'

    f = s3.folder.getter.folder(cwd)
    ms = f.cached_file_metas().values()
    #m0 = ms.next()

    lsm = ls.ls_meta(username, f)

