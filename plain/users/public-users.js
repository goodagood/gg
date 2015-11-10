
var u       = require("underscore");
var user_module = require("./a.js");

var p = console.log;

function get_one_public_user(callback){

    var usernames = ['cat-01', 'dog-01', 'dog-02',];
    // sample is to get a sample from an array, we can use it as random pick:
    var username = u.sample(usernames);

    user_module.find_by_user_name(username, function(err, user_info){
        callback(err, user_info);
    });

}


module.exports.get_one_public_user = get_one_public_user;


//-- checkings --//

var stop = function(period) {
    var milli_seconds;
    period = period || 1;
    if (!u.isNumber(period)) {
        period = 1;
    }
    milli_seconds = period * 1000;
    return setTimeout(process.exit, milli_seconds);
};


function chk_get_one(){
    get_one_public_user(function(err, one_user){
        p(err, one_user);
        stop();
    });
}

if(require.main === module){
    chk_get_one();
}


