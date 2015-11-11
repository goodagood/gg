//
// todo: 0119
// lock for folder, it will lock all changes to the folder, such as add/del files.
//
// modifying from pubsub's task lock
//

var redis   = require("redis");
var Promise = require("bluebird");
var assert  = require('assert');
var async   = require('async');

var myconfig   =   require("../config/config.js");
var folder_module = require('./folder-v5.js');

//var redis_host = myconfig.redis_host;
//var redis_port = myconfig.redis_port;
//var secrets = require("../config/secret-dir.js");
//var redis_host = secrets.conf.redis.redis_host;
//var redis_port = secrets.conf.redis.redis_port;
//var rclient = redis.createClient(redis_port, redis_host);

var redis_basic = require("../myutils/redis-basic.js");
var rclient = redis_basic.client;


var Lock_Prefix = 'folder.lock.';

var p = console.log;



function lock_path(path_){
    var Folder, Meta, Uuid;
    return folder_module.get_folder_uuid(path_).then(function(uuid){
        var locker = get_folder_lock(uuid, path_);
        return locker.promise_to_lock();
    });
}


// callback get (err, un-locker-function)
function lock_path_async(path_, callback){
    var Folder, Meta, Uuid;
    return folder_module.get_folder_uuid(path_).then(function(uuid){
        var locker = get_folder_lock(uuid, path_);
        return locker.lock(function(err, promise_to_unlock){
            callback(err, locker.unlock);
        });
    });
}


function get_folder_lock(uuid, path_){
    // uuid is folder uuid
    // callback get: (LOCKED(true/false) [, function-to-unlock(only when locked))

    //var key = Lock_Prefix + path_ + '.' + uuid; // redis key of the lock.
    var key = make_lock_key(path_, uuid);

    function _unlock(callback){
        if( typeof callback === 'undefined' || !callback) callback = function(){};

        rclient.exists(key, function(err, exists){
            if(err)     return callback('found err when check the key exists', null);
            if(!exists) return callback('not found the key', null);
            // now, try to del the 'lock' in hash: task id
            rclient.del(key, function(err, reply){
                if(!err) console.log('unlocked in task locking: ', key);
                callback(err, reply);
            });
        });
    }

    var promise_to_unlock = Promise.promisify(_unlock);


    function _lock(callback){
        rclient.incr(key, function(err, reply){
            //console.log(err, reply)
            if(err)       return callback(err, null);
            // reply > 1 means other has do the lock
            if(reply > 1) return callback(reply, null);

            // here we got flag, set a timestamp for it:
            rclient.set(key, Date.now(), function(err, reply){
                //console.log('lock 2', err, reply);
                if(err) return callback(err, null);
                //console.log('flag name: ', flag_name, ' setted');

                return callback(null, promise_to_unlock); // The only ok callback
            });
        });
    }

    var promise_to_lock = Promise.promisify(_lock);

    return {
        lock   : _lock,
        unlock : _unlock,
        promise_to_lock   : promise_to_lock,
        promise_to_unlock : promise_to_unlock
    }

    // If success, an 'promise_to_unlock' function will pass to 
    // .then(function(unlock){//...})
    //return promise_to_lock();
}

function make_lock_key(path_, uuid){
    return Lock_Prefix + path_ + '.' + uuid; // redis key of the lock.
}

function check_folder_locker(path_, callback){
    assert(u.isString(path_));

    folder_module.get_folder_uuid(path_).then(function(uuid){
        var Key = make_lock_key(path_, uuid);


        rclient.exists(Key, function(err, exists){
            if(err) return callback(err, null);
            if(!exists) return callback(null, null);
            if(exists){ 
                rclient.get(Key, function(err, milli_str){
                    // milli_str is epoch milli-seconds in string formate
                    var milli = parseInt(milli_str);
                    //p ('milli: ', milli);
                    var now   = Date.now();
                    var diff = past_time(milli);
                    callback(null, diff);
                });
            }
        });
    });
}


function past_time(milli){
    // give the time in milli-seconds, seconds, easy-reading-str from the lock till now.

    if(! u.isNumber(milli)) throw new Error('not a number?');
    var now = Date.now();
    //p ('now, milli:', now, milli, now-milli);
    //var old_enough = 5 * 60 * 1000; // mili-seconds of 5 minutes.


    var diff=now-milli;
    //p ('diff!: ', diff, now-milli);
    var seconds = diff / 1000;
    // Hours, minutes and seconds
    var hrs  = Math.floor(seconds / 3600);
    var mins = Math.floor((seconds % 3600) / 60);
    var secs = seconds % 60;

    // Put it to 00:00:00 things
    var str = "";
    if (hrs > 0)
        str += hrs + ":" + (mins < 10 ? "0" : "");
    str += "" + mins + ":" + (secs < 10 ? "0" : "");
    str += "" + parseInt(secs);

    return [diff, seconds, str];
}


function find_locks(callback){
  var key = Lock_Prefix + "*";
  rclient.keys(key, function(err, reply){
    //console.log('err, reply: ', err, reply);
    callback(err, reply);
  });
}


function find_one_lock(number, callback){
  // try to find one 
  var number = number || 0;
  find_locks(function(err, all){
    if (typeof all.length === 'undefined'){
      return callback('what is all.length undefined?', null)
    }
    var len = all.length;
    if (len < number) number = len -1;
    var id = all[number];

    rclient.hgetall(id, callback);

  });
}

function del_all_locks(callback){
  //var key = Lock_Prefix + "*";

  find_locks(function(err, all){
      var list_of_del = u.map(all, function(key){
          return function(callback){
              rclient.del(key, function(err, reply){
                //console.log('err, reply: ', err, reply);
                callback(err, reply);
              });
          };
      });

      async.parallel(list_of_del, callback);
  });

}



module.exports.lock_path  = lock_path;
module.exports.lock_path_async  = lock_path_async;
module.exports.find_locks = find_locks;
module.exports.del_all_locks = del_all_locks;
module.exports.rclient       = rclient;
module.exports.check_folder_locker = check_folder_locker;
module.exports.find_one_lock = find_one_lock;


// -- do some fast checkings -- //

var ttool = require("../myutils/test-util.js");

function check_del_all_locks(){
    del_all_locks(function(err, what){
        p('del all locks get: err, what ', err, what);
        show_lock();
    });
}

function check_lock(){
    var folder_path = "abc";

    var Unlock;
    lock_path(folder_path).then(function(unlock){
        Unlock = unlock;
        p('we have locked it: ', folder_path);
    }).then(function(){
        return ttool.idle_out(30);
    }).then(function(){
        p('after 30 seconds.');
        check_folder_locker(folder_path, function(err, what){
            p('check the locker: ' + folder_path, '\n', err, what);
        });
    }).then(function(){
        return ttool.idle_out(30);
    }).then(function(){
        p('unlocking');
        return Unlock();
    }).then(function(){
        p('should be unlocked');
    }).then(function(){
        ttool.stop();
    }).catch(function(err){
        p('we catched: \n', err);
        ttool.stop();
    });
}

function check_lock_async(){
    var folder_path = "abc/test";

    lock_path_async(folder_path, function(err, unlocker){
        p('we have locked it: ', folder_path);
        ttool.sleep(5, function(err, sec){
            p('after 5 seconds.');
            check_folder_locker(folder_path, function(err, what){
                p('check the locker: ' + folder_path, '\n', err, what);
                unlocker(function(err, reply){
                    p('should be unlocked');
                    check_folder_locker(folder_path, function(err, what){
                        p('check the locker: ' + folder_path, '\n', err, what);
                        ttool.stop();
                    });
                });
            });
        });
    });
}

function show_lock(){
    find_locks(function(err, what){p('find locks: err, what:', err, what);});

    var folder_path = 'abc/test';
    check_folder_locker(folder_path, function(err, diff){
        p('for folder: ', folder_path);
        p('got:\n', err, diff);
        ttool.stop();
    });
}

if(require.main === module){

    //check_lock();
    //check_lock_async();
    show_lock();

    //check_del_all_locks();
}

