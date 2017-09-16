
import os
import importlib


print __file__
print('name: ', __name__)

_plugin_dir = os.path.join(os.path.dirname(__file__), 'plugins')

for filename in os.listdir(_plugin_dir):
    print "file name: %s"%filename
    if filename == '__init__.py' or filename[-3:] != '.py':
        continue
    if filename == os.path.basename(__file__):
        continue
    if filename.startswith('c-'):
        # my file name set for checking codes.
        continue

    print filename[:-3]
    importlib.import_module('..' + filename[:-3], __name__)

    #abspath = os.path.join(_plugin_dir, filename)
    #importlib.import_module(abspath[:-3])

    #__import__(filename[:-3], locals(), globals())
    #importlib.import_module(filename[:-3])

del filename
