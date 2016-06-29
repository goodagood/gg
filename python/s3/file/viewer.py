
import os

from . import getter

import ggroot.permission.guess as guess_permission


class Viewer:
    def __init__(self, obj=None, path=None):
        if obj:
            self.ofile = obj
        elif path:
            self.from_path(path)
        else:
            raise Exception('what viewer?')

        self.set_meta_and_control()

    def from_path(self, path):
        self.ofile = getter.get_file(path)

    def set_meta_and_control(self):
        self.mfile = self.ofile.meta
        if 'path' not in self.mfile:
            raise Exception('no path for file, 0603 12:22pm')

        self.path = self.mfile.['path']
        if 'name' in self.mfile:
            self.name = self.mfile.['name']
        else:
            self.name = os.path.basename(self.path)

        self.oparent = self.ofile.get_folder()  # parent, folder object
        self.control = guess_permission.base_on_meta_with_default(
                self.mfile, self.oparent.control)
        pass


    def tools_for(self, username):
        download = """
        <a href="/dl/{path}" class="download"> {name} </a>
        """.format(path=self.path, name=self.name)



