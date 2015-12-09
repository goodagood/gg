/*
 * To use aws s3 as file storage backend.
 * Before, I was setting up redis data structures for files and folders
 * it bring complex to the system.
 * Now, 0525, this is to use s3 more directly.
 *
 * Refacting to seperate credentials from the repository.
 * 2015 1021
 */

var AWS = require('aws-sdk'); // stop using this.

var fs   = require('fs');
var path = require('path');
var u    = require('underscore');

var myutil = require('../myutils/myutil.js');

//var myconfig =   require("../config/config.js");
var myconfig =  require("../config/config.js");

var meta_file_ext = myconfig.meta_file_ext;

//var secrets  =  require("gg-credentials");
var secrets  =  require("../config/secret-dir.js");

var aws_conf   =  secrets.conf.aws;
var aws_keys   =  aws_conf.keys;
var aws_region =  aws_conf.region;


var root_bucket = aws_conf.root_bucket;


// set up aws region:
AWS.config.region = aws_region;


/*
 * after aws force me to delete root access key and secret access key.
 * updated 0407, this is for aws user: s3-worker-a
 *
 * Moved the keys outside the repository.  2015 1022
 */
AWS.config.update(aws_keys);


//var s3 = new AWS.S3(); // trying to use ../s3/s3-a.js 2015 1022
var s3a = require("../s3/s3-a.js");
var s3 = s3a.get_s3_obj();


// After more testing, should change s3 to s3only:
// var aws = require('./aws-s3-conf.js');
// var s3only = aws.get_s3_obj();
//


var default_user_home_tree = require('./user-home-structure.js');
var image = require('./image.js');

var s3folder = require('./folder.js');


var p = console.log;



/* 
 * 2015 1022b
 * put local filename to s3 storage with given key (s3key)
 */
function put_file_to_s3(local_file_path, s3key, callback){
  var s3 = s3a.get_s3_obj();

  var params = {
      Bucket: root_bucket,
      Key: s3key,
      Body: fs.createReadStream(local_file_path)
  };

  s3.putObject(params, callback);
}


/*
 * callback get the buffer, aws gives a buffer:
 * data.Body (Buffer, Typed Array, Blob, String, ReadableStream) Object data.
 * data.Body.toString use default utf8 encoding.
 */
function read_data_body(s3key, callback){
  var params = {
    Bucket: root_bucket,
    Key:    s3key,
  };
  p('in bucket.js read_data, params: ', params);
  s3.getObject(params, function(err,data){
    p('err typeof data: ', err, typeof data);
    if (err){
      return callback(err, null);
    } else{
      callback(err, data.Body);
    }
  });
}


function read_file(s3key, callback){
  // read to string.
  var s3 = new AWS.S3();
    var s3 = s3a.get_s3_obj();
  var params = {
    Bucket: root_bucket,
    Key:    s3key,
  };

  //p('testing 0923, ', params);
  s3.getObject(params, function(err,data){
    //console.log('in bucket read file, (err, data): ', err, data);
    if (err){
      callback(err, null); return;
    } else{
      callback(err, data.Body.toString());
    }
  });
}


function write_text_file(s3key, string, callback){
    var params = {
        Bucket: root_bucket,
        Key: s3key,
        Body: string
    };

    callback = callback || function(){}; // make sure there is a callback.
    s3.putObject(params, callback);
}
var write_string_to_s3 = write_text_file;



// 2015 0830


function delete_object(s3key, callback){
  var params = {
    Bucket: root_bucket,
    Key: s3key,
  };
  //s3.deleteObject(params, function(err, data) {
  //  if (err) console.log(err, err.stack); // an error occurred
  //  else     console.log(data);           // successful response
  //});
  s3.deleteObject(params, callback);
}


/*
 * callback get the object the data given by sdk, Body is in the data:
 * data.Body (Buffer, Typed Array, Blob, String, ReadableStream) Object data.
 */
function read_obj(s3key, callback){
  var params = {
    Bucket: root_bucket,
    Key:    s3key,
  };
  p('in bucket.js read_data, params: ', params);
  s3.getObject(params, callback);
}


// Interface to s3 api, with root bucket.
function s3list(prefix, callback){

    var params = {
        Bucket : root_bucket,
        Prefix : prefix,
    };

    var s3 = s3a.get_s3_obj();
    s3.listObjects(params, callback);
}


/*
 * keep in using, 2015 1107
 * no:
 *   replaced by list2. 0601
 *   @prefix should contain username
 *   used as tool by other listing functions. 0618.
 *
 * list objects in the bucket, with the prefix, callback get:
 *
 * data['Contents'] is an array like:

   [ { Key: 'tmp/',
       LastModified: Tue Apr 15 2014 08:18:59 GMT+0000 (UTC),
       ETag: '"d41d8cd98f00b204e9800998ecf8427e"',
       Size: 0,
       Owner: [Object],
       StorageClass: 'STANDARD' }, ...... ]

 */
function list(prefix, callback){

  //var params = {
  //    Bucket : root_bucket,
  //    //Prefix : 'tmp',
  //    Prefix : prefix,
  //};

  ////var s3 = new AWS.S3();
  //var s3 = s3a.get_s3_obj();
  //s3.listObjects(params, function(err, data) {
  //    //console.log('---');
  //    //console.log(data);
  //    callback(err, data['Contents']);
  //});


  // modified to use s3list
  s3list(prefix, function(err, data) {
    if(err) return callback(err);

    callback(err, data['Contents']);
  });
}


// failed to work
// bucket-list.js might be the way, not tested.
function list_all(prefix, max_number, callback){
  max_number = max_number || 999;

  var params = {
    Bucket : root_bucket,
    Prefix : prefix,
    MaxKeys: max_number,
  };
  var s3 = s3a.get_s3_obj();

  var all_keys = [];
  function list_all_keys(marker, cb)
  {
    params.Marker = marker;
    //s3.listObjects({Bucket: s3bucket, Marker: marker}, function(err, data){});
    s3.listObjects(params, function(err, data){
      if(err) return cb(err, all_keys);

      all_keys.push(data.Contents);

      p('all keys length: ', all_keys.length);
      p('data contents length: ', data.Contents.length);
      p('data contents 0 1 2: ', data.Contents.slice(0,3));
      p('is truncated       : ', data.IsTruncated);
      p('data next marker   : ', data.NextMarker);

      // recursively:
      if   (data.IsTruncated) list_all_keys(data.NextMarker, cb);
      else cb(null, all_keys);
    });
  }

  list_all_keys(null, callback);
}

function get_object(s3key, callback){
  // callback is from aws s3, callback(err, data)
  //var s3 = new AWS.S3();
  var s3 = s3a.get_s3_obj();
  var params = {
    Bucket: root_bucket,
    Key:    s3key,
  };
  s3.getObject(params, callback);
}


function read_json(s3path, callback){
  //console.log('--- bucket read json, s3path: ', s3path);
  read_file(s3path, function(err,data){
    if (err){
      return callback(err, null);
    }
    if (typeof data !== 'string'){
      return callback('data not string', null);
    }
    if (!data){
      return callback('not data?', null);
    }


    var json = null;
    try{
        json = JSON.parse(data);
    }catch(e){
        return callback(e, null);
    }

    callback(null, json);

  });
}


function write_s3_json_file(s3key, obj, callback){
  // 
  // write an object to s3, with json stringified text
  // 
  // @callback is optional, if presented, it will get called with `putObject` 
  // reply.
  // 

  // make the string represent of json obj.
  var text = null;
  try{
      // 4 means tab-width
      text = JSON.stringify(obj, null, 4);
  }catch(e){
      return callback(e, null);
  }

  //p('2015 1205 going to write json stringified ', text);
  write_string_to_s3(s3key, text, callback);
}
var write_json = write_s3_json_file;


// 2015 1022e end of moving back, 2015 1205



////d
//function init_user_home(username, callback){ //d
//    /* found that buckets get limit number
//     * STOP using the function, it create many buckets for each user.
//     */
//    if (!username){
//        callback(new Error("who's user"), null);
//        return;
//    }
//
//    var s3 = new AWS.S3();
//    // note the '/', for s3,  abc is different to abc/
//    var params = {Bucket: path.join(root_bucket, username, '/')};
//    s3.headBucket(params, function(err, data){
//        if (err){
//            //console.log(err.stack);
//            s3.createBucket(params, function(err, data){
//                console.log("create bucket: " + params.Bucket); if(err) console.log("failed")
//                callback(null, null);
//            });
//        } else{
//            console.log('no err');
//            console.log(data);
//            callback(new Error("user exists"), null);
//        }
//    });
//}


//// not used now, the number of buckets is limited to 100, 0601
//function create_folder_0530(new_folder, callback){ //d
//    // make a folder, some think it's a `bucket` in s3 storage.  not sure.
//
//    if (!new_folder){
//        callback(new Error("which folder?"), null);
//        return;
//    }
//
//    var s3 = new AWS.S3();
//    // note the '/', for s3,  abc is different to abc/
//    var params = {Bucket: path.join(root_bucket, new_folder, '/')};
//    console.log('params');
//    console.log(params);
//    s3.headBucket(params, function(err, data){
//        if (err){
//            //console.log(err.stack);
//            s3.createBucket(params, function(err, data){
//                console.log("create bucket: " + params.Bucket); if(err) console.log("failed")
//                callback(null, null);
//            });
//        } else{
//            console.log('no err when headBucket');
//            console.log(data);
//            callback(new Error("path exists"), null);
//        }
//    });
//}
//



////d
///*
// * list files and folders
// */
//function list2(username, cwd, callback){ //d
//  list(cwd, function(err, s3list_obj_contents){
//    if(err){ 
//      callback(err, null);
//    } else {
//      var hash_file_links = link_hashs(s3list_obj_contents);
//      //console.log("hash_file_links"); console.log(hash_file_links);
//      read_home_structure(username, function(err, tree){
//        if(err){
//          callback(err, null);
//        }else{
//          var checkout = myutil.check_out_cwd_tree(cwd, tree);
//          var sub_tree = checkout.tree;
//          //console.log("sub_tree"); console.log(sub_tree);
//
//          var hash_folder_links = {}; // will be modified as parameter:
//          obj_to_path_hash(sub_tree, checkout.cwd, hash_folder_links);
//          //console.log("hash_folder_links"); console.log(hash_folder_links);
//
//          var all_hash = merge_hashes(hash_folder_links, hash_file_links);
//          //console.log("all_hash"); console.log(all_hash);
//          callback(null, sort_to_ul(all_hash));
//        }
//      });
//    }
//  });
//}







//d
/// helper function
function merge_hashes(ha, hb){
  var h = {};
  for (var key in ha){
    h[key] = ha[key];
  }
  for (var key in hb){
    h[key] = hb[key];
  }
  return h;
}


/// helper function
function is_empty_object(obj){
    if (typeof(obj) !== 'object') return false;
    // empty object will get 0 keys:
    if (Object.keys(obj).length > 0) return false;
    return true;
}


//d
/// helper function
function make_a(words, href){
    return '<a href="' + href + '">' + words + '</a>';
}




/*
 * help function.
 * Make an array from 'Contents' of AWS S3 getObjects data:
 *
{ Contents: 
   [ { Key: 'tmp/',
       LastModified: Tue Apr 15 2014 08:18:59 GMT+0000 (UTC),
       ETag: '"d41d8cd98f00b204e9800998ecf8427e"',
       Size: 0,
       Owner: [Object],
       StorageClass: 'STANDARD' }, ......

   ]...... }


 * The returned hash:  { 'file_full_path': down_stream_link, ... }
 */
function link_hashs(contents){
    var h = {};
    var html = '';
    if(contents){
        for (var i = 0; i < contents.length; i++){
            var fi = contents[i];  // file info

            html = '';
            html = html + '<a href="';
            html = html + '/ss/' + fi['Key'] + '">';
            html = html + fi['Key'];
            html = html + '</a>';
            h[fi['Key']] = html;
        }

    }
    return h;
}


////d
///*
// * list only s3 files, make it show with selector in HTML template
// * 0613
// * this is testing 0613, to let user select and send files
// */
//function list3(username, cwd, callback){
//  list(cwd, function(err, s3list_obj_contents){
//    if(err){ 
//      callback(err, null);
//    } else {
//      //var hash_file_links = link_hashs(s3list_obj_contents);
//      //var hash_file_links = keep_one_level_s3list(s3list_obj_contents, cwd);
//      var file_list_in_dir = shrink_s3list_to_cwd(s3list_obj_contents, cwd);
//      //filter_out_hidden_name_keys(hash_file_links);
//      filter_out_hidden_name_keys(file_list_in_dir);
//      prepare_file_info(file_list_in_dir, function(err, in_dir){
//              //console.log('get called');
//              //console.log(in_dir);
//              var html = '<ul class="list-unstyled list-group file-list">';
//              u.each(in_dir, function(finfo, k){
//                html += finfo['li-element'];
//              });
//              html += '</ul>';
//              //console.log(html);
//
//              callback(null, html);
//
//      });
//      //console.log("hash_file_links"); console.log(hash_file_links);
//      //callback(null, sort_and_mk_form(hash_file_links));
//    }
//  });
//}


/*
 * list folder contain messages
 * 0618
 */
function list_messages(username, dir, callback){
  list(dir, function(err, contents){
    //console.log(contents);
    if(err){ callback(err, null); return;}

    var file_list_in_dir = shrink_s3list_to_cwd(contents, dir);
    //filter_out_hidden_name_keys(file_list_in_dir);
    prepare_file_info(file_list_in_dir, function(err, in_dir){
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
    list_messages('muji', 'muji/goodagood/.in',  function(err, what){
    //list_messages('abc', 'abc/goodagood/.in',  function(err, what){
      //console.log('what getten from list_message?'); console.log(what);
    });
}

// helper function
function filter_out_hidden_name_keys(obj, hidden_pattern){
  if (typeof hidden_pattern === 'undefined') hidden_pattern = '/.';
  Object.keys(obj).forEach(function(key){
    if (key.indexOf(hidden_pattern) >= 0) {
      delete obj[key];
      console.log( 'deleted : ' + key);
    }
  });
}


/*
 * help function.
 * Make an object from 'Contents' of AWS S3 getObjects data:
 *
{ Contents: 
   [ { Key: 'tmp/',
       LastModified: Tue Apr 15 2014 08:18:59 GMT+0000 (UTC),
       ETag: '"d41d8cd98f00b204e9800998ecf8427e"',
       Size: 0,
       Owner: [Object],
       StorageClass: 'STANDARD' }, ......

   ]...... }


 * The returned hash:  { 's3key': {infos...}, ... }
 */
// to do : replaced by shrink_s3list_to_cwd
function keep_one_level_s3list(contents, cwd){
    var h = {};
    var html = '';

    var results = [];
    var level = count_folder_level(cwd);
    if(contents){
        for (var i = 0; i < contents.length; i++){
            var fi = contents[i];  // file info
            var key = fi['Key'];   // s3 key
            var cutted = key;
            if (count_folder_level(key) > level + 1) { 
              cutted = cut_extra_subs(key, level);
              var html = '';
              html = html + '<a href="';
              html = html + '/list3/' + cutted + '">';
              var beheaded = cutted.replace(path.join(cwd,'/'), '');
              html = html + beheaded;
              html = html + '</a>';
              h[cutted] = { type : 'folder', html: html, 'short-name': beheaded};
            }else{
              //cutted = key;
              var html = '';
              html = html + '<a href="';
              html = html + '/ss/' + key + '">';
              var beheaded = key.replace(path.join(cwd,'/'), '');
              html = html + beheaded;
              html = html + '</a>';
              h[key] = { type : 'file', html: html, 'short-name': beheaded };
            }
            //console.log(key, '  ', cutted, ' ', html);
        }
        //console.log(h);

    }
    return h;
}


function cut_extra_subs(key, level){
  return key.split('/').slice(0, level+1).join('/') + '/';
}


function count_folder_level(abspath){
  // abc'     : level 1
  // abc/d    : level 2
  // abc/d/e  : level 3
  // abc/d/e/ : level 3?
  var p = abspath.split('/');
  parts = u.without(p, '');
  return parts.length;
}


function count_appearance(string,  substr){
  return string.split(substr).length - 1;
}




//d
/// helper function
function sort_to_ul_form(hash){
  //console.log(hash);
  var keys = (Object.keys(hash)).sort();
  var ul = '<form><ul>';
  // "for in" kills me many times. js array can not :  for in
  keys.forEach(function(key){
    ul += '<li>' + '<input type="checkbox" name="filepath[]" value="' + key + '" />' + hash[key] + '</li>';
  });
  ul += '</ul></form>';
  return ul;
}




//d
/*
 * help function.
 * Make an object from 'Contents' of AWS S3 listObjects data:
 *
 * The returned hash:  { 's3key': {infos...}, ... }
 * This will not add HTML to data.
 */
function shrink_s3list_to_cwd(contents, cwd){
    var h = {};

    var level = count_folder_level(cwd);
    if(contents){
        for (var i = 0; i < contents.length; i++){
            var fi = contents[i];  // file info
            var key = fi['Key'];   // s3 key
            if (count_folder_level(key) > level + 1) { 
              var cutted = cut_extra_subs(key, level);
              var beheaded = cutted.replace(path.join(cwd,'/'), '');
              h[cutted] = { type : 'folder', 'short-name': beheaded};
            }else{
              var beheaded = key.replace(path.join(cwd,'/'), '');
              h[key] = { type : 'file', 'short-name': beheaded };
            }
        }
        //console.log(h);

    }
   return h;
}




//d?
var filetype = require('../myutils/filetype.js');

//d
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
function prepare_file_info(file_in_dir, callback){
  console.log('file in dir',  file_in_dir);
  var number = u.size(file_in_dir);
  if( number == 0) {callback(null, null); return;}

  // make it get called after all been done:
  var callback_after_all_done = u.after(number, callback);

  u.each(file_in_dir, function(file_info, key){
    //console.log('key: ', key, ' file_info: ', file_info);
    file_info['file-s3key'] = key;
    //console.log('read_file_meta(key,...', key);
    read_file_meta(key, function(err, meta_info){
      if (!err){
        u.defaults(file_info, meta_info);
      }
      //console.log('before filetype.make_presentation_html(file_info)\n', file_info);
      filetype.make_presentation_html(file_info);
      callback_after_all_done(null, file_in_dir);
      //console.log('key: ', key, ' file_info: ', file_info);
    });
  });
}






///*
// * deprecated? 2015 1022
// *
// * @file : file object made by node 'formidable'
// *         file.name : the name
// *         file.path : the abs path of the local file.
// */
//function put_file(file, prefix){
//    var s3key = path.join(prefix, file.name);
//    file.s3key = s3key;
//
//    //var s3 = new AWS.S3();
//    var s3 = s3a.get_s3_obj();
//
//    var params = {
//        Bucket: root_bucket,
//        Key: s3key,
//        Body: fs.createReadStream(file.path)
//    };
//
//    s3.putObject(params, function(err, data) {
//        if (err) console.log(err, err.stack); // an error occurred
//        else     console.log(data);           // successful response
//    });
//}
//


/*
 * testing for new s3 object, 2015 1022
 */
function put_one_file(local_file_path, s3key, callback){
  // 
  // put local filename to s3 storage with key (s3key)
  // 

  //var s3 = new AWS.S3();
  var s3 = s3a.get_s3_obj();

  var params = {
      Bucket: root_bucket,
      Key: s3key,
      Body: fs.createReadStream(local_file_path)
  };

  s3.putObject(params, function(err, data) {
    if(callback){ return callback(err, data);}
    else if(err){ return console.log(err, err.stack);}
    else{ return console.log('bucket, put one file ', data);}
    //if (err) console.log(err, err.stack); // an error occurred
    //else     console.log(data);           // successful response
  });
}


// moved out?
/*
 * 0608
 * first try, make the thumbnail 100x100, put it under current dir:
 * ./.thumbnails/....100x100.ext
 */
function process_image_by_ext(file, callback){
  console.log('\nprocess image by ext, file\n');
  //console.log(file);
  if (file.name){
    var ext = path.extname(file.name).toLowerCase();
    // remove first '.'
    ext = ext.replace(/^\./, '');
    console.log('ext'); console.log(ext);
    if (['jpg', 'jpeg', 'tiff', 'png', 'gif'].indexOf(ext) >= 0){
      // do image file
      var outfile = {
        path : file.path + ".100x100." + ext,
        name :  file.name + '.100x100.' + ext
      };
      console.log('outfile'); console.log(outfile);
      image.make_thumbnail(100, 100, file.path, 100, outfile.path, function(err, another){
        console.log('process image: make thumb: before callback, :err, outfile\n');
        console.log(err, outfile);
        callback(err, outfile);
      });

    }
  }
}


//d
function make_thumbnail(file, width, height, callback){
  //console.log(file);
  if (!file.name){
    callback(new Error('file name?'), null); return;
  }

  var ext = path.extname(file.name).toLowerCase();
  // remove first '.'
  ext = ext.replace(/^\./, '');
  console.log('ext'); console.log(ext);

  if (['jpg', 'jpeg', 'tiff', 'png', 'gif'].indexOf(ext) < 0){
    callback(new Error('not image file?'), null);  return;
  }

  var opts = {
    ext     : ext,
    infile  : file.path,
    outfile : file.path + '.thumbnail',
  };
  if (width) opts.width   = width;
  if (height) opts.height = height;

  image.do_thumbnail(opts, function(err, thumbnail_filename){
    //console.log('process image: mk-thumbnail: before callback, :err, outfile\n');
    //callback(err, outfile);
    var s3key = image.make_thumb_key(opts);
    opts.s3key = s3key;
    put_one_file(thumbnail_filename, s3key);
    callback(null, opts);
    //console.log('outfile'); console.log(outfile);
  });
}


//d
function test_make_thumbnail(){
  var file = {
    name : '/tmp/img.jpg',
    path : '/tmp/img.jpg',
  };
  make_thumbnail(file, 88, 88, function(err, out){
    if (err) console.log(err);
    console.log(out);
  });
}


//d
function make_thumbnail_a(file, width, height, meta, callback){
  //
  // based on make_thumbnail, fit to new requirements of s3 file object. 0712
  //
  //console.log(file);
  if (!file.name){
    callback(new Error('file name?'), null); return;
  }

  var ext = path.extname(file.name).toLowerCase();
  // remove first '.'
  ext = ext.replace(/^\./, '');
  console.log('ext'); console.log(ext);

  var opts = {
    ext     : ext,
    infile  : file.path,
    outfile : file.path + '.thumbnail',
  };
  if (width) opts.width   = width;
  if (height) opts.height = height;

  var s3key = image.make_thumb_key(opts);
  if( typeof meta['thumbnail-s3key'] !== 'undefined'){
    s3key = meta['thumbnail-s3key'];
  }
  opts.s3key = s3key;


  image.do_thumbnail(opts, function(err, thumbnail_filename){
    //console.log('process image: mk-thumbnail: before callback, :err, outfile\n');
    //callback(err, outfile);
    put_one_file(thumbnail_filename, s3key);
    callback(null, opts);
    //console.log('outfile'); console.log(outfile);
  });
}


//d
// going to be deprecated, to use new folder/file data structure. 0626
function init_home_structure_file(username, callback){
    // load the default user home folder structure
    //
    //console.log(default_user_home_tree);

    // The file will be put to: username/goodagood/etc/home-structure.json
    var s3key = path.join(username, 'goodagood/etc', 'home-structure.json');

    var s3 = new AWS.S3();
    var s3 = s3a.get_s3_obj();

    var tree = {}; tree[username] = default_user_home_tree;
    var params = {
        Bucket: root_bucket,
        Key: s3key,
        // 4 means tab-width
        Body: JSON.stringify(tree, null, 4),
    };

    s3.putObject(params, function(err, data) {
        if (err) {callback(err, null);}
        else     {callback(null, data);}
    });
}









function read_data(s3key, callback){
  // callback get the buffer, aws gives a buffer:
  // data.Body — (Buffer, Typed Array, Blob, String, ReadableStream) Object data.
  // data.Body.toString use default utf8 encoding.
  var params = {
    Bucket: root_bucket,
    Key:    s3key,
  };
  p('in bucket.js read_data, params: ', params);
  s3.getObject(params, function(err,data){
    p('err typeof data: ', err, typeof data);
    if (err){
      return callback(err, null);
    } else{
      callback(err, data.Body);
    }
  });
}


// duplicated
//function read_file(s3key, callback){
//  // read to string.
//  var s3 = new AWS.S3();
//  var params = {
//    Bucket: root_bucket,
//    Key:    s3key,
//  };
//  s3.getObject(params, function(err,data){
//    //console.log('in bucket read file, (err, data): ', err, data);
//    if (err){
//      callback(err, null); return;
//    } else{
//      callback(err, data.Body.toString());
//    }
//  });
//}


function test_read_file(){
  s3key = path.join('tmpb', myconfig.user_home_structure_file);
  console.log('s3key'); console.log(s3key);
  read_file(s3key, function(err,data){
    if (err){
      res.end('Read file error'); next();
    }
    console.log(data.Body.toString());
    console.log(data.Body.toJSON());
  });
}



function console_log_file(filepath){
  read_file(filepath, function(err, data){
    if(err) console.log(err);
    console.log(data);
  });
}


////d
///*
// * @callback : will get parameters: err, object_of_home_tree
// *
// * object_of_home_tree : { folder : {
// *                            sub-folder : {},
// *                            ...
// *                            }
// *                            ...
// *                        }
// */
//function read_home_structure(username, callback){ //d
//  s3key = path.join(username, myconfig.user_home_structure_file);
//  read_file(s3key, function(err,data){
//    if (err){
//      callback(err, null);
//    }
//
//    var obj = JSON.parse(data);
//    callback(null, obj);
//  });
//}


function s3_object_exists(s3key, callback){
  //
  // @callback directly passed as s3 callback

    var params = {
        Bucket: root_bucket,
        Key:    s3key,
    };
    s3.headObject(params, callback);
}


function test_s3_object_exists(){
  var s3key = '.meta/abc';
  s3_object_exists(s3key, function(err, reply){
    console.log(err, reply);
  });
}


function delete_with_prefix(prefix){
  var list_params = {
    Bucket: root_bucket, //'STRING_VALUE', required
    //Delimiter: 'STRING_VALUE',
    //EncodingType: 'url',
    //Marker: 'STRING_VALUE',
    //MaxKeys: 0,
    Prefix: prefix, //'STRING_VALUE'
  };
  s3.listObjects(list_params, function(err, data) {
    if (err) {console.log(err, err.stack);} // an error occurred
    else     {
      //console.log(data);

      //delete all other attribute, it cause deleteObjects fails
      data.Contents.forEach(function(element){
        for(var k in element){
          if (k !== 'Key') delete element[k];
        }
      });

      var delete_params = {
        Bucket: root_bucket, //'STRING_VALUE', required
        Delete: { // required
          Objects: data.Contents,
          //Objects: [ // required
          //{
          //  Key: 'STRING_VALUE', // required
          //  VersionId: 'STRING_VALUE',
          //},
          //// ... more items ...
          //],

          //Quiet: true || false,
        },
        //MFA: 'STRING_VALUE',
      };

      console.log("\ndelete_params.Delete.Objects\n");
      console.log(delete_params.Delete.Objects);

      s3.deleteObjects(delete_params, function(err, data) {
        if (err) {console.log(err, err.stack);} // an error occurred
        else     {
          console.log("\n return data from deleteObjects :\n");
          console.log(data);
        }
      });

    }
  });
}

/*
 * Do this with CAREFULNESS!!
 */
function test_delete_with_prefix(){
  ['tmpb', 'abc', 'noone', 'test'].forEach(function(name){
    delete_with_prefix(name);
  });
  //delete_with_prefix("tmpa");
}


/* d, 2015-0408
 * Add meta file for the file pointed by s3key.
 * @s3key : s3key of the file, not meta file.
 * s3key for meta file will be calculated as meta_key
 *
 * replace add_meta_file_0618
 */
function add_meta_file(s3key, meta, callback){
    var meta_key = path.join(myconfig.meta_file_prefix, s3key);

    var s3 = new AWS.S3();
    var s3 = s3a.get_s3_obj();

    var params = {
        Bucket: root_bucket,
        Key: meta_key,
        // 4 means tab-width
        Body: JSON.stringify(meta, null, 4),
    };

    s3.putObject(params, function(err, data) {
        if (err) {callback(err, null);}
        else     {callback(null, data);}
    });
}
var write_file_meta = add_meta_file


//d
/*
 * @hash : an object { key:value, ... }
 */
function update_file_meta(file_s3key, hash, callback){
  read_file_meta(file_s3key, function(err, meta){
    if(err) { callback(err, null); return; }
    if(!meta) meta = {};
    //u.defaults(meta, hash);
    u.extend(meta, hash);  // this will override
    write_file_meta(file_s3key, meta, function(err){
      callback(err, meta);
    });
  });
}



//d 2015 1205
function print_file_meta(file_key){
  read_file_meta(file_key, function(err, meta){
    if(err) console.log('ERR: ', err);
    console.log(meta);
  });
}

function add_meta_file_0618(s3key, meta, callback){
    var meta_key = s3key + "." + meta_file_ext;

    var s3 = new AWS.S3();
    var s3 = s3a.get_s3_obj();

    var params = {
        Bucket: root_bucket,
        Key: meta_key,
        // 4 means tab-width
        Body: JSON.stringify(meta, null, 4),
    };

    s3.putObject(params, function(err, data) {
        if (err) {callback(err, null);}
        else     {callback(null, data);}
    });
}


function test_add_meta_file_0618(){
  var s3key = 'muji/one/651165.jpg';
  var meta = {

            creator: {
                who  : 'muji',
                when : Date.now(),
                //...
            },

            license: {owner: 'muji' },

            permission: {
                owner : 'rwx',
                group : 'r',
                other : 'r',
            },
  };
  add_meta_file_0618(s3key, meta, function(err, data){
    console.log(data);
  });

}

function copy_file(src_key, tgt_key){
    var s3 = new AWS.S3();
    var s3 = s3a.get_s3_obj();
    var src = path.join(root_bucket, src_key);
    src = encodeURIComponent(src);
    var params = {
        Bucket     : root_bucket,
        CopySource : src,
        Key        : tgt_key,
    };
    //console.log('params'); console.log(params);
    s3.copyObject(params, function(err,data){
        //if (err) callback(err, null);
        //else callback(err, data);
        if (err) console.log(err);
        //console.log(params.CopySource, data);
    });
}

function copy_object(src_key, tgt_key, callback){
    var s3 = new AWS.S3();
    var s3 = s3a.get_s3_obj();
    var src = path.join(root_bucket, src_key);
    src = encodeURIComponent(src);
    var params = {
        Bucket     : root_bucket,
        CopySource : src,
        Key        : tgt_key,
    };
    //console.log('params'); console.log(params);
    s3.copyObject(params, callback);
}


function move_object(src_key, tgt_key, callback){
    copy_object(src_key, tgt_key, function(err, rep){
      if(err) return callback(err, rep);
      delete_object(src_key, callback);
    });
}


/*
 * I found no direct API to 'move files', but to do it 'copy and delete'
 */
function copy_file_with_meta_0722(src_key, tgt_key){
    var s3 = new AWS.S3();
    var s3 = s3a.get_s3_obj();
    var src = path.join(root_bucket, src_key);
    src = encodeURIComponent(src);
    var params = {
        Bucket     : root_bucket,
        CopySource : src,
        Key        : tgt_key,
    };
    console.log('params');
    console.log(params);
    s3.copyObject(params, function(err,data){
        //if (err) callback(err, null);
        //else callback(err, data);
        if (err) console.log(err);
        console.log(params.CopySource, data);
    });

    // move associated meta files if it has
    meta_src = path.join(myconfig.meta_file_prefix, src_key);
    src = path.join(root_bucket, meta_src);
    src = encodeURIComponent(src);
    var params2 = {
        Bucket     : root_bucket,
        CopySource : src,
        Key        : path.join(myconfig.meta_file_prefix, tgt_key),
    };
    console.log('params2');
    console.log(params2);
    s3.copyObject(params2, function(err,data){
        //if (err) callback(err, null);
        //else callback(err, data);
        if (err) console.log(err);
        console.log(data);
    });
}


function test_copy_file(){
  var srckey = 'muji/aa/14110356769.jpg';
  var tgtkey = 'muji/goodagood/public/14110356769.jpg';
  copy_file(srckey, tgtkey);
}


function write_meta(meta_info){
    // load the default user home folder structure
    //
    //console.log(default_user_home_tree);

    // The file will be put to: username/goodagood/etc/home-structure.json
    var s3key = meta_info.s3key;

    var s3 = new AWS.S3();
    var s3 = s3a.get_s3_obj();

    var params = {
        Bucket: root_bucket,
        Key: s3key,
        // 4 means tab-width
        Body: JSON.stringify(meta_info, null, 4),
    };

    s3.putObject(params, function(err, data) {
        //if (err) {callback(err, null);}
        //else     {callback(null, data);}
    });
}


function put_object(s3key, object, callback){
  // object: can be Buffer/string/stream
    var params = {
        Bucket: root_bucket,
        Key: s3key,
        // 4 means tab-width
        Body: object
    };

    callback = callback || function(){}; // make sure there is a callback.
    s3.putObject(params, callback);
}




// This will create 300 files, BE CAREFUL
function test_write_s3_json_file(){
  for (var i = 0; i < 300; i++){
    var folder = 'abc/tmp/a';
    var s3key = path.join(folder, i.toString(),  myconfig.folder_option_file_name);
    console.log(s3key);
    var folder_opt = {
      creator: 'sys',
      owner:   'abc',
      permission : {
        owner : 'rwx',
        group : '',
        other : ''
      },
    };
    write_s3_json_file(s3key, folder_opt);
  }
}


function update_json(s3path, more_opt, callback){
  read_json(s3path, function(err, obj){
    if(err || !obj) obj = {};  // any error causes a new json object.
    u.defaults(obj, more_opt);
    write_json(s3path, obj, callback);
  });
}


function test_update_json(){
  var key = 'abc/tmp/update.json';
  update_json(key, {a:1, b:2}, function(){});
  setTimeout(function(){
    read_json(key, function(err, data){
      console.log(data);
    });
  }, 5000);
}


////d
//function init_folder_meta(folder_path, dir_opt, callback){
//  // This will create more 'folders' than expected, for example:
//  // a/b/c/d/e/f/g  -> a/b, a/b/c/, ...
//  //var s3key = path.join(folder_path, myconfig.folder_option_file_name);
//
//  var meta_file_key = path.join(myconfig.meta_file_prefix, folder_path);
//
//  var defaults = {};
//  defaults['what'] = myconfig.iamfolder;
//  defaults['path'] = folder_path;
//  defaults['owner'] = folder_path.split('/')[0];
//  defaults['name'] = path.basename(folder_path);
//  defaults['parent'] = path.dirname(folder_path);
//  defaults['permission'] = {};
//  defaults['permission']['owner'] = 'rwx';
//  defaults['create-date'] = Date.now();
//
//  u.defaults(dir_opt, defaults); // make sure there are defaults.
//  write_json(meta_file_key, dir_opt, function(err, reply){
//    if(callback) callback(err, reply); // reply would be s3 putObject 'reply'
//  });
//}
//
//
//function is_s3_pseudo_folder(fpath, callback){
//  read_file_meta(fpath, function(err, meta_obj){
//    if(!err){
//      if(typeof meta_obj.what !== 'undefined' && 
//        meta_obj.what === myconfig.iamfolder){
//          callback(true);
//          return;
//      }
//    }
//    callback(false);
//  });
//}
//
//
//function test_make_s3_pseudo_folder(){
//
//  var folder = 'abc/tmp/tsp-folder';
//  var folder_opt = {
//    what : myconfig.iamfolder,
//    create_miliseconds: Date.now(),
//    creator: 'abc',
//    owner:   'abc',
//    permission : {
//      owner : 'rwx',
//      group : '',
//      other : ''
//    },
//  };
//
//  init_folder_meta(folder, folder_opt);
//
//  function _test_folder(){
//    is_s3_pseudo_folder(folder, function(yes){
//      if(yes) console.log(folder, ' is folder');
//    });
//  }
//  setTimeout(_test_folder, 3000);
//}
//
//
//function build_gallery_list(cwd, callback){
//  list(cwd, function(err, s3list_obj_contents){
//    console.log(s3list_obj_contents);
//    
//    var finished = 0, length = s3list_obj_contents.length;
//    var links = "";
//    s3list_obj_contents.forEach(function(element){
//      read_file_meta(element.Key, function(err, meta_obj){
//        links += '<a href="/ss/' + element.Key + '"' +' title="" ' + ' data-description="" >\n';
//        if(!err && meta_obj) links += '<img src="/ss/' + meta_obj['thumbnails'][0].s3key + '" alt="?" > </a>\n';
//        else links += '<img src="/ss/muji/one/tn-d52.jpg" alt="dft"></a>\n';
//        finished += 1; 
//        if (finished == length) callback(null, links);
//      });
//    });
//  });
//}
//
//
//function test_build_gallery_list(){
//  var full_path  = 'muji/goodagood/public/';
//  build_gallery_list(full_path, function(err, links){
//    console.log(links);
//  });
//}
//
//
////d
//function read_file_meta(file_s3key, callback){
//  if(!file_s3key){
//    callback(new Error('give a key'), null);
//    return;
//  }
//  s3key = path.join(myconfig.meta_file_prefix, file_s3key);
//  read_file(s3key, function(err,data){
//    if (err){
//      callback(err, null);
//      return;
//    }
//
//    var obj = JSON.parse(data);
//    callback(null, obj);
//  });
//}
//
//
////d
//function test_read_file_meta(){
//  var filekey = 'muji/goodagood/public/14110247507.jpg';
//  read_file_meta(filekey, function(err, obj){
//    if(err) console.log(err);
//    console.log(obj);
//  });
//}
//
//
//function guess_to_be_folder(key, callback){
//  // This might not be a good guess
//  var params = {
//      Bucket : root_bucket,
//      Key:key
//  };
//  s3.headObject(params, function(err,data){
//    if(err) callback(true);
//    else callback(false);
//  });
//}
//
//
//function test_guess_to_be_folder(){
//  var key = 'muji/aa';
//  guess_to_be_folder(key, function(yes){
//    if(yes) console.log(key, ' is folder');
//    else console.log(key, ' is not folder');
//  });
//}


// 2015, 0519; 1031;
function s3_object_read_stream(key){
    if (!key) throw new Exception('can you give an s3 key to "s3 object read stream" in bucket.js?');

    //var s3 = new AWS.S3();
    var s3 = s3a.get_s3_obj();
    var params = {Bucket: root_bucket, Key: key};

    return s3.getObject(params).createReadStream();
}


//module.exports.init_user_home = init_user_home; //d

// 2015 1022
module.exports.version        = '3, back from gg-credentials';
module.exports.put_file_to_s3 = put_file_to_s3;
module.exports.read_obj       = read_obj;
module.exports.read_file      = read_file;
module.exports.read_to_string = read_file;
module.exports.write_text_file= write_text_file;
module.exports.delete_object  = delete_object;

module.exports.s3list   = s3list;
module.exports.list     = list;
module.exports.list_all = list_all;  //not pass, 2015 1111

module.exports.get_object = get_object;

// 2015 1205
module.exports.write_s3_json_file = write_s3_json_file;
module.exports.write_json = write_json;

// before 1022
//module.exports.list2 = list2;
//module.exports.list3 = list3; //d
module.exports.list_messages = list_messages;
//module.exports.put_file = put_file;
module.exports.put_one_file = put_one_file;



module.exports.read_json = read_json;
//module.exports.read_file_meta = read_file_meta; //d?
module.exports.read_data = read_data;

module.exports.console_log_file = console_log_file;
//module.exports.read_home_structure = read_home_structure; //d
//module.exports.update_home_structure_file = update_home_structure_file;


//module.exports.delete_object = delete_object;
module.exports.delete_with_prefix = delete_with_prefix;
//module.exports.process_image_by_ext = process_image_by_ext;
//module.exports.make_thumbnail_folder = make_thumbnail_folder;
//module.exports.make_thumbnail= make_thumbnail;
//module.exports.folder_exists = folder_exists;
//module.exports.add_meta_file = add_meta_file;

//module.exports.write_file_meta = write_file_meta;
//module.exports.update_file_meta = update_file_meta;
//module.exports.print_file_meta = print_file_meta;

// write meta need s3key in meta, no seperate s3key to specify.
//module.exports.write_meta = write_meta;  


module.exports.update_json = update_json;
//module.exports.build_gallery_list = build_gallery_list;
module.exports.copy_file = copy_file;
module.exports.copy_object = copy_object;
module.exports.move_object = move_object;

//module.exports.make_s3_pseudo_folder = init_folder_meta;
//module.exports.init_folder_meta = init_folder_meta;
//module.exports.shrink_s3list_to_cwd = shrink_s3list_to_cwd;
//module.exports.guess_to_be_folder = guess_to_be_folder;

module.exports.s3_object_exists = s3_object_exists;
module.exports.put_object = put_object;

//2015, 0516
module.exports.s3_object_read_stream = s3_object_read_stream;


// -- checkings -- //

function stop(seconds){ // exit the process at seconds or 1
  setTimeout(process.exit, (seconds || 1)*1000);
}


function check_put(){
  var s3key = path.join('.gg.test', 'test-2015-1022');
  put_one_file('/tmp/aa.js', s3key, function(err, s3reply){
    if(err) return p(err);
    p('s3reply'); p(s3reply); 
    process.exit();
  });
}


if (require.main === module){

  //test_get_object();
  //test_put_object();
  //stream_down_so();
  //test_headBucket();
  //test_createFolder();
  //test_list();
  //test_init_home_structure_file();
  //test_read_file();

  //test_list2();
  //test_list3();
  //test_obj_to_path_hash();
  
  // be careful:
  //test_delete_with_prefix();

  //test_create_folder();
  //test_folder_exists();
  //test_add_meta_file();
  //test_read_file_meta();
  //test_make_thumbnail();
  //test_copy_file();
  //test_build_gallery_list();
  //test_read_file_meta();
  //test_write_s3_json_file();
  //

  //test_list_message();
  //test_guess_to_be_folder();
  //test_make_s3_pseudo_folder();
  //test_update_file_meta();
  //test_update_json();
  //
  //test_init_home_folder();
  //test_init_home_folder_many();

  //test_s3_object_exists();
 
  // 2015 1022
  check_put();
}

// vim: set et ts=2 sw=2 fdm=indent:
