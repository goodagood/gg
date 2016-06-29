
/*
 * mongodb for user informations.
 */

var MongoClient = require('mongodb').MongoClient;

// 27017 is actually being forwarded to the target db server
var GG_User_Db         = 'mongodb://localhost:27017/gg';
var User_Collection_Name = 'users';
var User_Id_Field      = 'userid';
var User_Name_Field    = 'username';



var p = console.log;


/*
 * Get the mongodb, database name 'gg',
 * where it has collection of user information.
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

