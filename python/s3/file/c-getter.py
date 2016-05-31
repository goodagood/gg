
from pprint import pprint

import s3.file.getter as getter


a = getter.get_file('tmp/public/a.txt')
a.make_up_basic_meta()
#a.set_attr('owner', a.meta['root'])
a.set_attr('owner', 'tmp')
a.set_permission()
a.list_tools()


#print(f.read())
#f = getter.get_file('tmp/public/tt1.mp4')
#f = getter.get_file('tmp/public/cat-food.mp4')

if hasattr(a, 'version'):
    print(a.version)


if __name__ == "__main__":
    pass
