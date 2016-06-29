
import path_setting #d

#import s3.folder.getter as getter
from s3.folder import  getter


def cached_reply(info):
    if 'path' not in info:
        return {'got no path for folder ul, in function reply': True}

    #get folder ul
    asked  = info['ask-for']
    folder = getter.folder(info['path'])
    cache  = folder.get_cache()
    if 'renders' in cache and 'ul' in cache['renders']:
        info[asked] = cache['renders']['ul']
    else:
        info[asked] = -1

    return info


if __name__ == "__main__":
    info = {
            "who": 'tmp',
            "ask-for": 'folder.ul',
            "path": 'tmp/public',
            "timeout": 3000
            }

    #print cached_reply(info)
