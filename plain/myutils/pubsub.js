//
// todo: 0907
// When there are more task runners, each task need a lock to avoid double run.
//

var myconfig   =   require("../config/config.js");
var collector  = require('../aws/file-collector-v2.js');
var prepare    = require('../aws/prepare-home.js');

//var redis_host = myconfig.redis_host;
//var redis_port = myconfig.redis_port;
var secrets    = require("../config/secret-dir.js");
var redis_host = secrets.conf.redis.redis_host;
var redis_port = secrets.conf.redis.redis_port;
//var redis_pass = secrets.conf.redis.requirepass;

var redis = require("redis");
//var client = redis.createClient(redis_port, redis_host);
//var client = redis.createClient(redis_port, redis_host, {auth_pass: redis_pass});
// 2017 0426 drop passwrod for long
var client = redis.createClient(redis_port, redis_host);

// the 'client' above used for subscribe 
//var cmd_client = redis.createClient(redis_port, redis_host);
//var cmd_client = redis.createClient(redis_port, redis_host, {auth_pass: redis_pass});
// 2017 0426 drop passwrod for long
var cmd_client = redis.createClient(redis_port, redis_host);

// hardwired:
var channel         = 'tasks';
var task_rec_prefix = 'task.a.';

var p = console.log;


client.on("subscribe", function(channel, msg){
  console.log("subscribe to: ", channel, ' and more: ', msg);
});

client.on("message", pass_job);

function pass_job(channel, message){
  try{
    var job_json = JSON.parse(message);

    console.log('pass job: ', job_json);
    // Must get lock before run the task, one lock for each task, to be
    // sure each get only one running.
    // - not get unlock? 11 19, 2014
    // Where the id come from? 0727, 2015
    add_task_lock(job_json.id, function(ok, unlock){
      if(ok){
        console.log('ok, added task lock; ', job_json.name, job_json.id);
        job_switch(job_json, function(err, what){
          unlock();
        });
      }
    });
  }
  catch(e){
    console.log("\n -- !!!!!!!!  !!   !! --\n", e);
  }
}

function job_switch(job_json, callback){
  switch(job_json.name){
    case "new-file-meta" :
      collector.check_new_file_meta(job_json, function(err, checked){
        if(err) return callback(err);
        p('check  new file meta return : ', err, checked)
        collector.do_s3_jobs(job_json.owner, callback);
      });
      break;
    // here, to do some testing, 2016 0205
    case "test-new-file-meta" :
      p('test new file meta');
      collector.check_new_file_meta(job_json, function(err, checked){
        p('check  new file meta return : ', err, checked)
        if(err) return callback(err);
        collector.do_s3_jobs(job_json.owner, callback);
      });
      break;
    case "new-user" :
      // todo, 11-13
      // to test, 2015 0727
      prepare.prepare_more_home(3, callback);
      break;
    case "something" :
      show_j(job_json, callback);
      break;
    default:
      p('job switch got default');
      show_j(job_json, callback);
  }
}

function show_j(j, callback){
  console.log('j: ', j);
  callback(null,null);
}

function add_task_lock(task_id, callback){
  // callback get: (LOCKED(true/false) [, function-to-unlock(only when locked))

  function _unlock(callback){
    if( typeof callback === 'undefined' || !callback) callback = function(){};

    cmd_client.exists(task_id, function(err, exists){
      if(err)     return callback('found err when check the key exists');
      if(!exists) return callback('not found the key');
      // now, try to del the 'lock' in hash: task id
      cmd_client.hdel(task_id, 'lock', function(err, reply){
        if(!err) console.log('unlocked in task locking: ', task_id);
        callback(err, reply);
      });
    });
  }

  cmd_client.hincrby(task_id, 'lock', 1, function(err, reply){
    //console.log(err, reply)
    if(err){
      console.log(`lock err, in cmd client hincrby ${task_id}, err `, err);
      return callback(false);
    }
    // reply > 1 means other has do the lock
    if(reply > 1){
      console.log(`lock fail, in cmd client hincrby ${task_id}, already locked `, reply);
      return callback(false);
    }

    // here we got flag, set a timestamp for it:
    cmd_client.hset(task_id, 'lock', Date.now(), function(err, reply){
      console.log('lock 2', err, reply);
      if(err) return callback(false);

      return callback(true, _unlock);
    });
  });
}


function find_lock_time(task_id, callback){
  // give the time in milli-seconds, seconds, easy-reading-str of the lock till now.
  var now = Date.now();
  //var old_enough = 5 * 60 * 1000; // mili-seconds of 5 minutes.
  cmd_client.hget(task_id, 'lock', function(err, milli_sec){
    if (err) return callback(err, milli_sec);
    p( 'in get lock time: ', err, milli_sec);
    var milli = parseInt(milli_sec);
    if(typeof milli === 'undefined') return callback('can not get number of milli seconds', null);
    var dif   = now - milli;
    var seconds = dif / 1000
    // Hours, minutes and seconds
    var hrs = ~~(seconds / 3600);
    var mins = ~~((seconds % 3600) / 60);
    var secs = seconds % 60;
    // Put it to 00:00:00 things
    var ret = "";
    if (hrs > 0)
          ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + parseInt(secs);
    callback(null, dif, seconds, ret);
  });
}

function find_tasks(callback){
  var key = task_rec_prefix + "*";
  cmd_client.keys(key, function(err, reply){
    //console.log('err, reply: ', err, reply);
    callback(err, reply);
  });
}


function find_one_task(number, callback){
  // try to find one redis 'task.a.*' task, negative number gives random.

  find_tasks(function(err, all){
    if (typeof all.length === 'undefined'){
      return callback('what is all.length undefined? (in "find one task" of pubsub)', null)
    }

    var len = all.length;
    if(len <= 0) return callback('not records? when: find one task', null);
    // negative go to random:
    if (number < 0)   number = Math.floor(Math.random() * len);
    if (len < number) number = len -1;
    var task_id = all[number];
    //p('find one  task, the task id: ', task_id);

    cmd_client.hgetall(task_id, callback);

  });
}

function del_all_tasks(callback){
  var key = task_rec_prefix + "*";
  cmd_client.del(key, function(err, reply){
    //console.log('err, reply: ', err, reply);
    callback(err, reply);
  });

}



module.exports.add_task_lock = add_task_lock;
module.exports.find_tasks = find_tasks;
module.exports.del_all_tasks = del_all_tasks;
module.exports.rclient    = cmd_client;
module.exports.find_lock_time    = find_lock_time;
module.exports.find_one_task    = find_one_task;


if(require.main === module){

  client.subscribe(channel);

  //setTimeout(function(){process.exit();}, 28000);
}

// vim: et ts=2 sw=2 :
