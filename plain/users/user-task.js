// aws/init-home.js (coffee) might doing the job.
//
var u    = require('underscore');
var async= require('async');

var Promise = require('bluebird');

var user = require('./a.js');

var s3folder = require("../aws/folder-v1.js");
var s3folder = require("../aws/folder-v5.js");

var social   = require("../aws/social.js");
var log28    = require('../myutils/mylogb.js').double_log('/tmp/log28');

p = console.log

name_list_1112 = [
'andrew',
  'tmp',
  'tmpa',
  'goodagood',
  'tmpb',
  'bb',
  'tmpc',
  'tmpd',
  'muji',
  //'abc',
  'lth',
  'anonymous',
  'dirty-show',
  'test',
  'cc',
  'dd',
  'ee',
  'who',
  'pptok',
  ];

// All user home were deleted in accident, 2014-0901
// This is to rebuild it

function rebuild_homes(){
  var names_to_exclude = ['abc',];
  user.get_user_names(function(err, names){
    if(err){
      return log28('err in get user name roll: ', err);
    }
    
    var names = u.difference(names, names_to_exclude);
    log28('After exclusion names in roll: ', names.sort().join(', '));

    async.map(
      names, 
      function(username, callback){
        //callback(null, username);
        p('do for user: ', username);
        s3folder.init_home_folder_0927(username, callback); //function(err, home){ });
        //s3folder.init_home_folder(username, callback );
      },
      function(err, meta_list){
        log28(" init home folder, and ", [err, meta_list]);
        //if (err) { return callback(err, null); }
        //if (err) { log28('err to init home folder: ', [username, err, meta_list]); }
        //else{ social.init_people_file(username); }
        exit();
      }
    );

  });
}


function rebuild_home(username){

    s3folder.init_home_folder_0927(username, function(err, home){
      console.log('haha ', home.get_meta());
      if(err) console.log(err);
      exit();
    });

}

function show_user_list(){
  user.get_user_names(function(err, names){
    if( u.isArray(names)) p( 'the names is array');
    var sorted = names.sort();
    p(err, sorted);
    exit();
  });
}


function exit(){
  setTimeout(process.exit, 1000);  // close the redis.
}

if (require.main === module){
  //rebuild_homes();
  //rebuild_home('tmp');

  show_user_list();
  //setTimeout(function(){ process.exit(); }, 55000);  // close the redis.

}


// vim: set et ts=2 sw=2 fdm=indent:
