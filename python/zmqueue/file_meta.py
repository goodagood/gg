import path_setting
import s3.file.getter

def retrieve_or_calculate(info):
    if 'path' not in info:
        return {'got no path for folder ul, in function reply': True}

    # file.text
    asked  = info['ask-for']

    #...
    fi = s3.file.getter.get_file(info['path'])
    if fi.is_meta_in_s3():
        fi.retrieve_meta()
    else:
        #print('calculate')
        fi.make_up_basic_meta()
    fi.guess_type()

    # we are not checking if it has text.
    info[asked] = fi.get_meta()

    return info


if __name__ == "__main__":
    info = {
            "who": 'tmp',
            "ask-for": 'file.text',
            "path": 'tmp/public/a.txt',
            "timeout": 3000
            }

    print(retrieve_or_calculate(info))
