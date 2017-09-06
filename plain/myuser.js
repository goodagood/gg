// 2014 0219
// Use redis for user/password
//
// 2015 0121 deprecated, use users/a.js instead
//

var conf =   require("./config/config.js");

var clog = console.log;
var util = require('util');
var see  = util.inspect;

var mylog = require("./mylog.js");
var folder = require("./myutils/folder.js"); // old attempt

var s3folder = require("./aws/folder.js");

var redis_basic = require("./myutils/redis-basic.js");
var rclient = redis_basic.client;

var bucket = require("./aws/bucket.js");

var u      = require('underscore');

var log28  = require('./myutils/mylogb.js').double_log('/tmp/log28');

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
      return fn(null, user);
    });
  });
}


// not using? 0626
function _findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}




//// not finished, but using, 0525.
//// default folders not added, the function for default folders is ready.
//function add_user(user_info){
//  // user_info : hash {username:..., password:..., id:..., referrer:...}
//  rclient.exists(user_info.username, function(err, name_exists){
//    console.log("add user hit redis, and ", user_info.username);
//    if(err){
//      throw new Error(err);
//    }
//    if(name_exists === 0){
//      // Name not exists
//      process.nextTick(function(){
//        myfolder.make_home_folder({owner:user_info.username, abspath: user_info.username}, 
//          function(err, folder_key){
//            //console.log("folder key");
//            //console.log(folder_key);
//
//            user_info['home_folder'] = folder_key;
//            user_info['.ggwhat'] = "user_information";
//
//            //console.log("user_info");
//            //console.log(user_info);
//            rclient.hmset(user_info.username, user_info, function(err, reply){
//              if (err) {
//                throw new Error(
//                  err.toString() + " When add user: " + user_info.username);
//              }
//            });
//
//        });
//      });
//      //
//    }else{
//      return "username exists";
//    }
//  });
//}



var ihome = require('./aws/init-home.js');
function init_user_c(user_info, callback){
  // 
  // To replace: init_user, init_user_a, init_user_b
  // 
  // @user_info : hash {username:..., password:..., id:..., referrer:...}
  // @callback  :
  //   callback(err, user_obj)
  // 
  isNameOccupied(user_info.username, function(err, name_exists){
    //console.log("11 init user c, and username: ", user_info.username);
    console.log("111 init user c, name_exists: ", name_exists);
    if(err) return ( callback(err, null) );

    if(name_exists) return (callback(new Error('username conflict'), null));

    // Name not exists:
    user_info['what'] = "user_information";
    user_info['storage'] = "s3";
    user_info['s3-bucket'] = conf.root_bucket;

    //console.log("22 init user c, user info ", user_info);
    //s3folder.init_home_folder(user_info.username, function(err, meta)...
    ihome.init_one_home(user_info.username).then(function(what_ever){
      //console.log("user_info"); console.log(user_info);
      rclient.hmset(user_info.username, user_info, function(err, reply){
        console.log("33 hmset in myuser, init user c ", reply);
        if (err) { return callback(err, null); }
        add_name_to_user_roll(user_info.username);
        callback(null, user_info);
      });
    });
    //log28(" did you get logs in init_home_folder? ", 'o^o');

  });
}

function test_init_user_c(){
  var users = ['tmp',];
  users.forEach(function(username){
    var info = {username: username, password: 'kkkooo', referrer:'andrew'};
    console.log(info);
    init_user_c(info, function(err, u){
      if(err) return console.log('ERR, ', username);
      console.log(u);
      console.log(' --- --- ');
    });
  });
}

function test_init_user_c_many(){
  var users = ['tmp', 'tmpa'];
  users.forEach(function(username){
    var info = {username: username, password: 'kkkooo', referrer:'andrew'};
    init_user_c(info, function(err, u){
      if(err) return console.log('ERR, ', username);
      console.log(u);
      console.log(' --- --- ');
    });
  });
}


function isNameOccupied(username, callback){
  rclient.exists(username, function(err, name_exists){
    if(err) { callback(err, true); return;}
    if(name_exists) {callback(null, true); return;}
    callback(null, false);
  });
}


function test_isNameOccupied(name){
  name = name || 'muji';
  isNameOccupied(name, function(err, exists){
    if(err) console.log(err);
    console.log('name muji:');
    console.log('exists:');
    console.log(exists);
  });
  isNameOccupied('muji-qq', function(err, exists){
    if(err) console.log(err);
    console.log('name muji-qq:');
    console.log('exists:');
    console.log(exists);
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


/*
 * Do this with CAREFULNESS!!
 */
function test_delete_user(){
  ['abc', ].forEach(function(name){
    delete_user(name);
  });
}


//d
function add_file(username, file){
  // add a record (key-value) to user data
  rclient.exists(username, function(err, name_exists){
    console.log("add_file hit redis, for ", username);
    if(err){
      throw new Error(err);
    }
    if(name_exists){
      var file_info = JSON.stringify(file);
      process.nextTick(function(){
        rclient.hset(username, file.name, file_info, function(err, reply){
          if (err) {
            throw new Error(
              err.toString() + " When add user: " + user.username);
          }
        });
      });
      //
    }else{
      return "username not exists";
    }
  });
}


////d
//function add_file_key(username, file){
//  // add a record (key-value) to user data
//  rclient.exists(username, function(err, name_exists){
//    //console.log("'add file key' hit redis, for ", username);
//    if(err){
//      throw new Error(err);
//    }
//    if(name_exists){
//      var file_info = JSON.stringify(file);
//      process.nextTick(function(){
//
//        mylog.info("username"); mylog.info(username);
//        mylog.info("redis_file_key"); mylog.info(file.redis_file_key);
//        rclient.hset(username, file.name, file.redis_file_key, function(err, reply){
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


// -- do some fast checkings -- //


var p = console.log;

function stop(period) {
    var milli_seconds;
    period = period || 1;
    if (!u.isNumber(period)) {
        period = 1;
    }
    milli_seconds = period * 1000;
    return setTimeout(process.exit, milli_seconds);
};


function redis_user_hash(username){
  rclient.hgetall(username, function(err, userdata){
    if(err){
      clog(err);
    }
    clog(see(userdata));
  });
}

function test_findByUsername(name){
  findByUsername(name, function(err, user){
    if (err){
      clog("err\n");
      clog(see(err));
    }
    if (!user){
      clog("not user");
    }

    clog("you get a user\n");
    clog(see(user));
  });
}


function test_make_user_file_href_list(){
  make_user_file_href_list('abc', function(err, alist){
    console.log(alist);
  });
}


//function test_add_user(){
//  var ui = { // user info
//    username : 'tmpb',
//    password : 'kkkooo',
//    referrer : 'abc'
//  };
//  add_user(ui);
//}


function add_name_to_user_roll(username, callback){
  var key_of_roll = conf.current_user_name_roll;
  rclient.sadd(key_of_roll, username, function(err, reply){
    if(callback) callback(err, reply);
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
  var key_of_roll = conf.current_user_name_roll;
  rclient.smembers(key_of_roll, callback);
  //  function(err, reply){
  //  callback(err, reply);
  //});
}

function test_get_user_names(){
  get_user_names(function(err, reply){
    console.log(typeof reply);
    console.log(u.isArray(reply));
    reply.sort();
    //console.log(reply.join('\n\t, '));
    console.log(reply);
    stop();
  });
}

if (require.main === module){
  //test_make_user_file_href_list();

  //test_add_user();
  //test_delete_user();

  //test_add_name_to_user_roll_b();
  //test_isNameOccupied();

  test_get_user_names();
  //test_init_user_c();
  setTimeout(function(){ rclient.quit(); }, 5000);  // close the redis.
}

module.exports.findByUsername = findByUsername;
//module.exports.add_user = add_user;
module.exports.add_file = add_file;
//module.exports.add_file_key = add_file_key;
//module.exports.init_user = init_user;
//module.exports.init_user_b = init_user_b;
module.exports.init_user_c = init_user_c;
module.exports.add_name_to_user_roll = add_name_to_user_roll;
module.exports.get_user_names = get_user_names;

module.exports.is_name_occupied = isNameOccupied;


// vim: set et ts=2 sw=2 fdm=indent:
