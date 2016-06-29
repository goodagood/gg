
/*
 * mongodb for user informations.
 */

var MongoClient = require('mongodb').MongoClient;

// 27017 is actually being forwarded to the target db server
var GG_User_Db         = 'mongodb://localhost:27017/gg';
var User_Collection    = 'users';
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

    p('going to get gg in get user collection');
    getgg(function(err, ggdb){
        if(err) return callback(err);

        UserCollection = ggdb.collection(User_Collection);
        //p('user collection: ', UserCollection);
        callback(null, UserCollection);
    });
}
module.exports.get_user_collection = get_user_collection;


function find_by_user_id(id, callback){
    get_user_collection(function(err, collection) {
        if(err) return callback(err);

        p('going to findOne');
        //collection.findOne({User_Id_Field: id}, callback);
        collection.findOne({'userid': id}, callback);
    });
}
module.exports.find_by_user_id = find_by_user_id;


function find_by_user_name(name, callback){
    get_user_collection(function(err, collection) {
        if(err) return callback(err);

        var query = {};
        query[User_Name_Field] = name;
        //p('in find by user name, going to findOne:', query);

        collection.findOne(query, callback);
    });
}
module.exports.find_by_user_name = find_by_user_name;


function name_exists(name, callback){
    return find_by_user_name(name, function(err, info){
        p('in name exists: ', err, info);
        if(err) return callback(err);

        if(!info) return callback(null, false);

        if(info.username){
            return callback(null, info.username === name);
        }
        callback(err, info);
    });
}
module.exports.name_exists = name_exists;



function insert_user_info(info, callback){
    get_user_collection(function(err, collection) {
        if(err) return callback(err);

        collection.insertOne(info, callback);
    });
}
module.exports.insert_user_info = insert_user_info;
