import path_setting
import s3.file.plugins.img as image

def put_tmp_thumb(info):
    if 'path' not in info:
        return {'got no path for put tmp thumb, in function reply': True}

    asked  = info['ask-for']

    img = image.get_image(info['path'])
    href = img.thumb_tmp(info['width'], info['height'])

    info[asked] = href
    return info


if __name__ == "__main__":
    info = {
            "who": 'tmp',
            "ask-for": 'tmp.thumb',
            "path": 'tmp/public/t1.png',
            "width": 128,
            "height": 72,
            "timeout": 3000
            }

    print(put_tmp_thumb(info))
