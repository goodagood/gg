#
# Download a file,  
#

import s3.keys
import s3.crud

def upload(local_path, online_path):
    s3key = s3.keys.file_content(online_path)
    with open(local_path, 'rb') as f:
        s3.crud.put_object(s3key, f)



if __name__ == "__main__":
    ''
