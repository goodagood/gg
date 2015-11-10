/* 2014 0525
 * Modified from ./folder.js
 * Use abspath as redis key, this should make name mapping simple.
 *
 * For folders, actually folder are container for files, 
 * folders are simply records in redis data base
 */


var util = require('util');
var path = require('path');

var redis_basic = require("./redis-basic.js");
var rclient = redis_basic.client;

var myutil = require('./myutil.js');
var config =   require("../config/config.js");


function _make_folder_configuration(cfg, callback){
  if (typeof cfg === 'undefined') callback(new Error('no configuration supported'), null);
  // callback will be called as: callback(err, obj_key)
  redis_basic.save_obj(cfg, callback);
}


function make_folder( folder_configurations, callback){
  // make a folder, where options will be .ggfoldercfg (hash)
  var folder = {};
  //if (typeof options !== 'undefined' && options) {
  //  folder = JSON.parse(JSON.stringify(options));
  //}
  folder['.ggwhat'] = 'folder';
  _make_folder_configuration(folder_configurations, function(err, cfg_key){
    folder['.ggfoldercfg'] = cfg_key;
    redis_basic.save_obj(folder, callback);
  });
}


function get_folder_configuration(folder_key, callback){
  redis_basic.get_obj(folder_key, function(err, folder_obj){
    redis_basic.get_obj(folder_obj['.ggfoldercfg'], callback);
  });
}


var default_folder_configuration = {
  permission : 700,
  name       : '',
  parent_key : '',  // redis key of parent folder
  ".ggwhat"  : "folder_option",
  abspath    : '',
  links      : 0
};


var default_home_folder_configuration = {
  permission : 700,
  name       : "home",
  parent_key : '',
  ".ggwhat"  : "folder_option",
  abspath    : '',
  links      : 0
};


function make_home_folder(opt, callback){
  // make the folder, not take care other user information.
  var home_folder_cfg = myutil.merge(default_home_folder_configuration, opt);
  // function callback will be called: callback(err, folder_key)
  make_folder(home_folder_cfg, callback);
}


function make_user_default_folders(home_folder_key){
  var folder_names = config.default_folders;

  redis_basic.get_obj(home_folder_key, function(err, home_folder_obj){
    get_folder_configuration(home_folder_key, function(err, home_folder_cfg){
      console.log(1); console.log(home_folder_cfg); console.log(home_folder_key);

      var folder_cfg = myutil.merge(default_folder_configuration, {
        parent_key: home_folder_key,
        owner: home_folder_cfg['owner'],
      });
      
      folder_names.forEach(function(folder_name){
        folder_cfg['name'] = folder_name;
        folder_cfg['abspath'] = path.join(home_folder_cfg['abspath'], folder_name);
        console.log(2); console.log(folder_cfg);
        make_folder(folder_cfg, function(err, new_key){
          rclient.hset(home_folder_key, folder_name, new_key, function(err, reply){
            if (err) {console.log(err); throw err;}
            console.log(reply);
          });
        });
      });

    });
  });

}


// testing

function test_make_folder_configuration(){
  var folder_cfg = {
    name : "test make folder configurations",
    "default_behavior" : "list",
    "parent" : "who",

    "owner"  : "who"
  };

  _make_folder_configuration(folder_cfg, function(err, folder_key){
    console.log(folder_key);
  });
}


function test_make_folder(){
  var folder_cfg = {
    name : "test make folder",
    "default_behavior" : "list",
    "parent" : "who",
    "owner"  : "who",
    "permission" : 664,
  };

  make_folder(folder_cfg, function(err, folder_key){
    console.log(folder_key);
    rclient.hgetall(folder_key, function(err, folder_obj){
      console.log("get back folder hgetall:");
      console.log(util.inspect(folder_obj));
    });
  });
}


function test_make_home_folder(){
  var opt = {owner: 'who', permission:700};
  make_home_folder(opt, function(err, key){
    console.log('key is ' + key);
    rclient.hgetall(key, function(err, obj){
      console.log("get back obj");
      console.log(obj);

      rclient.hgetall(obj['.ggfoldercfg'], function(err, home_folder_opt){
        console.log("get back home folder opt");
        console.log(home_folder_opt);
      });

    });
  });
}


function test_make_user_default_folders(){
  var username = 'tmpa';
  rclient.exists(username, function(err, exists){
    //console.log( username + ' exists');
    //console.log(exists);
    redis_basic.get_obj(username, function(err, userobj){
      console.log("user object: " + username);
      console.log(userobj);
      make_user_default_folders(userobj['home_folder']);
    });
  });

}


// run with command line, for testing in developing.
if (require.main === module){
  console.log('start testing: ');
  //test_make_folder_configuration();

  //test_make_folder();
  //test_make_home_folder();

  test_make_user_default_folders();

  setTimeout(function(){ rclient.quit(); }, 5000);  // close the redis.
}

module.exports.get_folder_configuration = get_folder_configuration;
module.exports.make_folder = make_folder;
module.exports.make_home_folder = make_home_folder;

// vim: et sw=2 ts=2:
