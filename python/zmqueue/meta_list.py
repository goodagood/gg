
import path_setting
import s3.folder.getter as getter

def file_metas_in_folder_cache(info):
    if 'path' not in info:
        return {'got no path for folder ul, in function reply': True}

    #get folder ul
    asked  = info['ask-for']
    folder = getter.folder(info['path'])
    cache  = folder.get_cache()
    metas  = cache['files']

    info[asked] = metas

    return info


if __name__ == "__main__":
    info = {
            "who": 'tmp',
            "ask-for": 'meta.list',
            "path": 'tmp/public',
            'patstr': '.+',
            "timeout": 3000
            }

    print( file_metas_in_folder_cache(info))
