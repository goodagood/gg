var path     = require('path');
var U        = require('underscore');

var myconfig =   require("../config/config.js");
var bucket   = require('./bucket.js');


//var redis_host = myconfig.redis_host;
//var redis_port = myconfig.redis_port;
var secrets = require("../config/secret-dir.js");
var redis_host = secrets.conf.redis.redis_host;
var redis_port = secrets.conf.redis.redis_port;



var redis      = require("redis");
var client     = redis.createClient(redis_port, redis_host);

var avatar   = require('../users/avatar.js');
//var s3folder = require('./folder-v1.js'); // upgrade?
  var s3folder = require('./folder-v5.js');

//var s3file   = require('./file.js');
//var s3file   = require('./simple-file.js');
var s3file_type   = require('./s3-file-types.js');

var fs = require('fs');

var p  = console.log

//?
function list_new_meta_data(username, callback){
  var prefix = path.join(username, myconfig.new_meta_folder);
  bucket.list(prefix, function(err, file_list){
    //console.log('file list: ', file_list);
    if(err) console.log(err, file_list);
    U.each(file_list, function(data){
      var key = data.Key;
      //if(key === prefix) return; // prefix is not what we want.
      if(path.basename(key) === path.basename(prefix)) return; // prefix is not what we want.
      fs.appendFile('/tmp/abcnew', key + "  \n");
      //console.log('key: ', key);
      bucket.read_json(key, function(err, j){
        //console.log('read json key: ', key);
        if(err){
          callback(err, null, key);
          return console.log('err, bucket.read json, key, err: ', key, err);
        }
        //console.log('come');
        //console.log(key, j);
        if (callback) callback(null, j, key);
      });
    });
  });
}

function _collect_all_new_files(username){
  list_new_meta_data(username, function(err, meta, s3key){
    if(err) console.log('err in collect all new files: ', err);
    _collect_meta_file(meta, function(err, rep){
      if(err) return console.log(err, rep);
      bucket.delete_object(s3key, function(s3err, s3reply){
        if(!s3err) console.log('it deleted ', s3key);
      });
    });
  });
}

//
// abc/goodagood/.new/0bdd3e73-7df1-4398-822c-8248ffa5516d  
// abc/goodagood/.new/bc082a5b-9156-4a2a-8d9d-4c4b54692afe  
//

function _collect_one_meta_key(s3key){
  s3key =  s3key || 'abc/goodagood/.new/82cc923e-53de-477b-a8d6-36aba71e56eb';
  bucket.read_json(s3key, function(err, j){
    //console.log('read json key: ', key);
    if(err){
      return console.log('err, bucket.read json, key, err is: ', s3key, err);
    }
    console.log(s3key, j);
    _collect_meta_file(j, function(err, user){
      console.log('after collect one meta, user is: ', user);
      bucket.delete_object(s3key, function(s3err, s3reply){
        console.log('it deleted');
      });
    });
  });
}


function _collect_meta_file(meta, callback){

  var folder_path = path.dirname(meta.path);
  var username    = meta.owner;

  s3file_type.file_obj_from_meta(meta, function(err, file_obj){
  //_build_file_obj(meta, function(err, file_obj)
    if(err) return callback(err, null);
    var file_meta = file_obj.get_meta();
    //console.log('file meta: ', file_meta);

    _insert_to_file_list(folder_path, file_meta, function(err, folder_obj){
      if (err) return callback(err, null);
      _add_file_the_old_way(username, file_meta, folder_path, folder_obj, function(err, user){
        if (err) return callback(err, null);
        callback(null, user);
      });
    });
  });
}


function check_new_file_meta(job_json){
  // When new file put to s3, and a task published in 'tasks' channel.
  // This check in the meta, and put file data in folder.

  if(job_json.name !== "new-file-meta") return;
  console.log("job json: ", job_json); //-

  // The 'id' is the 'key' of task in redis, and it's the lock
  // It is set in 'job.js'.
  var job_id = job_json.id;

  // currently, the job_json.meta_s3key is the new meta in .new/user-name...
  bucket.read_json(job_json.meta_s3key, function(err, meta){
      console.log("read the NEW file meta:"); //-
      console.log(err, meta); //-
      if(err) return err;

      write_down_job_and_meta(job_json, meta, '/tmp/s448', function(){});
      // leave out For testing, 1203
      collect_one_file(job_json, meta, function(err){
        if(err) return console.log('ERR ERR:', err);
        console.log('finished: ', job_json);
      });
  });
}

function write_down_job_and_meta(job, meta, fpath, callback){
  // Used in testing, keep the information of job(task), meta
  console.log(' --- in write down job and meta, it supposed to stop and check');
  fpath = fpath || '/tmp/jm' + Date.now().toString();
  var text = "job\n"
  text += JSON.stringify(job, null, 4);
  text += "\n\nmeta\n"
  text += JSON.stringify(meta, null, 4);
  fs.writeFile(fpath, text, callback);
}

function collect_one_file(job, meta, callback){
  // @job : json of task
  // @meta: simple meta of the new file, by uploading.
  //  meta.meta_s3key is `new` meta when passed in, it need change.

  var folder_path = job.folder;
  var username    = job.username;

  s3file_type.file_obj_from_meta(meta, function(err, file_obj){
    if(err) return callback(err, null);
    var file_meta = file_obj.get_meta();
    //console.log('file meta in collect one file, 1 \n', file_meta);

    s3folder.retrieve_folder(folder_path).then(
      function (folder_obj){
        if(!folder_obj) return callback('not folder object', null);
        //console.log('folder meta in collect one : \n', folder_obj.get_meta());
        //p('should go to the old way');
        _add_file_the_old_way(username, file_meta, folder_path, folder_obj, function(err, user){
          if (err) return callback(err, null);
          _delete_task_tmp_meta(job.meta_s3key, job.id, function(err){
            if (err) return callback(err, null);
            if (callback) return callback(err, folder_obj);
          });
        });
      }
    );
  });
}


//d
//function _build_file_obj(meta_in, callback){
//  s3file.new_file_obj_from_meta(meta_in, function(err, file_obj){
//    if(err) return log28('err when make new  file_obj from meta');
//    //console.log('build file obj, file : ', file_obj.get_meta());
//    //file_obj.render_html_repr();
//    //file_obj.save_meta_file(function(err, reply){
//    //  callback(err, file_obj);
//    //});
//  });
//}

function _insert_to_file_list(folder_path, file_meta, callback){
  s3folder.retrieve_folder(folder_path, function(folder){
    if(!folder) return callback('err', null);
    folder.add_file_to_redis_list(file_meta, function(err, reply){
      console.log('add file to redis list');
      callback(err, folder);
    });
  });
}

function _add_file_the_old_way(username, file_meta, folder_path, folder_obj, callback ){
  avatar.make_user_obj(username, function(user){
    //p(' -- in the old way, username: ', username);
    //p('arguments: ', arguments);
    //p('user attr: ', user.pass_attr(function(){}));
    //p('user object: ', user);
    p('show flags: ', user.show_flags(function(){}));
    user.flag_up(folder_path, function(ok, flag_down){
      p('ok? ', ok);
      if(ok){
        p('flag up OK');
        folder_obj.add_file_save_folder(file_meta, function(err, _meta){
          flag_down(function(err, reply){
            callback(err, user);
          });
        });
      }
    });
  });
}

function _delete_task_tmp_meta(meta_s3key, job_id, callback){
  bucket.delete_object(meta_s3key, function(s3err, s3reply){
    //console.log('deleted meta file in .new', meta_s3key);
    client.del(job_id, function(redis_err, redis_reply){
      //console.log('deleted redis task rec', job_id);
      if (s3err) return callback(s3err);
      if (redis_err) return callback(redis_err);
      callback(null);
    });
  });
}

function do_all_tasks(){
  client.keys('task.a*', function(err, reply){
    //console.log(err, reply);
    //fs.writeFile('/tmp/tl', reply.join('\n'));
    if(err) return err;
    U.each(reply, function(key){
      console.log('key  ', key);
      test_collect_one(key);

    });
  });
}


function test_collect_one(key){
  // task records in redis is simple string by JSON.stringify
  key = key || 'task.a.7101b570-a8ac-4e3b-a762-b53154d1c0fb';
  client.hgetall(key, function(err, hash){
    //console.log(err, hash);
    if(err) return err;
    check_new_file_meta(hash);
  });
}

function check_meta(){
  var s3key = 'abc/goodagood/.new/';
  bucket.read_json(s3key, function(err, meta){
      //console.log("read the file meta:");
      console.log(err, meta);
      if(err) return err;
      //collect_one_file(job_json, meta);
  });
}

function something_test(jobjson){
  console.log("jobjson: ", jobjson);
}



if(require.main === module){
  //list_new_meta_data('abc');
  //check_meta();

  //_collect_one_meta_key();
  //_collect_all_new_files('abc');

  do_all_tasks();
  //test_collect_one();
  setTimeout(function(){process.exit();}, 5000);
}

module.exports.check_new_file_meta = check_new_file_meta;
module.exports.collect_one_file = collect_one_file;

module.exports.add_file_the_old_way = _add_file_the_old_way;
module.exports.something_test = something_test;

// vim: set et ts=2 sw=2 fdm=indent:
