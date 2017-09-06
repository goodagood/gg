

var myconfig   =   require("../config/config.js");

var secret     = require('../config/secret-dir.js');
//var redis_conf = secret.conf.redis;

//var redis_host = redis_conf.redis_host;
//var redis_port = redis_conf.redis_port;


var redis_basic = require("./redis-basic.js");
var client = redis_basic.client;

//var redis  = require("redis");
//var client = redis.createClient(redis_port, redis_host);

var myutil = require('./myutil.js');

var channel         = 'tasks';
var task_rec_prefix = 'task.a.';



// @task_json
//  { 
//    name : 'new-file-meta', 
//    username : username, 
//    folder : cwd,
//    meta_s3key : meta_s3key, of the new meta
//  }
//
function pub_task(channel, task_json, callback){
  //var uniq     = myutil.get_uuid();

  //var key      = task_rec_prefix + uniq;
  //task_json.id = key;
  //task_json.task_id = key;

  if(!task_json.task_id) return callback('what the task id?');

  var task_str = JSON.stringify(task_json);

  client.hmset(task_json.task_id, task_json, function(err, reply){
    if(err) return callback(err, task_json);
    //console.log('hmset task json: \n', task_json);
    client.publish(channel, task_str, function(e,r){
        //console.log('published?');
        callback(e, task_json);
    });
  });
}

function test_pub_task(){
  var task = {
    name : 'something',
    username : 'wwwhooo',
    folder : 'whoknow',
    more : 'none'
  };
  pub_task(channel, task, function(e, task_json){
      console.log('pub task callback (e, task_json): ', e, task_json);
  });
}

if (require.main === module){
  test_pub_task();

  //setTimeout(function(){process.exit();}, 28000);
  setTimeout(function(){client.quit(); }, 5000);  // close the redis.
}

module.exports.pub_task = pub_task;
module.exports.channel  = channel;

module.exports.task_rec_prefix  = task_rec_prefix;
