
from . import vid

import loc.file



if __name__ == "__main__":
    vidfile = '/tmp/tt1.mp4'
    lf = loc.file.File(vidfile)
    print(lf.meta)

    online_vidfile = 'tmp/public/tt1.mp4'
    vf = vid.File(online_vidfile)
    vf.set_owner('tmp')
    vf.calculate_prefix_and_keys()

    vf.meta['poster'] = None
    poster_s3key = os.path.join(vf.meta['name_space_prefix'], 'poster')

    # build the post file
    pass
