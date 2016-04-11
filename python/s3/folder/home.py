# Fixing user homes

from pprint import pprint

import path_setting

import users_a as users
import adder
import getter


def restore():
    ''' Restore all homes deleted, 2016 0404
    '''
    infos = users.get_id_names()

    owners = [o['owner'] for o in infos]
    owners = sorted(owners)
    for n in owners:
        print('one home: ', n)
        one_home(n)

    #print "  \t  ".join(owners)


def one_home(name, subnames=['gg', 'public', 'muji']):
    root = adder.safe_new_root(name)
    subs = {}
    for i in subnames:
        root.safe_sub_folder(i)


def all_names():
    ''' Restore all homes deleted, 2016 0404
    '''
    infos = users.get_id_names()

    owners = [o['owner'] for o in infos]
    owners = sorted(owners)
    return owners


def add_name_attr():
    '''  add it. 'name' attribute for all roots were forgot, 2016 0404
    '''
    names = all_names()
    for n in names:
        f = getter.folder(n)
        m = f.get_meta()
        if 'name' not in m:
            print("name {} not there".format(n))
            m['name'] = n
            f.save_meta()
    #pprint(names)


def cnamehome():
    ni = users.get_id_names()
    print([tni for tni in ni if tni['owner'] != tni['home']])

if __name__ == "__main__":
    print('__name__ == "__main__"')
    #restore()
    add_name_attr()
