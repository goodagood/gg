// var redis = require("redis");
// var client = redis.createClient(null, "54.248.54.80");

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

// client.on("error", function (err) {
//     console.log("Error " + err);
// });

// client.set("string key", "string val", redis.print);
// client.hset("hash key", "hashtest 1", "some value", redis.print);
// client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
// client.hkeys("hash key", function (err, replies) {
//     console.log(replies.length + " replies:");
//     replies.forEach(function (reply, i) {
//         console.log("    " + i + ": " + reply);
//     });
//     // client.quit();
// });

// client.get("string key", function(err, reply){
//     console.log(reply);
// });

// client.exists("string key blaa", function(err, reply){
//     console.log("key exists.\n");
//     console.log(reply);
//     console.log(typeof reply);
//     if(reply === 1){
//         console.log("1 is reply.\n");
//     }
//     if(reply === 0){
//         console.log("0 is reply.\n");
//     }
// });

// client.keys("*", redis.print);

// client.hgetall("hash key", redis.print);
client.hgetall("hash key", function(err, reply){
    if(err){ console.log("error occured \n"); return; }
    console.log( util.inspect(reply) );
    console.log( typeof reply );
    if( Array.isArray(reply) ){ 
      console.log("replay is array.\n");
    }else{
      console.log("replay NOT array.\n");
    }

    console.log( reply.length );

});
