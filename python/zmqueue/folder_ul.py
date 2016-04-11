
import path_setting
import s3.folder.getter as getter

def cached_reply(info):
    if 'path' not in info:
        return {'got no path for folder ul, in function reply': True}

    #get folder ul
    folder = getter.folder(info['path'])
    cache  = folder.get_cache()
    if 'renders' in cache and 'ul' in cache['renders']:
        return cache['renders']['ul']
    else:
        return None


if __name__ == "__main__":
    info = {
            "who": 'tmp',
            "ask-for": 'folder.ul',
            "path": 'tmp/public',
            "timeout": 3000
            }

    print cached_reply(info)
