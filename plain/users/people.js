// Generated by CoffeeScript 1.8.0
(function() {
  var People_file_name, Promise, bucket, config_folder_name, folder_module, init_people_file, init_people_manager, make_people_manager_for_user, p, path, promise_to_init_people_manager, social, u, user;

  u = require("underscore");

  path = require("path");

  folder_module = require("../aws/folder-v5.js");

  social = require("../aws/social.js");

  Promise = require("bluebird");

  bucket = require("../aws/bucket.js");

  user = require("./a.js");

  p = console.log;

  People_file_name = '.gg.people.v1.json';

  config_folder_name = 'goodagood';

  init_people_file = function(username, callback) {
    var config_folder_path, content;
    content = {
      current: [],
      friends: [],
      people: [],
      teams: [],
      groups: {}
    };
    config_folder_path = path.join(username, config_folder_name);
    p('config folder path is: ', config_folder_path);
    return folder_module.retrieve_folder(config_folder_path).then(function(folder) {
      var meta, text;
      meta = folder.get_meta();
      if ((meta.owner != null) && (meta.owner.username != null)) {
        content.people.push(meta.owner.username);
      }
      if (typeof meta.owner === 'string') {
        content.people.push(meta.owner);
      }
      if (!folder.file_exists(People_file_name)) {
        p('init people file : ', username);
        text = JSON.stringify(content, null, 4);
        return folder.write_text_file(People_file_name, text).then(function(job_json) {
          return callback(null, job_json);
        });
      } else {
        return callback(null, null);
      }
    });
  };

  make_people_manager_for_user = function(Username) {
    var Empty_content, Folder, Folder_path, Obj, add_people, add_recent, del_people, get_a_few, get_json, get_people_file_obj, get_recent, get_text, init_folder, is_file_initialized, is_file_initialized_async, know, promise_to_update_file, recognize, update_file, _pick_some;
    Obj = {};
    Folder_path = path.join(Username, config_folder_name);
    Folder = null;
    Empty_content = {
      current: [],
      friends: [],
      people: [],
      teams: [],
      groups: {}
    };
    init_folder = function() {
      return folder_module.retrieve_folder(Folder_path).then(function(folder) {
        Folder = folder;
        return Folder;
      });
    };
    is_file_initialized = function(callback) {
      return folder_module.retrieve_folder(Folder_path).then(function(folder) {
        var exists, meta;
        meta = folder.get_meta();
        exists = folder.file_exists(People_file_name);
        return callback(null, exists);
      });
    };
    is_file_initialized_async = Promise.promisify(is_file_initialized);
    get_people_file_obj = function() {
      var config_folder_path;
      config_folder_path = path.join(Username, config_folder_name);
      return Folder.promise_to_one_file_obj(People_file_name);
    };
    update_file = function(json, callback) {
      var text;
      text = JSON.stringify(json);
      return get_people_file_obj().then(function(file) {
        var meta;
        meta = file.get_meta();
        return bucket.write_text_file(meta.storage.key, text, function(err, reply) {
          meta.timestamp = Date.now();
          return Folder.add_file_save_folder(meta, callback);
        });
      });
    };
    promise_to_update_file = Promise.promisify(update_file);
    know = function(some_name) {
      return false;
    };
    recognize = function(name) {
      return get_json().then(function(j) {
        var ind;
        ind = j.people.indexOf(name);
        if (ind < 0) {
          return false;
        } else {
          return true;
        }
      });
    };
    get_text = function() {
      if (!Folder) {
        throw 'no folder? when "get text"';
      }
      return Folder.read_text_file(People_file_name);
    };
    get_json = function() {
      return get_text().then(function(text) {
        var json;
        return json = JSON.parse(text);
      });
    };
    add_people = function(name) {
      return get_json().then(function(j) {
        if (j.people.indexOf(name) < 0) {
          j.people.push(name);
        }
        return j;
      }).then(function(j) {
        return promise_to_update_file(j);
      });
    };
    del_people = function(name) {
      return get_json().then(function(j) {
        var ind;
        ind = j.people.indexOf(name);
        if (ind < 0) {
          return j;
        }
        j.people.splice(ind, 1);
        return j;
      }).then(function(j) {
        return promise_to_update_file(j);
      });
    };
    add_recent = function(name) {
      return get_json().then(function(j) {
        j.current.splice(0, 0, name);
        j.current = u.unique(j.current);
        return j;
      }).then(function(j) {
        return promise_to_update_file(j);
      });
    };
    get_recent = function(number) {
      number = number || 1;
      if (!u.isNumber(number)) {
        number = 1;
      }
      if (number < 1) {
        number = 1;
      }
      return get_json().then(function(j) {
        return u.first(j.current, number);
      });
    };
    _pick_some = function(number) {
      var a_few;
      number = number || 10;
      a_few = [];
      return get_json().then(function(j) {
        var get_more, len, more, union;
        a_few = u.first(j.current, number);
        if ((a_few != null) && (a_few.length != null)) {
          len = a_few.length;
        } else {
          p('fuck, why not a few or length');
          len = 0;
        }
        if (len < number) {
          more = number - len;
          get_more = u.first(j.friends, more);
          if (!u.isEmpty(get_more)) {
            union = u.union(a_few, get_more);
            a_few = u.uniq(union);
            len = a_few.length;
          }
        }
        if ((a_few != null) && (a_few.length != null)) {
          len = a_few.length;
        } else {
          len = 0;
        }
        if (len < number) {
          more = number - len;
          get_more = u.first(j.people, more);
          if (!u.isEmpty(get_more)) {
            union = u.union(a_few, get_more);
            a_few = u.uniq(union);
            len = a_few.length;
          }
        }
        if (u.isEmpty(a_few)) {
          a_few.push('goodagood');
        }
        return a_few;
      });
    };
    get_a_few = function(number) {
      var a_few;
      number = number || 10;
      a_few = [];
      return is_file_initialized_async().then(function(yes_) {
        if (yes_) {
          return _pick_some(number);
        } else {
          if (u.isEmpty(a_few)) {
            a_few.push('goodagood');
          }
          return Promise.resolve(a_few);
        }
      });
    };
    Obj.init_folder = init_folder;
    Obj.Folder = Folder;
    Obj.is_file_initialized = is_file_initialized;
    Obj.get_people_file_obj = get_people_file_obj;
    Obj.know = know;
    Obj.recognize = recognize;
    Obj.get_json = get_json;
    Obj.add_people = add_people;
    Obj.del_people = del_people;
    Obj.add_recent = add_recent;
    Obj.get_recent = get_recent;
    Obj.get_a_few = get_a_few;
    return init_folder().then(function(f) {
      Obj.Folder = f;
      return Obj;
    });
  };

  init_people_manager = function(username, callback) {
    return make_people_manager_for_user(username).then(function(manager) {
      return manager.is_file_initialized(function(err, yes_) {
        if (yes_) {
          return callback(null, null);
        }
        p('In "init people manager", start to init people file for ', username);
        return init_people_file(username, callback);
      });
    });
  };

  promise_to_init_people_manager = Promise.promisify(init_people_manager);

  module.exports.make_people_manager_for_user = make_people_manager_for_user;

  module.exports.init_people_file = init_people_file;

  module.exports.init_people_manager = init_people_manager;

  module.exports.promise_to_init_people_manager = promise_to_init_people_manager;

}).call(this);
