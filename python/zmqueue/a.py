

#
#   Hello World server in Python
#   Binds REP socket to tcp://*:5555
#   Expects b"Hello" from client, replies with b"World"
#

import time
import json
import zmq
import pprint

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
    replies = {
            "default": default_reply,
            "folder.ul": default_reply
            }

    if askfor in replies:
        print('got a function to replay')
        return replies[askfor](info)
    else:
        return {'found no function to reply': True}


def default_reply(info):
    return {"I.am.not.ready.to.do.it": True}


def srv_zmq():
    while True:
        message = socket.recv_json()

        if(message):
            j = json.loads(message)

            reply = job_pass(j)

            socket.send_json(reply)

            j = reply = None


if __name__ == "__main__":
    srv_zmq()

