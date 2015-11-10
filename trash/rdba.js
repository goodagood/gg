var rd = require("redis"),
    client = rd.createClient(null, "54.248.54.80");

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

client.on("error", function (err) {
    console.log("Error " + err);
});


//client.set("string key", "string val", rd.print);
//client.hset("hash key", "hashtest 1", "some value", rd.print);
//client.hset(["hash key", "hashtest 2", "some other value"], rd.print);
//client.hkeys("hash key", function (err, replies) {
//    console.log(replies.length + " replies:");
//    replies.forEach(function (reply, i) {
//        console.log("    " + i + ": " + reply);
//    });
//    client.quit();
//});

client.get("string key", function(err, reply){
    console.log(reply);
});
