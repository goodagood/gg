
/*
 * Start from ./hash-pass.js, change db to mongodb from redis.
 *
 * Use 'bcrypt' for password salted hashing
 *
 * user name and password/hash info in ./user-hash
 */


//var fs = require('fs');
var bcrypt = require('bcrypt');

var muser  = require("./muser.js");

const Salt_Length = 8;
// the key name for salted hash as password
const Salted_Hast_Field = "salted-hash";


//d 2016 0305
var redis_basic = require("../myutils/redis-basic.js");
var rclient = redis_basic.client;

var p = console.log;


//d, change to ./muser.js#find_by_user_name
function find_user(username, callback){
  rclient.exists(username, function(err, name_exists){
    if(err){
      return callback(err);
    }
    console.log("hit redis, and ", username, name_exists);
    if(name_exists === 0){
      // Name not exists
      return callback(null, null);
    }

    // make a user object
    var user = {};
    rclient.hgetall(username, function(err, userdata){
      if(err){
        return callback(new Error(err));
      }
      user = userdata;
      if (typeof user.username === 'undefined') user.username = username;
      if (typeof user.id === 'undefined') user.id = username;
      //console.log('findByUsername, user: ', user);
      return callback(null, user);
    });
  });
}



function check_pass(userinfo, password, done){
    if(!userinfo['username']) return done('mhp cp, no username in userinfo, hash-pass.js');
    p("userinfo in m-hash-pass.js check pass: ", userinfo);
    var username = userinfo['username'];

    if(!userinfo[Salted_Hast_Field]) return done('mhp cp, no salted hash for user: ' + username);
    if(!password) return done('mhp cp, can you give me a password for user: ' + username);

    var hash = userinfo[Salted_Hast_Field];

    bcrypt.compare(password, hash, function(err, res) {
        p('828 mhp cp, compare .. ', err,  res);
        if(err) return done(err);

        if(!res) return done(null, false);

        done(null, userinfo);
    });
}

function find_and_check(username, password, done){
    p(`username: "${username}", password: "${password}". in m-hash-pass find and check.`)
    muser.find_by_user_name(username, function(err, user){
        if(err) return done('m-hash-pass.js, 2016 0305, find user error: ' + err);
        if(!user) return done('m-hash-pass.js, 2016 0305, find no user');

        check_pass(user, password, done);
    });
}


function set_salted_hash_if_plain_password(username, callback){
    muser.find_by_user_name(username, function(err, user){
        if(err) return callback('m-hash-pass.js, 2016 0305, sshipp find user error: ' + err);
        if(!user) return callback('m-hash-pass.js, 2016 0305, sshipp find user and what?');
        /*
         * user : a simple object of key/value.
         */

        if(!user.password) return callback(null, 'no plain password for: ' + user.username);
        p('make hash for : ', user.username, user.password);
        bcrypt.hash(user.password, Salt_Length, function(err, hash){
            if(err) return callback(err);

            p('hash is : ', hash);
            user[Salted_Hast_Field] = hash;
            rclient.hset(user.username, Salted_Hast_Field, hash, callback);
        });
    });
}


function hash_password_for_userinfo(user_info, callback){
    p('got user info: ', user_info);
    bcrypt.hash(user_info.password, Salt_Length, function(err, hash){
        if(err) return callback(err);

        p('hash is : ', hash);
        user_info[Salted_Hast_Field] = hash;

        // let's delete the plain text password
        if(user_info.password) delete user_info.password;

        p('pass user info: ', user_info);

        callback(null, user_info);
    });
}




module.exports.find_and_check = find_and_check;
module.exports.set_salted_hash_if_plain_password = set_salted_hash_if_plain_password;

module.exports.hash_password_for_userinfo = hash_password_for_userinfo;

//module.exports.check_password = check_password;


// checkings


function check_find_and_check(username, password){
    username = username || 'abc';
    password = password || 'kkkooo';

    find_and_check(username, password, function(err, info){
        p('the err: ', err);
        p('the result: ', info);
        process.exit();
    });
}


function check_set_salt(username){
    username = username || 'abc';
    set_salted_hash_if_plain_password(username, function(err, redis_reply){
        p(err, redis_reply);
        process.exit();
    });
}

if(require.main === module){
    p('yes');
    check_find_and_check('andrew');

    //check_set_salt('ar');
}

