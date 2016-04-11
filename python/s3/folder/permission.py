
default_folder_permission = {
        "owner":  {
            "read":    True,
            "write":   True,
            "execute": True
        },
        "root":   {
            "read":    True,
            "write":   True,
            "execute": True
        },
        "member": {
            "read":    True,
            "write":   True,
            "execute": True
        },
        "viewer": {
            "read":    True,
            "write":   False,
            "execute": False
        },
        "public": {
            "read":    False,
            "write":   False,
            "execute": False
        },
        "inherit": Ture
    }


default_file_permission = {
        "owner":  {
            "read":    True,
            "write":   True,
            "execute": True
        },
        "root":   {
            "read":    True,
            "write":   True,
            "execute": True
        },
        "member": {
            "read":    True,
            "write":   True,
            "execute": True
        },
        "viewer": {
            "read":    True,
            "write":   False,
            "execute": False
        },
        "public": {
            "read":    False,
            "write":   False,
            "execute": False
        },
        "inherit": Ture
    }


def set_folder_permisstion(folder, permission=default_folder_permission):
    folder.set_attr("permission", per)
