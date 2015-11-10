# pubsub need run for jobs
# This is to check it.

u      = require "underscore"
async  = require "async"
Promise= require "bluebird"

pubsub = require "./pubsub.js"


p = console.log
stop = (period) ->
    period = period || 500
    setTimeout process.exit, 500


check_find_all_tasks = ()->
    pubsub.find_tasks( (err, reply)->
        p "Error in 'check find all tasks': ", err if err
        p 'is array' if u.isArray(reply)
        p reply
        stop()
    )

show_first_task_found = ()->
    pubsub.find_tasks( (err, reply)->
        p "Error in 'check find all tasks': ", err if err
        p 'show first 1: ', reply
        d1 = reply[0]
        pubsub.rclient.hgetall(d1, (err, res)->
            p 'show first 2 ', err, res
            p 'error in "show first task found", hgetall' if err
            if res.lock?
                p 'result lock: ', res.lock
                p 'to date: ', new Date(res.lock)
            stop()
        )
    )

show_by_id = (id, callback)->
    if not id?
        return
    callback = (->) if not callback

    p 'show by id: ', id
    pubsub.rclient.hgetall id, (err, data)->
        p 'error in "show by id", hgetall' if err
        p 'err, data:\n', err, data
        callback(err, data)
    
promised_show_by_id = Promise.promisify  show_by_id
    

milli_is_before = (milli_str, seconds)->
  now = Date.now()
  period = seconds * 1000 #// mili-seconds of 5 minutes.

  mark = now - period

  i = parseInt(milli_str)
  if i > mark
      return false
  else
      return true


check_old_a = ()->
    five = 5 * 60 * 1000
    ep   = Date.now() - five

    if milli_is_before(ep, 301)
        p 'is old'
    else
        p 'new'
    stop()


show_all_date = ()->
    pubsub.find_tasks( (err, keys)->
        p "Error in 'check find all tasks': ", err if err

        show_key = (key, callback)->
            pubsub.rclient.hgetall key, (err, res)->
                #p err, res
                p 'error in "show first task found", hgetall' if err
                p 'name: ', res.name
                if res.lock?
                    p 'result lock: ', res.lock
                    i = parseInt(res.lock)
                    p 'to date: ', new Date(i)
                else
                    p 'no lock'
                callback(err, res)

        async.map(keys, show_key, (err, results)->
            p 'after map:'
            #p err, results
            stop()
        )
           
    )


show_if_old = ()->
    pubsub.find_tasks( (err, keys)->
        p "Error in 'check find all tasks': ", err if err

        show_key = (key, callback)->
            pubsub.rclient.hgetall key, (err, res)->
                #p err, res
                p 'error in "show first task found", hgetall' if err
                if res.lock?
                    p 'this is old, ' if milli_is_before(res.lock, 300)
                    #p 'result lock: ', res.lock
                    i = parseInt(res.lock)
                    p 'to date: ', new Date(i)
                else
                    p 'no lock'
                p ''
                callback(err, res)

        async.map(keys, show_key, (err, results)->
            p 'after map:'
            #p err, results
            stop()
        )
           
    )


none_or_old_key = (key, callback)->
    period = 300
    pubsub.rclient.hgetall key, (err, res)->
        #p err, res
        #p 'error in "show first task found", hgetall' if err
        return callback(false) if err
        if res.lock?
            #p 'this is old, ' if milli_is_before(res.lock, period)
            return callback(true) if milli_is_before(res.lock, period)
            #p 'result lock: ', res.lock
            #i = parseInt(res.lock)
            #p 'to date: ', new Date(i)
        else
            return callback(true)
        #p 'no lock'


filter_a = ()->
    pubsub.find_tasks( (err, keys)->
        p "Error in 'check find all tasks': ", err if err
        count = 0
        async.filter(keys, none_or_old_key, (results)->
            p 'f1:\n',  results
            p 'left:\n', u.difference(keys, results)
            stop()
        )
    )


del_key = (key, callback)->
    # This is ridiculous to pass the callback:
    pubsub.rclient.del  key, callback


del_by_steps = ()->
    pubsub.find_tasks( (err, keys)->
        return p "Error in 'del by steps': ", err if err
        #async.map(keys, pubsub.rclient.del, (err, results)->
        async.map(keys, del_key, (err, results)->
            p 'ds:\n', err,  results
            stop()
        )
    )


check_del_all = ()->
    pubsub.del_all_tasks( (err, results)->
        p 'check del all 1: \n', err, results
        stop()
    )


try_lock = ()->
    pubsub.find_tasks( (err, reply)->
        p "Error in 'try lock': ", err if err
        p 'show 1 try lock : ', reply
        d1 = reply[0]
        pubsub.rclient.hgetall(d1, (err, res)->
            id = res.id
            if not id?
                p 'no id found'
                return stop()
            pubsub.add_task_lock id, (locked, unlock)->
                promised_unlock = Promise.promisify unlock

                if locked
                    promised_show_by_id(id).then(
                        ()->
                            #promised_unlock()
                    ).then(
                        ()->
                            # put all inside same level here:
                            p 'show try lock 2 ', err, res
                            p 'error in "show try lock 3", hgetall' if err
                            if res.lock?
                                p 'result lock: ', res.lock
                                p 'to date: ', new Date(res.lock)
                            stop(11000)  # 11 seconds
                    )
                    
        )
    )

check_find_one = (number)->
    number = number || 0
    pubsub.find_one_task number, (err, things)->
        p 'check find ONE: ', err, things
        stop()

give_a_lock = ()->
    pubsub.find_one_task 0, (err, one_job)->
        p 'check find ONE: ', err, one_job
        pubsub.add_task_lock one_job.id, (locked, unlock)->
            p 'locked? ', locked if locked
            stop()

get_the_time = ()->
    pubsub.find_one_task 0, (err, one_job)->
        pubsub.find_lock_time one_job.id, (err, time, a, b, c)->
            p 'check the time: ', err, time, a, b, c
            stop()


# # checkings: # #
#
#check_find_all_tasks()
#show_first_task_found()
#show_all_date()
#check_old_a()
#show_if_old()
#filter_a()
check_del_all()
#del_by_steps()
#try_lock()
#check_find_one(99)
#give_a_lock()
#get_the_time()


