
from . import path_setting
from . import li

import s3.file.klass

def name_part(file_path = 'tmp/s.text'):
    f = s3.file.klass.File(file_path)
    f.calculate_prefix_and_keys()

    meta = f.get_meta()

    if f.is_meta_in_s3():
        meta = f.retrieve_meta()

    np = li.make_name_part(meta)
    print(np)


def fill(file_path = 'tmp/s.text'):
    f = s3.file.klass.File(file_path)
    f.calculate_prefix_and_keys()

    meta = f.get_meta()

    if f.is_meta_in_s3():
        meta = f.retrieve_meta()

    litag = li.fill_li_tag(meta)
    print(litag)


if __name__ == "__main__":
    #name_part()
    fill()
