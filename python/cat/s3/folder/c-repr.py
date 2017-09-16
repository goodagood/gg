
import s3.folder.repr


def check_0602():
    username = 'tmp'
    cwd = 'tmp/public'
    res = s3.folder.repr.give_user_folder_repr(username, cwd)
    print(res)

if __name__ == "__main__":
    print('checking folder repr')
    check_0602()
