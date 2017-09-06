
var path        = require('path');
var myutil      = require("../myutils/myutil.js");
var bucket      = require("../aws/bucket.js");

var redis_basic = require("../myutils/redis-basic.js");
var rclient     = redis_basic.client;

var log28       = require('../myutils/mylogb.js').double_log('/tmp/log28');

// helpers:
var p = console.log
function exit() { setTimeout(process.exit, 500); }

function make_user_obj(username, callback){
  var attributes;


  function _init (callback){
    _refresh(function(){
      if(typeof attributes['flags'] === 'undefined') _init_flag(function(){
        return _refresh(function(){
          callback(obj);
        });
      });
      return callback(obj);
    });
  }


  function _refresh (callback){
    _get_attr(null, function(err, obj){
      attributes = obj;
      callback(attributes);
    });
  }


  function _set_attr (attr, value, callback){
    // if attr is 'false' value, get the whole obj:
    if(!attr){
      return callback(null); // do nothing?
    }

    return rclient.hset(username, attr, value, callback);
  }


  function _get_attr (attr, callback){
    // callback if from redis client
    // if attr is 'false' value, get the whole obj:
    if(!attr){
      return rclient.hgetall(username, callback);
    }

    // when it specified attr
    return rclient.hget(username, attr, callback);
  }

  function _pass_attr(callback){
    // pass the attributes directly, different from _get_attr which
    // retrieve it from redis.
    callback(null, attributes);
    return attributes;
  }



  // ..., flags : point_to_flags(a key of hash in redis), ...
  // { flag_name_1 : timestamp,
  //   flag_name_2 : timestamp, ... }
  function _init_flag (callback){
    //var username = this.username;
    rclient.hexists(username, 'flags', function(err, exists){
      if(exists){
        return callback(null);
      }
      redis_basic.serial_number(function(err, number){
        if(err) return callback(null);
        var flag_key = "flags." + number.toString();
        var uniq     = myutil.get_uuid();
        rclient.hset(flag_key, uniq, 0, function(err, reply){
          if(err) return callback(null);

          rclient.hset(username, 'flags', flag_key, function(err, reply){
            if(err) return callback(null);
            callback(flag_key);
          });
        });
      });
    });
  }


  function _flag_up (flag_name, callback){
    if( !attributes['flags'] ) return callback(false);
    var flag_field = attributes['flags'];
    console.log( 'flag_field',  flag_field);

    function _flag_down_(callback){
      rclient.hdel(flag_field, flag_name, function(err, reply){
        if(callback) callback(err, reply);
      });
    }

    // Using increment operation to do the flag checking. 
    // Instead, if we check by 'exists' query, two or more checking might
    // happens in same time, and get same results, it bring to conflicts.
    rclient.hincrby(flag_field, flag_name, 1, function(err, reply){
      //console.log('222 err, reply: ', err, reply)
      if(err) return callback(false);
      if(reply > 1) return callback(false);
      // here we got flag, set a timestamp for it:
      rclient.hset(flag_field, flag_name, Date.now(), function(err, reply){
        console.log(2, err, reply);
        if(err) return callback(false);
        //console.log('flag name: ', flag_name, ' setted');

        return callback(true, _flag_down_);
      });
    });

  }

  function _show_flags(callback){
    rclient.hgetall(attributes['flags'], function(err, results){
      p('_show flags, err, results: ', err, results);
      callback(err, results);
    });
  }

  function _del_flag(flag_name, callback){
    var flag_field = attributes['flags'];
    rclient.hdel(flag_field, flag_name, function(err, reply){
      if(callback) callback(err, reply);
    });
  }

  function _accept_new_file_meta (file_path, meta){
    // Write the meta data to user's local folder,
    //     username/goodagood/.new/file_path
    // The file itself, if has, write to: username/.files/file-name

    var dir   = path.dirname(file_path);
    var uniq  = myutil.get_uuid();
    var s3key = path.join(this.username, myconfig.new_meta_folder, dir, uniq);
    // callback get: callback(err, reply)
    bucket.write_json(s3key, meta, callback);
  }

  var obj = {
    init      : _init,
    refresh   : _refresh,
    get_attr  : _get_attr,
    pass_attr : _pass_attr,
    set_attr  : _set_attr,
    init_flag : _init_flag,
    //_flag_up will pass its specific 'flag down' to its callback
    flag_up   : _flag_up,
    show_flags: _show_flags,
    del_flag  : _del_flag,

  };

  _init(callback);
}



module.exports.make_user_obj = make_user_obj;


// vim: set et ts=2 sw=2 fdm=indent:
