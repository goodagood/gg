
/*
 * mongodb for user informations.
 */

var MongoClient = require('mongodb').MongoClient;

var gg_user_db         = 'mongodb://localhost:9017/gg';
var user_collection    = 'users';
var user_id_field_name = 'userid';

var p = console.log;


/*
 * Get the mongodb, database name 'gg',
 * where it has collection of user information.
 */
var GG;
function getgg(callback){
    if(GG) return callback(null, GG);

    var url = gg_user_db;
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

    p('going to get gg in get user collection');
    getgg(function(err, ggdb){
        if(err) return callback(err);

        UserCollection = ggdb.collection(user_collection);
        callback(null, UserCollection);
    });
}
module.exports.get_user_collection = get_user_collection;


function find_by_user_id(id, callback){
    get_user_collection(function(err, collection) {
        if(err) return callback(err);

        p('going to findOne');
        //collection.findOne({user_id_field_name: id}, callback);
        collection.findOne({'userid': id}, callback);
    });
}
module.exports.find_by_user_id = find_by_user_id;


