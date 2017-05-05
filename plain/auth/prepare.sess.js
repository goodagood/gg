
// session backup by redis DB, RedisStore should be a class:
//var RedisStore = require('connect-redis')(express);
var session    = require('express-session');
var RedisStore = require('connect-redis')(session);

var myRedisStore = require("./redis.store.js");


var secrets = require("plain/config/secret-dir.js");
var redis_host = secrets.conf.redis.redis_host;
var redis_port = secrets.conf.redis.redis_port;
var redis_pass = secrets.conf.redis.requirepass;

var redis_store_instance = new RedisStore({
  port: redis_port,
  host: redis_host,
  //pass: redis_pass, //2017 0426
  prefix: 'e.sess.rs'
});

var my_redis_store = myRedisStore.config_redis_store({
  port: redis_port,
  host: redis_host,
  prefix: 'e.sess.rs'
});


var prepared_session_middle_ware = session({ 
  store  : redis_store_instance,
  // 2017 0426 comment out secret, err
  // already using ssh port forward to local db for long.
  secret : 'kEy.b0ard#ca-t, th|s shou|d be $ecret',
  // this 2 defaults is going to change:
  saveUninitialized : true,
  resave : true,
  rolling : true
});

module.exports.prepared_session_middle_ware = prepared_session_middle_ware;


if(require.main === module){
    console.log('main');
}
