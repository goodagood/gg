
# Moving the redis data, session and lockers
# 2016 0312


import redis
import imp


rconf = imp.load_source('whatname',
    '/home/ubuntu/workspace/gg-credentials/pyconf/redis_conf.py')

rold = redis.StrictRedis(
        host = rconf.redis_host,
        port = rconf.redis_port,
        password = rconf.requirepass)

rnow.keys("a*")

#rnew = redis.StrictRedis(port = 9397)



