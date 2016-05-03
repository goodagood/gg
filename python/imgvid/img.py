
#
# Image object to help image processing.
# 2016 0422
#

from wand.image import Image

import s3.crud


class Img(object):
    def __init__(self, path_or_key):
        self.pork = path_or_key
        self.img  = None

    def load_file(self, file_path):
        self.img = Image(filename = file_path)
        return self.img

    def load_s3(self, s3key):
        body = s3.crud.get_body(s3key)
        self.img = Image(file=body)


def from_file(file_path):
    return Image(filename = file_path)

def from_s3(s3key):
    body = s3.crud.get_body(s3key)
    return Image(file=body)
