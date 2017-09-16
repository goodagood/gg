

from wand.image import Image



def resize_h(img_path, thumb_path, target_height):
    with Image(filename = img_path) as img:
        ratio = target_height * 1.0 / img.height
        img.resize(int(ratio * img.width), target_height)
        img.save(filename = thumb_path)

def resize_hw(img_path, thumb_path, target_height, target_width):
    with Image(filename = img_path) as img:
        img.resize(int(target_width), int(target_height))
        img.save(filename = thumb_path)


def img_in_s3(key, info):
    ''' Set up an image object from s3 key.
    '''
    pass
