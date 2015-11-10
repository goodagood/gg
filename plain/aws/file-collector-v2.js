// Generated by CoffeeScript 1.8.0
(function() {
  var async, avatar, bucket, check_collect_one, check_new_config_file, check_new_file_meta, check_new_meta, check_new_metas, check_retrieve_the_folder, check_the_err, client, collect_meta, collect_new_file_meta, collect_one_file, collect_redis, delete_redis_key, delete_task_tmp_meta, do_all_tasks, do_s3_job, do_s3_jobs, ends_with, fs, job2, list_new_meta_data, meta2, myconfig, p, path, pubsub, redis, redis_host, redis_port, s3file_type, s3folder, secrets, something_test, stop, test_collect_one, ttools, u, update, util, write_down_job_and_meta, _add_file_the_old_way, _collect_all_new_files, _collect_meta_file, _collect_one_meta_key, _insert_to_file_list,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  path = require("path");

  async = require("async");

  u = require("underscore");

  util = require('util');

  fs = require("fs");

  bucket = require("./bucket.js");

  pubsub = require("../myutils/pubsub.js");

  myconfig = require("../config/config.js");

  secrets = require("../config/secret-dir.js");

  redis_host = secrets.conf.redis.redis_host;

  redis_port = secrets.conf.redis.redis_port;

  redis = require("redis");

  client = redis.createClient(redis_port, redis_host);

  avatar = require("../users/avatar.js");

  s3folder = require("./folder-v5.js");

  s3file_type = require("./s3-file-types.js");

  update = require("./file-update.js");

  ttools = require('../myutils/test-util.js');

  p = console.log;

  collect_one_file = function(job, meta, callback) {
    var filename, folder_path;
    folder_path = meta['dir'];
    filename = meta.name;
    return s3folder.retrieve_folder(folder_path).then(function(folder_obj) {
      if (!folder_obj) {
        return callback("not folder object", null);
      }
      if (!folder_obj.file_exists(filename)) {
        p('do the normal job, when file not exists', meta);
        return collect_new_file_meta(meta, callback);
      }
      p('check 2, file id.. by uuid ', u.isFunction(folder_obj.file_identified_by_uuid));
      if (folder_obj.file_identified_by_uuid()) {
        return collect_new_file_meta(meta, callback);
      }
      p('# This would be the default behavior, update file is exists.');
      return update.update_file(meta, function(err, what) {
        if (err) {
          return callback(err);
        }
        p('going to rm task data');
        return delete_task_tmp_meta(meta.new_meta_s3key, meta.redis_task_id, callback);
      });
    })["catch"](callback);
  };

  collect_new_file_meta = function(file_meta, callback) {
    var folder_path, new_file_meta_s3key, redis_task_id;
    folder_path = file_meta['dir'];
    new_file_meta_s3key = file_meta.new_meta_s3key;
    redis_task_id = file_meta.redis_task_id;
    delete file_meta.new_meta_s3key;
    delete file_meta.redis_task_id;
    return s3file_type.file_obj_from_meta(file_meta, function(err, file_obj) {
      if (err || !file_obj) {
        return callback(err, null);
      }
      return file_obj.save_file_to_folder().then(function(what) {
        return delete_task_tmp_meta(new_file_meta_s3key, redis_task_id, callback);
      })["catch"](callback);
    });
  };

  collect_meta = function(meta, callback) {
    var folder_path, key, username;
    folder_path = path.dirname(meta.path);
    p(0.1, ' collect meta ', meta);
    if (meta.meta_s3key != null) {
      key = meta.meta_s3key;
    }
    if (meta.initial_key != null) {
      key = meta.initial_key;
    }
    if (meta.new_meta_s3key != null) {
      key = meta.new_meta_s3key;
    }
    username = meta.owner;
    if (folder_path === '.') {
      folder_path = username;
    }
    return s3file_type.file_obj_from_meta(meta, function(err, file_obj) {
      var file_meta;
      if (err) {
        return callback(err, null);
      }
      file_meta = file_obj.get_meta();
      p('folder_path, key, username: ', folder_path, key, username);
      return s3folder.retrieve_folder(folder_path).then(function(folder_obj) {
        if (!folder_obj) {
          return callback("not folder object", null);
        }
        delete file_meta.initial_key;
        delete file_meta.meta_s3key;
        delete file_meta.s3key;
        delete file_meta.Meta_s3key;
        return _add_file_the_old_way(username, file_meta, folder_path, folder_obj, function(err, user) {
          if (err) {
            return callback(err, user);
          }
          p('going to deleting, the meta only, 02 07 2:11pm ');
          return bucket.delete_object(key, function(s3err, s3reply) {
            if (s3err) {
              return callback(s3err, s3reply);
            }
            return callback(null, file_obj);
          });
        });
      });
    });
  };

  collect_redis = function(callback) {
    return pubsub.find_one_task(-1, function(err, task_json) {
      var s3key, task_id;
      if (err) {
        return callback(err, task_json);
      }
      task_id = task_json.task_id;
      s3key = task_json.meta_s3key;
      if (task_json.new_meta_s3key) {
        s3key = task_json.new_meta_s3key;
      }
      if ((s3key == null) || !s3key) {
        return callback('NO S3KEY? what fuck in collect redis', null);
      }
      return bucket.s3_object_exists(s3key, function(err, s3check) {
        if (err) {
          delete_redis_key(task_id, function(redis_err, redis_reply) {
            return callback([err, redis_err], [s3check, redis_reply]);
          });
        }
        if ((s3check.LastModified != null)) {
          return bucket.read_json(s3key, function(err, meta_) {
            if (err) {
              return callback(err, meta_);
            }
            if (meta_.name == null) {
              return callback('meta_.name not exists? in: collect redis', null);
            }
            return collect_meta(meta_, function(err, file_obj) {
              if (err) {
                p('err in collect redis, 0207');
                return callback(err, file_obj);
              }
              return client.del(task_id, callback);
            });
          });
        } else {
          p('delete redis record any way', task_id);
          return client.del(task_id, callback);
        }
      });
    });
  };

  delete_redis_key = function(key, callback) {
    p('delete redis key: ', key);
    return client.del(key, callback);
  };

  _collect_all_new_files = function(username) {
    return list_new_meta_data(username, function(err, meta, s3key) {
      if (err) {
        console.log("err in collect all new files: ", err);
      }
      return _collect_meta_file(meta, function(err, rep) {
        if (err) {
          return console.log(err, rep);
        }
        return bucket.delete_object(s3key, function(s3err, s3reply) {
          if (!s3err) {
            return console.log("it deleted ", s3key);
          }
        });
      });
    });
  };

  _collect_one_meta_key = function(s3key) {
    s3key = s3key || "abc/goodagood/.new/82cc923e-53de-477b-a8d6-36aba71e56eb";
    return bucket.read_json(s3key, function(err, j) {
      if (err) {
        return console.log("err, bucket.read json, key, err is: ", s3key, err);
      }
      console.log(s3key, j);
      return _collect_meta_file(j, function(err, user) {
        console.log("after collect one meta, user is: ", user);
        return bucket.delete_object(s3key, function(s3err, s3reply) {
          return console.log("it deleted");
        });
      });
    });
  };

  _collect_meta_file = function(meta, callback) {
    var folder_path, username;
    folder_path = path.dirname(meta.path);
    username = meta.owner;
    return s3file_type.file_obj_from_meta(meta, function(err, file_obj) {
      var file_meta;
      if (err) {
        return callback(err, null);
      }
      file_meta = file_obj.get_meta();
      return _insert_to_file_list(folder_path, file_meta, function(err, folder_obj) {
        if (err) {
          return callback(err, null);
        }
        return _add_file_the_old_way(username, file_meta, folder_path, folder_obj, function(err, user) {
          if (err) {
            return callback(err, null);
          }
          return callback(null, user);
        });
      });
    });
  };

  check_new_file_meta = function(job_json, callback) {
    if (job_json.name !== "new-file-meta") {
      return;
    }
    console.log("job json: ", job_json, ' in check new file meta');
    return bucket.read_json(job_json.new_meta_s3key, function(err, meta) {
      console.log(err, meta, ' read json in check new file meta');
      if (err) {
        return err;
      }
      console.log('going to collect one: ');
      return collect_one_file(job_json, meta, function(err, what) {
        if (err) {
          return console.log('ERR ERR, in "check new file meta":', err);
        }
        console.log('finished: ', job_json.folder);
        return callback(err, what);
      });
    });
  };

  write_down_job_and_meta = function(job, meta, fpath, callback) {
    var text;
    console.log(" --- in write down job and meta, it supposed to stop and check");
    fpath = fpath || "/tmp/jm" + Date.now().toString();
    text = "job\n";
    text += JSON.stringify(job, null, 4);
    text += "\n\nmeta\n";
    text += JSON.stringify(meta, null, 4);
    return fs.appendFile(fpath, text, callback);
  };

  _insert_to_file_list = function(folder_path, file_meta, callback) {
    return s3folder.retrieve_folder(folder_path, function(folder) {
      if (!folder) {
        return callback("err", null);
      }
      return folder.add_file_to_redis_list(file_meta, function(err, reply) {
        console.log("add file to redis list");
        return callback(err, folder);
      });
    });
  };

  _add_file_the_old_way = function(username, file_meta, folder_path, folder_obj, callback) {
    return avatar.make_user_obj(username, function(user) {
      return user.flag_up(folder_path, function(ok, flag_down) {
        var err;
        if (ok) {
          p("flag up OK");
          return folder_obj.add_file_save_folder(file_meta, function(err, _meta) {
            return flag_down(function(err, reply) {
              return callback(err, user);
            });
          });
        } else {
          err = 'flag up NOT ok, do something, the file not collected.\n' + file_meta.path + '\n' + username;
          return callback(err, null);
        }
      });
    });
  };

  delete_task_tmp_meta = function(s3key, job_id, callback) {
    return bucket.delete_object(s3key, function(s3err, s3reply) {
      console.log('deleted meta file in coll. 2 0927 ', s3key);
      return client.del(job_id, function(redis_err, redis_reply) {
        console.log('deleted redis task rec', job_id);
        if (s3err) {
          return callback(s3err);
        }
        if (redis_err) {
          return callback(redis_err);
        }
        return callback(null);
      });
    });
  };

  do_all_tasks = function() {
    return client.keys("task.a*", function(err, reply) {
      if (err) {
        return err;
      }
      return u.each(reply, function(key) {
        console.log("key    ", key);
        return test_collect_one(key);
      });
    });
  };

  test_collect_one = function(key) {
    key = key || "task.a.7101b570-a8ac-4e3b-a762-b53154d1c0fb";
    return client.hgetall(key, function(err, hash) {
      if (err) {
        return err;
      }
      return check_new_file_meta(hash);
    });
  };

  something_test = function(jobjson) {
    return console.log("jobjson: ", jobjson);
  };

  list_new_meta_data = function(username, callback) {
    var prefix;
    if (username) {
      prefix = path.join(myconfig.new_meta_prefix, username);
    } else {
      prefix = myconfig.new_meta_prefix;
    }
    return bucket.list(prefix, function(err, file_list) {
      if (err) {
        return callback(err, file_list);
      }
      if (callback) {
        return callback(err, file_list);
      }
    });
  };

  do_s3_job = function(s3_info, callback) {
    var s3key;
    s3key = s3_info.Key;
    return bucket.read_json(s3key, function(err, meta) {
      if (err) {
        console.log('bucket read json err:', err, meta);
      }
      if (err) {
        return callback(err, meta);
      }
      console.log('going to "collect meta":\n', meta);
      return collect_meta(meta, callback);
    });
  };

  do_s3_jobs = function(username, callback) {
    var milli;
    milli = 5000;
    return list_new_meta_data(username, function(err, list) {
      var functions;
      if (err) {
        return p("fuck, work in finish...");
      }
      functions = [];
      u.each(list, function(item) {
        return functions.push(function(cb) {
          return do_s3_job(item, function(err, f) {
            var remember;
            p("done s3 job:", item.Key);
            remember = function() {
              return cb(err, item.Key);
            };
            return setTimeout(remember, milli);
          });
        });
      });
      if (functions.length < 1) {
        callback(null, ['no thing to do']);
      }
      return async.series(functions, callback);
    });
  };

  module.exports.check_new_file_meta = check_new_file_meta;

  module.exports.collect_one_file = collect_one_file;

  module.exports.add_file_the_old_way = _add_file_the_old_way;

  module.exports.something_test = something_test;

  module.exports.collect_meta = collect_meta;

  module.exports.collect_redis = collect_redis;

  module.exports.list_new_meta_data = list_new_meta_data;

  module.exports.do_s3_job = do_s3_job;

  module.exports.do_s3_jobs = do_s3_jobs;

  module.exports.delete_task_tmp_meta = delete_task_tmp_meta;

  job2 = {
    "name": "new-file-meta",
    "task_name": "new-file-meta",
    "username": "abc",
    "folder": "abc/goodagood",
    "meta_s3key": ".gg.new/abc/goodagood/a5437410-2d5a-4bb7-b860-ecfe5fe8b400",
    "id": "task.a.efbd43a5-7381-40d6-88ed-ed0b6ddab2df",
    "task_id": "task.a.efbd43a5-7381-40d6-88ed-ed0b6ddab2df"
  };

  meta2 = {
    "name": ".gg.people.v1.json",
    "path": "abc/goodagood/.gg.people.v1.json",
    "size": 112,
    "owner": "abc",
    "dir": "abc/goodagood",
    "timestamp": 1418877986342,
    "uuid": "a5437410-2d5a-4bb7-b860-ecfe5fe8b400",
    "meta_s3key": ".gg.new/abc/goodagood/a5437410-2d5a-4bb7-b860-ecfe5fe8b400",
    "initial_key": ".gg.new/abc/goodagood/a5437410-2d5a-4bb7-b860-ecfe5fe8b400",
    "s3key": ".gg.file/abc/goodagood/a5437410-2d5a-4bb7-b860-ecfe5fe8b400",
    "storage": {
      "type": "s3",
      "key": ".gg.file/abc/goodagood/a5437410-2d5a-4bb7-b860-ecfe5fe8b400"
    }
  };

  stop = function(seconds) {
    var milli;
    seconds = seconds || 0.5;
    milli = seconds * 1000;
    return setTimeout(process.exit, milli);
  };

  check_collect_one = function() {
    return collect_one_file(job2, meta2, function(err, folder) {
      p('check collect one: \n', err, folder);
      return stop(15);
    });
  };

  check_retrieve_the_folder = function(folder_path) {
    folder_path = folder_path || 'abc/goodagood';
    return s3folder.retrieve_folder(folder_path).then(function(folder_obj) {
      var meta;
      p('is object? : ', u.isObject(folder_obj));
      meta = folder_obj.get_meta();
      p(meta);
      return stop();
    });
  };

  ends_with = function(str, part) {
    return str.slice(-part.length) === part;
  };

  check_new_meta = function(username) {
    var prefix;
    prefix = path.join(myconfig.new_meta_prefix, username);
    return bucket.list(prefix, function(err, file_list) {
      if (err) {
        return console.log('err: ', err);
      }
      console.log('got file list');
      u.each(file_list, function(data) {
        var key, omits, trues;
        key = data.Key;
        omits = ['tmpab', 'goodagood', '/'];
        trues = omits.map(function(omit) {
          return ends_with(key, omit);
        });
        if (__indexOf.call(trues, true) >= 0) {
          return console.log('return for key: ', key);
        }
        if (path.basename(key) === path.basename(prefix)) {
          return;
        }
        fs.appendFile("/tmp/tmpabnew", key + "    \n");
        return bucket.read_json(key, function(err, j) {
          if (err) {
            return console.log("err, bucket.read json, key, err: ", key, err);
          }
          console.log(key, j.name, j.path);
          return fs.appendFile("/tmp/tmpabnew", util.inspect(j, {
            depth: null
          }) + "\n\n");
        });
      });
      return ttools.stop(30);
    });
  };

  check_new_metas = function() {
    return list_new_meta_data(null, function(err, file_list) {
      var funs;
      p('err, file list: ', err, file_list);
      funs = u.map(file_list, function(s3info) {
        return function(callback) {
          return do_s3_job(s3info, callback);
        };
      });
      return async.series(funs, function(err, what) {
        return ttools.stop();
      });
    });
  };

  check_the_err = function() {
    return list_new_meta_data(null, function(err, file_list) {
      var f0;
      p('err, file list: ', err, file_list);
      f0 = file_list[0];
      return do_s3_job(f0, function(err, what) {
        p('do s3 job without s', err, what);
        return ttools.stop();
      });
    });
  };

  check_new_config_file = function() {
    p(redis_host);
    return p(redis_port);
  };

  if (require.main === module) {
    check_new_config_file();
  }

}).call(this);