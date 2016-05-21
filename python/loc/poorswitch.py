
import loc.mirror
import loc.img
import loc.vid


# based on 'file name ok'

def mirror_a_file(online_file_path):
    if loc.img.file_name_ok(online_file_path):
        return loc.img.File(online_file_path)
    if loc.vid.file_name_ok(online_file_path):
        return loc.vid.File(online_file_path)

    #else:
    return loc.mirror.File(online_file_path)



