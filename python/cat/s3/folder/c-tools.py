
import s3.folder.tools

import s3.folder.getter


def check_0621():
    username = 'tmp'
    cwd = 'tmp/public'

    fo = s3.folder.getter.folder(cwd)

    tlist = s3.folder.tools.list_tools(username, fo)
    print(tlist)
    [print(t['a'], t['url']) for t in tlist]


if __name__ == "__main__":
    print('checking folder repr')

    username = 'tmp'
    cwd = 'tmp/public'

    f = s3.folder.getter.folder(cwd)
    print(f.control.get_settings())
    f.control.add_reader('*')

    check_0621()
