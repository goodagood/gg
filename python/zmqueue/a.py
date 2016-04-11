

#
#   Hello World server in Python
#   Binds REP socket to tcp://*:5555
#   Expects b"Hello" from client, replies with b"World"
#

import time
import json
import zmq

context = zmq.Context()
socket = context.socket(zmq.REP)
#socket.bind("tcp://localhost:5555")
socket.bind("tcp://127.0.0.1:5555")



def job_pass(info):
    ''
    if 'ask-for' in info:
        ''
        return reply(info)
    else:
        return {"nothing-i-hear-nothing-i-can-do": True}


def reply(info):
    askfor = info['ask-for']
    replies = {"default": default_reply,
            "folder.ul": default_reply
            }
    return replies[askfor](info)


def default_reply(info):
    return {"I.am.not.ready.to.do.it": True}


if __name__ == "__main__":
    from pprint import pprint

    while True:
        #  Wait for next request from client
        message = socket.recv()
        print("Received request: %s" % message)
        print("typeof msg: %s" %type(message))

        j = json.loads(message)

        #pprint("parsed json: ", j)
        #pprint(j['ask-for'])
        print(j['ask-for'])
        #job_pass(j)

        #  Do some 'work'
        time.sleep(1)

        #  Send reply back to client
        reply = json.dumps({"reply": "World"});
        socket.send(reply)
