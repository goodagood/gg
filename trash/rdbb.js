
client.get("string key", function(err, reply){

    console.log("ooo ooo \n");
    console.log(reply);
});


client.keys("*", function(err, reply){

    console.log("keys * \n");
    console.log(reply);
});
