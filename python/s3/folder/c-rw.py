
import importlib

import s3.file.rwcmd #?

print(s3.file.rwcmd.read_txt('tmp/public/a.txt'))

per = importlib.import_module("ggroot.permission.per")

per = importlib.import_module("s3.folder")
