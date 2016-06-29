
from pprint import pprint

import s3.whowhat.file_meta_list_in_folder_cache as metaListor



if __name__ == "__main__":
    m1 = metaListor.list_metas_for_user('tmp', 'tmp/public')
    m2 = metaListor.list_metas_for_user('abc', 'tmp/public')
    pprint(m1)
    pprint(m2)
