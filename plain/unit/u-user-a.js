
//
// 0330, 2015.
// 0512, 2015.
// Test users/a.js, after added 'set_user_info_attr(s)'
//

var assert  = require("assert");
var u       = require("underscore");
var async   = require("async");
var path    = require("path");
var Promise = require("bluebird");
var fs      = require("fs");

//var bucket        = require("../aws/bucket.js");
//var folder_module = require("../aws/folder-v5.js");
//var file_module   = require("../aws/simple-file-v3.js");
//var file_types    = require("../aws/s3-file-types.js");
//var update        = require("../aws/file-update.js");
//
//var myconfig =   require("../config/config.js");
//var config = require("../test/config.js");

var a      = require("../users/a.js");
var ttool  = require("../myutils/test-util.js");

// folders, files used in testing //
var _test_folder_path = 'abc';
var _test_file_name   = 'test-write-20';
var _test_file_path   = 'abc/test-write-20';
var _test_user_name   = 'abc';

var _gg_folder_name  = 'goodagood';
var _new_folder_name = 'test';
var _new_folder_name_in_test = 'test';


var p = console.log;

var stop = function(period) {
    var milli_seconds;
    period = period || 1;
    if (!u.isNumber(period)) {
        period = 1;
    }
    milli_seconds = period * 1000;
    return setTimeout(process.exit, milli_seconds);
};

// end of the headings //

// just moved from a.js
function test_init_user_c(){
  var users = ['tmp',];
  users.forEach(function(username){
    var info = {username: username, password: 'kkkooo', referrer:'andrew'};
    console.log(info);
    init_user_c(info, function(err, u){
      if(err) return console.log('ERR, ', username);
      console.log(u);
      console.log(' --- --- ');
    });
  });
}

function test_init_user_c_many(){
  var users = ['tmp', 'tmpa'];
  users.forEach(function(username){
    var info = {username: username, password: 'kkkooo', referrer:'andrew'};
    init_user_c(info, function(err, u){
      if(err) return console.log('ERR, ', username);
      console.log(u);
      console.log(' --- --- ');
    });
  });
}
// end moved to change ref.



function check_user_id(user_name){
    user_name = user_name || 'abc';
    a.get_user_id(user_name, function(err, id){
        p('cb');
        p('err id:', err, id);
        ttool.stop();
    });
}

function check_name2id(){
    var na = 'abc dfe  fe fds  df ds #@#$#';
    p(na, ' ', a.name2id(na));
    stop();
}

var rclient = require("../myutils/redis-basic.js").client;

function check_user_roll(){
  a.get_user_names(function(err, names){
    console.log(typeof names);
    console.log(u.isArray(names));
    names.sort();
    console.log(names.join(', '));

    assert(u.isArray(names));
    //u.map(names, a.findByUsername);
    stop();
  });
}


function check_user_has_id(){
  a.get_user_names(function(err, names){
    console.log(names.join(', '));

    assert(u.isArray(names));
    u.each(names, function(username, index, _array){
        //p("\n\n\n");
        //p(username, index, _array);
        a.findByUsername(username, function(err, user){
            //p('user: ', user);

            if(!user.id) p('-- no id: ', user.username);
            if(typeof user.id === 'undefined') p('-- no id: ', user.username);
            p(username, ' -- ', user.id, ' -- ', typeof user.id);

            //assert(u.isString(user.id));
            //assert(!u.isNull(user.id));
            //assert(!u.isEmpty(user.id));
            //a.get_user_id(username, function(err, id){
            //    assert(!err);
            //    assert(id === user.id);
            //    p(username, ' get user id: ', id);
            //});
        });
    });
    stop(30);
  });
}


function check_set_attr(){
    // name: user name, uinfo: user info

    var name = 'ak';
    a.findByUsername(name, function(err, uinfo){
        p(err, uinfo);
        //p('to set attribute');
        //a.set_user_info_attr(name, 'id', '30', function(err, what){
        //    p('did we get err? ', err, what);
        //    stop();
        //});
        stop();
    });
}

function check_assign(user_name, home_id){
    user_name = user_name || 'aj';
    home_id   = home_id   || '28';
    a.assign_user_home(user_name, home_id, function(err, what){
        p('check assign user home: ', err, what);
        stop();
    });
}

// check 'init user d' in ../user/a.js
function chk_init_user_d(username){
    if(!username) return p('make sure your know the __ username __, \n' +
            'we are going to init the user, \n' +
            'with "users/a.js # init_user_d \n');

    // @user_info : hash {username:..., password:..., id:...,  referrer:...}
    var user_info = {
        username: username,
        password: 'kkkooo',
        referrer: 'andrew'
    };
    a.init_user_d(user_info, function(err, uinfo){
        p('\n\n');
        p('after "init user d", got: ', err, uinfo);
        stop();
    });
}


/*
 * When checking with user 'ar', some thing wrong.
 */
function repare_ar(username){
    username = username || 'ar';

    // @user_info : hash {username:..., password:..., id:...,  referrer:...}
    var user_info = {
        username: username,
        password: 'kkkooo',
        referrer: 'andrew',
        id: '43',

    };

    a.is_name_occupied(user_info.username, function(err, name_exists){
        //console.log("11 init user c, and username: ", user_info.username);
        if(err) return p('err: ',  err);
        console.log("repare , name_exists: ", name_exists);
        if(name_exists) {
            p('1106 new Error("username conflict"), null');
            return process.exit();
        }

        a.save_user_to_redis(user_info, function(err, uinfo){
            if(err){
                console.log("i u d, 1106 drop init user d, err : ",err);
                return process.exit();
            }
            p('after "init user d", got: ', uinfo);
            process.exit();
        });
    });
}


// keep repare/repair user 'ar' id '43'
function check_ar_43(name){
    username = name || 'ar';

    // @user_info : hash {username:..., password:..., id:...,  referrer:...}
    var user_info = {
        username: username,
        password: 'kkkooo',
        referrer: 'andrew',
        id: '43',

    };
    a.find_by_user_name(username, function(err, uinfo){
        if(err){
            console.log("c a 4, 1106 k c u i 915pm   , err : ",err);
            return process.exit();
        }
        p('user info: ', uinfo);
        process.exit();
    });
}


var secrets  =  require("../config/secret-dir.js");
var aws_conf =  secrets.conf.aws;
function check_ar_43_occupy(name){
    username = name || 'ar';

    a.find_by_user_name(username, function(err, user_info){
        if(err){
            console.log("c a 4, 1106 k c u i 915pm   , err : ",err);
            return process.exit();
        }
        p('ca4o user info: ', user_info);

        // add password because need to do hashing
        user_info['password'] = 'kkkooo'; 

        user_info['what'] = "user_information";
        user_info['storage'] = "s3";
        user_info['s3-bucket'] = aws_conf.root_bucket;

        console.log("in occupy room, before get hid, user info ", user_info);

        console.log("user_info"); console.log(user_info);
        a.save_user_to_redis(user_info, function(err, uinfo){
            if(err){
                console.log("ca4o , 1106 936 , err : ",err);
                return process.exit();
            }
            p('after save u t r   , got: ', uinfo);

            process.exit();
        });

    });
}



if(require.main === module){
    //check_user_id();
    //check_name2id();
    //check_user_roll();
    //check_user_has_id();

    //check_set_attr();
    //check_assign('am', '29');

    //chk_init_user_d('defaults');

    //repare_ar();
    //check_ar_43();
    check_ar_43_occupy();
}


