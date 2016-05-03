
import path_setting
import s3.file.klass

def read(info):
    if 'path' not in info:
        return {'got no path for folder ul, in function reply': True}

    # file.text
    asked  = info['ask-for']

    #...
    fi = s3.file.klass.File(info['path'])

    # we are not checking if it has text.
    info[asked] = fi.read()

    return info


if __name__ == "__main__":
    info = {
            "who": 'tmp',
            "ask-for": 'file.text',
            "path": 'tmp/public/a.txt',
            "timeout": 3000
            }

    #print read(info)
