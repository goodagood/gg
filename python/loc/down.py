#
# Download a file,  
#

import s3.keys
import s3.crud

def download(online_path, local_path):
    s3key = s3.keys.file_content(online_path)
    with open(local_path, 'wb') as f:
        f.write(s3.crud.get_body(s3key).read())



if __name__ == "__main__":
    ''
