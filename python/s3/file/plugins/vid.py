# Video file type
# Video file has player, poster.
# Posters has thumbnails.
# 2016 0420
#

import os

import mimetypes

import path_setting
import imgvid.poster
import s3.file.klass


def file_name_ok(file_name):
    mime = mimetypes.guess_type(file_name)[0]
    if not mime:
        return False

    return mime.lower().find('video') >= 0


class File(s3.file.klass.File):
    version = 'video-file-in-s3.2016.05.07'
    description = 'For vedio file when it is in s3'

    def href_poster0(self):
        ''' Grap a poster (image) from 00:00:00.000 (hh:mm:ss.ddd)

        suppose self.meta['loc']:
            'path':
        '''
        _res = {} #results

        name = None
        if 'name' not in self.meta:
            self.meta['name'] = name = os.path.basename(self.meta['path'])

        ps = self.meta['posters']
        ps0= ps['0.0']

        ps0key = ps0['key']

        _res['poster0key'] = ps0key

        href = "/s3key/" + ps0key
        _res['poster0href'] = href

        anchor = """<a href="{href}" class="poster"> {name} </a>""".format(
                href=href, name=name)
        _res['poster0anchor'] = anchor

        print(anchor)

        img = """<img src="{href}">""".format(href=anchor)
        print(img)
        _res['poster0img'] = img

        thumb_href = None
        tkeys = ps0['thumbnails'].keys()
        thumb0 = ps0['thumbnails'][tkeys[0]]
        thumb0key = thumb0['key']
        _res['thumb0key'] = thumb0key
        thumb0href = "/s3key/" + thumb0key
        _res['thumb0href'] = thumb0href

        thumb = """<img src="{thumb_href}" class="thumb">""".format(thumb_href=thumb0href)
        _res['thumb0img'] = thumb

        print(thumb)
        print(_res)

        self.poster_thumbs = _res
        self.meta['post0_s3key'] = _res['poster0key']
        self.meta['thumb0_s3key'] = _res['thumb0key']


        pass


    def poster0_s3key(self):
        filename = '0.0.png'
        key = os.path.join(self.meta['name_space_prefix'], 'posters', filename)
        self.meta['poster0_s3key'] = key
        return key
        pass

    def thumb0_s3key(self, width=None, height=80):
        '''
        name: seconds.milli.w--.h--.png
        w--:  width, such as w128, in pixels
        '''
        name = 'thumb-0.0'
        if width:
            name += 'w' + str(width)
        if height:
            name += 'h' + str(height)

        name += '.png'
        key = os.path.join(self.meta['name_space_prefix'], 'posters', name)
        self.meta['thumb0_s3key'] = key
        return key


    def set_poster0_in_meta(self, width=None, height=80):
        print(self.meta)
        s3key = self.poster0_s3key()
        if s3.crud.key_exists(s3key):
            if 'posters' not in self.meta:
                self.meta['posters'] = {'0.0': {}}

            p0 = self.meta['posters']['0.0']
            p0['key'] = s3key
            p0['seconds'] = 0.0
        print(self.meta)


    def set_thumb0_in_meta(self, width=None, height=80):
        s3key = self.thumb0_s3key()
        if s3.crud.key_exists(s3key):
            p0 = self.meta['posters']['0.0']
            p0['thumbnails'] = {'h80': s3key }



if __name__ == "__main__":
    vf = File('tmp/public/tt1.mp4')
    vf.retrieve_meta()
    vf.href_poster0()
