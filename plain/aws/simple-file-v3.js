// Generated by CoffeeScript 1.8.0
(function() {
  var Promise, Web_file_info, async, bucket, check_meta_has_basics, fix_file_meta, folder_v5, ft, myconfig, myutil, new_file_obj_from_meta, new_plain_file, old, p, pass_meta_to_task, path, promise_to_make_old_simple_file_object, promised_new_plain_file, promised_simple_s3_file_obj, put_local_file, put_local_file_without_pass, simple_s3_file_obj, stop, task, test_file_name, test_folder_name, test_json_file_name, test_owner_name, u, util, write_a_text_file, write_text_file;

  u = require("underscore");

  Promise = require("bluebird");

  async = require("async");

  path = require("path");

  util = require("util");

  old = require("./simple-file.js");

  bucket = require("./bucket.js");

  folder_v5 = require("./folder-v5.js");

  myutil = require('../myutils/myutil.js');

  myconfig = require("../config/config.js");

  task = require('../myutils/job.js');

  ft = require('../myutils/filetype.js');

  p = console.log;

  Web_file_info = "/file-info/";

  promise_to_make_old_simple_file_object = Promise.promisify(old.simple_s3_file_obj);

  simple_s3_file_obj = function(meta_src, callback) {
    var Meta, Obj, build_file_info_list, build_util_list, calculate_delete_href, calculate_meta, calculate_meta_defaults, calculate_s3_stream_href, calculate_view_href, callback_file_auxiliary_path, callback_milli_uuid, clear_past_meta_store, convert_meta_to_ul, delete_s3_storage, file_uuid, get_client_json, get_complex_auxiliary_path, get_file_auxiliary_path, get_meta, get_owner_id, get_saved_meta, guess_owner, increase_value, isError, meta2s3, prepare_html_elements, promise_to_delete_s3_storage, promise_to_save_meta_file, read_file_to_buffer, read_stream, read_to_string, remove_storage, render_html_for_owner, render_html_for_viewer, render_html_repr, retrieve_meta, save_file_to_folder, save_meta_file, set_meta, update_meta, update_storage, update_storage_a, write_s3_storage, _build_ul, _keep;
    Meta = {};
    Obj = {};
    set_meta = function(_meta) {
      _meta = _meta || meta_src;
      return Meta = _meta;
    };
    isError = function() {
      return Meta.error;
    };
    guess_owner = function() {
      var guess;
      if (typeof Meta.owner === "string" || /^\s*$/.test(Meta.owner)) {
        return Meta.owner;
      }
      if (Meta.path) {
        guess = Meta.path.split("/")[0];
        if (typeof guess === "string" || /^\s*$/.test(guess)) {
          Meta.owner = guess;
          Meta.owner;
        }
      } else {
        guess = null;
      }
      return guess;
    };
    calculate_s3_stream_href = function() {
      var s3_stream_href;
      if (!Meta.storage) {
        return "";
      }
      if (!Meta.storage.key) {
        return "";
      }
      s3_stream_href = path.join(myconfig.s3_stream_prefix, Meta.storage.key);
      return s3_stream_href;
    };
    calculate_delete_href = function() {
      var delete_href;
      if (!Meta.path) {
        return;
      }
      delete_href = path.join("/del/", Meta.path_uuid);
      return delete_href;
    };
    calculate_view_href = function() {
      var view_href;
      if (!Meta.path) {
        return;
      }
      view_href = path.join("/viewtxt/", Meta.path_uuid);
      return view_href;
    };
    calculate_meta_defaults = function() {
      var Meta_s3key, necessaries;
      if (Meta == null) {
        p(' -- where the Meta go? in file obj');
      }
      if (typeof Meta.filetype !== "string") {
        Meta.filetype = ft.check_file_type_by_name(Meta.name);
      }
      if (!Meta.uuid) {
        Meta.uuid = myutil.get_uuid();
      }
      if (typeof Meta.owner !== "string") {
        Meta.owner = guess_owner();
      }
      if (typeof Meta.dir !== "string") {
        Meta.dir = path.dirname(Meta.path);
      }
      if (typeof Meta.path_uuid !== "string") {
        Meta.path_uuid = path.join(Meta.dir, Meta.uuid);
      }
      Meta_s3key = path.join(myconfig.file_meta_prefix, Meta.owner, Meta.uuid);
      Meta.Meta_s3key = Meta_s3key;
      Meta.file_meta_s3key = Meta_s3key;
      if (typeof Meta.s3_stream_href !== "string") {
        Meta.s3_stream_href = calculate_s3_stream_href();
      }
      if (typeof Meta.delete_href !== "string") {
        Meta.delete_href = calculate_delete_href();
      }
      if (typeof Meta.view_href !== "string") {
        Meta.view_href = calculate_view_href();
      }
      necessaries = {
        what: myconfig.IamFile,
        timestamp: Date.now(),
        permission: {
          owner: "rwx",
          group: "",
          other: ""
        },
        "file-types": [],
        storage: {},
        storages: [],
        html: {},
        value: {
          amount: 0,
          unit: "GG"
        }
      };
      return u.defaults(Meta, necessaries);
    };
    calculate_meta = function() {
      var Meta_s3key, m, necessaries;
      if (Meta == null) {
        p(' -- what the fuck Meta go? in file obj');
      }
      m = {
        path: Meta.path,
        name: Meta.name
      };
      if (Meta.uuid != null) {
        m.uuid = Meta.uuid;
      }
      m.filetype = ft.check_file_type_by_name(m.name);
      if (!m.uuid) {
        m.uuid = myutil.get_uuid();
      }
      m.owner = Meta.owner;
      if (typeof m.owner !== "string") {
        m.owner = guess_owner();
      }
      m.dir = path.dirname(m.path);
      m.path_uuid = path.join(m.dir, m.uuid);
      Meta.path_uuid = m.path_uuid;
      console.log('m\n', m, myconfig.file_meta_prefix);
      Meta_s3key = path.join(myconfig.file_meta_prefix, m.owner, m.uuid);
      m.Meta_s3key = Meta_s3key;
      m.file_meta_s3key = Meta_s3key;
      m.s3_stream_href = calculate_s3_stream_href();
      m.delete_href = calculate_delete_href();
      m.view_href = calculate_view_href();
      necessaries = {
        what: myconfig.IamFile,
        timestamp: Date.now(),
        permission: {
          owner: "rwx",
          group: "",
          other: ""
        },
        "file-types": [],
        storage: {},
        storages: [],
        html: {},
        value: {
          amount: 0,
          unit: "GG"
        }
      };
      u.defaults(m, necessaries);
      return m;
    };
    read_file_to_buffer = function(callback) {
      if (Meta.storage.type !== "s3") {
        return callback('it might NOT be s3 storage', null);
      }
      return bucket.read_data(Meta.storage.key, callback);
    };
    read_to_string = function(callback) {
      return bucket.read_to_string(Meta.storage.key, callback);
    };
    read_stream = function() {
      return bucket.s3_object_read_stream(Meta.storage.key);
    };
    write_s3_storage = function(content, callback) {
      return bucket.put_object(Meta.storage.key, content, function(err, aws_reply) {
        if (err) {
          return callback(err, aws_reply);
        }
        Meta.lastModifiedDate = Date.now();
        return callback(err, aws_reply);
      });
    };
    _keep = function(hash, names) {
      var name, _i, _len, _meta;
      if (u.isEmpty(names)) {
        return hash;
      }
      _meta = {};
      for (_i = 0, _len = names.length; _i < _len; _i++) {
        name = names[_i];
        _meta[name] = hash[name];
      }
      return _meta;
    };
    _build_ul = function(hash) {
      var ul;
      ul = "<ul> \n";
      u.each(hash, function(val, key) {
        var li;
        li = '<li class="key"> <span>' + key.toString() + "</span> : ";
        if (u.isArray(val)) {
          li += _build_ul(val);
        } else if (u.isObject(val)) {
          li += _build_ul(val);
        } else if (!val) {
          li += '<span class="value">' + (" " + val + " </span>");
        } else {
          li += '<span class="value">' + val.toString() + '</span>';
        }
        li += "</li>\n";
        return ul += li + "\n";
      });
      ul += "</ul>\n";
      return ul;
    };
    convert_meta_to_ul = function() {
      var attr_names, exclude, _show_meta;
      attr_names = ['name', 'path', 'owner', 'timestamp', 'size', 'permission'];
      exclude = ['uuid', 'html', 'storage', 'storages'];
      _show_meta = _keep(Meta, attr_names);
      return _build_ul(_show_meta);
    };
    build_util_list = function() {
      var del_a, del_href, href, stream_a, stream_href, ul, view_a, view_href;
      del_href = calculate_delete_href();
      del_a = 'delete'.link(href = del_href);
      view_href = calculate_view_href();
      view_a = 'Text Viewer'.link(href = view_href);
      stream_href = calculate_s3_stream_href();
      stream_a = 'Download'.link(href = stream_href);
      ul = "<ul class=\"util-list\">\n<li class=\"util-list-item\">\n  <span class=\"glyphicon glyphicon-remove\"> </span> " + del_a + "\n</li>\n\n<li class=\"util-list-item\">\n  <span class=\"glyphicon glyphicon-zoom-in\"> </span> " + view_a + "\n</li>\n\n<li class=\"util-list-item\">\n  <span class=\"glyphicon glyphicon-arrow-down\"> </span> " + stream_a + "\n</li>\n\n</ul>\n";
      return ul;
    };
    build_file_info_list = function() {
      var file_info_ul, meta_ul, util_ul;
      util_ul = build_util_list();
      meta_ul = convert_meta_to_ul();
      file_info_ul = "<h2 class=\"util-list-name\"> File tools </h2>\n\n" + util_ul + "\n\n<h2 class=\"util-list-name\"> File information </h2>\n\n" + meta_ul;
      return file_info_ul;
    };
    increase_value = function(amount) {
      if (!amount) {
        amount = 1;
      }
      return Meta.value.amount += amount;
    };
    clear_past_meta_store = function(callback) {
      var index;
      index = -2;
      if (Meta.meta_s3key != null) {
        p('Meta.meta_s3key in "clear past meta store" ', Meta.mets_s3key);
        index = Meta.meta_s3key.indexOf(myconfig.new_meta_prefix);
      }
      if (index >= 0) {
        p('going to delete past meta store: ', Meta.path);
        return bucket.delete_object(Meta.meta_s3key, function(err, reply) {
          if (err) {
            callback(err, reply);
          }
          delete Meta.meta_s3key;
          return callback(err, reply);
        });
      } else {
        p('no need to delete past meta store?', Meta.path);
        return callback(null, null);
      }
    };
    save_meta_file = function(callback) {
      var err;
      if (Meta.file_meta_s3key == null) {
        err = "Meta.file_meta_s3key not prepared, in " + Meta.path;
        return callback(err, null);
      }
      return bucket.write_json(Meta.file_meta_s3key, Meta, function(err, reply) {
        if (err) {
          return callback(err, reply);
        }
        return callback(err, reply);
      });
    };
    promise_to_save_meta_file = Promise.promisify(save_meta_file);
    retrieve_meta = function(callback) {
      return bucket.read_json(Meta.file_meta_s3key, function(err, json) {
        Meta = json;
        return callback(null, json);
      });
    };
    get_saved_meta = function(callback) {
      return bucket.read_json(Meta.file_meta_s3key, callback);
    };
    render_html_repr = function() {
      prepare_html_elements();
      render_html_for_owner();
      return render_html_for_viewer();
    };
    render_html_for_owner = function() {
      var li;
      li = "<li class=\"file\">";
      li += Meta.html.elements["file-selector"] + "&nbsp;\n";
      li += "<ul class=\"list-unstyled file-info\"><li>\n";
      li += Meta.html.elements["text-view"] + "&nbsp;\n";
      li += Meta.html.elements["remove"] + "&nbsp;\n";
      li += Meta.html.elements["path-uuid"] + "&nbsp;\n";
      li += "</li></ul></li>\n";
      return Meta.html["li"] = li;
    };
    render_html_for_viewer = function() {
      var li;
      li = "<li class=\"file\">";
      li += Meta.html.elements["file-selector"] + "&nbsp;\n";
      li += Meta.html.elements["anchor"] + "&nbsp;\n";
      li += "<ul class=\"list-unstyled file-info\"><li>\n";
      li += Meta.html.elements["text-view"] + "&nbsp;\n";
      li += "</li></ul></li>";
      return Meta.html["li_viewer"] = li;
    };
    prepare_html_elements = function() {
      var dir, ele, puuid;
      if (typeof Meta.html === "undefined") {
        Meta.html = {};
      }
      if (typeof Meta.html.elements === "undefined") {
        Meta.html.elements = {};
      }
      ele = Meta.html.elements;
      ele["file-selector"] = "<label class=\"file-selector\">\n<input type=\"checkbox\" name=\"filepath[]\" value=\"" + Meta.path_uuid + "\" />\n\n<span class=\"filename\"><a href=\"/fileinfo-pathuuid/" + Meta.path_uuid + "\">" + Meta.name + "</a></span>\n</label>";
      ele["anchor"] = "<a href=\"" + Meta.s3_stream_href + "\"> " + Meta.name + "</a>";
      ele["text-view"] = "<a href=\"/viewtxt/" + Meta.path_uuid + "\">\n<span class=\"glyphicon glyphicon-zoom-in\"> </span>Read\n</a>";
      ele["remove"] = "<a href=\"" + Meta.delete_href + "\">\n<span class=\"glyphicon glyphicon-remove\"></span>Delete</a>";
      dir = path.dirname(Meta.path);
      puuid = path.join("/fileinfo-pathuuid/", dir, Meta.uuid);
      ele["path-uuid"] = "<a href=\"" + puuid + "\"> <i class=\"fa fa-paw\"> </i> Paw-in </a>";
      return ele["name-info"] = '<a href="' + Web_file_info + Meta.path_uuid + '" >' + Meta["name"] + "</a>";
    };
    save_file_to_folder = function() {
      var dirname;
      dirname = path.dirname(Meta.path);
      return promise_to_save_meta_file().then(function() {
        return folder_v5.retrieve_folder(dirname);
      }).then(function(folder) {
        folder.add_file(Meta);
        return folder.promise_to_save_meta();
      });
    };
    get_meta = function() {
      return Meta;
    };
    delete_s3_storage = function(callback) {
      var funs_to_rm, rm;
      callback = callback || (function() {});
      funs_to_rm = [];
      if (Meta.storage != null) {
        if (Meta.storage.key != null) {
          if (Meta.meta_s3key != null) {
            if (Meta.meta_s3key === Meta.storage.key) {
              p('meta_s3key == storage.key, this is duplicated?');
            } else {
              p('ok meta_s3key != storage.key, are you sure? msg from:', Meta.path);
            }
          }
          rm = function(callback) {
            return bucket.delete_object(Meta.storage.key, callback);
          };
          funs_to_rm.push(rm);
        }
      }
      if (Meta.meta_s3key != null) {
        rm = function(callback) {
          return bucket.delete_object(Meta.meta_s3key, callback);
        };
        funs_to_rm.push(rm);
      }
      if (Meta.file_meta_s3key != null) {
        rm = function(callback) {
          return bucket.delete_object(Meta.file_meta_s3key, callback);
        };
        funs_to_rm.push(rm);
      }
      if (!u.isEmpty(funs_to_rm)) {
        return async.parallel(funs_to_rm, callback);
      } else {
        return callback(null, null);
      }
    };
    promise_to_delete_s3_storage = Promise.promisify(delete_s3_storage);
    meta2s3 = function(_meta, callback) {
      Meta = _meta;
      fix_file_meta(_meta);
      calculate_meta_defaults();
      render_html_repr();
      return save_meta_file(function(err, reply) {
        return callback(err, Meta);
      });
    };
    update_storage = function(obj, callback) {
      return bucket.put_object(Meta.storage.key, obj, function(err, aws_reply) {
        if (err) {
          return callback(err, aws_reply);
        }
        Meta.timestamp = Date.now();
        Meta.lastModifiedDate = Date.now();
        return callback(null, Meta);
      });
    };
    update_storage_a = function(storage, callback) {
      if (storage.type === 'object') {
        return update_storage(storage['buf-str'], function(err, what) {
          Meta.timestamp = Date.now();
          Meta.lastModifiedDate = Date.now();
          return callback(null, Meta);
        });
      } else if (storage.type === 's3') {
        return bucket.copy_object(storage.key, Meta.storage.key, function(err, what) {
          Meta.timestamp = Date.now();
          Meta.lastModifiedDate = Date.now();
          return callback(null, Meta);
        });
      } else {
        return callback("don't know storage type", null);
      }
    };
    get_client_json = function() {
      var err, file_key, filetype, milli, size, unique, value;
      milli = 0;
      if (typeof Meta.timestamp === "function" ? Meta.timestamp(i) : void 0) {
        if (u.isNumber(Meta.timestamp)) {
          milli = Meta.timestamp;
        } else {
          try {
            milli = parseInt(Meta.timestamp);
          } catch (_error) {
            err = _error;
            milli = 0;
          }
        }
      }
      value = 0;
      if (Meta.value != null) {
        if (Meta.value.amount != null) {
          value = Meta.value.amount;
        }
      }
      file_key = null;
      if (Meta.storage != null) {
        if (Meta.storage.key != null) {
          file_key = Meta.storage.key;
        }
      }
      if (Meta['client_json'] == null) {
        Meta['client_json'] = {};
      }
      size = -1;
      if (Meta.size != null) {
        size = Meta.size;
      }
      filetype = '';
      if (Meta.filetype != null) {
        filetype = Meta.filetype;
      }
      unique = false;
      if ((Meta.unique != null)) {
        unique = Meta.unique;
      }
      Meta['client_json'] = {
        name: Meta.name,
        path: Meta.path,
        uuid: Meta.uuid,
        path_uuid: Meta.path_uuid,
        file_key: file_key,
        value: value,
        order: 0 - milli,
        milli: milli,
        size: size,
        filetype: filetype,
        unique: unique
      };
      return Meta['client_json'];
    };
    update_meta = function(hash, callback) {
      var i, _i, _len, _ref;
      if (hash.value) {
        Meta.value += hash.value;
        delete Meta.value;
      }
      if (hash.uuid) {
        delete hash.uuid;
      }
      if (hash.path_uuid) {
        delete hash.path_uuid;
      }
      if (hash.dir) {
        delete hash.dir;
      }
      p('update meta: hash: ', hash);
      _ref = Object.keys(hash);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        Meta[i] = hash[i];
      }
      return save_file_to_folder().then(function(this_get_s3_write_reply) {
        var j;
        j = get_client_json();
        return callback(null, j);
      });
    };
    remove_storage = function(callback) {
      return bucket.delete_object(Meta.storage.key, callback);
    };
    get_owner_id = function() {
      var guess;
      if (_meta_.owner_id != null) {
        return Meta.owner_id;
      }
      guess = Meta.path.split("/")[0];
      if (u.isString(guess)) {
        return guess;
      }
      return null;
    };
    get_complex_auxiliary_path = function() {
      var auxiliary_path, create_time, oid;
      create_time = -1;
      if (Meta['create_time'] != null) {
        create_time = Meta['create_time'];
      }
      oid = get_owner_id();
      if ((oid == null) || !oid) {
        throw new Exception('no owner id for folder: ' + Meta.path);
      }
      oid = oid.toString();
      auxiliary_path = path.join(oid, Meta.uuid, create_time);
      return auxiliary_path;
    };
    file_uuid = function() {
      return Meta.uuid;
    };
    callback_milli_uuid = function(callback) {
      var create_time, milli_uuid;
      if (Meta['milli_uuid'] != null) {
        return callback(null, Meta['milli_uuid']);
      }
      if (Meta['create_time'] != null) {
        create_time = Meta['create_time'];
      } else {
        create_time = Date.now();
      }
      milli_uuid = path.join(create_time.toString(), Meta.uuid);
      Meta['milli_uuid'] = milli_uuid;
      return save_file_to_folder().then(function() {
        return callback(null, milli_uuid);
      })["catch"](function(err) {
        return callback(err, null);
      });
    };
    get_file_auxiliary_path = function() {
      var key, muuid;
      muuid = null;
      if (Meta.milli_uuid != null) {
        muuid = Meta.milli_uuid;
        key = path.join(myconfig.file_auxiliary_prefix, muuid);
        Meta.aux_path = key;
        return key;
      }
      return null;
    };
    callback_file_auxiliary_path = function(callback) {
      if (Meta.aux_path != null) {
        return callback(null, Meta.aux_path);
      }
      callback_milli_uuid(function(err, muuid) {
        var key;
        if (err) {
          return callback(err, null);
        }
        key = path.join(myconfig.file_auxiliary_prefix, muuid);
        Meta.aux_path = key;
        return save_file_to_folder().then(function(what) {
          return callback(null, key);
        })["catch"](function(err) {
          return callback(err);
        });
      });
      return null;
    };
    Obj.version = '3 simple file';
    Obj.get_meta = get_meta;
    Obj.delete_s3_storage = delete_s3_storage;
    Obj.promise_to_delete_s3_storage = promise_to_delete_s3_storage;
    Obj.read_to_string = read_to_string;
    Obj.read_file_to_buffer = read_file_to_buffer;
    Obj.read_stream = read_stream;
    Obj.set_meta = set_meta;
    Obj.calculate_meta_defaults = calculate_meta_defaults;
    Obj.calculate_meta = calculate_meta;
    Obj.increase_value = increase_value;
    Obj.save_meta_file = save_meta_file;
    Obj.retrieve_meta = retrieve_meta;
    Obj.get_saved_meta = get_saved_meta;
    Obj.prepare_html_elements = prepare_html_elements;
    Obj.render_html_repr = render_html_repr;
    Obj.save_file_to_folder = save_file_to_folder;
    Obj.write_s3_storage = write_s3_storage;
    Obj.convert_meta_to_ul = convert_meta_to_ul;
    Obj.build_util_list = build_util_list;
    Obj.build_file_info_list = build_file_info_list;
    Obj.meta2s3 = meta2s3;
    Obj.update_storage = update_storage;
    Obj.update_storage_a = update_storage_a;
    Obj.get_client_json = get_client_json;
    Obj.update_meta = update_meta;
    Obj.remove_storage = remove_storage;
    Obj.callback_milli_uuid = callback_milli_uuid;
    Obj.file_uuid = file_uuid;
    Obj.get_file_auxiliary_path = get_file_auxiliary_path;
    Obj.callback_file_auxiliary_path = callback_file_auxiliary_path;
    if (meta_src != null) {
      set_meta(meta_src);
    }
    return callback(null, Obj);
  };

  promised_simple_s3_file_obj = Promise.promisify(simple_s3_file_obj);

  new_plain_file = function(text, meta, callback) {
    var s3key;
    fix_file_meta(meta);
    s3key = meta.storage.key;
    return bucket.write_text_file(s3key, text, function(err, aws_result) {
      return pass_meta_to_task(meta, callback);
    });
  };

  promised_new_plain_file = Promise.promisify(new_plain_file);

  put_local_file = function(local_file_path, meta, callback) {
    var s3key;
    fix_file_meta(meta);
    s3key = meta.storage.key;
    return bucket.put_one_file(local_file_path, s3key, function(err, aws_result) {
      return pass_meta_to_task(meta, callback);
    });
  };

  put_local_file_without_pass = function(local_file_path, meta, callback) {
    var s3key;
    fix_file_meta(meta);
    s3key = meta.storage.key;
    return bucket.put_one_file(local_file_path, s3key, function(err, aws_result) {
      return callback(err, meta);
    });
  };

  check_meta_has_basics = function(_meta) {
    var err;
    err = 0;
    if (_meta.name == null) {
      err += 1;
    }
    if (_meta.path == null) {
      err += 1;
    }
    if (_meta.owner == null) {
      err += 1;
    }
    if (!u.isString(_meta.name)) {
      err += 1;
    }
    if (!u.isString(_meta.path)) {
      err += 1;
    }
    if (!u.isString(_meta.owner)) {
      err += 1;
    }
    if (err === 0) {
      return true;
    } else {
      return false;
    }
  };

  fix_file_meta = function(_meta) {
    var err;
    if (!check_meta_has_basics(_meta)) {
      err = 'can not do this meta data: ' + _meta.toString();
      throw new Error(err);
    }
    if (_meta.dir == null) {
      _meta.dir = path.dirname(_meta.path);
    }
    if (_meta.timestamp == null) {
      _meta.timestamp = Date.now();
    }
    if (_meta.uuid == null) {
      _meta.uuid = myutil.get_uuid();
    }
    _meta.new_meta_s3key = path.join(myconfig.new_meta_prefix, _meta.dir, _meta.uuid);
    _meta.initial_key = _meta.new_meta_s3key;
    _meta.s3key = path.join(myconfig.raw_file_prefix, _meta.dir, _meta.uuid);
    _meta.storage = {
      type: 's3',
      key: _meta.s3key
    };
    return _meta;
  };

  pass_meta_to_task = function(meta, callback) {
    var job;
    job = {
      name: 'new-file-meta',
      task_name: 'new-file-meta',
      username: meta.owner,
      folder: meta.dir,
      new_meta_s3key: meta.new_meta_s3key
    };
    return bucket.write_json(meta.new_meta_s3key, meta, function(err, reply) {
      if (err) {
        log28('write file meta to s3 ERR, in "pass meta to task"', [meta.new_meta_s3key, meta]);
        return callback(err, null);
      }
      return task.pub_task(task.channel, job, callback);
    });
  };

  write_text_file = function(owner, dir, filename, text) {
    var file_meta, m;
    file_meta = {
      name: filename,
      path: path.join(dir, filename),
      owner: owner,
      size: text.length
    };
    m = fix_file_meta(file_meta);
    p("m -- ", m);
    return promised_new_plain_file(text, m);
  };

  new_file_obj_from_meta = function(_meta, callback) {
    return simple_s3_file_obj(_meta, function(err, file_obj) {
      p('in new file obj from meta, _meta', _meta);
      file_obj.set_meta(_meta);
      file_obj.calculate_meta_defaults();
      file_obj.render_html_repr();
      return file_obj.save_file_to_folder().then(function(what) {
        p('## the "what" is s3 json write reply.');
        return callback(null, file_obj);
      })["catch"](callback);
    });
  };

  module.exports.simple_s3_file_obj = simple_s3_file_obj;

  module.exports.promised_simple_s3_file_obj = promised_simple_s3_file_obj;

  module.exports.fix_file_meta = fix_file_meta;

  module.exports.new_plain_file = new_plain_file;

  module.exports.promised_new_plain_file = promised_new_plain_file;

  module.exports.write_text_file = write_text_file;

  module.exports.put_local_file = put_local_file;

  module.exports.put_local_file_without_pass = put_local_file_without_pass;

  module.exports.new_file_obj_from_meta = new_file_obj_from_meta;

  p = console.log;

  stop = function() {
    return setTimeout(process.exit, 500);
  };

  test_owner_name = 'abc';

  test_folder_name = 'abc';

  test_json_file_name = 'test.json';

  test_file_name = 'check04';

  write_a_text_file = function() {
    var F, dir, name, owner, text;
    owner = test_owner_name;
    dir = test_folder_name;
    name = test_file_name;
    text = "\nI am checking\na new plain\nfile\n";
    F = null;
    return write_text_file(owner, dir, name, text).then(function(what) {
      return p('what: ', what);
    }).then(stop);
  };

  if (require.main === module) {
    write_a_text_file();
  }

}).call(this);
