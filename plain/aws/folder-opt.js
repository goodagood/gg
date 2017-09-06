var Opt_file_name, Promise, Viewers_file_name, async, bucket, check_delete,
    check_reset, check_show_the_file,
    fs, folderOptBoard, p, p2folderOptBoard, get_opt_obj,
    folder_module, stop, test_opt_file_exists, u,
    _test_folder_name;

var u  = require("underscore");
var fs = require("fs");

var Promise = require("bluebird");
var async   = require("async");


var folder_module = require("./folder-v5.js");

var bucket = require("./bucket.js");

// tools
var p = console.log;
function stop(){ setTimeout(process.exit, 500); };

var Opt_file_name = '.folder.opt.json';

function folderOptBoard(Dir) {
    var add_opt, add_viewer, 
        check_user_role, del_member, emptyOpt,
        folder_initialized, get_file_obj, get_json, get_number_of_opt_file,
        get_text, has_member, has_viewer, 
        is_owner, promise_to_replace_json,
        reset_opt_file, show_folder, show_text, replace_json, _obj_;

    var Folder = null;
    emptyOpt = {};

    function get_dir(){ return Dir; }

    function set_folder() {
        // returned is a promise
        return folder_module.retrieve_folder(Dir).then(function(folder) {
            Folder = folder;
            return Folder;
        });
    }

    function is_folder_set () {
        if (u.isNull(Folder)) {
            return false;
        }
        return true;
    }

    var show_folder = function() {
        p('folder object in "make members obj", Dir: ' + Dir);
        return p(Folder);
    };

    var init_opt_file = function() {
        var text = JSON.stringify({}); // empty object

        if (Folder === null) {
            throw 'have no folder object in "init opt file" exists';
        }
        return check_opt_file_exists().then(function(exists) {
            if (exists) {
                return Promise.reject('opt file already exists');
            }
            return Folder.write_text_file(Opt_file_name, text);
        });
    };

    var reset_opt_file = function() {
        return promise_to_replace_json(emptyOpt);
    };

    var get_file_obj = function() {
        return Folder.promise_to_one_file_obj(Opt_file_name).then(function(file) {
            return file;
        });
    };

    replace_json = function(json, callback) {
        var text;
        text = JSON.stringify(json);
        return get_file_obj().then(function(file) {
            var meta;
            meta = file.get_meta();
            return bucket.write_text_file(meta.storage.key, text, function(err, reply) {
                meta.timestamp = Date.now();
                meta.lastModifiedDate = Date.now();
                return Folder.add_file_save_folder(meta, callback);
            });
        });
    };
    var promise_to_replace_json = Promise.promisify(replace_json);

    var get_text = function() {
        if (!Folder) {
            throw 'no folder? when "get text"';
        }
        return Folder.read_text_file(Opt_file_name);
    };

    var get_json = function() {
        return get_text().then(function(text) {
            var json;
            return json = JSON.parse(text);
        });
    };

    var show_text = function() {
        return folder_module.retrieve_folder(Dir).then(function(folder) {
            return folder.read_text_file(Opt_file_name);
        }).then(function(str) {
            p('The file contents:\n', str);
            return str;
        });
    };


    var add_opt = function(name, value) {
        return get_json().then(function(j) {
            j[name] = value;

            return j;
        }).then(function(j) {
            return replace_json(j);
        });
    };

    del_opt = function(name) {
        return get_json().then(function(j) {
            delete j[name];
            return j;
        }).then(function(j) {
            return replace_json(j);
        });
    };

    has_opt = function(name) {
        return get_json().then(function(j) {
            return u.has(j, name);
        });
    };


    var check_opt_file_exists = function() {
        var exists;
        if (Folder === null) {
            throw 'have no folder object in "check opt file exists"';
        }
        exists = Folder.file_exists(Opt_file_name);
        return Promise.resolve(exists);
    };

    var delete_one_file = function() {
        var folder_;
        return folder_module.retrieve_promisified_folder(Dir).then(function(folder) {
            folder_ = folder;
            return folder.get_uuids(Opt_file_name);
        }).then(function(uuid_list) {
            p('the list in "delete file": \n', uuid_list);
            if (u.isArray(uuid_list)) {
                if (uuid_list.length >= 1) {
                    return folder_.delete_uuid_promised(uuid_list[0]);
                }
            }
            return Promise.resolve('nothing deleted');
        });
    };

    var get_number_of_opt_file = function() {
        // used in debugging, when there will be wierdly many opt files.
        var uuid_list;
        uuid_list = Folder.get_uuids(Opt_file_name);
        if (!u.isArray(uuid_list)) {
            throw 'not a list in "get number of member file"';
        }
        return uuid_list.length;
    };

    var keep_only_one_opt_file = function() {

        // should we get a new folder obj?
        return folder_module.retrieve_folder(Dir).then(function(folder) {
            return folder.get_uuids(Opt_file_name);
        }).then(function(uuid_list) {
            var counts, funs, len, size, _i, _j, _results, _results1;
            p('the list: \n', uuid_list);
            if (!u.isArray(uuid_list)) {
                return Promise.resolve('not a list in "keep only one mem.."');
            }
            len = uuid_list.length;
            if (len > 1) {
                size = len(-1);
                counts = (function() {
                    _results = [];
                    for (var _i = 1; 1 <= size ? _i <= size : _i >= size; 1 <= size ? _i++ : _i--){ 
                        _results.push(_i);
                    }
                    return _results;
                }).apply(this);
                funs = (function() {
                    _results1 = [];
                    for (var _j = 2; 2 <= len ? _j <= len : _j >= len; 2 <= len ? _j++ : _j--){
                        _results1.push(_j);
                    }
                    return _results1;
                }).apply(this).map(function(num) {
                    return delete_one_file;
                });
                p('funs: ', funs);
                return async.series(funs);
            }
        });
    };


    _obj_ = {
        get_dir: get_dir,
        set_folder: set_folder,
        folder_initialized: folder_initialized,
        init_opt_file: init_opt_file,
        show_text: show_text,
        check_opt_file_exists: check_opt_file_exists,
        get_number_of_opt_file: get_number_of_opt_file,
        is_owner: is_owner,
        has_viewer: has_viewer,
        add_viewer: add_viewer,
        keep_only_one_opt_file: keep_only_one_opt_file,
        delete_one_file: delete_one_file,
        get_json: get_json,
        add_opt: add_opt,
        del_member: del_member,
        get_file_obj: get_file_obj,
        has_member: has_member,
        check_user_role: check_user_role,
        reset_opt_file: reset_opt_file,
        show_folder: show_folder
    };
    return _obj_;
};

//
p2folderOptBoard = function(dir) {
    var obj;
    obj = folderOptBoard(dir);
    return Promise.resolve(obj);
};

//
get_opt_obj = function(dir) {
    var Opto;
    return p2folderOptBoard(dir).then(function(obj) {
        Opto = obj;
        return Opto.set_folder();
    }).then(function(folder) {
        return Opto;
    });
};


module.exports.folderOptBoard = folderOptBoard;
module.exports.p2folderOptBoard = p2folderOptBoard;
module.exports.get_opt_obj = get_opt_obj;



// -- fast checkings --

var _test_folder_name = 'abc/add-2';

check_show_the_file = function(dir) {
    var Opto;
    dir = dir || _test_folder_name;
    Opto = null;
    return get_opt_obj(dir).then(function(opto) {
        Opto = opto;
        return opto.check_opt_file_exists();
    }).then(function(exists) {
        p("exists: " + exists);
        if (!exists) {
            throw 'members file not exists';
        }
    }).then(function() {
        return Opto.show_text();
    }).then(stop);
};

test_opt_file_exists = function(dir) {
    dir = dir || _test_folder_name;
    return get_opt_obj(dir).then(function(opto) {
        return opto.check_opt_file_exists();
    }).then(function(exists) {
        return p("exists: " + exists);
    }).then(stop);
};

check_delete = function(dir) {
    var opt_obj;
    dir = dir || _test_folder_name;
    opt_obj = null;
    return get_opt_obj(dir).then(function(obj) {
        opt_obj = obj;
        return obj.delete_one_file();
    }).then(function(what) {
        return p(1, ' ', what);
    }).then(function() {
        return stop();
    });
};

check_reset = function(dir) {
    var opt_obj;
    dir = dir || _test_folder_name;
    opt_obj = null;
    return get_opt_obj(dir).then(function(opto) {
        opt_obj = opto;
        return opto.reset_opt_file();
    }).then(function(what) {
        return p('you got what in "check reset": ', what);
    }).then(stop);
};

// doing checks

check_set_folder = function(dir) {
    dir = dir || 'abc/add-2';

    var Opto; // option object
    return p2folderOptBoard(dir).then(function(opto) {
        //p('1 opto object: ', opto);
        Opto = opto;
        return Opto;
    }).then(function(opto) {
        return opto.set_folder();
    }).then(function(folder) {
        //p('3 folder:', folder);
        p('dir: ',  Opto.get_dir());
        return folder;
    }).then(function(f) {
        var fm;
        fm = f.get_meta();
        p('name: ', fm.name);
        return p('uuid: ', fm.uuid);
    }).then(stop);
};

var check_init_opt_file = function(dir) {
    dir = dir || _test_folder_name;

    var opt_obj;

    return get_opt_obj(dir).then(function(opto) {
        opt_obj = opto;
        return opt_obj.check_opt_file_exists();
    }).then(function(exists){
        p("exists: ", exists);
        if(!exists) return opto.init_opt_file();
    }).then(function(what) {
        return p('you got what: ', what);
    }).then(function(){
        // must retrieve folder again to include changes.
        return opt_obj.set_folder();
    }).then(function() {
        return opt_obj.check_opt_file_exists();
    }).then(function(exists) {
        return p("exists: " + exists);
    }).then(stop);
};


if (require.main === module) {
    //check_set_folder();
    check_init_opt_file('abc');

}

