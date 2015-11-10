/*
 * Check the name is ok
 *     validate_user_name
 * Check the name is can be used as id
 *     user_name_could_be_used_as_id
 *
 * 2015 1107
 */


var u = require('underscore');

var bucket = require("../aws/bucket.js");
var user   = require("./a.js");

var folder_module = require("../aws/folder-v5.js");


/*
 * User name pattern:
 * From start to end, without space, tab and other empty things.
 * Must start with [A-Za-z0-9_], followed by non-empty words untill ending.
 * Less then 129 letters.
 * Not sure what will happen if there is utf-8 encoding.
 * 2015, 1107
 */
var Name_pat  = /^\w\S{2,128}$/;


function validate_user_name(name){
    if(!name) return false;
    if(!u.isString(name)) return false;

    return Name_pat.test(name);
}


function is_all_digits(str){
    if(u.isFinite(str)) return true;  // is number and finite

    if(!str) return false;
    if(!u.isString(str)) return false;

    var pat = /^[0-9]+$/;
    return pat.test(str);
}


//var redis_basic = require("../myutils/redis-basic.js");
//var rclient = redis_basic.client;
//function is_name_in_redis(username, callback){
//  rclient.exists(username, function(err, name_exists){
//    if(err) { callback(err, true); return;}
//    if(name_exists) {callback(null, true); return;}
//    callback(null, false);
//  });
//}


/*
 * Check if the user name is ok before init root folder for the user, the 
 * user id is going to be same as user name.  There is no need to check if
 * the user name has 'id', not come into exists yet.
 *
 * callback will get true, if it's ok to use the username as user id.  If not
 * it can give a 'reason' as the 3rd parameter for callback.
 */
function user_name_could_be_used_as_id(username, callback){

    if(!validate_user_name(username)) return callback('Not valide user name.');

    /**
     * forbid all digit username, because we might use is as serial number.
     * we are going to keep all digits id used by sys only, auto-gen serial
     * number as user id.
     * So, give at least one non-digit
     */
    if(is_all_digits(username)) return callback('we keep all digits id used by sys only.');

    user.is_name_occupied(username, function(err, occupied){
        if(err){
            p('finding if name occupied get err: ', err);
            return callback(err);
        }

        if(occupied){
            p('finding name occupied: ', occupied);
            return callback(null, false, 'user name has been occupied');
        }

        // Now, it's ok in redis, Check it can be used as id ...
        var s3key = folder_module.make_s3key_for_folder_meta_file(username);
        bucket.list(s3key, function(err, content){
            if(err){
                p('list with prefix got err : ', err);
                return callback(err);
            }
            if(!u.isArray(content)) return callback(null, false, 'not array? when check to be used as id, 1107');

            var len = content.length;
            if( len > 0 ) return callback(null, false, 'Wierdly the id not ok');

            callback(null, true); // yes, it's ok
        });
    });
}


module.exports.validate_user_name = validate_user_name;
module.exports.user_name_could_be_used_as_id = user_name_could_be_used_as_id;


////** trying and checkings
//var name_pat1 = /[a-zA-Z0-9]{3,}/;
//var name_pat2 = /[a-zA-Z0-9]{3,}/;
//var name_pat3 = /[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\-._]{3,}/;
//var name_pat4 = /\w[\w\S]{2,}/;
//var name_pat5 = /^\w\S{2,}$/;
//
//
//var tn1 = 'abcde';
//var tns = ['abcde', '39adk', '88a 99', '#as8'] ;


