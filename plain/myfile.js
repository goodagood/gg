// 2014 0428
// Use redis for file rec, try to set up my file system.
//

var conf =  require("./config/config.js");

var clog = console.log;
var util = require('util');
var see  = util.inspect;


var redis_basic = require("./myutils/redis-basic.js");
var rclient = redis_basic.client;

//// rclient : redis client
//if (typeof rclient === 'undefined'){
//  //var redis_host = "54.248.54.80", redis_port = null;
//  //var redis_host = conf.redis_host, redis_port = conf.redis_port;
//
//  var secrets = require("./config/secret-dir.js")
//  var redis_host = secrets.conf.redis.redis_host
//  var redis_port = secrets.conf.redis.redis_port
//
//  var redis = require("redis");
//  var rclient = redis.createClient(redis_port, redis_host);
//
//  // if you'd like to select database 3, instead of 0 (default), call
//  // rclient.select(3, function() { /* ... */ });
//
//  rclient.on("error", function (err) {
//      console.log("Error from redis client: " + err);
//  });
//}


function save_file_info(file_info, callback){

  var file_key = "file.";

  // 'fid' in redis db store the id sequence
  function increase_number(_callback){
    rclient.incr("fid", function(err, number){
      if(err){
        _callback(err);
      }
      file_key += number.toString();
      file_info['redis_file_key'] = file_key;
      console.log('file key is :' + file_key);

      // except a _callback, which is to save file info as hash into redis db.
      _callback(null, file_key, file_info);
    });
  }


  function save_info(err, file_key, file_info){
    // Save the file_info to redis as hash
    // Where file_info is javascript object, currently all simple properties.
    if(err){
      throw new Error("save_info err");
    }
    rclient.hmset(file_key, file_info, function(err, reply){
      if (err) {
        throw new Error(
          err.toString() + " When add file info: " + file_info.name);
      }
      console.log("hit redis and save file info : " + file_key + " : " + file_info.name);
    });

    if (callback) callback(null, file_key);
  }

  increase_number(save_info);
}


function set_file_info_field( file_key, field, value ){
  rclient.hset(file_key, field, value, function(err, reply){
    if(err) console.log(err);
    console.log(reply);
  });
}

function get_file_info(file_key, callback){
  // callback(err, file_info_obj){//...}

  rclient.hgetall(file_key, function(err, file_info_obj){
    //if(err) console.log(err);
    console.log(file_info_obj);
    if (callback){
      callback(null, file_info_obj);
    }
  });
}


function hash_to_ul_list(ahash){
  var html = '<ul>';
  for (var i in ahash){
    if (ahash.hasOwnProperty(i)){
      //console.log("key- " + i + " : " + ahash[i]);
      html = html + '\n<li><span><i class="icon-folder-open"></i>';
      html += i;
      html = html +  '</span> <a href="">Goes somewhere? ' + ahash[i] + '</a></li>';
    }
  }
  html += "\n</ul>";
  //console.log("html: \n" + html); //test
  return html;
}


// testing

function test_save_file_info(){
  //var file_info = { 
  //  name: 'fa' + Date.now().toString(),
  //  name_a: 'testing-file-514.tmp',
  //  type:'testing',
  //  isfolder:false
  //};
  //console.log('after prepare file info');
  //save_file_info(file_info);

  file_info = { 
    name: 'fb' + Date.now().toString(),
    name_a: 'testing-file-514.tmp',
    type:'testing',
    isfolder:false
  };
  save_file_info(file_info, function(err, filekey){
    ////
    console.log( "got filekey: " + filekey);
  });

}


function test_set_file_info_field(){
  var file_key = "file.10";
  var field = 'test-this',  value = 'step by step';
  set_file_info_field( file_key, field, value );
}


function test_redis_keys(username){
  rclient.keys("*", function(err, allkeys){
    if(err){
      console.log(err);
    }
    console.log(typeof allkeys);
    console.log(allkeys);
    process.exit();
  });
}


function test_list_hash(){
  var html = '<ul>';
  var hasha = {a:1, b:2, c:3};
  for (var i in hasha){
    if (hasha.hasOwnProperty(i)){
      console.log("key- " + i + " : " + hasha[i]);
      html = html + '\n<li><span><i class="icon-folder-open"></i>';
      html += i;
      html = html +  '</span> <a href="">Goes somewhere? ' + hasha[i] + '</a></li>';
    }
  }
  html += "\n</ul>";
  console.log("html: \n" + html);
}


function test_hash_to_ul_list(){
  var h = {a:1, b:2, c:3};
  var html = hash_to_ul_list(h);
  console.log(html);
}



// run with command line, for testing in developing.
if (require.main === module){
  //test_redis_keys();
  //test_set_file_info_field();
  //test_list_hash();
  //test_hash_to_ul_list();
  console.log('start testing: test_save_file_info');
  test_save_file_info();

  setTimeout(function(){ rclient.quit(); }, 5000);  // close the redis.
}

//module.exports.findByUsername = findByUsername;
//module.exports.add_user = add_user;
module.exports.save_file_info = save_file_info;
module.exports.get_file_info = get_file_info;
// vim: et sw=2 ts=2:
