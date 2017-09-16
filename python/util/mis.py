
import copy

import uuid
import munch


def getuuid():
    return str(uuid.uuid4())

def getroot(_path):
    return _path.split('/')[0]


#d, use 'dotify' instead, 2016 0621
class DotAccess(dict):
    """
    Example:
    m = Map({'first_name': 'Eduardo'}, last_name='Pool', age=24, sports=['Soccer'])
    """
    def __init__(self, *args, **kwargs):
        super(Map, self).__init__(*args, **kwargs)
        for arg in args:
            if isinstance(arg, dict):
                for k, v in arg.iteritems():
                    self[k] = v

        if kwargs:
            for k, v in kwargs.iteritems():
                self[k] = v

    def __getattr__(self, attr):
        return self.get(attr)

    def __setattr__(self, key, value):
        self.__setitem__(key, value)

    def __setitem__(self, key, value):
        super(Map, self).__setitem__(key, value)
        self.__dict__.update({key: value})

    def __delattr__(self, item):
        self.__delitem__(item)

    def __delitem__(self, key):
        super(Map, self).__delitem__(key)
        del self.__dict__[key]


def dotify(obj):
    o = copy.deepcopy(obj)
    return munch.munchify(o)


def simple_li(file_meta):
    '''
    '''
    #print('simple li ', file_meta)
    tpl = """
    <li class="{kind}">
        <span class="name">{name}</span>
        <span class="size">{size}</span>
        <span class="type">{kind}</span>
    </li>
    """

    kind = size = ''

    if 'size' in file_meta:
        size = file_meta['size']

    if 'type' in file_meta:
        kind = file_meta['type']
    elif 'filetype' in file_meta:
        kind = file_meta['filetype']
    else:
        kind = ''

    li = tpl.format(name=file_meta['name'],
            size=size, kind=kind)
    return li


class Quote:
    '''
    Save quote for valid names.

    usage:
        q = Quote()
        q.key  # gives: "key", a string

        q.some_other_key  # gives: "some_other_key", a string
    '''
    def __getattribute__(self, name):
        return name
