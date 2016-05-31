
#
#   zmq serve localhost:5555, modified from Hello World server example.
#   2016 0525
#

import sys
import time
import json
import zmq
import pprint

import zmqueue.folder_ul as folder_ul
import zmqueue.file_meta as file_meta
import zmqueue.file_text as file_text
import zmqueue.tmp_thumb as tmp_thumb
import zmqueue.file_upload as file_upload
import zmqueue.meta_list as meta_list



def serve_zmq():
    context = zmq.Context()
    socket = context.socket(zmq.REP)
    socket.bind("tcp://127.0.0.1:5555")

    while True:
        try:
            #receive_and_serve_message
            message = socket.recv_json()
            print('message:', message)

            if(message):
                j = json.loads(message)
                reply = serve_and_reply(j)
                socket.send_json(reply)

                j = reply = None
        except KeyboardInterrupt:
            print("closing zmq binding")
            socket.close()
            context.destroy()
            sys.exit()


def serve_and_reply(info):
    ''
    if 'ask-for' not in info:
        info['error'] = "no ask-for no done anything"
        return info

    asked = info['ask-for']

    try:
        py_response(info)
        if 'py.failed' not in info:
            print('return after py response', info)
            return info # only return when ok, continue if not.
    except (Exception) as e:
        if 'py.failed' not in info:
            del info['py.failed']

    # continue the old way
    services = offer_service_list()

    if asked in services:
        print( asked, ' got a function to replay')
        service = services[asked]
        return service(info)
    else:
        # noop: no operation
        return services['noop'](info)


def offer_service_list():
    return {
            "noop": noop_service,
            "folder.ul": folder_ul.cached_reply,
            "meta.list": meta_list.file_metas_in_folder_cache,
            "file.meta": file_meta.retrieve_or_calculate,
            "file.text": file_text.read,
            "file.upload": file_upload.loc_to_s3,
            "tmp.thumb": tmp_thumb.put_tmp_thumb
            }



import importlib
def py_response(info):

    asked = info['ask-for']
    try:
        modname = "zmqueue.%s"%asked
        mod = importlib.import_module(modname)
        print("going to run: %s main"%modname)
        return mod.main(info)
    except Exception as e:
        print ('py response got e: ', e)
        info['py.failed'] = True
        return info



def noop_service(info):
    info['noop'] = True;
    info["I.did.nothing.for.asked"] = True
    return info



if __name__ == "__main__":
    serve_zmq()

