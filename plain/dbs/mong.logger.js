
const mongo = require("./mongo.client.js");

//const Collection_of_Logger = '
const Logger_collection_name = "loggings";


const p = console.log.bind(console);


const log_json = (j, callback)=> {
    //p('log json got run');
    callback = callback || function(){};

    mongo.get_collection(Logger_collection_name, (err, coll)=> {
        // callback might be empty, so error might be ignored.
        if(err) return callback(err);
        coll.insertOne(j, null, callback);
    });
}
module.exports.log_json = log_json;


// //
function c_log(){
    var doc = {
        'test' : true,
        dd:  Date.now(),
        dt:  Date(),
        url: 'http://some.com/who/know',
        ip: '234.234.222.222'
    };

    log_json(doc, (err, what)=> {
        console.log(err, what);
        setTimeout(process.exit, 3000);
    });
}



if(require.main === module){
    console.log("main");

    //log_json({a:1}, (err, what)=> {
    //    console.log(err, what);
    //});

    c_log();
}

