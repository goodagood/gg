import path_setting
import s3.file.getter

def retrieve_or_calculate(info):
    if 'path' not in info:
        return {'got no path for folder ul, in function reply': True}

    asked  = info['ask4'] or info['ask-for']

    fi = s3.file.getter.get_file(info['path'])
    if fi.is_meta_in_s3():
        fi.retrieve_meta()
    else:
        #print('calculate')
        fi.make_up_basic_meta()
    fi.guess_type()

    # we are not checking if it has text.
    _reply = fi.meta
    info[asked] = _reply

    #return info
    return _reply


main = retrieve_or_calculate


if __name__ == "__main__":
    info = {
            "who": 'tmp',
            "ask-for": 'file.text',
            "path": 'tmp/public/a.txt',
            "timeout": 3000
            }

    print(retrieve_or_calculate(info))
