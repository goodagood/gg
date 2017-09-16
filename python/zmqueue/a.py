
# moved to ./server.py

#
#   Hello World server in Python
#   Binds REP socket to tcp://*:5555
#   Expects b"Hello" from client, replies with b"World"
#

import sys
import time
import json
import zmq
import pprint

import folder_ul



def serve_zmq():
    context = zmq.Context()
    socket = context.socket(zmq.REP)
    socket.bind("tcp://127.0.0.1:5555")

    while True:
        try:
            #receive_and_serve_message
            message = socket.recv_json()

            if(message):
                j = json.loads(message)
                reply = serve_and_report(j)
                socket.send_json(reply)

                j = reply = None
        except KeyboardInterrupt:
            print("closing zmq binding")
            socket.close()
            context.destroy()
            sys.exit()


def serve_and_report(info):
    ''
    if 'ask-for' not in info:
        info['error'] = "no ask-for no done anything"
        return info

    asked = info['ask-for']
    services = offer_service_list()

    if asked in services:
        print('got a function to replay')
        service = services[asked]
        return service(info)
    else:
        # noop: no operation
        return services['noop'](info)


def offer_service_list():
    return {
        "noop": noop_service,
        "folder.ul": folder_ul.cached_reply
        }


def noop_service(info):
    info['noop'] = True;
    info["I.did.nothing.for.asked"] = True
    return info



if __name__ == "__main__":
    serve_zmq()

