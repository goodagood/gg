
const client = require('./mongo.client.js');


function insert_one(value_json, callback){
    if(!check_value_json(value_json)) return callback('json value not ok');

    client.get_value_coll(function(err, coll){
        if(err){return callback(err);}

        coll.insertOne(value_json, callback);
    });
}
module.exports.insert_one = insert_one;


function check_value_json(j){
    if(!j.value) j.value = 1;

    j.millisec = Date.now().toString();
    return true;
}


function find(query={}, callback){
    client.get_value_coll(function(err, coll){
        if(err){return callback(err);}

        coll.find(query).toArray(callback);
    });
}
module.exports.find = find;




// checkings

var p = console.log;

//for testing:
const _ = require('underscore');

function cinsert(){
        insert_one    ({test: true, timestr: '2017 0505 0312am'}, function(err, back){
            p(back, err);
        });
}

function cfind(){
    find({}, function(err, what){
        p(what, err);
        p('is array: ', _.isArray(what))
    });
}

if(require.main == module){
    //cinsert();
    cfind();
    setTimeout(process.exit, 3000);
}
