
# Moving the redis data, session and lockers
# 2016 0312


import redis



rnew = redis.StrictRedis(port = 9397)


import datetime
def milli_to_date(milli):
    s = milli / 1000.0
    return datetime.datetime.fromtimestamp(s).strftime('%Y-%m-%d %H:%M:%S.%f')

