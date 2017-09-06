
Promise = require "bluebird"


p = console.log
stop = (time) ->
    time = time || 500
    setTimeout process.exit, time



delayed = (time, callback) ->
    time = time || Math.random() * 500

    err = null
    err = time if time > 600

    bar = () ->
        p 'bar ', time
        callback(err, time)

    setTimeout(bar, time)


#delayed(i, ) for i in [1..2]

#for i in [4..1]
#    p i
#    delayed(i*200, (err, time) ->
#        p "err: #{err}, time: #{time}"
#    )

promised_delay = Promise.promisify(delayed)

promised_delay(800).then(
    (what) ->
        p 11
        1
).then(
    (what) ->
        p '2  ', what
        2
).catch(
    (e) ->
        p 'e ', e
)
    
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
