import pkgutil
import sys


def load_all_modules_from_dir(dirname = 'plugins'):
    for importer, package_name, _ in pkgutil.iter_modules([dirname]):
        full_package_name = '%s.%s' % (dirname, package_name)
        print('full package name: ', full_package_name)
        if full_package_name not in sys.modules:
            module = importer.find_module(package_name).load_module(full_package_name)
            print module


if __name__ == "__main__":
    load_all_modules_from_dir()
