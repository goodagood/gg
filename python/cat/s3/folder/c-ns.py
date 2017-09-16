
import s3.folder.ns
import s3.folder.getter

_cwd = 'tmp/public'


def getAFolder(cwd = 'tmp/public'):
    ''
    fo = s3.folder.getter.folder(cwd)
    fm = s3.folder.getter.folder_meta(cwd)
    return [fo, fm]


def nsobj(cwd = _cwd):
    o = s3.folder.ns.NameSpace(cwd)

    print(o.prefix)
    return o


if __name__ == "__main__":
    from pprint import pprint

    #fa = getAFolder()
    #fo = fa[0]
    #fm = fa[1]

    ns = nsobj()
    keys = ns.list_keys()
