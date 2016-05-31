# do it json file.
# 2016 0523

import os
#from . import json
import json
import mimetypes

import s3.crud
import s3.file.klass
import util.mis
import util.json_repr




def file_name_ok(file_name):
    mime = mimetypes.guess_type(file_name)[0]
    if not mime:
        return False

    return mime.lower().find('json') >= 0


class File(s3.file.klass.File):
    ''' Image file class

    s3.file.klass.File get: __init__(path)
    '''

    def type_ok(self):
        if 'type' not in self.meta:
            self.guess_type()

        if 'json' in self.meta['type']:
            return True

        return False


    def load(self):
        ''' Load json, make it self.json
        '''
        #json_str = super(File, self).read()
        json_str = self.read()
        self.json = json.loads(json_str)

        return self.json


    def pprint_json_to_str(self):
        if not hasattr(self, 'json'):
            self.load()

        return json.dumps(self.json, indent=4, sort_keys=True)


    def render_data(self):
        if not hasattr(self, 'json'):
            self.load()

        return util.json_repr.ul(self.json)


    def as_li(self):
        sli = super(File, self).as_li()
        print(sli)


#?
def get_image(file_path):
    fi = File(file_path)
    fi.calculate_keys()

    if fi.is_meta_in_s3():
        fi.retrieve_meta()
    else:
        fi.calculate_prefix_and_keys()

    meta = fi.get_meta()
    if s3.crud.key_exists(meta['s3key']):
        fi.load()
        return fi
    else:
        return None
    #fi.resize(80,80)


if __name__ == "__main__":

    file_path = "tmp/public/a.json"


    def c0523(file_path = file_path):
        fi = File(file_path)
        fi.calculate_keys()

        if fi.is_meta_in_s3():
            fi.retrieve_meta()
        else:
            fi.calculate_prefix_and_keys()


        return fi

    fi = c0523(file_path)
    j2 = fi.load()
