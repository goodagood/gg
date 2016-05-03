
#
# map the remote video file
#

import os
import glob
import mimetypes

import mapper
import imgvid.poster
import imgvid.vid
import s3.crud
import s3.folder.getter

#import loc.file
#import util.mis as util
#import s3.file.getter
#import imgvid.thumb


def try_get_mapper():
    ''' Use mapper to process remote video file
    '''
    remote_video_path = "tmp/public/cats2014.mp4"

    m = mapper.DownMapper(remote_video_path)
    #...
    m.calculate_prefixes()
    m.prepare_prefixed_dirs()
    m.get_remote_file()
    m.download_file()

    return m

def get_mapper(file_path):
    ''' Use mapper to process remote video file
    '''
    #file_path = "tmp/public/cats2014.mp4"

    m = mapper.DownMapper(file_path)
    #...
    m.calculate_prefixes()
    m.prepare_prefixed_dirs()
    m.get_remote_file()
    m.download_file()

    return m

def list_vids(base):
    ''' List online video files in 'base'
    '''
    if not type(base) == str:
        raise Exception('string of base path needed in list vids')

    folder = s3.folder.getter.folder(base)
    infos = folder.grep_file_info(r'(?i)mp4|webm|flv')
    print infos
    for info in infos:
        file_path = os.path.join(base, info['name'])
        m = get_mapper(file_path)
        one_poster(m)


def one_poster(mapper):
    m = mapper
    poster0(m)
    upload_posters(m)
    if 'type' in mapper.rm:
        if type(m.rm['type']) is tuple:
            m.rm['type'] = m.rm['type'][0]
    else:
        m.rm['type'] = mimetypes.guess_type(m.rm['path'])[0]
    #print(m.rm['type'], m.rm['posters'])
    m.rf.save_meta()


def poster0(mapper):
    name = os.path.basename(mapper.rm['path'])
    ext = os.path.splitext(name)[1]
    poster0_path = os.path.join(mapper.lm['pathes']['name_space'], 'posters',
            '0.0' + '.png')

    print("make poster %s"%mapper.lm['pathes']['file'])
    # poster at 0 second
    imgvid.poster.make_poster(
            mapper.lm['pathes']['file'],
            '00:00:00.000',
            poster0_path)


def change_format(mapper, extension):
    ''' The video file change extension by 'ffmpeg' and save in name space.

    Extension can be: mp4, webm, flv, ...
    '''
    ps = mapper.lm['pathes']
    src = ps['file']

    name = os.path.basename(src)
    bare_name = os.path.splitext(name)[0]

    if extension.startswith('.'):
        new_name  = bare_name + extension
    else:
        new_name  = bare_name + '.' + extension
    out = os.path.join(ps['name_space'], new_name)

    print(src, out)
    imgvid.vid.change_format(src, out)


def upload_formats(mapper):
    ''' Upload available formats to online name space
    '''
    ns = mapper.lm['pathes']['name_space']

    name = os.path.basename(mapper.rm['path'])
    bare_name = os.path.splitext(name)[0]

    pattern = os.path.join(ns, bare_name + '*')
    files = glob.glob(pattern)

    for f in files:
        basename = os.path.basename(f)
        key = os.path.join(mapper.rm['name_space_prefix'], basename)
        print(key, f)
        s3.crud.put_file(key, f)


def upload_posters(mapper):
    ''' Upload available formats to online name space
    '''
    ns = mapper.lm['pathes']['name_space']
    pattern = os.path.join(ns, 'posters/*.*')

    files = glob.glob(pattern)

    for f in files:
        basename = os.path.basename(f)
        key = os.path.join(mapper.rm['name_space_prefix'], 'posters', basename)
        print(key, f)
        s3.crud.put_file(key, f)
        add_poster_to_meta(mapper, key)


def add_poster_to_meta(mapper, key):
    rm = mapper.rm
    if 'posters' not in rm:
        rm['posters'] = {}
    ps = rm['posters']
    ps['0.0'] = {'key': key, 'seconds': 0.0}


# not tested
if __name__ == "__main__":
    vidfile = '/tmp/tt1.mp4'
    target  = 'tmp/public/tt1.mp4'
    tbase = 'tmp/public'

    #m = try_get_mapper()
    list_vids(tbase)
