var u      = require('underscore');
var path   = require('path');
//var test   = require('nodeunit');

var s3folder = require('./folder.js');
var s3file = require('./file.js');
var msg_file = require('./message-file-2.js');

var myconfig =   require("../config/config.js");
var myutil   = require('../myutils/myutil.js');

function copy_file(source, target){
  // 
  // @source is file name, full path
  // @target is folder, full path
  //
  var tgt_user_name = target.split('/')[0];

  s3folder.retrieve_file_obj(source, function(src_obj){
    var src_meta = src_obj.get_meta();
    src_obj.clone_content_to_user(tgt_user_name, function(file_storage){
      console.log('file storage', file_storage);
      var tgt_meta = {};
      //tgt_meta = u.pick(meta, 'name', 'size');
      u.defaults(tgt_meta, src_meta);
      u.extend(tgt_meta, file_storage);

      tgt_meta.path      = path.join(target, src_meta.name);
      if(typeof src_meta.owner !== 'undefined' && typeof src_meta.owner.username !== 'undefined' ) tgt_meta.from = src_meta.owner.username;
      tgt_meta.timestamp = Date.now();
      delete tgt_meta.html.li; // must delete one by one, or error.
      delete tgt_meta.s3_stream_href;
      delete tgt_meta.delete_href;
      delete tgt_meta.local_file;
      console.log('tgt meta', tgt_meta);

      s3file.new_s3_file_obj(tgt_meta, function(new_file){
        //new_file.set_meta(tgt_meta); //?
        new_file.calculate_meta_defaults();
        new_file.switch_with_filetype(function(typed){
          typed.render_html_repr();
          console.log('typed rendered meta', typed.get_meta());
          s3folder.retrieve_folder(target, function(tgt_folder){
            tgt_folder.add_file(typed.get_meta());
            tgt_folder.save_meta();
          });
        });
      });
    });

  });
}

function test_copy_file(){
  var src = 'abc/h.ra.rb';
  var target = 'test/public';
  copy_file(src, target);
}


function prepare_meta(src, username, to_path){
  // prepare basic meta from a file
  // @src is meta of source file.
  // @username is who will receiver the file
  // @to_path is the path where file would be put in.

  // Clone the meta
  var meta = JSON.parse(JSON.stringify(src));
  meta = u.omit(meta, 'uuid', 'path', 'timestamp',
      'html', 'uuid_path', 'delete_href', 'view_href', 'thumb',
      'thumbnail-s3key', 's3_stream_href');

  meta.uuid = myutil.get_uuid();
  meta.path = path.join(to_path, meta.name);
  meta.dir  = to_path;
  meta.from = src.owner; // 
  //meta.owner= 
  meta.timestamp = Date.now();

  meta.path_uuid = path.join(to_path, meta.uuid);

  // this will be the s3 key for `new` meta information:
  meta.new_meta_s3key = path.join(myconfig.new_meta_prefix, meta.dir, meta.uuid);
  // This name, 'meta_s3key', is missleading to normal meta s3 key. 
  // keep for old things.
  //meta.meta_s3key = meta.new_meta_s3key;

  file_content_key = path.join(myconfig.raw_file_prefix, meta.dir, meta.uuid);
  meta.storage = {type: 's3', key : file_content_key};
  meta.owner   = username;

  return meta;
}


function send_out_meta(file_meta, prepared_meta, callback){
  // not finished.

  var meta = file_meta;

  // prepare task json, register task
  var job = { 
    name : 'new-file-meta', 
    username : prepared_meta.owner, 
    from : prepared_meta.from, // get used?
    folder : prepared_meta.dir,
    meta_s3key : prepared_meta.meta_s3key, //?
    new_meta_s3key : prepared_meta.new_meta_s3key // try to use this name from now on.
  };


  // put file content to s3
  bucket.copy_object(meta.storage.key, prepared_meta.storage.key, function(err,data){
    if(err){
      console.log('put file to s3 ERR', [s3key, file]);
      return callback(err, null);
    }
    // put information to .new/user-name/...
    bucket.write_json(prepared_meta.new_meta_s3key, prepared_meta, function(err, reply){
      if(err){
        console.log('write file meta to s3 ERR, in "send out meta"', [meta.new_meta_s3key, meta]);
        return callback(err, null);
      }
      task.pub_task(task.channel, job, callback);
    });
  });
}


function mv_file_for_one_user(){
  // This not involve the second suer
  // same as copy, but without need to clone file content.
}


function send_message(message_meta, user, callback){
  var name = message_meta.owner.username + ', '  + Date.now().toString();
  message_meta.name = name;
  message_meta.owner = user;

  var message_folder = myconfig.message_folder;
  message_meta.path = path.join(user, message_folder);
  message_meta.to = user;

  msg_file.new_message_file_obj(message_meta, function(msgobj){
    msgobj.render_html_repr();
    var to_folder_name = path.join(message_meta.to, message_folder);
    s3folder.retrieve_folder(to_folder_name, function(from_folder){
      from_folder.add_file(msgobj.get_meta());
      from_folder.save_meta();
      if(callback) callback();
    });
  });
}


// -- use new versions --

var folder_module = require('./folder-v5.js');
var file_module   = require('./simple-file-v3.js');
var bucket        = require('./bucket.js');
var task          = require('../myutils/job.js');

var p     = console.log;
var ttool = require("../myutils/test-util.js");

function file_sender(src_path, to_whom, to_path, callback){
  // doing, 0101

  folder_module.retrieve_file_meta(src_path)

  //var meta = file_meta;
  //var target_folder = path.join(to_whom, myconfig.message_folder);
  ////var target_path   = path.join(myconfig.raw_file_prefix, target_folder);


  //// prepare task json, register task
  //var job = { 
  //  name : 'new-file-meta', 
  //  username : to_whom, 
  //  from : meta.owner,
  //  folder : target_folder,
  //  meta_s3key : meta.meta_s3key //?
  //};


  //// put file content to s3
  //bucket.copy_object(meta.storage.key, meta.storage.key, function(err,data){
  //  if(err){
  //    //log28('put file to s3 ERR', [s3key, file]);
  //    console.log('put file to s3 ERR', [s3key, file]);
  //    return callback(err, null);
  //  }
  //  fs.unlink(file.path);
  //  // put information to .new/user-name/...
  //  bucket.write_json(meta.meta_s3key, meta, function(err, reply){
  //    if(err){
  //      return callback(err, null);
  //    }
  //    task.pub_task(task.channel, job, callback);
  //  });
  //});

}


function send_file(path_uuid, acceptor, to_path, callback){
  var folder_path = path.dirname (path_uuid);
  var uuid        = path.basename(path_uuid);

  var Folder;
  folder_module.retrieve_folder(folder_path).then(function(folder){
    Folder = folder;
    //p ('got folder', folder);
    Folder.uuid_to_file_obj(uuid, function(err, file){
      //p('got file:\n', file);
      var src_meta = file.get_meta();
      //p('got file meta:\n', src_meta);
      var task_meta = prepare_meta(src_meta, acceptor, to_path);
      p('got task meta:\n', task_meta);
      send_out_meta(src_meta, task_meta, callback);
      //callback(null,null);
    });
  });
}

module.exports.copy_file = copy_file;
module.exports.send_message = send_message;

// new in 0116
module.exports.send_file = send_file;

// -- checkings -- //

function test_sender(){
  var src_folder_path = 'tmpab';
  var src_file_name   = 'txt-11';

  var to_folder       = 'abc/public';
  var acceptor        = 'abc';

  folder_module.retrieve_folder(src_folder_path).then(function(folder){
    //p('In test sender, got folder:\n', folder);
    var uuids = folder.get_uuids(src_file_name);
    //p(uuids);
    folder.get_one_file_obj(src_file_name, function(err, file){
      //p('got file:\n', file);
      var file_meta = file.get_meta();
      //p('got file meta:\n', file_meta);
      var path_uuid = path.join(file_meta.dir, file_meta.uuid);
      //p('got file path uuid:\n', path_uuid);

      // start test it
      send_file(path_uuid, acceptor, to_folder, function(err, res){
        p('In test send file, err, res:\n', err, res);
        ttool.stop();
      });
    });
  });
}



if(require.main === module){
  //test_copy_file();
  test_sender();
}

// vim: set et ts=2 sw=2 fdm=indent:
