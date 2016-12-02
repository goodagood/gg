
import path_setting
import s3.file.klass

def read(info):
    if 'path' not in info:
        return {'got no path for folder ul, in function reply': True}

    # file.text
    asked  = info['ask4'] or info['ask-for']

    #...
    fi = s3.file.klass.File(info['path'])

    # we are not checking if it has text.
    _text = fi.read()
    info[asked] = fi.read()

    #return info
    return _text

main = read

if __name__ == "__main__":
    info = {
            "who": 'tmp',
            "ask-for": 'file.text',
            "path": 'tmp/public/a.txt',
            "timeout": 3000
            }

    #print read(info)
