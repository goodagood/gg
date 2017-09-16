
var u = require("underscore");

// 26 letters small and big, 2 symbols: -.
const Valid = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.';

function valid_name(name){
    if(!u.isString(name)) return false;
    if(name.length < 3 )  return false;

    if(name[0] === '.' || name[0] === '-' ) return false;

    var end = name[name.length - 1];
    if(end === '.' || end === '-' ) return false;

    for(var i = 0; i < name.length; i++){
        if(Valid.indexOf(name[i]) < 0) return false;
    }

    return true;
}
module.exports.valid_name = valid_name;


/*
 * At least we need 'username' and 'password' as string.
 * and password length >= 8.
 */
function has_username_password(user_info){
    if(user_info.username && u.isString(user_info.username)){
        if(user_info.password && u.isString(user_info.password)){
            if(user_info.password.length >= 8)
                return true;
        }
    }

    return false;
}
module.exports.has_username_password = has_username_password;


/*
 * Most are names in testing, used as user name.
 * Some accidently used as id of user, but later I gived up using of user id.
 * 2016 0310
 */
function is_old_names(name){
    var old_names = ["17", "19", "21", "24", "25", "27", "28", "29", "30",
        "33", "34", "35", "36", "37", "38", "39", "40", "41", "43", "45", "46",
        "47", "48", "54", "55", "aa", "ab", "abc", "ac", "ad", "ae", "af",
        "ag", "ah", "ai", "aj", "ak", "al", "am", "an", "andrew", "anonymous",
        "ao", "ap", "aq", "ar", "bb", "cat-01", "cat-02", "cat-03", "cat-04",
        "cat-05", "cat-06", "cat-07", "cat-08", "cc", "dd", "default",
        "defaults", "dirty-show", "dog-01", "dog-02", "dog-03", "dogi02",
        "dogi03", "dogi04", "dogi05", "ee", "goodagood", "goodogood", "intro",
        "jackyle6", "jobs", "lth", "muji", "pptok", "test", "testa", "tmp",
        "tmpa", "tmpaa", "tmpab", "tmpb", "tmpc", "tmpd", "tmpe", "who"];

    if(old_names.indexOf(name) >= 0) return true;

    return false;
}
module.exports.is_old_names = is_old_names;


function fill_in_necessary_user_info(info){
    info['what'] = "user_information";
    info['create_mili'] = Date.now();

    info['storage'] = "s3";
    //info['s3-bucket'] = aws_conf.root_bucket;
}
module.exports.fill_in_necessary_user_info = fill_in_necessary_user_info;



if(require.main === module){
    var p = console.log;

    function check_name_ok(){
        p(valid_name('abc'));   //true
        p(valid_name('a-bc'));   //true
        p(valid_name('1.23'));   //true
        p(valid_name('.abc'));   //false
        p(valid_name('-abc'));   //false
        p(valid_name('0abc.'));   //false
        p(valid_name('8abc-'));   //false
        p(valid_name('9a'));   //false
    }

    function c_old_name(){
        p(is_old_names('abc'));
        p(is_old_names('dogi05'));
    }
    c_old_name();
}

