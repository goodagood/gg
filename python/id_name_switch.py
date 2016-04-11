import re
import copy

def mswitch(meta, uid, name):
    ''' replace user id "uid" with name in meta
    '''
    m = copy.deepcopy(meta)

    m['owner'] = name
    m['switch-date'] = '2016 0331 4:11am'

    m['path'] = str_switch(m['path'], uid, name)

    return m


def str_switch(s, uid, name):
    ''' replace the heading user id to user name in string
    '''
    # patter of id started
    pid = re.compile('^' + uid)
    new_str = re.sub(pid, name, s, 1)
    return new_str

