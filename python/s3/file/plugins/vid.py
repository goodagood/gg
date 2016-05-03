# Video file type
# Video file has player, poster.
# Posters has thumbnails.
# 2016 0420
#

import path_setting
import imgvid.poster
import s3.file.klass
import loc.file

class File(s3.file.klass.File):

    def poster0(self):
        ''' Grap a poster (image) from 00:00:00.000 (hh:mm:ss.ddd)

        suppose self.meta['loc']:
            'path':
        '''


        pass


    def from_local_file(self, loc_file):
        pass


def make_vid_file_from_loc_file(loc_path):
    #lf = loc.file.File(loc_path)
    pass


if __name__ == "__main__":
    vf = File('tmp/public/tt1.mp4')
