
import os
from time import time as seconds

import klass
import s3.folder.cache_in as cache_render


def write_txt(txt, file_path):
    fi = klass.File(file_path)
    fi.make_up_basic_meta()
    fi.set_attr('type', 'text/plain')
    fi.set_attr('size', len(txt))
    fi.set_attr('timestamp', seconds()*1000)
    fi.as_li()
    fi.write(txt)#

    fo = fi.get_folder()
    fo.add_file(fi.get_meta())#

    cache_render.cache_render_from_ns(fo)#
    return fi


if __name__ == "__main__":
    file_path = "tmp/public/a.txt"
    txt ='''
            testing text file to tmp/public/, 12:35pm,
            0413 5:43am
         '''

    write_txt(txt, file_path)
