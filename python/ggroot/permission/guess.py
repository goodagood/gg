
from . import per as Perm

import util.mis

def base_on_meta(meta):

    data = check_meta(meta)

    if 'owner' not in data:
        raise Exception('no owner found to set up access control 0603 0151am')

    control = Perm.Permission(data)
    # control will return a bool (True/False) for:
    #
    #  control.can_be_read_by   (username)
    #  control.can_be_written_by(username)
    #  control.can_be_run_by    (username)
    #
    return control


def base_on_meta_with_default(meta, default_control):
    try:
        return base_on_meta(meta)
    except Exception:
        return default_control


def check_meta(meta):
    data = {}
    if 'permission' in meta:
        data = check_permission(meta['permission'])

    if 'owner' not in data:
        if 'owner' in meta:
            o = meta['owner']
            if type(o) == str:
                data['owner'] = o
        pass

    if 'owner' not in data:
        if 'path' in meta:
            p = meta['path']
            if type(p) == str:
                o = util.mis.getroot(p)
                if type(o) == str:
                    data['owner'] = o
        pass

    return data


def check_permission(perdata):
    data = {}
    if 'owner' in perdata:
        o = perdata['owner']
        if type(o) == str:
            data['owner'] = o
    if 'readers' in perdata:
        r = perdata['readers']
        if type(r) == list:
            data['readers'] = r
    if 'writers' in perdata:
        w = perdata['writers']
        if type(w) == list:
            data['writers'] = w
    if 'runners' in perdata:
        runners = perdata['runners']
        if type(runners) == list:
            data['runners'] = runners
            pass
        pass
    pass
    return data

