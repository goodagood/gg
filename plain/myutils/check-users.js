var u      = require('underscore');
var util   = require('util');
var path   = require('path');

var myconfig =   require("../config/config.js");
var myuser   = require('../myuser');
var s3folder = require('../aws/folder');
var social   = require('../aws/social.js');

var log28  = require('./mylogb.js').double_log('/tmp/log28');


function get_user_names(){
  myuser.get_user_names(function(err, reply){
    console.log(typeof reply);
    console.log(u.isArray(reply));
    console.log(reply);
  });
}

function check_all_username_in_roll(callback){
  myuser.get_user_names(function(err, reply){

    var number=reply.length;
    console.log('number: ', number);
    var after  = callback;
    if( number > 1 ) var after = u.after(number, callback);

    reply.forEach(function(username){
      check_home_folder(username, after);
    });
  });
}


function check_home_folder(username, callback){
  // 

  //console.log("--- --- I AM checking home folder");
  s3folder.retrieve_folder(username, function(hfolder){
    var fmeta = hfolder.get_meta();
    //console.log(fmeta);
    if( typeof fmeta['path'] === 'undefined' || !fmeta['path']){
      log28('path not exist : ', username);
      fmeta['path'] = username;
    }
    if( typeof fmeta['name'] === 'undefined' || !fmeta['name']){
      log28('name not exist : ', username);
      fmeta['name'] = username;
    }
    if( typeof fmeta['owner'] === 'undefined' || !fmeta['owner']){
      log28('owner not exist : ', username);
      fmeta['owner'] = username;
    }
    if( typeof fmeta['permission'] === 'undefined' || !fmeta['permission']){
      log28('permission not exist : ', username);
      fmeta['permission'] = {owner: 'rwx', other:'', group:''};
    }

    if( !hfolder.is_file_exists('goodagood') ){
      console.log('goodagood not exists', username);
    }
    //console.log(util.format('username: %s, home folder get save', username));
    //hfolder.save_meta(function(){
    //  callback();
    //});
    callback();
  });

  //new_folder(folder_opt, function(home_folder){
  //  home_folder.add_folder('goodagood', function(goodagood){
  //    //goodagood.add_folder('in');
  //    //goodagood.add_folder('out');
  //    goodagood.add_folder('message');
  //    //goodagood.add_folder('etc');
  //    //goodagood.add_folder('backup');
  //  });
  //  home_folder.add_folder('etc', function(etc){});
  //  home_folder.add_folder('public', function(etc){});
  //  home_folder.build_file_list();
  //  home_folder.save_meta(callback);
  //});
}


function check_all_user_msg_folder(callback){
  myuser.get_user_names(function(err, reply){

    var number=reply.length + 1;
    var after  = callback;
    if( number > 1 ) after = u.after(number, callback);

    console.log('check all msg folder exists, number: ', number);
    reply.forEach(function(username){
      //console.log('in for each', username);
      check_msg_folder(username, function(){
        //console.log('checked: ', username);
        check_people_file(username);
        after();
      });
    });
  });
}

function check_msg_folder(username, callback){

  var msg_folder_path = path.join(username, myconfig.message_folder);
  console.log("--- --- I AM checking MSG folder : ", msg_folder_path);

  s3folder.retrieve_folder(msg_folder_path, function(msg_folder){
    if(!msg_folder){
      console.log('ERROR MSG FOLDER OBJ NOT GET', username);
      return callback();
    }
    var fmeta = msg_folder.get_meta();
    
    //console.log(fmeta);

    //if( !msg_folder.is_file_exists('goodagood') ){
    //  console.log('goodagood not exists', username);
    //}
    //console.log(util.format('username: %s, home folder get save', username));
    //msg_folder.save_meta(function(){
    //  callback();
    //});
    callback();
  });
}

function check_people_file(username, callback){

  social.init_people_file(username, function(){
  });

  //var msg_folder_path = path.join(username, myconfig.message_folder);
  //console.log("--- --- I AM checking MSG folder : ", msg_folder_path);

  //s3folder.retrieve_folder(msg_folder_path, function(msg_folder){
  //  if(!msg_folder){
  //    console.log('ERROR MSG FOLDER OBJ NOT GET', username);
  //    return callback();
  //  }
  //  var fmeta = msg_folder.get_meta();
  //  
  //  //console.log(fmeta);

  //  //if( !msg_folder.is_file_exists('goodagood') ){
  //  //  console.log('goodagood not exists', username);
  //  //}
  //  //console.log(util.format('username: %s, home folder get save', username));
  //  //msg_folder.save_meta(function(){
  //  //  callback();
  //  //});
  //  callback();
  //});
}

function show_folder_meta(folder_path){
  s3folder.retrieve_folder_meta(folder_path, function(meta){
    console.log(meta);
  });
}


if (require.main === module){
  //get_user_names();
  //check_home_folder('ee');
  //
  //check_all_username_in_roll( function(){
  //  console.log('callback get called');
  //  setTimeout(function(){ process.exit(); }, 5000);  // close
  //});
  //
  check_all_user_msg_folder( function(){
    console.log('callback for check all user msg folder:w get called');
    setTimeout(function(){ process.exit(); }, 55000);  // close
  });

  //show_folder_meta('dirty-show');

  //setTimeout(function(){ process.exit(); }, 5000);  // close
}

// vim: set et ts=2 sw=2 fdm=indent:
