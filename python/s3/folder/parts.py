
#
# Give parts needed by client
# This might be a tmp solution, 2016 0621
#


import s3.folder.getter as getter


def give_user_parts(username, cwd):
    f = getter.folder(cwd)
    if not f.control.can_be_read_by(username):
        return {}

    # From here, user is able to read folder
    pass



if __name__ == "__main__":
    from pprint import pprint


    username = 'tmp'
    cwd = 'tmp/public'

    f = s3.folder.getter.folder(cwd)

    check_0621()
