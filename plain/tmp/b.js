if(typeof clog === 'undefined'){
  var clog = console.log;
  var see  = util.inspect;
}

if( !redis_host ){
  var redis_host = "54.248.54.80", redis_port = null;

  var redis = require("redis");
  var client = redis.createClient(redis_port, redis_host);

  // if you'd like to select database 3, instead of 0 (default), call
  // client.select(3, function() { /* ... */ });

  client.on("error", function (err) {
    console.log("Error " + err);
  });
}

function hset(key, field, value){
  client.hset(key,  field, value, redis.print);
}

function fore(key){
  client.hkeys(key,  function(err, reply){
    if(err) console.log(err);
    reply.forEach(function(r){
      console.log(r);
    });
  });
}

function tob(hash_name){
  client.hgetall(hash_name, function(err, reply){
    console.log(util.inspect(reply));
    for(var i in reply){
      console.log(i, " => ",  reply[i]);
    }
  });
}

// vim: set sw=2 ts=2
