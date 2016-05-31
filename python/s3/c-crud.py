
import s3.crud as crud
import s3.keys


if __name__ == "__main__":
    print('__name__ == "__main__"')

    cwd = 'tmp/public'
    s3key = s3.keys.folder_meta(cwd)


    #o = crud.get_obj(s3key)
    j = crud.get_json(s3key)
    print(j)
