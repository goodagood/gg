
import importlib

import s3.file.rwcmd #?

print(s3.file.rwcmd.read_txt('tmp/public/a.txt'))

#per = importlib.import_module("permission.per")

#importlib.find_loader("permission.aa")
per = importlib.import_module("ggpermission.aa")
#per = importlib.import_module("s3.folder")
