// Generated by CoffeeScript 1.8.0
(function() {
  var Promise, async, check_delete_name, check_details, check_get_uuids, check_to_get_folder, clear_names, delete_a_few_files, delete_a_file, delete_a_file_by_uuid, fm, folder_name, fs, get_file_objs, give_list, names, p, read_a_few_files_by_name, stop, test_read_write, test_uuids, u, util, write_a_text_file;

  u = require("underscore");

  fs = require("fs");

  Promise = require("bluebird");

  async = require("async");

  util = require("util");

  fm = require("./folder-v5.js");

  p = console.log;

  stop = function() {
    return setTimeout(process.exit, 500);
  };

  folder_name = 'abc';

  test_uuids = ['6b550755-bf26-42f3-a081-586e5b867bb9', 'af480243-fc91-402e-a35d-f7e2cd48ca82'];

  names = ['tone2', 'txt9', 'txt19', 'ttwo-2'];

  check_to_get_folder = function() {
    return fm.retrieve_folder(folder_name).then(function(folder) {
      var meta;
      p(folder);
      return meta = folder.get_meta();
    }).then(stop)["catch"](function(err) {
      p('e r r: ', err);
      return stop();
    });
  };

  check_get_uuids = function() {
    var meta, name, obj;
    name = "tone2";
    name = "ttwo-2";
    obj = null;
    meta = null;
    return fm.retrieve_folder(folder_name).then(function(obj_) {
      obj = obj_;
      return obj.promise_to_retrieve_saved_meta();
    }).then(function(meta_) {
      meta = meta_;
      p('meta: ', meta);
      return obj;
    }).then(function(folder) {
      var uuids;
      uuids = folder.get_uuids(name);
      return p("uuids : \n", uuids);
    }).then(stop);
  };

  get_file_objs = function() {
    var name;
    name = "tone2";
    return fm.retrieve_folder(folder_name).then(function(folder) {
      return folder.get_file_objs_by_name(name, function(err, objs) {
        return u.each(objs, function(o) {
          return p(o.get_meta()['name'], o.get_meta()['uuid']);
        });
      });
    })["catch"](function(err) {
      return p(err);
    }).then(stop);
  };

  check_details = function() {
    var Folder, Meta;
    Meta = null;
    Folder = null;
    return fm.retrieve_folder(folder_name).then(function(folder) {
      var files, k, v, _results;
      Meta = folder.get_meta();
      files = Meta.files;
      _results = [];
      for (k in files) {
        v = files[k];
        if (v.name === 'goodagood') {
          p(k);
          _results.push(p(v));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }).then(stop);
  };

  clear_names = function() {
    return fm.retrieve_folder(folder_name).then(function(folder) {
      return folder.promise_to_clear_empty_names();
    }).then(p('cleared?'), stop())["catch"](function(err) {
      p('err in clear name: ', err);
      return stop();
    });
  };

  delete_a_file_by_uuid = function() {
    var uuid;
    uuid = test_uuids[0];
    return fm.retrieve_folder(folder_name).then(function(folder) {
      return folder.promise_to_delete_uuid(uuid).then(function(what) {
        return p("what ", what);
      });
    }).then(stop)["catch"](function(err) {
      p('err when delete a file by uuid: ', err);
      return stop();
    });
  };

  read_a_few_files_by_name = function() {
    var name;
    name = 'ttwo-2';
    name = 'txt19';
    return fm.retrieve_folder(folder_name).then(function(folder) {
      return folder.read_files_by_name(name);
    }).then(function(arr_str) {
      return p(arr_str);
    }).then(stop)["catch"](function(err) {
      p("err in read a file by name checking", err);
      return stop;
    });
  };

  write_a_text_file = function() {
    var F, name;
    name = 'txt9';
    F = null;
    return fm.retrieve_folder(folder_name).then(function(folder) {
      F = folder;
      return folder.write_text_file(name, "i am check to write : \nwrite a text file\nabc \n new line\n 19");
    }).then(stop)["catch"](function(err) {
      p('err in write a text file: ', err);
      return stop();
    });
  };

  test_read_write = function() {
    var Folder, file_name;
    file_name = 'tone3';
    Folder = null;
    return fm.retrieve_folder(folder_name).then(function(f) {
      Folder = f;
      return Folder.write_text_file(file_name, "-- how many checking?: \nwrite a text file...\nnew line\n 1119");
    }).then(function(results_from_writting) {
      return p("results_from_writting " + results_from_writting, results_from_writting);
    }).then(function() {
      var sleep;
      sleep = 15;
      p("sleep: " + sleep + " seconds");
      return new Promise(function(resolve) {
        var foo;
        foo = function() {
          return resolve(1);
        };
        return setTimeout(foo, sleep * 1000);
      });
    }).then(function() {
      return fm.retrieve_folder(folder_name);
    }).then(function(f) {
      Folder = f;
      return p('folder reget: ', Folder);
    }).then(function() {
      return stop();
    })["catch"](function(err) {
      p('fuck, i caught you', err);
      return stop();
    });
  };

  delete_a_file = function() {
    var name;
    name = "txt19";
    name = "cat_music.gif";
    p("name: " + name);
    return fm.retrieve_folder(folder_name).then(function(folder) {
      if (folder != null) {
        p('folder is not false');
      }
      return folder.delete_file(name, function(e, r) {
        return p('e,r: ', e, r);
      });
    }).then(stop)["catch"](function(err) {
      p('err in delete a file: ', err);
      return stop();
    });
  };

  delete_a_few_files = function() {
    names = ['tone2', 'txt9', 'txt23', 'txt28', 'ttwo-2'];
    return fm.retrieve_folder(folder_name).then(function(folder) {
      var err, n, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = names.length; _i < _len; _i++) {
        n = names[_i];
        try {
          _results.push(folder.delete_name(n).then(function(what) {
            return p("deleted " + n + " ", what);
          }));
        } catch (_error) {
          err = _error;
          p("E, delete a few ? here name: " + n + " ", err);
          _results.push("fuck..");
        }
      }
      return _results;
    }).then(stop);
  };

  check_delete_name = function() {
    var name;
    name = "ttwo-2";
    return fm.retrieve_folder(folder_name).then(function(folder) {
      return folder.delete_name(name).then(function(what) {
        p(what);
        return p("deleted? " + name);
      });
    }).then(stop);
  };

  give_list = function() {
    var username;
    username = folder_name;
    return fm.retrieve_folder(folder_name).then(function(folder) {
      var promise_give;
      promise_give = Promise.promisify(folder.give_ul_renderring);
      return promise_give(username).then(function(what) {
        p('u get what?');
        return p(what);
      });
    }).then(stop);
  };

  check_to_get_folder();

}).call(this);
