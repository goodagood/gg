var fs = require('fs'),
    u  = require('underscore');

var path = require('path');
var uuid = require('node-uuid');
var myconfig =   require("../config/config.js");

var bucket = require('./bucket.js');
var render = require('./render.js');

var myconfig =   require("../config/config.js");

// used by upload.js, when make thumbnail info
function make_meta(file, thumb_opts, username){
  console.log(file); console.log(thumb_opts); 
  var meta = {};
  meta.size = file.size;
  meta.lastModifiedDate = file.lastModifiedDate;
  // mime type according to the uploading client
  meta.client_type = file.type;  

  meta.uploader = username;
  meta.s3key = path.join(myconfig.meta_file_prefix, file.s3key);

  thumb_info = {};
  u.defaults(thumb_info, thumb_opts);
  delete thumb_info['infile'];
  delete thumb_info['outfile'];

  meta['thumbnails'] = [];
  meta['thumbnails'].push(thumb_info);

  return meta;
}

function test_make_meta(){
}


function update_meta_in_folder(folder){
  // 
  //var folder_set = [];
  bucket.list(folder, function(err, contents){
    u.each(contents, function(one){
      //console.log(one);
      //bucket.print_file_meta(one.Key);
      var meta = {};  
      meta.size = one.Size;
      meta['file-s3key'] = one.Key;
      meta['last-modified'] = one.LastModified;
      meta['owner'] = one.Key.split('/')[0];
      bucket.update_file_meta(one.Key, meta, function(){
        render.render_one_file(one.Key);
      });
    });
  });
}


function test_update_meta_in_folder(){
  var folder = 'muji/goodagood/.in';
  update_meta_in_folder(folder);
}


function get_all_folders(root, pass_result){
  var folder_set = [];
  bucket.list(root, function(err, contents){
    u.each(contents, function(one){
      //console.log(one.Key);

      var p = path.dirname(one.Key);
      while( p !== '.') {
        folder_set.push (p);
        p = path.dirname(p);
      }
    });
    var result = u.uniq(folder_set).sort();
    pass_result(result);
    //return folder_set;
  });
}


function test_get_all_folders(root){
  if (typeof root === 'undefined' || !root) root = 'abc';

  get_all_folders(root, function(folders){
    console.log(folders);
  });
}


function init_folder(abspath){
  if (typeof abspath === 'undefined') return;
  if (abspath === '.') return;

  var parts = abspath.split('/');
  var folder_obj = {};

  folder_obj.what =  myconfig.iamfolder;
  folder_obj.name =  parts[parts.length -1];
  folder_obj['full-path'] = abspath;
  folder_obj['parent'] = path.dirname(abspath);
  folder_obj['owner'] = parts[0];
  bucket.init_folder_meta(abspath, folder_obj, function(){
    render.prepare_folder_list(abspath);
  });  // no callback?

  //render.prepare_folder_list(abspath);
}


function test_init_folder(onefolder){
  if(typeof onefolder === 'undefined' || !onefolder){
    onefolder = 'abc/one/test-b';
  }
  //bucket.console_log_file(onefolder);
  //bucket.print_file_meta(onefolder);
  init_folder(onefolder);
}


function many_folders(){
  var many = ['muji', 'abc', 'tmp', 'dirty-show', 'test'];
  many.forEach(function(e){
    get_all_folders(e, function(folders){
      console.log(folders);
    });
  });
}


function init_many_folders(){
  var many = ['muji', 'abc', 'tmp', 'dirty-show', 'test'];
  many.forEach(function(e){
    get_all_folders(e, function(folders){
      console.log(folders);
      folders.forEach(function(f){
        init_folder(f);
      });
    });
  });
}


function get_file_list_in_folder(folder, callback){
  bucket.read_file_meta(folder, function(err, meta_info){
    if(err){ callback(err, null); return;}

    var list = '<ul> <li>Try to find a file list.</li> </ul>';
    if(typeof meta_info['list-folder'] !== 'undefined' && meta_info['list-folder']){
      list = meta_info['list-folder'];
    }
    callback(null, list);
  });
}


function test_get_file_list_in_folder(){
  var folder = 'muji/goodagood/.in';
  get_file_list_in_folder(folder, function(err, list){
    console.log(list);
  });
}



module.exports.make_meta = make_meta;
module.exports.get_file_list_in_folder = get_file_list_in_folder;


if (require.main === module){
  //test_make_meta();
  //test_update_meta_in_folder();
  //test_get_all_folders();
  //many_folders();
  //
  //test_init_folder();
  //init_many_folders();
  test_get_file_list_in_folder();
}

// vim: set et ts=2 sw=2 fdm=indent:
