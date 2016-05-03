
import klass

def file(_path):
    ''' Give a file obj, meta not retrieved, but keys calculated.
    '''
    f = klass.File(_path)
    f.calculate_keys() # s3key and meta_s3key

    # file may has no meta saved:
    return f


def retrieve(_path):
    ''' give a file object and meta retrieved
    '''
    f = klass.File(_path)
    f.retrieve_meta()
    return f


def file_meta(_path):
    f = klass.File(_path)

    if f.is_meta_in_s3():
        f.retrieve_meta()
    else:
        f.calculate_prefix_and_keys()

    return f.get_meta()


def file_with_meta(_path):
    f = klass.File(_path)

    if f.is_meta_in_s3():
        f.retrieve_meta()
    else:
        f.calculate_prefix_and_keys()

    return f

if __name__ == "__main__":

    from pprint import pprint
    #f = file('tmp/public/a.txt')
    #print f.read()

    #f = file_with_meta('tmp/public/t1.png')
    f = file_with_meta('tmp/public/tt1.mp4')
    pprint(f.meta)
