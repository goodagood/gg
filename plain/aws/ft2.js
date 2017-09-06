var path   = require('path');
var u      = require('underscore');
var test   = require('nodeunit');

var s3folder = require('./folder.js');
var s3file = require('./file.js');

var myconfig =   require("../config/config.js");
var myutil   = require('../myutils/myutil.js');

var log28  = require('../myutils/mylogb.js').double_log('/tmp/log28');


// 0711
function test_retrieve_file(){
  // abc/14110247507.jpg
  // abc/14110028590.jpg
  //var filename = 'abc/Png.png';
  var filename = 'abc/test717/ls.txt';
  s3folder.retrieve_file_obj(filename, function(file_obj){
    //console.log('here 534');
    console.log(file_obj);
    console.log(file_obj.get_meta());
  });
}

function test_read_to_string(){
  // abc/14110247507.jpg
  // abc/14110028590.jpg
  //var filename = 'abc/Png.png';
  var filename = 'abc/test717/ruby';
  s3folder.retrieve_file_obj(filename, function(file_obj){
    //console.log('here 534');
    //console.log(file_obj);
    //console.log(file_obj.get_meta());
    //file_obj.read_to_string(function(str){
    file_obj.read_file_to_string(function(str){
      console.log(typeof str);
      console.log(str);
    });
  });
}

function add_viewers(folder_path, name_list){
  folder_path = folder_path || 'tmpd/public';
  name_list = name_list || ['abc', 'andrew'];
  s3folder.retrieve_folder(folder_path, function(folder){
    var meta = folder.get_meta();
    //console.log(meta);
    folder.add_viewers(['tmp', 'abc'], function(list){
      console.log(list);
      
    });
  });
}

function delete_viewers(folder_path, name_list){
  folder_path = folder_path || 'tmpd/public';
  name_list = name_list || ['abc', 'andrew'];
  s3folder.retrieve_folder(folder_path, function(folder){
    var meta = folder.get_meta();
    //console.log(meta);
    folder.delete_viewers(['tmp', 'abc'], function(list){
      console.log(list);
    });
  });
}


function show_viewers(folder_path){
  folder_path = folder_path || 'tmpd/public';
  s3folder.retrieve_folder(folder_path, function(folder){
    var meta = folder.get_meta();
    //console.log(meta);
    folder.get_all_viewers(function(list){
      console.log(list);
    });
  });
}


function list_members(folder_path){
  folder_path = folder_path || 'tmpd/public';
  s3folder.retrieve_folder(folder_path, function(folder){
    var meta = folder.get_meta();
    //console.log(meta);
    folder.get_all_members(function(list){
      console.log(list);
    });
  });
}

function add_members(folder_path, name_list){
  folder_path = folder_path || 'tmpd/public';
  name_list = name_list || ['abc', 'andrew'];

  s3folder.retrieve_folder(folder_path, function(folder){
    var meta = folder.get_meta();
    //console.log(meta);
    folder.add_members(name_list, function(list){
      console.log(list);
    });
  });
}

function test_ask_ul_render(){
  var username    = 'tmpd';
  var folder_path = 'tmpd';

  s3folder.retrieve_folder(folder_path, function(folder){
    console.log(folder.is_owner(username));
    //folder.has_member(username, function(yes){
    //  log28('has member:', yes);
    //  console.log(yes);
    //});
    //
    //folder.has_viewer(username, function(yes){
    //  log28('has viewer:', yes);
    //  console.log(yes);
    //});
    //
    //console.log(folder);
    folder.give_ul_renderring(username, function(ul){
      console.log(ul);
    });
  });
}

function array_to_list(){
  var arr = ['abc', 'def', '88', 99];
  var list = myutil.array_to_checkbox_list(arr);
  console.log(list);
}



if(require.main === module){
  //test_retrieve_file();
  //test_read_to_string();

  //add_viewers();
  //delete_viewers();
  //show_viewers();
  //array_to_list();

  //add_members();
  //list_members('abc/test717');

  test_ask_ul_render();
}


// vim: set et ts=2 sw=2 fdm=indent:
