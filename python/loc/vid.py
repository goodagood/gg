
#
# Local image file
#

import loc.file
import util.mis as util
import s3.crud
import s3.file.getter
import imgvid.thumb


class File(loc.file.File):
    #def __init__(self, loc_file_path):
    #    super(self.__class__, self).__init__()


    def _help(self):
        print '''
        self.target_path : target (remote) file path
        '''

    def poster0(self):
        self.prepare_prefixed_dirs()

        if 'mapper' not in self.meta:
            self.make_mapper()

        print("make poster %s"%self.meta['mapper']['poster0'])
        # poster at 0 second
        imgvid.poster.make_poster(self.meta['path'], '00:00:00.000',
                self.meta['mapper']['poster0'])



    def thumb0(self, height=80):
        p0 = self.meta['mapper']['poster0']
        t0 = self.meta['mapper']['thumb0']
        imgvid.thumb.resize_h(p0, t0, height)

        name = self.thumb_name(poster_seconds=0, height= height)

        tm = self.meta['target_file'].meta
        key = os.path.join(tm['name_space_prefix'], name)

        ps0 = tm['posters']['0.0']

        mark = self.thumb_mark(height=height)
        print('thumb mark: ', mark)
        ps0['thumbnails'][mark] = {
                "key": key,
                "height": 80
                }
        pass

    def set_poster_data_structure(self):
        t  = self.meta['target_file']
        tm = t.meta

        if 'posters' not in tm:
            tm['posters'] = ps = {}
        else:
            ps = tm['posters']

        if '0.0' not in ps:
            name = self.poster_name(0.0)
            key = os.path.join(tm['name_space_prefix'], name)
            ps['0.0'] = {
                    "seconds": 0.0,
                    "key": key,
                    "thumbnails": {}
                    }
            pass
        return ps

    def poster_name(self, seconds, img_ext=".png"):
        return 'poster-' + str(seconds) + img_ext

    def thumb_mark(self, width=None, height=None):
        mark = ""

        if width != None:
            mark += "w%s"%width
        if height != None:
            mark += "h%s"%height
        return mark

    def thumb_name(self, poster_seconds=None, width=None, height=None, img_ext=".png"):
        name = "thumb-"
        if poster_seconds != None:
            name += "s%s"%poster_seconds

        name += self.thumb_mark(width, height)

        return name + img_ext


    def make_mapper(self):
        #mapper_path = ''
        self.meta['mapper'] = mapper = {}
        mapper['poster0'] = os.path.join('/tmp', util.getuuid()) + '.png'
        mapper['thumb0'] = os.path.join('/tmp', util.getuuid()) + '.png'
        mapper['vid'] = os.path.join('/tmp', util.getuuid()
                ) + os.path.splitext(self.meta['target'])[1]

    def set_target_file(self, target_path=None):
        if target_path:
            self.meta['target'] = target_path
        if 'target' in self.meta:
            target_file = s3.file.getter.file_with_meta(self.meta['target'])
            self.meta['target_file'] = target_file
            return target_file

    def upload(self):
        tm = self.meta['target_file'].meta
        s3.crud.put_file(tm['s3key'], self.meta['path'])

    def upload_poster0(self):
        # target file meta:
        tm = self.meta['target_file'].meta
        lposter = self.meta['mapper']['poster0']
        rposter = tm['posters']['0.0']['key'] # s3 key

        lthumb = self.meta['mapper']['thumb0']
        rthumb = tm['posters']['0.0']['thumbnails']['h80']['key'] # s3 key

        s3.crud.put_file(lposter, rposter)
        s3.crud.put_file(lthumb,  rthumb)
        self.meta['target_file'].save_meta()

    def rm_tmp(self):
        for i in self.meta['mapper']:
            _path = self.meta['mapper'][i]
            if os.path.exists(_path):
                print("remove %s"%_path)
                os.remove(_path)

    #...
    def download_vid(self):
        if 'mapper' in self.meta:
            pass
        if 'target_file' in self.meta:
            fi = self.meta['target_file']
            s3key = fi.meta['s3key']
            #...
            pass



# not tested
if __name__ == "__main__":
    vidfile = '/tmp/tt1.mp4'
    target  = 'tmp/public/tt1.mp4'

    def makea_oldvid(loc_file=vidfile, target_path=target):
        lvf = File(vidfile)
        #lvf.meta = meta
        lvf.set_target_file(target_path = target)
        lvf.make_mapper()
        lvf.set_poster_data_structure()
        print lvf.meta
        return lvf

    def makea_oldvid(loc_file=vidfile, target_path=target):
        ''

    vf = makea_oldvid()
    vf.poster0()
    vf.thumb0()
    tf = vf.meta['target_file']
    tm = tf.meta
