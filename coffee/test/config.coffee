#
# Common settings in testing
#

path    = require "path"
Promise = require "bluebird"
u       = require "underscore"

config = {}
module.exports.config = config


config.user_name   = 'abc'
config.folder_path = 'abc'
config.file_name   = 'txt22'

config.folder_name = config.folder_path
config.file_path   = path.join config.folder_path, config.file_name


p = console.log
stop = (period) ->
    period = period || 1
    period = 1 if not u.isNumber period
    milli_seconds = period * 1000

    setTimeout process.exit, milli_seconds


promise_to_wait = (seconds)->
    seconds = seconds || 1
    seconds = 1 if not u.isNumber seconds
    milli_seconds = seconds * 1000

    return new Promise((resolve)->
        setTimeout resolve, milli_seconds
    )


sleep = promise_to_wait
    
    
module.exports.p    = p
module.exports.stop = stop
module.exports.promise_to_wait = promise_to_wait
module.exports.sleep= sleep


if require.main is module
    wait(3).then(
        ( what )->
            p 'wait how long? ', what
    )


