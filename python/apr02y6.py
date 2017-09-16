# tmp functions to del old data

import s3.crud

def sort_file_list(file_info_list):
    '''
    '''
    tosort = []

    for f in file_info_list:
        depth = 0
        if 'path' in f:
            depth = count_depth(f['path'])

        t = depth, f
        tosort.append(t)

    return sorted(tosort, reverse=True)

def get_rid_of(alist):
    another = []
    for f in alist:
        _path = f[1]['path']
        if _path.startswith('t03'):
            print(f)
            continue
        else:
            another.append(f)
    return another

def del_the_list(file_list, elist):
    for f in file_list:
        info = f[1]
        #print(info['meta_s3key'], info['content'])
        try:
            s3.crud.rm(info['meta_s3key'])
            s3.crud.rm(info['content'])
        except:
            print('err, ', info)
            elist.append(f)

def del_in_dir_list(dir_list, errlist):
    for f in dir_list:
        try:
            key = f[1]['meta_s3key']
            s3.crud.rm(key)
        except:
            print('err, ', info)
            errlist.append(f)


def count_depth(string):
    ''' Give depth as dir by counting splitted parts with '/'
    '''
    return len(string.split('/'))


