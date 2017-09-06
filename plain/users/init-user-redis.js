
/*
 * After un-awared redis server dispear, reset data in new redis, 0305, 2015.
 */

var redis = require("redis");

var async = require("async");

var user  = require("./a.js");
var hname = require("./home-number.js");


var myconfig =   require("../config/config.js");

var redis_basic = require("../myutils/redis-basic.js");
var client = redis_basic.client;

var secrets = require("../config/secret-dir.js");
//var redis_host = secrets.conf.redis.redis_host;
//var redis_port = secrets.conf.redis.redis_port;

var aws_conf   =  secrets.conf.aws;


////  should we create client and close it every time?
//var client = redis.createClient(redis_port, redis_host);

var p    = console.log;

function set_user_info(user_info, callback){
    // 
    // 
    // @user_info : hash {username:..., password:..., id:..., referer:...} //refeRRer?
    // @callback  :
    //   callback(err, user_info)  // user_info filled.
    // 

    var username = user_info.username;

    check_name_exist(username, function(err, name_exists){
        //console.log("11 init user c, and username: ", username);
        console.log("init-user-redis.js, set user info, name_exists: ", name_exists);
        if(err) return callback(err, null);

        if(name_exists) return callback(new Error('username conflict'), null);

        // Name not exists:
        user_info['what']      = myconfig.IamUserInfo;
        user_info['storage']   = "s3";
        user_info['s3-bucket'] = aws_conf.root_bucket;

        console.log("init user redis, set user info, ..  user info: ", user_info);

        hname.get_home_name(username, function(err, home_name){
            user_info['home'] = home_name;
            console.log("init user redis, set user info, after get home..  user info: ", user_info);
            //callback(null, user_info);

                client.hmset(username, user_info, function(err, reply){
                    console.log("in 'init user redis.js' , hmset", reply);
                    if (err) { return callback(err, null); }
                    user.add_name_to_user_roll(username, function(err, add_reply){
                        callback(null, user_info);
                    });
                });

        });

        //console.log(" did you get logs in init_home_folder? ", 'o^o');

    });
}



function check_name_exist(username, callback){
  client.exists(username, function(err, name_exists){
    if(err) { callback(err, true); return;}
    if(name_exists) {callback(null, true); return;}
    callback(null, false);
  });
}



// do some fast checkings

var stop = function(seconds) {
    var seconds = seconds || 1;
    var milli_sec = seconds * 1000;
    setTimeout(process.exit, milli_sec);
};

function check_init_user_a(){
    var user_info = {
        username : 'aa',
        id       : 'aa',
        password : 'kkkooo',
        referer  : 'andrew'
    };
    set_user_info(user_info, function(err, user){
        p('err, user', err, user);
        stop();
    });
}


function check_set_many(){
    var names = [
        //'aa',
        'ab',
        'abc',
        'ac',
        'andrew',
        'anonymous',
        'bb',
        'cc',
        'dd',
        'dirty-show',
        'ee',
        'goodagood',
        'lth',
        'muji',
        'test',
        'tmp',
        'tmpa',
        'tmpaa',
        'tmpab',
        'tmpb',
        'tmpc',
        'tmpd',
        'who' ,
        'pptok',
        ];
    // end of names

    // make a function to reset old names
    function reset_old_name(name, callback){
        var user_info = {
            username : name,
            id       : name,
            password : 'kkkooo',
            referer  : 'andrew'
        };
        set_user_info(user_info, callback);
    }

    async.map(names, reset_old_name, function(err, results){
        p('after reset many, err, results\n', err, results);
        stop();
    });
}


if(require.main == module){
    check_init_user_a();
    //check_set_many();
}
