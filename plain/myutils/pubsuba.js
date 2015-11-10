
var myconfig   =   require("../config/config.js");

//var redis_host = myconfig.redis_host;
//var redis_port = myconfig.redis_port;

var secrets    = require("../config/secret-dir.js");
var redis_host = secrets.conf.redis.redis_host;
var redis_port = secrets.conf.redis.redis_port;

var redis = require("redis");
var client = redis.createClient(redis_port, redis_host);

var client2 = redis.createClient(redis_port, redis_host);

client.on("subscribe", function (channel, count) {
  console.log(' --- subscribe message --- ');
  client2.publish("a-channel", "I am sending a message.");
  client2.publish("a-channel", "I am sending a second message.");
  client2.publish("a-channel", "I am sending my last message.");
});

client.on("message", function (channel, message) {
  console.log("client channel " + channel + ": " + message);
  console.log(Date.now().toString());
});




function test_pub(number){
  number = number || 5;

  for(var i=0; i<number; i++){
    client2.publish("a-channel",  'ha ha : ' + Date.now().toString());
  }
}

function test_conf(){
  var p = console.log;

  p( redis_host);
  p( redis_port);
  process.exit();
}


if(require.main === module){

  //client.subscribe('a-channel');
  test_conf();
  //setTimeout(test_pub, 5000);
  //setTimeout(function(){process.exit();}, 28000);
}

// vim: et ts=2 sw=2 :
