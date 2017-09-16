
from time import time as seconds

import klass
import s3.crud
import s3.folder.cache_in as cache_render


def put(info):
    ''' put a local file to s3.

    suppose info has path attribute:
        info:
            {
            'path': user-name/path/to/file-name.extension,
            loc: {
                'path': local file path,
                ...
                }
            }
    '''
    fi = klass.File(info['path'])
    fi.make_up_basic_meta()

    loc = info['loc']
    if 'path' not  in loc:
        raise Exception("""no local file given?
            info["loc"]["path"]
            for {}.""".format(info['path']))
        return

    if 'type' in loc:
        fi.set_attr('type', loc['type'])
    if 'size' in loc:
        fi.set_attr('size', loc['size'])

    fi.set_attr('timestamp', int(seconds()*1000))
    fi.as_li()
    fi.set_attr('no_meta_file', True)
    meta = fi.get_meta()
    s3.crud.put_file(meta['s3key'], loc['path'])#

    fo = fi.get_folder()
    fo.add_file_in_ns(fi.get_meta())#

    cache_render.cache_render_from_ns(fo)#
    return fi


if __name__ == "__main__":
    info = {
            "path": "tmp/public/t1.png",
            "loc": {
                "path": "/tmp/t1.png"
                }
            }
    #put(info)
    pass


