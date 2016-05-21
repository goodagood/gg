
import s3.file.klass as klass

#import load_plugins

import s3.file.plugins.img as pimg
import s3.file.plugins.vid as pvid


def poorswitch(_path):
    if pimg.file_name_ok(_path):
        return pimg.File(_path)
    if pvid.file_name_ok(_path):
        return pvid.File(_path)

    #else:
    return klass.File(_path)


def get_file(_path):
    ''' Give a file obj, meta not retrieved, but keys calculated.
    '''
    f = poorswitch(_path)

    f.calculate_keys() # s3key and meta_s3key

    # file may has no meta saved:
    return f


def retrieve(_path):
    ''' give a file object and meta retrieved
    '''
    f = get_file(_path)
    f.retrieve_meta()
    return f


def file_meta(_path):
    f = get_file(_path)

    if f.is_meta_in_s3():
        f.retrieve_meta()
    else:
        f.calculate_prefix_and_keys()

    return f.get_meta()


def file_with_meta(_path):
    #print(" -- file with meta: %s"%_path)
    f = get_file(_path)

    if f.is_meta_in_s3():
        #print('retrieve file ', _path)
        f.retrieve_meta()
    else:
        f.calculate_prefix_and_keys()

    return f

if __name__ == "__main__":

    from pprint import pprint
    #f = get_file('tmp/public/a.txt')
    #print(f.read())
    #f = get_file('tmp/public/tt1.mp4')
    f = get_file('tmp/public/cat-food.mp4')
    if hasattr(f, 'version'):
        print(f.version)

    #f = file_with_meta('tmp/public/t1.png')
    #f = file_with_meta('tmp/public/tt1.mp4')
    #pprint(dir(f), f.meta)
