
import zmqueue.folder_list



if __name__ == "__main__":
    from pprint import pprint
    username = 'tmp'
    cwd = 'tmp/public'

    info = {
            'who'     : username,
            'ask-for' : 'folder_list',
            'path'    : cwd
            }
    res = zmqueue.folder_list.main(info)

    pprint(res)
    #pprint(res.keys())


