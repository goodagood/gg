
#
# map the remote video file
#

import os
import glob
import mimetypes

import mapper

import loc.mirror
import loc.poorswitch

import imgvid.poster
import imgvid.vid
import s3.crud
import s3.folder.getter
import s3.folder.cache_in
import s3.file.getter


from pprint import pprint


tmp_vid_file = '/tmp/tt1.mp4'
tmp_target  = 'tmp/public/tt1.mp4'
cwd = 'tmp/public'

#m = try_get_mapper()
#do_vids(cwd)

#infos = list_vids(cwd)
#print infos
#ia = infos[1]

#files = map(lambda i: loc.mirror.File(i['path']), infos)
#for f in files:
#    f.get_target_file()
#    print f.tm['path']
#    print f.tm['uuid']

fp1 = 'tmp/public/cat-food.mp4'
fp2 = 'tmp/public/cat-dog.mp4'
fp3 = 'tmp/public/cats2014.mp4'
fp4 = 'tmp/public/dog2014.mp4'
fp5 = 'tmp/public/tt1.webm'
fp6 = 'tmp/public/tt1.mp4'


def start_mirror(online_file_path):
    fi = loc.poorswitch.mirror_a_file(online_file_path)
    fi.get_target_file()
    return fi
    pass

def show_uuid(online_file_path):
    fi = start_mirror(online_file_path)
    print(fi.tm['uuid'], online_file_path)
    return fi

## test another file:
info1 = {'name': 'cat-dog.mp4',
    'path': 'tmp/public/cat-dog.mp4',
    'size': 37026041,
    'type': "('video/mp4',none)"
    }

def del_rest():
    rest_pathes = [fp3, fp4, fp5, fp6]
    for f in rest_pathes:
        fi = start_mirror(f)
        pprint(fi.tm)
        fi.tf.delete_name_space()
        fi.tf.delete_meta_file()


def refix_one(online_file_path):
    fi = start_mirror(online_file_path)
    pprint(fi.tm)
    fi.tf.delete_name_space()
    fi.tf.delete_meta_file()
    fi.mirror_down()
    fi.poster0()
    fi.thumb0()
    fi.upload_poster0()
    fi.tf.set_poster0_in_meta()
    fi.tf.set_thumb0_in_meta()
    fi.build_online_meta()
    fi.tf.save_meta()

def refix_rest():
    rest_pathes = [fp3, fp4, fp5, fp6]
    for f in rest_pathes:
        refix_rest(f)


def thumba(path_):
    fi = start_mirror(path_)
    fi.tf.set_thumb0_in_meta()
    fi.tf.save_meta()


#...
def thumb160_0510(path_ = fp1):
    lf = start_mirror(path_)
    if not os.path.exists(lf.mns.mirror_path_):
        lf.mirror_down()
        pass

    post_file = lf.name_poster0()
    print('poster 0 file: ', post_file)
    if not os.path.exists(post_file):
        lf.post0()

    file160 = lf.name_thumb(height=160)
    print('thumb 160 file: ', file160)

    lf.thumb160()

    s3key   = lf.tf.thumb0_s3key(height=160)
    print('160 s3key: ', s3key)
    #upload the 160 thumb 
    s3.crud.put_file(s3key, file160)

    lf.tm['thumb'] = s3key

    lf.tm['posters']['0.0']['thumbnails']['h160'] = s3key
    lf.tm['poster'] = lf.tm['posters']['0.0']['key']

    lf.tf.save_meta()
    lf.tf.add_to_folder_ns()
    return lf


def re_add_vid_to_tmp_public():
    ps = [fp1, fp2, fp3, fp4, fp5, fp6]

    for fp in ps:
        f = s3.file.getter.file_with_meta(fp)
        f.add_to_folder_ns()

    cwd = os.path.dirname(fp1)
    tp = s3.folder.getter.folder(cwd)
    s3.folder.cache_in.cache_render_from_ns(tp)
    return tp



# not tested
if __name__ == "__main__":
    #del_rest()


    #fi = start_mirror(fp2)
    #pprint(fi.tm)
    #fi.tf.set_thumb0_in_meta()

    #f3 = start_mirror(fp3)
    #pprint(f3.tm)

    #map(thumba, [fp1, fp3, fp4, fp5, fp6])
    #map(show_uuid, [fp1, fp2, fp3, fp4, fp5, fp6])


    #f2 = thumb160_0510(fp2)
    #for fp in [fp3, fp4, fp5, fp6]:
    #    f = thumb160_0510(fp)

    tp = re_add_vid_to_tmp_public()

