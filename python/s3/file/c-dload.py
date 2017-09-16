import os
import imp
import sys
import pkgutil

from pprint import pprint
#----------------------------------------------------------------------
def dynamic_importer(name, class_name):
    """
    Dynamically imports modules / classes
    """
    try:
        fp, pathname, description = imp.find_module(name)
    except ImportError:
        print "unable to locate module: " + name
        return (None, None)

    try:
        example_package = imp.load_module(name, fp, pathname, description)
    except Exception, e:
        print e

    try:
        myclass = imp.load_module("%s.%s" % (name, class_name), fp, pathname, description)
        print myclass
    except Exception, e:
        print e

    return example_package, myclass


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



def load_all_modules_from_dir(dirname):
    loaded = {}
    for importer, package_name, _ in pkgutil.iter_modules([dirname]):
        if package_name.startswith('c-'):
            # my file name set for checking codes.
            continue

        full_package_name = '%s.%s' % (dirname, package_name)
        if full_package_name not in sys.modules:
            module = importer.find_module(package_name).load_module(full_package_name)
            loaded[package_name] = module
            print module
            print dir(module)

    return loaded



if __name__ == "__main__":
    subdir = 'plugins'
    class_name = 'File'

    #module, modClass = dynamic_importer("plugins", "File")

    #names = get_names(subdir)
    #_plugin_dir = os.path.join(os.path.dirname(__file__), subdir)
    #for n in names:
    #    pprint(imp.find_module(n, _plugin_dir))

    #pprint(imp.find_module('img', "/home/ubuntu/workspace/gg/python/s3/file/plugins"))
    #pprint(imp.find_module('img', __name__))
    #import plugins
    #pprint(dir(plugins))
    #pprint(plugins.__name__)

    mods = load_all_modules_from_dir('plugins')
