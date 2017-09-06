/*
 * work with folder of messages.
 */

var myconfig =   require("../config/config.js");
var meta_file_ext = myconfig.meta_file_ext;

var AWS = require('aws-sdk');
var fs  = require('fs');
var path  = require('path');

var u = require('underscore');

var myutil = require('../myutils/myutil.js');


// set up aws region:
AWS.config.region = myconfig.region;
var s3 = new AWS.S3();


var default_user_home_tree = require('./user-home-structure.js');
var image = require('./image.js');

var bucket   = require('./bucket.js');

/*
 * list folder contain messages
 * 0618
 */
function list_msg_folder(username, dir, callback){
  bucket.list(dir, function(err, contents){
    //console.log(contents);
    if(err){ callback(err, null); return;}

    var files_in_dir = bucket.shrink_s3list_to_cwd(contents, dir);
    //console.log('files_in_dir'); console.log(files_in_dir);
    //filter_out_hidden_name_keys(files_in_dir);

    render_each_file(files_in_dir, function(err, in_dir){
            //console.log(in_dir);
            //var html = '<ul class="list-unstyled list-group file-list">';
            var html = ''
            u.each(in_dir, function(finfo, k){
              html += finfo['li-element'];
            });
            //console.log(html);

            callback(null, html);

    });
    //console.log("hash_file_links"); console.log(hash_file_links);
    //callback(null, sort_and_mk_form(hash_file_links));

  });
}

function test_list_message(){
    list_msg_folder('muji', 'muji/goodagood/',  function(err, what){
    //list_msg_folder('muji', 'muji/goodagood/.in',  function(err, what){
    //list_msg_folder('abc', 'abc/goodagood/.in',  function(err, what){
      //console.log('what getten from list_message?'); console.log(what);
    });
}



/// helper function
function is_empty_object(obj){
    if (typeof(obj) !== 'object') return false;
    // empty object will get 0 keys:
    if (Object.keys(obj).length > 0) return false;
    return true;
}




function test_list3(){
    list3('abc', 'abc',  function(err, what){
        //console.log('what sorted?'); console.log(what);
    });
}



var filetype = require('../myutils/filetype.js');

/*
 * Accept obj contains basic file info:
 *   { 
 *      s3_file_key: { type: string, 'short-name': string, ...},
 *      ...
 *   }
 * where each key is the s3 key.
 *
 * Readin meta info for each file, puff the obj.
 */
function render_each_file(file_in_dir, callback){
  //console.log('file in dir',  file_in_dir);
  var number = u.size(file_in_dir);
  if( number == 0) {callback(null, null); return;}

  // make it get called after all been done:
  var callback_after_all_done = u.after(number, callback);

  u.each(file_in_dir, make_file_html_representation );
}


function make_file_html_representation(file_info, key){
    //console.log('key: ', key, ' file_info: ', file_info);
    file_info['file-s3key'] = key;
    //console.log('read_file_meta(key,...', key);
    bucket.read_file_meta(key, function(err, meta_info){
      console.log('read file meta, err: ', err);
      console.log('read file meta: ', meta_info);
      if(err){
        calculate_meta(file_info);
        calculate_basic_html(file_info);
        return;
      }
      u.defaults(file_info, meta_info);
      //console.log('before filetype.make_presentation_html(file_info)\n', file_info);
      filetype.make_presentation_html(file_info);
      //callback_after_all_done(null, file_in_dir);
      //console.log('key: ', key, ' file_info: ', file_info);
    });
}


function render_msg_folder(folder){
}


module.exports.list_msg_folder = list_msg_folder;



if (require.main === module){
  test_list_message();
}

// vim: set et ts=2 sw=2 fdm=indent:
