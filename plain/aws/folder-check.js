var path   = require('path');
var u      = require('underscore');
//var test   = require('nodeunit');

var s3folder = require('./folder-v1.js');
var s3file   = require('./simple-file.js');

var myconfig  =   require("../config/config.js");

var fappend   = require('../myutils/mylogb.js').append_file;
var afile     = '/tmp/a9.log';

function folder_update(folder_path, callback){
  s3folder.retrieve_folder(folder_path, function(err, folder_obj){

    var folder_meta = folder_obj.get_meta();
      fappend(afile, 'the folder meta retrieved');
      fappend(afile, folder_meta);
    //folder_obj.build_new_folder(folder_meta);
    //folder_obj.save_meta(function(err, meta){
    //  fappend(afile, 'after update, meta');
    //  fappend(afile, meta);
    //});
  });
}


function folder_meta_without_array_of_names(folder_path, name_array, callback){
  // @name_array : an array of names to exclude from the file meta

  if(!u.isArray(name_array)) {
    console.log('NOT ARRAY');
    return null;
  }

  s3folder.retrieve_folder(folder_path, function(err, folder_obj){
    var folder_meta = folder_obj.get_meta();
    // insert the first element to be folder_meta
    name_array.splice(0,0,folder_meta);
    var to_show = u.omit.apply(this, name_array); //omit asks (obj, to_omit...)
    console.log(to_show);
    fappend(afile, to_show);
    if(callback) callback(to_show);
  });
};

function folder_meta_with_array_of_names(folder_path, name_array, callback){
  // @name_array : an array of names to exclude from the file meta

  if(!u.isArray(name_array)) {
    console.log('NOT ARRAY');
    return null;
  }

  s3folder.retrieve_folder(folder_path, function(folder_obj){
    var folder_meta = folder_obj.get_meta();
    // insert the first element to be folder_meta
    name_array.splice(0,0,folder_meta);
    var to_show = u.pick.apply(this, name_array); //pick asks (obj, to_omit...)
    console.log(to_show);
    if(callback) callback(to_show);
  });
};

if(require.main === module){

  //folder_meta_without_array_of_names('abc/public', [ 'html' ]);
  //folder_meta_with_array_of_names('dd', [ 'files' ]);

  folder_update('abc/public');
  setTimeout(function(){process.exit();}, 3000);
}

module.exports.folder_meta_with_array_of_names   = folder_meta_with_array_of_names;

// vim: set et ts=2 sw=2 fdm=indent:
