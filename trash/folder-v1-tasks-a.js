// Generated by CoffeeScript 1.8.0
(function() {
  var afile, argv, bucket, checking, do_some_stupid, fappend, folder_meta_show, folder_meta_without_array_of_names, read_json_from_s3, s3folder, show_folder_meta, show_meta, tools, u;

  u = require('underscore');

  argv = require("yargs").argv;

  bucket = require('./bucket.js');

  s3folder = require('./folder-v1.js');

  tools = require('./tools-cof.js');

  fappend = require('../myutils/mylogb.js').append_file;

  afile = '/tmp/a9.log';

  show_folder_meta = function(folder_path, callback) {
    return s3folder.retrieve_folder(folder_path, function(err, folder) {
      var meta;
      meta = folder.get_meta();
      console.log(err, meta);
      return callback();
    });
  };

  read_json_from_s3 = function(s3key, callback) {
    return bucket.read_json(s3key, function(err, obj) {
      console.log(err, obj);
      return callback();
    });
  };

  folder_meta_without_array_of_names = function(folder_path, name_array, callback) {
    if (!u.isArray(name_array)) {
      console.log('NOT ARRAY');
      return null;
    }
    return s3folder.retrieve_folder(folder_path, function(err, folder_obj) {
      var folder_meta, name, _i, _len;
      if (err) {
        callback(err, null);
      }
      folder_meta = folder_obj.get_meta();
      for (_i = 0, _len = name_array.length; _i < _len; _i++) {
        name = name_array[_i];
        if (folder_meta[name] !== 'undefined') {
          delete folder_meta[name];
        }
      }
      return callback(null, folder_meta);
    });
  };

  folder_meta_show = function(folder_path, name_array, callback) {
    if (!u.isArray(name_array)) {
      console.log('NOT ARRAY: ' + name_array);
      return null;
    }
    return s3folder.retrieve_folder(folder_path, function(err, folder_obj) {
      var folder_meta, name, to_show, _i, _len;
      folder_meta = folder_obj.get_meta();
      to_show = {};
      for (_i = 0, _len = name_array.length; _i < _len; _i++) {
        name = name_array[_i];
        if (folder_meta[name] !== 'undefined') {
          to_show[name] = folder_meta[name];
        }
      }
      if (callback) {
        return callback(to_show);
      }
    });
  };


  /*
  exit = (time) ->
      time = time || 500
      console.log "\n --- goint to exit at #{time}"
      setTimeout(process.exit, time)
   */

  show_meta = (function(what) {});

  do_some_stupid = function(what) {
    console.log("Can not understand the command: " + what + "\n");
    return tools.exit();
  };

  checking = function() {
    var cmd, folder_path, key;
    cmd = argv.cmd;
    folder_path = argv['folder-path'];
    key = argv.key;
    switch (cmd) {
      case 'show-folder-meta':
        return show_folder_meta(folder_path, tools.exit);
      case 'read-json-from-s3':
        return read_json_from_s3(key, tools.exit);
      default:
        return do_some_stupid(cmd);
    }
  };

  if (require.main === module) {

    /*
    folder_meta_without_array_of_names 'abc',
        [ 'file_uuids', 'renders'],
        (err, _meta) ->
            console.log err, _meta
            tools.exit(88)
     */
    folder_meta_show('abc', ['file_uuids', 'renders'], function(err, _meta) {
      console.log(err, _meta);
      return tools.exit(88);
    });
  }


  /*
   */

}).call(this);
