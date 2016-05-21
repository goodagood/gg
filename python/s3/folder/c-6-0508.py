
from pprint import pprint

#import s3.folder.getter
import s3.file.getter
import getter


cwd = 'tmp/public'

fp1 = 'tmp/public/cat-food.mp4'
fp2 = 'tmp/public/cat-dog.mp4'
fp3 = 'tmp/public/cats2014.mp4'
fp4 = 'tmp/public/dog2014.mp4'
fp5 = 'tmp/public/tt1.webm'
fp6 = 'tmp/public/tt1.mp4'

fps = [fp1, fp2, fp3, fp4, fp5, fp6]


def re_save_meta(fipath):
    fi = s3.file.getter.file_with_meta(fipath)
    fi.add_to_folder_ns()


def is_vid(meta):
    if 'type' not in meta:
        return False
    if meta['type'].find('video') >=0:
        return True
        #return meta

    return False

def prepare_blue_gallery(fo, cwd='tmp/public'):
    metas = fo.meta['cache']['files']
    glist = []
    for name, meta in metas.iteritems():
        if 'type' not in  meta:
            continue
        if meta['type'].find('video') < 0:
            print meta['type']
            continue
        gd = {}
        gd['title'] = meta['name']
        gd['type'] = meta['type']
        gd['href'] = '/get/' + cwd + '/' + meta['name']
        gd['poster'] = '/s3key/' + meta['posters']['0.0']['key']
        gd['thumb'] = '/s3key/' + meta['posters']['0.0']['thumbnails']['h80']
        pprint(gd)
        glist.append(gd)

    return glist

if __name__ == "__main__":
    #map(re_save_meta, fps)

    fo = getter.folder(cwd)
    clist = fo.meta['cache']['files']

    glist = prepare_blue_gallery(fo)

