
var info_checker = require("./info-checker.js");
var muser        = require("./muser.js");
var hash_pass    = require("./m-hash-pass.js");

var p = console.log;


// @user_info : hash {username: must, password: must, referrer:...}
function insert_user_info_into_mongodb(user_info, callback){
    if(! info_checker.has_username_password(user_info)) return callback('not enough user info, in suitm');

    // Check elsewhere
    //if(! info_checker.valid_name(user_info.username)) return callback('name not pass checker user info, in suitm');
    //if(  info_checker.is_old_names(user_info.username)) return callback('name occupied by history reason, in suitm');

    var un = user_info.username;


    info_checker.fill_in_necessary_user_info(user_info);
    //p('after fill in user info: ', user_info);

    // This also will  delete the plain password:
    hash_pass.hash_password_for_userinfo(user_info, function(err, user_hash){
        if (err) {
            p('in save u t mdb, h p . h p f u : err: ', err, user_info);
            return callback(err, null);
        }

        //callback(err, user_hash); // indev
        muser.insert_user_info(user_info, callback);
    });
}
module.exports.insert_user_info_into_mongodb = insert_user_info_into_mongodb;


function user_name_can_be_used(name, callback){
    if(! info_checker.valid_name(name)) return callback('name not pass checker user info, in uncbu');
    if(  info_checker.is_old_names(name)) return callback('name occupied by history reason, in uncbu');

    muser.name_exists(name, function(err, yes){
        if(err) return callback(err);

        if(yes) return callback(null, false, 'the user name occupied');

        callback(null, true);
    });
}
module.exports.user_name_can_be_used = user_name_can_be_used;


/*
 * Add a new user, if name is not ok, it will callback with err message.
 */
function new_user(name, password, callback){
    user_name_can_be_used(name, function(err, yes){
        if(err)  return callback(err);
        if(!yes) return callback('Name occupied maybe, user name can NOT be used');

        var info = {
            username : name,
            password : password
        };

        insert_user_info_into_mongodb(info, callback);
    });
}
module.exports.new_user = new_user;

