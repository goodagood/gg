

//var redis_host = "54.248.54.80";
//var redis_port = null;  // null is default 6379

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


function testa(){
    client.hgetall("h.3", function(err, reply){
        console.log(typeof reply);
        console.log(reply);
    });
}


function testb(callback){
    if (callback){
        client.hgetall("h.3", callback);
    }
    //client.hgetall("h.3", function(err, reply){
    //    console.log(typeof reply);
    //    console.log(reply);
    //});
}

function cba(err, reply){
    console.log(reply);
}
