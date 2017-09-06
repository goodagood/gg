
Promise = require "bluebird"


p = console.log
stop = (time) ->
    time = time || 500
    setTimeout process.exit, time

chech_a = () ->
    pa = new Promise( (resolve, reject) ->
        setTimeout(resolve, 500)

    )
    #pa.then



delayed = (time, callback) ->
    time = time || Math.random() * 500

    err = null
    err = time if time > 600

    bar = () ->
        p 'timed: ', time
        callback(err, time)

    setTimeout(bar, time)



#for i in [4..1]
#    p i
#    delayed(i*200, (err, time) ->
#        p "err: #{err}, time: #{time}"
#    )

promised_delay = Promise.promisify(delayed)

promised_delay 100
.then (what) ->
    promised_delay 200
.then (what) ->
    p '2  ', what
    promised_delay 300
.then( (what) ->
    p 'got what: ', what
    promised_delay what
).catch (e) ->
    p "got one: ",  e

    
#.catch
#(
#    SyntaxError,
#    (e) ->
#        p 'catch Error ', e
#).catch
#(
#    (wrong) ->
#        p wrong
#)
