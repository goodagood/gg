
/*
 * To separate user name and root folder name,
 * user need to get an name to use as root folder.
 *
 * 0305, 2015.
 *
 * -- use prepare-home.js instead, I fogot this file, but it didn't implemented
 *  yet.  
 */

var myconfig =   require("../config/config.js");

var secrets    = require("../config/secret-dir.js");
var redis_host = secrets.conf.redis.redis_host;
var redis_port = secrets.conf.redis.redis_port;

var redis = require("redis");

//  should we create client and close it every time?
var client = redis.createClient(redis_port, redis_host);


function get_home_name(username, callback){
    var home_name = username.toLowerCase();
    
    callback(null, home_name);
}

function build_name_list(){

}


module.exports.get_home_name = get_home_name;

