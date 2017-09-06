// 2014 0904, put it to directory: users
//


var util = require('util');
var u    = require('underscore');

var conf =   require("../config/config.js");

var secrets  =  require("../config/secret-dir.js");
var aws_conf =  secrets.conf.aws;

//var s3folder = require("../aws/folder.js");
var bucket = require("../aws/bucket.js");

var redis_basic = require("../myutils/redis-basic.js");
var rclient = redis_basic.client;


//var log28  = require('../myutils/mylogb.js').double_log('/tmp/log28');
var p = console.log;

function findByUsername(username, fn){
  rclient.exists(username, function(err, name_exists){
    //console.log("hit redis, and ", username, " exists.");
    if(err){
      return fn(new Error(err));
    }
    if(name_exists === 0){
      // Name not exists
      return fn(null, null);
    }

    // make a user object
    var user = {};
    rclient.hgetall(username, function(err, userdata){
      if(err){
        return fn(new Error(err));
      }
      user = userdata;
      if (typeof user.username === 'undefined') user.username = username;
      if (typeof user.id === 'undefined') user.id = username;
      //console.log('findByUsername, user: ', user);
      return fn(null, user);
    });
  });
}

var find_by_user_name = findByUsername;



var ihome = require('../aws/init-home.js');
// do not use ../myusers.js
function init_user_c(user_info, callback){
  // 
  // To replace: init_user, init_user_a, init_user_b
  // 
  // @user_info : hash {username:..., password:..., id:..., referrer:...}
  // @callback  :
  //   callback(err, user_obj)
  // 
  is_name_occupied(user_info.username, function(err, name_exists){
    //console.log("11 init user c, and username: ", user_info.username);
    console.log("111 init user c, name_exists: ", name_exists);
    if(err) return ( callback(err, null) );

    if(name_exists) return (callback(new Error('username conflict'), null));

    // Name not exists:
    user_info['what'] = "user_information";
    user_info['storage'] = "s3";
    user_info['s3-bucket'] = conf.root_bucket;

    //console.log("22 init user c, user info ", user_info);
    ihome.init_one_home(user_info.username).then(function(what_ever){
      //console.log("user_info"); console.log(user_info);
      rclient.hmset(user_info.username, user_info, function(err, reply){
        //console.log("in users/a.js , hmset", reply);
        if (err) { return callback(err, null); }
        add_name_to_user_roll(user_info.username);
        callback(null, user_info);
      });
    });
    console.log(" did you get logs in init_home_folder? ", 'o^o');

  });
}


var phome = require("../aws/prepare-home.js");
/* 2015, 0407
 * User will get an 'id', it's root id, the root should be prepared ready
 * to use as root folder.
 * 
 * To replace: init_user, init_user_a, init_user_b/c
 * 
 * @user_info : hash {username:..., password:..., id:...,  referrer:...}
 * @callback  :
 *   callback(err, user_obj)
 */ 
function init_user_d(user_info, callback){
  if(user_info.username.length < 3) return callback('The name occupied', null);

  occupy_room(user_info, callback);
}


function occupy_room(user_info, callback){
  is_name_occupied(user_info.username, function(err, name_exists){
    //console.log("11 init user c, and username: ", user_info.username);
    if(err) return callback(err, null);
    console.log("1106 1002p occupy room, name_exists: ", name_exists);

    if(name_exists) return (callback(new Error('username conflict'), null));

    // Name not exists:
    user_info['what'] = "user_information";
    user_info['storage'] = "s3";
    user_info['s3-bucket'] = aws_conf.root_bucket;

    console.log("in occupy room, before get hid, user info ", user_info);
    phome.get_one_prepared_home_id(user_info.username, function(err, home_id){
      if(err) return callback(err, 'err when "get one prepared home id"');

      user_info['id'] = home_id;

      p('\n\n got prepared home id');
      console.log("user_info"); console.log(user_info);
      save_user_to_redis(user_info, callback);
    });
  });
}


/*
 * Change to hash password, 2015 1106
 * add the: hash pass # hash_password_for_userinfo
 */
function save_user_to_redis(user_info, callback){
  var hash_pass = require("./hash-pass.js");
  hash_pass.hash_password_for_userinfo(user_info, function(err, user_hash){
    if (err) {
      p('in save u t r, h p . h p f u : err: ', err, user_info);
      return callback(err, null);
    }
    // The parameter user info has been modified, it's been called user_hash now:
    rclient.hmset(user_hash.username, user_hash, function(err, reply){
      if (err) {
        p('rclient hmset, in save ... to redis, 1106, err:', err);
        return callback(err, null);
      }
      //console.log("in users/a.js, 'save user to redis', hmset, err reply: ",err, reply);

      add_name_to_user_roll(user_hash.username, function(err, whatever){
        if(err){
          p('add name to user roll, 1106, err: ', err);
          return callback(err, whatever);
        }
        //console.log("in users/a.js, 'save user to redis', add name to user roll, whatever: ", whatever);
        callback(null, user_hash);
      });
    });
  });
}


function set_user_info_attr(user_name, attr_name, attr_value, callback){
  rclient.hset(user_name, attr_name, attr_value, callback);
}


function set_user_info_attrs(user_name, obj, callback){
  rclient.hset(user_name, obj, callback);
}


function assign_user_home(username, home_id, callback){
  set_user_info_attr(username, 'id', home_id, callback);

  //find_by_user_name(username, function(err, user_info){
  //  if(err) return callback(err, null);
  //  console.log("11 assign user home, user_info: ",  user_info);
  //  user_info['id'] = home_id;
  //  save_user_to_redis(user_info, callback);
  //});
}


// going to be moved to ./validate-name.js
function is_name_occupied(username, callback){
  rclient.exists(username, function(err, name_exists){
    if(err) { callback(err, true); return;}
    if(name_exists) {callback(null, true); return;}
    callback(null, false);
  });
}


function delete_user(username){
  rclient.exists(username, function(err, name_exists){
    if(name_exists === 1){
      bucket.delete_with_prefix(username);
      rclient.del(username);
    }
  });
}

function get_user_id(username, callback){
  // Give username, it can has an id, which will be safe to use as root name.
  // id should be a string, not necessarily digital numbers.
  if(!username) return callback('not a username');
  rclient.exists(username, function(err, name_exists){
    if(err) return callback(err);
    if(name_exists === 1){
      rclient.hgetall(username, function(err, hash){
        if(err) return callback(err, null);
        if(!hash.id) return callback('no id attribute', null);
        callback(err, hash.id);
      });
    }
  });
}


function name2id(user_name){
  if(!user_name) return false;
  if(!u.isString(user_name)) return false;

  // one or more not ascii letter, digital, '.' and '-' would be replace to '-'
  var reg = /[^a-zA-Z0-9.-]+/g;
  var id = user_name.replace(reg, '-');

  var end_dash = /-+$/; // one or more dash at the end.
  var start_dash = /^-+/;
  id = id.replace(end_dash, '');
  id = id.replace(start_dash, '');

  return id;
}


/*
 * Do this with CAREFULNESS!!
 */
function test_delete_user(){
  ['abc', ].forEach(function(name){
    delete_user(name);
  });
}


////d
//function add_file(username, file){
//  // add a record (key-value) to user data
//  rclient.exists(username, function(err, name_exists){
//    console.log("add_file hit redis, for ", username);
//    if(err){
//      throw new Error(err);
//    }
//    if(name_exists){
//      var file_info = JSON.stringify(file);
//      process.nextTick(function(){
//        rclient.hset(username, file.name, file_info, function(err, reply){
//          if (err) {
//            throw new Error(
//              err.toString() + " When add user: " + user.username);
//          }
//        });
//      });
//      //
//    }else{
//      return "username not exists";
//    }
//  });
//}



function make_user_file_href_list(username, callback){
  // callback(err, list){//...}
  // list: [{file_name:--, href:--}]

  rclient.exists(username, function(err, name_exists){
    if(err){
      throw new Error(err);
    }
    console.log(name_exists.toString() + typeof(name_exists));
    if(name_exists){
      rclient.hgetall(username, function(err, userobj){
        console.log(userobj);
        console.log(typeof(userobj));
        for (var k in userobj){
        }

      });
    }
  });
}




function test_make_user_file_href_list(){
  make_user_file_href_list('abc', function(err, alist){
    console.log(alist);
  });
}



function add_name_to_user_roll(username, callback){
  var key_of_roll = conf.current_user_name_roll;
  rclient.sadd(key_of_roll, username, function(err, reply){
    if(callback){
      if(err) return callback(err, reply);
      callback(err, reply);
    }
  });
}


function test_add_name_to_user_roll(){
  add_name_to_user_roll('muji', function(err, reply){
    console.log(err);
    console.log(reply);
  });
}


function test_add_name_to_user_roll_b(){
  var names = ['abc', 'andrew', 'tmp', 'dirty-show', 'test'];
  names.forEach(function(name){
    add_name_to_user_roll(name, function(err, reply){
      console.log(err);
      console.log(reply);
    });
  });
}

function get_user_names(callback){
  // callback get: err, array of names
  var key_of_roll = conf.current_user_name_roll;
  rclient.smembers(key_of_roll, callback);
}

// duplicated with 'get user names'
//function get_current_username_roll(callback){
//  var key_of_roll = conf.current_user_name_roll;
//  rclient.smembers(key_of_roll, callback);
//}


//function test_get_user_names(){
//  get_user_names(function(err, reply){
//    console.log(typeof reply);
//    console.log(u.isArray(reply));
//    console.log(reply.join(', '));
//  });
//}


function test_isNameOccupied(){
  is_name_occupied('muji', function(err, exists){
    if(err) console.log(err);
    console.log('name muji:');
    console.log('exists:');
    console.log(exists);
  });
  is_name_occupied('muji-qq', function(err, exists){
    if(err) console.log(err);
    console.log('name muji-qq:');
    console.log('exists:');
    console.log(exists);
  });
}

if (require.main === module){
  //test_make_user_file_href_list();

  //test_delete_user();

  //test_add_name_to_user_roll_b();
  test_isNameOccupied();

  //test_get_user_names();
  setTimeout(function(){ rclient.quit(); }, 1000);  // close the redis.
}

module.exports.findByUsername = findByUsername;
module.exports.find_by_user_name = find_by_user_name;

//module.exports.add_user = add_user;
//module.exports.add_file = add_file;
//module.exports.init_user = init_user;
module.exports.init_user_c = init_user_c;
module.exports.init_user_d = init_user_d;
module.exports.add_name_to_user_roll = add_name_to_user_roll;
//module.exports.get_current_username_roll = get_current_username_roll;
module.exports.get_user_names = get_user_names;
module.exports.is_name_occupied = is_name_occupied;

module.exports.get_user_id = get_user_id;
module.exports.name2id = name2id;

module.exports.set_user_info_attr = set_user_info_attr;
module.exports.set_user_info_attrs = set_user_info_attrs;
module.exports.assign_user_home = assign_user_home;

// 2015 1106
module.exports.occupy_room = occupy_room;

//for debuging:
module.exports.rclient = rclient;
module.exports.save_user_to_redis = save_user_to_redis;

// vim: set et ts=2 sw=2 fdm=indent:
