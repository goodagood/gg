// 2014 0519
// Basic tools to use redis.  One purpose is to save multiple redis clients.
//

var u     = require("underscore");

var conf  =   require("../config/config.js");

var util  = require('util');


var p = console.log;

var mylog = require("./mylog.js")

//var redis_host = conf.redis_host, redis_port = conf.redis_port;
//if(!redis_port) redis_port = 6379;
var secrets = require("../config/secret-dir.js");
var redis_host = secrets.conf.redis.redis_host;
var redis_port = secrets.conf.redis.redis_port;
var redis_pass = secrets.conf.redis.requirepass;

var redis = require("redis");
var client = redis.createClient(redis_port, redis_host, {auth_pass: redis_pass});

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

client.on("error", function (err) {
    console.log("Error, redis client error: " + err);
});


// Give a serial number, to avoid number conflicts.
// '_serial_number_rb' in redis db store the serial number
function serial_number(callback){
  client.incr("_serial_number_rb", function(err, number){
    if(err){
      callback(err);
    }
    //console.log('serial number is :' + number);

    // except a callback, which get the number
    callback(null, number);
  });
}

function serial_number_str(callback){
  serial_number(function(err, num){
    if(err) return callback(err, null);
    if(!u.isNumber(num)) return callback('got no number', null);

    try{
      var str = num.toString();
      callback(null, str);
    }catch(err){
      callback(err, null);
    }
  });
}


function save_string(string, callback){
  serial_number(function(err, number){
    if (err) throw new Error('thrown in save string, ' + err.toString());

    var key = 'str.' + number.toString();
    client.set(key, string, function(err, reply){
      callback(err, key);
    });
  });
}


function get_string(key, callback){
  // callback will be called as: callback(err, the_string)
  client.get(key, callback);
}


function save_obj(obj, callback){
  serial_number(function(err, number){
    if (err) throw new Error('thrown in save string, ' + err.toString());

    var key = 'h.' + number.toString();
    client.hmset(key, obj, function(err, reply){
      callback(err, key);
    });
  });
}


function get_obj(key, callback){
  // callback will be called as: callback(err, obj)
  client.hgetall(key, callback);
}


function get_obj_without_hidden(key, callback){
  // If the name of the key (property) start from '.', 
  // think it as hidden, as for *nix file name convention.
  // callback will be called as: callback(err, obj)
  client.hgetall(key, function(err,obj){
    //if (err) throw new Error('error happened in "get obj without hidden" ' + err.toString();
    if (err) callback(err, obj);

    for (var k in obj){
      if (k.indexOf('.') == 0){
        delete obj[k];
      }
    }
    callback(null, obj);
  });
}


function serialize_obj_and_save(){
}


// testing
function chk_serial_number(){
  serial_number(function(err, num){
    if(err) return process.exit(p('err: ', err));

    console.log("number is " + num.toString());
    process.exit();
  });
}


function test_save_string(){
  var s = "test b, save string, " + Date.now().toString();
  save_string(s, function(err, str_key){
    console.log("the key of the string " + s + " is:");
    console.log(str_key);

    // try to get the string back
    get_string(str_key, function(err, string){
      console.log("the value of the string: " + string );
    });
  });
}


function test_save_obj(){
  var o = {a:1, b:2, c:"c is string", d:Date.now()};
  save_obj(o, function(err, reply_is_key){
    // reply is key in redis of the object hash
    console.log("save the object: " + util.inspect(o));
    console.log("redis key is " );
    console.log(reply_is_key);

    // test to get the object:
    get_obj(reply_is_key, function(err, obj){
      console.log("get the saved obj:");
      console.log(typeof obj);
      console.log(obj);

    });
  });
}


function test_get_obj_without_hidden(){
  var o = {a:1, b:2, c:"c is string", d:Date.now(), 
    '.ee':'dot e e',
    ".another dot" : "this is another dot"
  };
  save_obj(o, function(err, reply_is_key){
    // reply is key in redis of the object hash
    console.log("save the object: " + util.inspect(o));
    console.log("redis key is " );
    console.log(reply_is_key);

    // test to get the object, the key start with dot should not appear:
    get_obj_without_hidden(reply_is_key, function(err, obj){
      console.log("get the saved obj:");
      console.log(typeof obj);
      console.log(obj);

    });
  });
}

function chk_redis_connect(){
  client.keys('e.sess.rs*', function(err, what){
    p(err, what);
    process.exit();
  });
}


if (require.main === module){
  //chk_redis_connect();
  chk_serial_number();

  //client.set('tmp1', 'tmp1value', function(err, reply){
  //  console.log(typeof reply);
  //  console.log(reply);
  //});

  //test_save_string();

  //test_save_obj();
  //test_get_obj_without_hidden();

  //setTimeout(function(){ client.quit(); }, 5000);  // close the redis.
}


module.exports.client = client;
module.exports.serial_number = serial_number;
module.exports.serial_number_str = serial_number_str;
module.exports.save_string = save_string;
module.exports.get_string = get_string;
module.exports.save_obj = save_obj;
module.exports.get_obj = get_obj;
module.exports.get_obj_without_hidden = get_obj_without_hidden;

// vim: et sw=2 ts=2:
