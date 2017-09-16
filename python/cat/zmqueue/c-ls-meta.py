
import zmqueue.ls_meta


if __name__ == "__main__":
    from pprint import pprint
    username = 'tmp'
    cwd = 'tmp/public'

    info = {
            'who'     : username,
            'ask-for' : 'folder_list',
            'path'    : cwd
            }

    meta_list = zmqueue.ls_meta.main(info)

    pprint(meta_list)
