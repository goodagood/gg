//
// Continue ../aws/folder-lock.js
//
// Before, I have folder lock and task lock,
// It actually is a kind of flag, when others see flag up, they should stop.
//
// This is to make reusable functions for flag things.
//
// 2016 0311
//


//var Promise = require("bluebird");
//var assert  = require('assert');
var async   = require('async');

//var myconfig   =   require("../config/config.js");
//var folder_module = require('./folder-v5.js');


var redis_connection = require("./conn.js");
var rclient = redis_connection.get_redis_client();


var Flag_Prefix = 'flag.y6m3d12.';

var p = console.log;


function timed_flag(id, max_milli, callback){
    if(!id) return callback('we need a id for the flag');

    const key = Flag_Prefix + id;

    function down_flag(callback){
        if( typeof callback === 'undefined' || !callback) callback = function(){};

        rclient.exists(key, function(err, exists){
            if(err){
                p(`err, down flag, timed flag ${key}`);
                return callback('found err when check the key exists, in timed flag, down', null);
            }
            if(!exists){
                p(`not exists, down flag, timed flag ${key}`);
                return callback('not found the key', null);
            }

            rclient.del(key, function(err, reply){
                if(err){
                    console.log('err in del, in timed flag, del key : ', key);
                }
                callback(err, reply);
            });
        });
    }

    function _up_flag_fun(callback){
        rclient.incr(key, function(err, reply){
            if(err)       return callback(err, null);
            // reply > 1 means other has do the lock
            if(reply > 1) return callback(`looks flag ${key} ALREADY UP, ${reply}`, null);

            // here we got flag up, set a timestamp for it:
            rclient.set(key, Date.now(), callback);
        });
    }

    //p('//do the job of flag up:');
    _up_flag_fun(function(err, set_rep){
        //p('up flag 1 ', err, set_rep);
        if(err) return callback(err);

        var flag = {
            down: down_flag
        };
        if(max_milli > 0) flag["auto-disapear"] = max_milli;

        //p('up flag 2,  callback');
        callback(null, flag); // callback but continue to set flag down in time:

        if(max_milli > 0) setTimeout(function(){
            down_flag(function(){});
        }, max_milli);
    });
}
module.exports.timed_flag = timed_flag;


function find_flags(callback){
  var key = Flag_Prefix + "*";
  rclient.keys(key, function(err, reply){
    //console.log('err, reply: ', err, reply);
    callback(err, reply);
  });
}
module.exports.find_flags = find_flags;


// need test
function rm_old_flags(milli, callback){
    milli = milli || 60 * 60 * 1000; // 1 hr is default for old enough.
    var key = Flag_Prefix + "*";

    rclient.keys(key, function(err, keys){
        //console.log('in rm old flags, err, keys: ', err, keys);
        if(err) return callback(err);

        var now = Date.now();

        async.map(
            keys,
            function(key, cb){
                rclient.get(key, function(err, millisec){
                    if(err) return callback(err);
                    if(now - millisec > milli){
                        p(`old enough ${key}`);
                        return rclient.del(key, cb);
                    }else{
                        return cb(null, `not old enough, ${key}`);
                    }
                });
            },
            callback);

        //callback(err, keys);
    });
}
module.exports.rm_old_flags = rm_old_flags;



if(require.main === module){

    function c_flag_a(){
        var key = 'testing-flag-m3d12-' + Date.now().toString(); 
        timed_flag(key, 33 * 1000, function(err, flag_things){
            p('testing timed flag: ', err, flag_things);
        });
    }
    //c_flag_a();

    function c_find_flag(){
        find_flags(function(e, r){
            p('find flags, ', e, r);
            setTimeout(process.exit, 3000);
        });
    }
    //c_find_flag();

    rm_old_flags(null, function(err, what){
        p('remove old flags: ', err, what);
    });

    setTimeout(process.exit, 53 * 1000);
}

