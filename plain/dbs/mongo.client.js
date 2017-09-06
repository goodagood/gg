
/*
 * mongodb for user informations.
 */

var MongoClient = require('mongodb').MongoClient;

// 27017 is actually being forwarded to the target db server
var GG_User_Db         = 'mongodb://localhost:27017/gg';
var User_Collection_Name = 'users';
var User_Id_Field      = 'userid';
var User_Name_Field    = 'username';


//2017 0505 1259am
const GG_Sys_Db         = 'mongodb://localhost:27017/ggsys';
const Value_Collection  = 'value';


var p = console.log;


const dbs_colls = {
    //dbs:
    gg : null,
    ggsys: null,

    // collections:
    value: null,
    user: null
};


/*
 * Get the mongodb, database supported by 'url'
 * where it has collection of user information.
 *
 */
function getdb(url, callback){

    MongoClient.connect(url, function(err, db){
        if(err) return callback(err);

        callback(null, db);
    });
}
module.exports.getdb = getdb;


function get_value_coll(callback){
    if(dbs_colls.ggsys === null){
        getdb(GG_Sys_Db, function(err, db){
            if(err) return callback(err);
            dbs_colls.ggsys = db;

            value_collection = db.collection(Value_Collection);
            callback(null, value_collection);
        });
    }else{
        value_collection = dbs_colls.ggsys.collection(Value_Collection);
        callback(null, value_collection);
    }

}
module.exports.get_value_coll = get_value_coll;


/*
 * Get the mongodb, database name 'gg',
 * where it has collection of user information.
 *
 * old
 */
var GG;
function getgg(callback){
    if(GG) return callback(null, GG);

    var url = GG_User_Db;
    MongoClient.connect(url, function(err, db){
        if(err) return callback(err);

        GG = db;
        callback(null, GG);
    });
}
module.exports.getgg = getgg;


/*
 *  Get the collection
 */
var UserCollection;
function get_user_collection(callback){
    if(UserCollection) return callback(null, UserCollection);

    //p('going to get gg in get user collection');
    getgg(function(err, ggdb){
        if(err) return callback(err);

        UserCollection = ggdb.collection(User_Collection_Name);
        //p('user collection: ', UserCollection);
        callback(null, UserCollection);
    });
}
module.exports.get_user_collection = get_user_collection;



/*
 *  Get the collection
 */
function get_collection(name_of_collection, callback){

    getgg(function(err, ggdb){
        if(err) return callback(err);

        coll = ggdb.collection(name_of_collection);
        //p('user collection: ', coll);
        callback(null, coll);
    });
}
module.exports.get_collection = get_collection;

