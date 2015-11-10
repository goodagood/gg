
var path = require('path');

var locations = {};
var conf      = {};

locations.credential_dir = "/home/ubuntu/workspace/gg-credentials/";


/*
 * Use ./config.js instead, it put here during code refacting. 2015 1021.
 */
locations.myconfig_file = path.join(locations.credential_dir, 'config-mj.js');
conf.oldconfig           = require(locations.myconfig_file);


locations.redis_conf_file = path.join(locations.credential_dir, 'redis-conf.js');
// redis-conf.js got: module.exports = config;
conf.redis                = require(locations.redis_conf_file);


locations.aws_conf_file = path.join(locations.credential_dir, 'aws-config.js');
conf.aws                = require(locations.aws_conf_file);


// 'myconfig'  was used a lot before, make a function to easy transfer.
function get_old_config(){
    return conf.oldconfig;
}


module.exports.locations = locations;
module.exports.conf      = conf;

module.exports.get_old_config = get_old_config;


var p = console.log;

if(require.main === module){
    p("\n");
    p(conf.aws);
    p(conf.redis);
}
