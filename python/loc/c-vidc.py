#
# Check or try to make vid web pages

# 2016 0503
#

import re
import os
from pprint import pprint

import s3.folder.getter
import s3.file.getter


def build_vid_index(cwd='tmp/public'):
    pat = re.compile(r'mp4$|webm$', re.I)
    file_infos = s3.folder.getter.list_files(cwd, pat)

    blue = "[\r\n"
    for info in file_infos:
        #print info
        one = fit_info_to_blueimp(info)
        blue = blue + one + "\r\n"  + ','

    blue = blue[:-1] #chop of the last ','
    blue = blue + "]\r\n"
    return blue


def fit_info_to_blueimp(info):
    '''
    info is one of this:
        [
        {
            u'name': u'cat-dog.mp4',
            'path': u'tmp/public/cat-dog.mp4',
            u'size': 37026041,
            u'type': u"('video/mp4',none)"},
        {
            u'name': u'cat-food.mp4',
            'path': u'tmp/public/cat-food.mp4',
            u'size': 64086858,
            u'type': u"('video/mp4',none)"},
        {
            u'name': u'cats2014.mp4',
            'path': u'tmp/public/cats2014.mp4',
            u'size': 7047002,
            u'type': u"('video/mp4',none)"},
        {
            u'name': u'dog2014.mp4',
            'path': u'tmp/public/dog2014.mp4',
            u'size': 32663915,
            u'type': u"('video/mp4',none)"},
        {
            u'name': u'tt1.mp4', 'path': u'tmp/public/tt1.mp4'},
        {
            u'name': u'tt1.webm',
            'path': u'tmp/public/tt1.webm',
            u'size': 704395,
            u'type': u"('video/webm',none)"}
        ]

        blueimp.Gallery([
            {
                title: 'Fruits',
                href: 'https://example.org/videos/fruits.mp4',
                type: 'video/mp4',
                poster: 'https://example.org/images/fruits.jpg'
            },
            {
                title: 'Banana',
                href: 'https://example.org/images/banana.jpg',
                type: 'image/jpeg',
                thumbnail: 'https://example.org/thumbnails/banana.jpg'
            }
        ]);

        blueimp.Gallery([
            {
                title: 'Fruits',
                type: 'video/*',
                poster: 'https://example.org/images/fruits.jpg',
                sources: [
                    {
                        href: 'https://example.org/videos/fruits.mp4',
                        type: 'video/mp4'
                    },
                    {
                        href: 'https://example.org/videos/fruits.ogg',
                        type: 'video/ogg'
                    }
                ]
            }
        ]);
    '''

    tpl = '''
        {   title: '%s',
            href: '%s',
            type: '%s',
            poster: '%s'
        }
        '''

    print(info)

    fi = s3.file.getter.file_with_meta(info['path'])
    m  = fi.meta
    pprint(m)

    _title = _href = _type = _poster_href = None

    if 'name' in m:
        _title = m['name']
    elif 'name' in info:
        _title = info['name']
    else:
        _title = 'no name?'

    if 'path' in m:
        _href = os.path.join('/get', m['path'])
    if 'type' in m:
        _type = m['type']

    key = None
    if 'posters' in m:
        if '0.0' in m['posters']:
            if 'key' in m['posters']['0.0']:
                key = m['posters']['0.0']['key']
    if key:
        _poster_href = os.path.join('/s3key', key)


    #fill = {'title': info[u'name'],
    #        'href': info[u'name'],
    #        'type': info[u'name'],
    #        'poster_href': info[u'name']
    #    }

    return tpl%(
            _title,
            _href,
            _type,
            _poster_href
            )


def infos(cwd='tmp/public'):
    pat = re.compile(r'mp4$|webm$', re.I)
    file_infos = s3.folder.getter.list_files(cwd, pat)
    for info in file_infos:
        print info['path']
        fi = s3.file.getter.file_with_meta(info['path'])
        print fi.meta

    #return file_infos



if __name__ == "__main__":
    #pprint(build_vid_index())

    def check_one_info():
        ''
        info = {
            'name': u'cat-dog.mp4',
            'path': u'tmp/public/cat-dog.mp4',
            'size': 37026041,
            'type': u"video/mp4"}

        print(fit_info_to_blueimp(info))

    #check_one_info()
    #blue = build_vid_index()
    #print blue

    pprint(infos())
