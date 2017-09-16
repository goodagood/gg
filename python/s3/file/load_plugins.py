import os
import sys
import pkgutil

from pprint import pprint

#----------------------------------------------------------------------

def mynoop():
    pass

def get_names(sub_folder_name):
    _plugin_dir = os.path.join(os.path.dirname(__file__), sub_folder_name)
    names = []
    for filename in os.listdir(_plugin_dir):
        print "file name: %s"%filename
        if filename == '__init__.py' or filename[-3:] != '.py':
            continue
        if filename == os.path.basename(__file__):
            continue
        if filename.startswith('c-'):
            # my file name set for checking codes.
            continue

        name = filename[:-3]
        print filename[:-3]
        names.append(name)
    print names
    return names


import plugins
def load_all_modules_from_dir(dirname="plugins"):
    loaded = {}
    for loader, package_name, isPkg in pkgutil.iter_modules([dirname]):
        #print('lpi: ', loader, package_name, isPkg)
        if package_name.startswith('c-'):
            # my file name set for checking codes.
            continue

        full_package_name = '%s.%s' % (dirname, package_name)
        if full_package_name not in sys.modules:
            module = loader.find_module(package_name).load_module(full_package_name)
            loaded[package_name] = module
            #print module
            #print dir(module)

    return loaded


def check_mods(mods, filenames):
    keys = mods.keys()
    keys.sort()
    for key in keys:
        print ("=== key of mods: ", key)
        mod = mods[key]
        if hasattr(mod, 'file_name_ok'):
            print 'mod has file_name ok'
            file_name_ok = getattr(mod, 'file_name_ok')
            for f in filenames:
                print f
                print file_name_ok(f)
        if hasattr(mod, 'File'):
            print 'mod has File '


def apply_1st_mod(online_file_path):
    mods = load_all_modules_from_dir()
    keys = mods.keys()
    keys.sort()
    print mods
    print keys
    for key in keys:
        print ("=== key of mods: ", key)
        mod = mods[key]
        if hasattr(mod, 'file_name_ok'):
            print 'mod has file_name ok'
            if hasattr(mod, 'File'):
                print 'mod has File '
                file_name_ok = getattr(mod, 'file_name_ok')
                if file_name_ok(online_file_path):
                    print ("going to give instance, key of mods: ", key)
                    File = getattr(mod, 'File')
                    f = File(online_file_path)
                    return f

def get_1st_mod(online_file_path):
    mods = load_all_modules_from_dir()
    keys = mods.keys()
    keys.sort()
    print mods
    print keys
    for key in keys:
        print ("=== key of mods: ", key)
        mod = mods[key]
        if hasattr(mod, 'file_name_ok'):
            print 'mod has file_name ok'
            if hasattr(mod, 'File'):
                print 'mod has File '
                file_name_ok = getattr(mod, 'file_name_ok')
                if file_name_ok(online_file_path):
                    return mod

    print 'get 1st mod return None'
    return None


if __name__ == "__main__":
    import inspect

    subdir = 'plugins'
    class_name = 'File'

    filenames = ["abc.jpg",
            "kdlsoo.dkf.mp4",
            "tmp/some/path/vid.webm",
            "tmp/some/pa.th/some.mp3"
            ]

    #module, modClass = dynamic_importer("plugins", "File")

    #names = get_names(subdir)
    #_plugin_dir = os.path.join(os.path.dirname(__file__), subdir)

    #import plugins
    #pprint(dir(plugins))
    #pprint(plugins.__name__)

    #mods = load_all_modules_from_dir('plugins')
    #check_mods(mods, filenames)
    apply_1st_mod(filenames[2])

    
