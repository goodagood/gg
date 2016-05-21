
from pprint import pprint

import klass
import s3.crud as crud
import util.mis as util





def cache_in_meta(folder):
    ''' Got infos from folder name space: name-space-prefix/files/
    cache those infos into meta['cache']['files']
    '''
    sub_metas = folder.get_infos_of_ns_files()
    cache = folder.get_cache()
    for m in sub_metas:
        cache['files'][m['name']] = m


def ul_from_cache(folder):
    ''' Build list 'ul' for file infos in meta['cache']['files']
    '''
    cache = folder.get_cache()
    files = cache['files']
    ul = '<ul class="file-list folder">'
    for i in files:
        f = files[i]
        ul += "\r\n"
        if 'li' in f:
            ul += f['li']
            continue
        else:
            ul += util.simple_li(f)

    ul += "\r\n</ul>"
    cache['renders']['ul'] = ul


def cache_render_from_ns(folder):
    ''' get info from name space, cache it in meta,
        then render <ul> and save folder meta.
    '''
    cache_in_meta(folder)
    ul_from_cache(folder)
    folder.save_meta()



if __name__ == "__main__":
    ''' checkings
    '''
    import s3.folder.getter

    #tp = s3.folder.getter.folder('tmp/public')
    #cache_render_from_ns(tp)

    #abc = s3.folder.getter.folder('abc')

    gg = s3.folder.getter.folder('tmp/gg')
    cache_render_from_ns(gg)
