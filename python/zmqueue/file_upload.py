import os
import json

import path_setting
import s3.crud
import s3.folder.cache_in

import s3.file.getter



def loc_to_s3(info):
    ''' Put local file to s3, local file get from node.js uploading

    info:
        var info = JSON.stringify( {
            "ask-for": 'file.upload',
            "info_json_path": info_json_path,
            "file_info_jstr": info,
            "timeout": 3000
        });

    "file_info_jstr" : file information json string,
        {
            username:
            fieldname: 'ofiles',
            originalname: 'h5.html',
            encoding: '7bit',
            mimetype: 'text/html',
            cwd:
            destination: '/dir/name/where/file/should/be/uploaded', # cwd
            filename: 'f2a4e5f36bc5604193f5cfee38d7213f', # tmp file name
            path: '/tmp/f2a4e5f36bc5604193f5cfee38d7213f',
            size: 1121
        }

    'destination' got wrong format with leading '/'
    '''
    # file.text
    asked  = info['ask4'] or info['ask-for']

    ufile = json.loads(info['file_info_jstr'])
    file_name = ufile['originalname']
    file_path = os.path.join(ufile['cwd'], file_name);

    fi = s3.file.getter.get_file(file_path)

    fi.calculate_prefix_and_keys()
    if ufile['mimetype']:
        fi.set_attr('type', ufile['mimetype'])
    if ufile['size']:
        fi.set_attr('size', ufile['size'])
    if ufile['encoding']:
        fi.set_attr('encoding', ufile['encoding'])
    meta = fi.meta

    s3.crud.put_file(meta['s3key'], ufile['path'])
    fo = fi.get_folder()
    fo.add_file_in_ns(meta)
    s3.folder.cache_in.cache_render_from_ns(fo)
    #...
    #upload, save meta, save to folder, render folder

    # we are not checking if it has text.
    reply = 'file uploaded: ' + file_path
    info[asked] = reply #d

    #return info
    return reply


main = loc_to_s3


if __name__ == "__main__":

    file_info = {
            "username": 'tmp',
            "cwd": 'tmp/public',
            "fieldname": 'ofiles',
            "originalname": 'h5.html',
            "encoding": '7bit',
            "mimetype": 'text/html',
            "destination": 'tmp/public',
            "filename": 'f2a4e5f36bc5604193f5cfee38d7213f',
            "path": '/tmp/f2a4e5f36bc5604193f5cfee38d7213f',
            "size": 1121
        }

    file_info_json = json.dumps(file_info)

    msg = {
            "ask-for": 'file.upload',
            "info_json_path": 'currently not used',
            "file_info_jstr": file_info_json,
            "timeout": 3000
        }

    print(loc_to_s3(msg))
