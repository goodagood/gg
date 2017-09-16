
import crud

tmp_prefix = ".gg.transport.old.data.0329y6/"

def get_tmp_old():
    objs = crud.list_obj(tmp_prefix)
    return objs


if __name__ == "__main__":
    ''
    objs = get_tmp_old()
