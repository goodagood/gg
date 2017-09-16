var util   = require('util');
var path   = require('path');
var u      = require('underscore');
var async  = require('async');
var fs     = require('fs');

var file_module   = require('./simple-file-v3.js');
var folder_module = require('./folder-v5.js');
var bucket   = require('./bucket.js');

var myconfig =   require("../config/config.js");
var myutil   = require('../myutils/myutil.js');
var task     = require('../myutils/job.js');

var log28 = require('../myutils/mylogb.js').double_log('/tmp/log28');
var p     = console.log;


function handin(req, username, cwd, files){
  //
  //

  //log28('handin the files', files); 
  //log28('cwd', cwd); 
  //log28('username', username); 
  //log28('files 818', files);
  //log28('req.files 819', req.files);
  if(!files) return ;

  s3folder.retrieve_folder(cwd, function(the_folder){
    // once the wrong path lead to error, 0809, it looks not returned. ?
    if(!the_folder) return; // need more codes
    //log28('handin the folder', the_folder); 
    //log28('handin the folder meta ', the_folder.get_meta()); 


    if (u.isArray(files)){
      u.each(files, function(file){
        //var file = files[key];
        //log28('processonefile', [the_folder, file, username, cwd]);
        process_one_file(the_folder, file, username, cwd);
      });
    }else{
      //files is one file, what's the fuck.
      process_one_file(the_folder, files, username, cwd);
    }
  });
  
}




function make_basic_file_meta(file, username, cwd){
  // @file is got from 'formidable', form.parse(req, function...)
  //log28('make basic file meta, file username cwd', [file, username, cwd]);

  var meta  = u.pick(file, 'name', 'size', 'lastModifiedDate');
  meta.type = file.type;
  //meta.local_file = u.pick(file, 'path', 'type');
  //console.log(cwd, username);
  meta.path = path.join(cwd, file.name);
  meta.dir  = cwd;
  meta.owner = username;
  meta.timestamp = Date.now();

  meta.uuid     = myutil.get_uuid();
  //uuid_name is uuid.extname, it keeps file extension.
  //var uuid_name = meta.uuid + path.extname(file.name); 
  //meta.uuid_path = path.join(cwd, uuid_name);

  // In history:
  // files will be put to user/.files/uuid-of-file
  //meta.s3key = path.join(username, '.files', meta.uuid_path);
  //meta.meta_s3key = path.join(username, myconfig.new_meta_folder, meta.uuid_path);


  // this will be the s3 key for `new` meta information:
  //meta.new_meta_s3key = path.join(myconfig.new_meta_prefix, meta.path);
  meta.new_meta_s3key = path.join(myconfig.new_meta_prefix, meta.dir, meta.uuid);

  //meta.s3key = path.join(myconfig.raw_file_prefix, meta.path);
  var s3key = path.join(myconfig.raw_file_prefix, cwd, meta.uuid) // 12-20
  meta.storage = {type: 's3', key : s3key};

  return meta;
}


// The 2nd version, use file object's functionality to calculate meta.
function make_basic_file_meta2(file, username, cwd, callback){
  
  var meta_orig  = make_basic_file_meta(file, username, cwd);

  // use simple file obj to set up default:
  file_module.simple_s3_file_obj(meta_orig, function(err, obj){
    if(err) return callback(err, null);

    obj.calculate_meta_defaults();
    // meta masked.
    meta = obj.get_meta();
    if(meta.name){
      callback(null, meta);
    }else{
      callback('without name in the meta', meta);
    }
  });
}


function repair_file_meta(_meta){

  if (! _meta.name)  return false;
  if (! _meta.path)  return false;
  if (! _meta.owner) return false;
  if (! _meta.dir) _meta.dir = path.dirname(_meta.path);
  if (! _meta.timestamp) _meta.timestamp = Date.now();

  if (! _meta.uuid) _meta.uuid = myutil.get_uuid();

  // todo 1015

  // this s3key is old thing, use storage.s3key instead
  meta.s3key = path.join(myconfig.raw_file_prefix, _meta.dir, _meta.uuid);
  // this will be the s3 key for `new` meta information:
  meta.meta_s3key = path.join(myconfig.new_meta_prefix, _meta.dir, _meta.uuid);

  meta.storage = {type: 's3', key : meta.s3key};

  return meta;
}


// get single file, or files as array, 0214
function accept_files(username, files, cwd, callback){
  //p ('accept files : files 1', files);
  if(! u.isArray(files)) files = [files,];
  p ('accept files : ', files);

  // funs is array, each element is function, process one file in files.
  var funs = files.map(function(file){
    return function (callback){
      accept_file(username, file, cwd, callback);
    }
  });

  async.parallel(funs, function(err, result){
    // make replay json for blueimp?
    callback(err, result);
  });
}


// This is in use, 0101
function accept_file(username, file, cwd, callback){
  // Function 'handin' will take care file types, and build file object.
  // 'acceptor' will not. It simply accept the file to user's space, it's
  //   username/goodagood/.new/
  // later, after collecting it will be put to: username/goodagood/.meta/
  //

  if(file.size < 1) return callback('file size?', null);

  make_basic_file_meta2(file, username, cwd, function(err, meta){
    p ('after make basic file meta2:', err, meta);
    if(err) return callback(err, meta);
    // prepare task json, register task
    var job = { 
      name : 'new-file-meta', 
      username : username, 
      folder : cwd,
      new_meta_s3key : meta.new_meta_s3key
    };

    // put file content to s3
    bucket.put_one_file(file.path, meta.storage.key, function(err,data){
      if(err){
        p('put file to s3, key and file:', meta.storage.key, file);
        return callback(err, null);
      }
      fs.unlink(file.path);
      // put information to .new/user-name/...
      bucket.write_json(meta.new_meta_s3key, meta, function(err, reply){
        if(err){
          p('write file meta to s3 ERR, in "accept file"', [meta.new_meta_s3key, meta]);
          return callback(err, null);
        }
        task.pub_task(task.channel, job, function(err, pub_reply){
          if(err) return callback(err, pub_reply);
          callback(null, meta);
        });
      });
    });

  });
}



// 2015 0926
function process_req_files(files, username, cwd, callback){
  if(! u.isArray(files)) return callback('files should be an array');

  p ('process files : ', files);

  async.map(
      files,
      function(file, callback){
        pass_file(file, username, cwd, callback);
      },
      callback);
}


/*
 * rewrite accept_file after change formidable to multer.
 * 2015 0926
 *
 * callback will not pass 'err' to avoid 'async' stop running, the message
 * will be: callback(null, msg)
 *
 */
function pass_file(file, username, cwd, callback){
  if(file.size < 1) return callback(null, 'file size?');

  var meta = prepare_meta(file, username, cwd);

  var tkey = task.task_rec_prefix + meta.uuid;
  var job  = { 
    task_id:         tkey,
    new_meta_s3key : meta.new_meta_s3key,
    //name:            'new-file-meta',  // name of task
    //for testing, 2016 0205
    name:            'test-new-file-meta',

    username:        username, 
    folder:          cwd,
    filepath:        meta.path,
  };
  job.id = tkey;  // do not use this attribute

  // in the new meta, we should have a point to redis job
  meta.redis_task_id = job.task_id;

  p('2016 bucket.put_one_file: ',  meta.local_file, meta.storage.key);
  bucket.put_one_file(meta.local_file, meta.storage.key, function(err,data){
    if(err){
      p('2015 0926, put file to s3, key and file:', meta.storage.key, file);
      return callback(err, null);
    }
    fs.unlink(meta.local_file); delete meta.local_file;
  
    // put new file information to s3.
    //p('bucket.write_json', meta.new_meta_s3key, meta);
    bucket.write_json(meta.new_meta_s3key, meta, function(err, reply){
      if(err){
        p('0926, write file meta to s3 ERR, ', [meta.new_meta_s3key, meta]);
        return callback(err, null);
      }

      ////in dev, before publish task
      //p('util inspect: ',  util.inspect([meta, job]));
      //fs.writeFile('/tmp/mdata', util.inspect([meta, job]), 'utf-8', function(e,r){
      //  p('write inspect data, ', e, r);
      //  callback(null, meta);
      //});

      //p('2015 1010 put task ');
      task.pub_task(task.channel, job, function(err, pub_reply){
        if(err){
          p('2015 0926 pub task in parse :', err);
          return callback(err, pub_reply);
        }
        p('2016, task should be past out, ', pub_reply);
        callback(null, meta);
      });

    });
  });
}


/*
 * Using uploaded file info to prepare meta data.
 *
 * move away into to ../meta/file.js, 2016 0205.
 */
function prepare_meta(file, username, cwd){
  var meta  = u.pick(file, 'originalname', 'size', 'mimetype', 'encoding' );

  meta.type = meta.mimetype;
  meta.name = meta.originalname;

  meta.local_file = file.path;
  meta.path = path.join(cwd, meta.name);

  meta["dir"]  = cwd;
  meta.owner   = username; //what if other user put this file?
  meta.creator = username;
  meta.timestamp = Date.now();

  meta.uuid      = myutil.get_uuid();
  meta.path_uuid = path.join(meta.dir, meta.uuid);

  // this will be the s3 key for `new` meta information:
  meta.new_meta_s3key = path.join(myconfig.new_meta_prefix, meta["dir"], meta.uuid);

  var s3key = path.join(myconfig.raw_file_prefix, cwd, meta.uuid);
  meta.storage = {type: 's3', key : s3key};

  return meta;
}



module.exports.accept_file  = accept_file;
module.exports.accept_files = accept_files;
// change to: 
module.exports.process_req_files = process_req_files;
module.exports.pass_file         = pass_file;

module.exports.handin = handin; //d?
module.exports.repair_file_meta = repair_file_meta;


// vim: set et ts=2 sw=2 fdm=indent:
