
var vn = require("./validate-name.js");


var u = require('underscore');

var bucket = require("../aws/bucket.js");

var user = require("./a.js");
var folder_module = require("../aws/folder-v5.js");

var p = console.log;


function lsobj(prefix){
    bucket.s3list(prefix, function(err, s3rep){
        o.err   = err;
        o.s3rep = s3rep;
    });
}


function ls_obj_content(prefix){
    bucket.list(prefix, function(err, cont){
        o.err   = err;
        o.cont = cont;
        p('o.cont: ', o.cont); 
    });
}


function get_home_folder_meta_key(username){
    // when username is the folder path
    var s3key = folder_module.make_s3key_for_folder_meta_file(username);
    bucket.list(s3key, function(err, content){
        o.err   = err;
        o.content = content;
        p('o.content: ', o.content); 
    });
}

function get_root_folder_meta_key(username){
    // when username is the folder path
    user.get_user_id(username, function(err, uid){
        var s3key = folder_module.make_s3key_for_folder_meta_file(uid);
        bucket.list(s3key, function(err, content){
            o.err   = err;
            o.content = content;
            p('o.content: ', o.content); 
        });
    });

}


function is_all_digits(str){
    if(u.isFinite(str)) return true;  // is number and finite

    if(!str) return false;
    if(!u.isString(str)) return false;

    var pat = /^[0-9]+$/;
    return pat.test(str);
}


/*
 * trying, 2015 1107
 * Check if the user name is ok before init root folder for the user, the 
 * user id is going to be same as user name.  There is no need to check if
 * the user name has 'id', not come into exists yet.
 */
function validate_name_a(username){
    //forbid all digit username, because we use is as serial number...
    //we keep all digits id used by sys only, auto-gen serial number as user id.
    //give at least one non-digit
    if(is_all_digits(username)) return callback('we keep all digits id used by sys only.');

    user.is_name_occupied(username, function(err, occupied){
        if(err){
            p('finding if name occupied get err: ', err);
            return
        }

        if(occupied){
            p('finding name occupied: ', occupied);
            return
        }

        // Now, it's ok in redis,
        // Check it as id ...

        var s3key = folder_module.make_s3key_for_folder_meta_file(username);
        bucket.list(s3key, function(err, content){
            if(err){
                p('list with prefix got err : ', err);
                return
            }
            o.err   = err;
            o.content = content;
            p('o.content.length: ', o.content.length); 
        });
    });

}


function check_name(name){
    name = name || 'ar';

    vn.user_name_could_be_used_as_id(name, function(err, yes, reason){
        if(err) p('got err: ', err);
        p(yes, reason);
    });
}

var o = {};


//lsobj2('ar');
//get_home_folder_meta_key('ar');
//get_root_folder_meta_key('ar');
//validate_name_a('ar');
check_name();
p( "ok start interact:");
