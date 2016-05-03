
/*
 * moved to ./file/obj.js 2016 04
 *
 * The file object, rewrite from ../aws/simple-file-v3.js(coffee).
 * Should be ok to play with plain utf-8 files.
 *
 * 2016 0313
 */

var path = require("path");
var uuid = require("node-uuid");
var u    = require("underscore");

var bucket = require('../aws/bucket.js');

var s3keys = require("./s3keys.js");
var lutil  = require("./local-util.js");
var ft     = require('../myutils/filetype.js');
var myconfig = require("../config/config.js");

var p = console.log;


function new_obj(file_info, callback) {
    var build_file_info_list, build_util_list, calculate_delete_href, calculate_meta, calculate_s3_stream_href, calculate_view_href, callback_file_auxiliary_path, callback_milli_uuid, clear_past_meta_store, convert_meta_to_ul, delete_s3_storage, file_uuid, get_client_json, get_complex_auxiliary_path, get_file_auxiliary_path, get_meta, get_owner_id, get_saved_meta, guess_owner, increase_value, isError, meta2s3, prepare_html_elements, promise_to_delete_s3_storage, promise_to_save_meta_file, read_file_to_buffer, read_stream, read_to_string, remove_storage, render_html_for_owner, render_html_for_viewer, render_html_repr, retrieve_meta, save_file_to_folder, save_meta_file, set_meta, update_meta, update_storage, update_storage_a, write_s3_storage, _build_ul, _keep;

    function check_file_info(){
        if(!file_info.path) return false;
        return true;
    }

    if(!check_file_info()) return callback('not enough file information feed in, 2016 0313.');

    var _meta = file_info;
    var _file = {};


    function make_s3key_and_meta_s3key(callback){
        s3keys.make_s3keys_for_file_path(_meta.path, function(err, keys){
            if(err) return callback(err);
            p('keys: ', keys);
            _meta.s3key = keys.s3key;
            _meta.meta_s3key = keys.meta_s3key;
            callback(null, _meta);
        });
    }
    _file.make_s3key_and_meta_s3key = make_s3key_and_meta_s3key;


    // doing
    function set_basic_access_keys(callback){
        if (!_meta.uuid) _meta.uuid = uuid.v4();

        s3keys.make_s3key_and_meta_s3key(_meta.path, function(err, file_s3key){
            if(err) return callback(err);

            s3keys.make_file_name_space_prefix(_meta, function(err, ns_key){
                if(err) return callback(err);
                _meta.name_space_s3key = ns_key;
                callback(null, _meta);
            });
        });
    }
    _file.set_basic_access_keys = set_basic_access_keys;


    // doing
    /*
     * file_s3key
     * meta_s3key : file and meta s3key get full path, they can be accessed
     *              when full path is given.
     *
     * uuid
     * name_space_s3key
     *
     */
    function calculate_meta_defaults(callback) {
        var necessaries;

        if (!_meta.uuid) _meta.uuid = uuid.v4();
        if (!_meta.name) _meta.name = path.basename(_meta.path);

        if (typeof _meta.filetype !== "string") {
            if(_meta.type){
                _meta.filetype = _meta.type;
            }else if(_meta.mimetype){
                _meta.filetype = _meta.mimetype;
            }else{
                _meta.filetype = ft.check_file_type_by_name(_meta.name);
            }
        }

        if (typeof _meta.owner !== "string") {
            _meta.owner = lutil.get_root(_meta.path);
        }

        make_s3key_and_meta_s3key(function(err, m){
            necessaries = {
                what: myconfig.IamFile,
                timestamp: Date.now(),
                permission: lutil.Default_permission,
                "file-types": [],
                storage: {},
                storages: [],
                html: {},
                value: {
                    amount: 0,
                    unit: "GG"
                }
            };

            u.defaults(_meta, necessaries);
            callback(null, _meta);
        });
    }
    _file.calculate_meta_defaults = calculate_meta_defaults;



    function set_meta(m) {
        return _meta = m;
    }
    _file.set_meta = set_meta;


    function get_meta() {
        return _meta;
    }
    _file.get_meta = get_meta;


    function retrieve_meta(callback){
        return bucket.read_json(_meta.meta_s3key, function(err, retrieved_meta_) {
            if (err) {
                _meta.error = err;
                return callback(err, null);
            }
            _meta = retrieved_meta_;
            return callback(null, _meta);
        });
    }
    _file.retrieve_meta = retrieve_meta;


    function is_owner(user_name){
        if(user_name === _meta.owner) return true;
        return false;
    }
    _file.is_owner = is_owner;


    //guess_owner = function() {
    //    var guess;
    //    if (typeof _meta.owner === "string" || /^\s*$/.test(_meta.owner)) {
    //        return _meta.owner;
    //    }
    //    if (_meta.path) {
    //        guess = _meta.path.split("/")[0];
    //        if (typeof guess === "string" || /^\s*$/.test(guess)) {
    //            _meta.owner = guess;
    //            _meta.owner;
    //        }
    //    } else {
    //        guess = null;
    //    }
    //    return guess;
    //};
    //calculate_s3_stream_href = function() {
    //    var s3_stream_href;
    //    if (!_meta.storage) {
    //        return "";
    //    }
    //    if (!_meta.storage.key) {
    //        return "";
    //    }
    //    s3_stream_href = path.join(myconfig.s3_stream_prefix, _meta.storage.key);
    //    return s3_stream_href;
    //};
    //calculate_delete_href = function() {
    //    var delete_href;
    //    if (!_meta.path) {
    //        return;
    //    }
    //    delete_href = path.join("/del/", _meta.path_uuid);
    //    return delete_href;
    //};
    //calculate_view_href = function() {
    //    var view_href;
    //    if (!_meta.path) {
    //        return;
    //    }
    //    view_href = path.join("/viewtxt/", _meta.path_uuid);
    //    return view_href;
    //};



    //read_file_to_buffer = function(callback) {
    //    if (_meta.storage.type !== "s3") {
    //        return callback('it might NOT be s3 storage', null);
    //    }
    //    return bucket.read_data(_meta.storage.key, callback);
    //};
    //read_to_string = function(callback) {
    //    return bucket.read_to_string(_meta.storage.key, callback);
    //};
    //read_stream = function() {
    //    return bucket.s3_object_read_stream(_meta.storage.key);
    //};
    //write_s3_storage = function(content, callback) {
    //    return bucket.put_object(_meta.storage.key, content, function(err, aws_reply) {
    //        if (err) {
    //            return callback(err, aws_reply);
    //        }
    //        _meta.lastModifiedDate = Date.now();
    //        return callback(err, aws_reply);
    //    });
    //};
    //_keep = function(hash, names) {
    //    var name, _i, _len, _meta;
    //    if (u.isEmpty(names)) {
    //        return hash;
    //    }
    //    _meta = {};
    //    for (_i = 0, _len = names.length; _i < _len; _i++) {
    //        name = names[_i];
    //        _meta[name] = hash[name];
    //    }
    //    return _meta;
    //};
    //_build_ul = function(hash) {
    //    var ul;
    //    ul = "<ul> \n";
    //    u.each(hash, function(val, key) {
    //        var li;
    //        li = '<li class="key"> <span>' + key.toString() + "</span> : ";
    //        if (u.isArray(val)) {
    //            li += _build_ul(val);
    //        } else if (u.isObject(val)) {
    //            li += _build_ul(val);
    //        } else if (!val) {
    //            li += '<span class="value">' + (" " + val + " </span>");
    //        } else {
    //            li += '<span class="value">' + val.toString() + '</span>';
    //        }
    //        li += "</li>\n";
    //        return ul += li + "\n";
    //    });
    //    ul += "</ul>\n";
    //    return ul;
    //};
    //convert_meta_to_ul = function() {
    //    var attr_names, exclude, _show_meta;
    //    attr_names = ['name', 'path', 'owner', 'type', 'timestamp', 'size', 'permission', 'value'];
    //    exclude = ['html', 'storage', 'storages'];
    //    _show_meta = _keep(_meta, attr_names);
    //    return _build_ul(_show_meta);
    //};
    //build_util_list = function() {
    //    var del_a, del_href, href, stream_a, stream_href, ul, view_a, view_href;
    //    del_href = calculate_delete_href();
    //    del_a = 'delete'.link(href = del_href);
    //    view_href = calculate_view_href();
    //    view_a = 'Text Viewer'.link(href = view_href);
    //    stream_href = calculate_s3_stream_href();
    //    stream_a = 'Download'.link(href = stream_href);
    //    ul = "<ul class=\"util-list\">\n<li class=\"util-list-item\">\n  <span class=\"glyphicon glyphicon-remove\"> </span> " + del_a + "\n</li>\n\n<li class=\"util-list-item\">\n  <span class=\"glyphicon glyphicon-zoom-in\"> </span> " + view_a + "\n</li>\n\n<li class=\"util-list-item\">\n  <span class=\"glyphicon glyphicon-arrow-down\"> </span> " + stream_a + "\n</li>\n\n</ul>\n";
    //    return ul;
    //};
    //build_file_info_list = function() {
    //    var file_info_ul, meta_ul, util_ul;
    //    util_ul = build_util_list();
    //    meta_ul = convert_meta_to_ul();
    //    file_info_ul = "<h2 class=\"util-list-name\"> File tools </h2>\n\n" + util_ul + "\n\n<h2 class=\"util-list-name\"> File information </h2>\n\n" + meta_ul;
    //    return file_info_ul;
    //};
    //increase_value = function(amount) {
    //    if (!amount) {
    //        amount = 1;
    //    }
    //    if (_meta.value.amount >= 0) {
    //        return _meta.value.amount += amount;
    //    } else {
    //        return _meta.value.amount -= amount;
    //    }
    //};
    //clear_past_meta_store = function(callback) {
    //    var index;
    //    index = -2;
    //    if (_meta.meta_s3key != null) {
    //        p('_meta.meta_s3key in "clear past meta store" ', _meta.mets_s3key);
    //        index = _meta.meta_s3key.indexOf(myconfig.new_meta_prefix);
    //    }
    //    if (index >= 0) {
    //        p('going to delete past meta store: ', _meta.path);
    //        return bucket.delete_object(_meta.meta_s3key, function(err, reply) {
    //            if (err) {
    //                callback(err, reply);
    //            }
    //            delete _meta.meta_s3key;
    //            return callback(err, reply);
    //        });
    //    } else {
    //        p('no need to delete past meta store?', _meta.path);
    //        return callback(null, null);
    //    }
    //};
    //save_meta_file = function(callback) {
    //    var err;
    //    if (_meta.file_meta_s3key == null) {
    //        err = "_meta.file_meta_s3key not prepared, in " + _meta.path;
    //        return callback(err, null);
    //    }
    //    return bucket.write_json(_meta.file_meta_s3key, _meta, function(err, reply) {
    //        if (err) {
    //            return callback(err, reply);
    //        }
    //        return callback(err, reply);
    //    });
    //};
    //promise_to_save_meta_file = Promise.promisify(save_meta_file);
    //retrieve_meta = function(callback) {
    //    return bucket.read_json(_meta.file_meta_s3key, function(err, json) {
    //        _meta = json;
    //        return callback(null, json);
    //    });
    //};
    //get_saved_meta = function(callback) {
    //    return bucket.read_json(_meta.file_meta_s3key, callback);
    //};
    //render_html_repr = function() {
    //    prepare_html_elements();
    //    render_html_for_owner();
    //    return render_html_for_viewer();
    //};
    //render_html_for_owner = function() {
    //    var li;
    //    li = "<li class=\"file\">";
    //    li += _meta.html.elements["file-selector"] + "&nbsp;\n";
    //    li += "<ul class=\"list-unstyled file-info\"><li>\n";
    //    li += _meta.html.elements["text-view"] + "&nbsp;\n";
    //    li += _meta.html.elements["remove"] + "&nbsp;\n";
    //    li += _meta.html.elements["path-uuid"] + "&nbsp;\n";
    //    li += "</li></ul></li>\n";
    //    return _meta.html["li"] = li;
    //};
    //render_html_for_viewer = function() {
    //    var li;
    //    li = "<li class=\"file\">";
    //    li += _meta.html.elements["file-selector"] + "&nbsp;\n";
    //    li += _meta.html.elements["anchor"] + "&nbsp;\n";
    //    li += "<ul class=\"list-unstyled file-info\"><li>\n";
    //    li += _meta.html.elements["text-view"] + "&nbsp;\n";
    //    li += "</li></ul></li>";
    //    return _meta.html["li_viewer"] = li;
    //};
    //prepare_html_elements = function() {
    //    var dir, ele, puuid;
    //    if (typeof _meta.html === "undefined") {
    //        _meta.html = {};
    //    }
    //    if (typeof _meta.html.elements === "undefined") {
    //        _meta.html.elements = {};
    //    }
    //    ele = _meta.html.elements;
    //    ele["file-selector"] = "<label class=\"file-selector\">\n<input type=\"checkbox\" name=\"filepath[]\" value=\"" + _meta.path_uuid + "\" />\n\n<span class=\"filename\"><a href=\"/fileinfo-pathuuid/" + _meta.path_uuid + "\">" + _meta.name + "</a></span>\n</label>";
    //    ele["anchor"] = "<a href=\"" + _meta.s3_stream_href + "\"> " + _meta.name + "</a>";
    //    ele["text-view"] = "<a href=\"/viewtxt/" + _meta.path_uuid + "\">\n<span class=\"glyphicon glyphicon-zoom-in\"> </span>Read\n</a>";
    //    ele["remove"] = "<a href=\"" + _meta.delete_href + "\">\n<span class=\"glyphicon glyphicon-remove\"></span>Delete</a>";
    //    dir = path.dirname(_meta.path);
    //    puuid = path.join("/fileinfo-pathuuid/", dir, _meta.uuid);
    //    ele["path-uuid"] = "<a href=\"" + puuid + "\"> <i class=\"fa fa-paw\"> </i> Paw-in </a>";
    //    return ele["name-info"] = '<a href="' + Web_file_info + _meta.path_uuid + '" >' + _meta["name"] + "</a>";
    //};
    //save_file_to_folder = function() {
    //    var dirname;
    //    dirname = path.dirname(_meta.path);
    //    return promise_to_save_meta_file().then(function() {
    //        return folder_v5.retrieve_folder(dirname);
    //    }).then(function(folder) {
    //        folder.add_file(_meta);
    //        return folder.promise_to_save_meta();
    //    });
    //};
    //get_meta = function() {
    //    return _meta;
    //};
    //delete_s3_storage = function(callback) {
    //    var funs_to_rm, rm;
    //    callback = callback || (function() {});
    //    funs_to_rm = [];
    //    if (_meta.storage != null) {
    //        if (_meta.storage.key != null) {
    //            if (_meta.meta_s3key != null) {
    //                if (_meta.meta_s3key === _meta.storage.key) {
    //                    p('meta_s3key == storage.key, this is duplicated?');
    //                } else {
    //                    p('ok meta_s3key != storage.key, are you sure? msg from:', _meta.path);
    //                }
    //            }
    //            rm = function(callback) {
    //                return bucket.delete_object(_meta.storage.key, callback);
    //            };
    //            funs_to_rm.push(rm);
    //        }
    //    }
    //    if (_meta.meta_s3key != null) {
    //        rm = function(callback) {
    //            return bucket.delete_object(_meta.meta_s3key, callback);
    //        };
    //        funs_to_rm.push(rm);
    //    }
    //    if (_meta.file_meta_s3key != null) {
    //        rm = function(callback) {
    //            return bucket.delete_object(_meta.file_meta_s3key, callback);
    //        };
    //        funs_to_rm.push(rm);
    //    }
    //    if (!u.isEmpty(funs_to_rm)) {
    //        return async.parallel(funs_to_rm, callback);
    //    } else {
    //        return callback(null, null);
    //    }
    //};
    //promise_to_delete_s3_storage = Promise.promisify(delete_s3_storage);
    //meta2s3 = function(_meta, callback) {
    //    _meta = _meta;
    //    fix_file_meta(_meta);
    //    calculate_meta_defaults();
    //    render_html_repr();
    //    return save_meta_file(function(err, reply) {
    //        return callback(err, _meta);
    //    });
    //};
    //update_storage = function(obj, callback) {
    //    return bucket.put_object(_meta.storage.key, obj, function(err, aws_reply) {
    //        if (err) {
    //            return callback(err, aws_reply);
    //        }
    //        _meta.timestamp = Date.now();
    //        _meta.lastModifiedDate = Date.now();
    //        return callback(null, _meta);
    //    });
    //};
    //update_storage_a = function(storage, callback) {
    //    if (storage.type === 'object') {
    //        return update_storage(storage['buf-str'], function(err, what) {
    //            _meta.timestamp = Date.now();
    //            _meta.lastModifiedDate = Date.now();
    //            return callback(null, _meta);
    //        });
    //    } else if (storage.type === 's3') {
    //        return bucket.copy_object(storage.key, _meta.storage.key, function(err, what) {
    //            _meta.timestamp = Date.now();
    //            _meta.lastModifiedDate = Date.now();
    //            return callback(null, _meta);
    //        });
    //    } else {
    //        return callback("don't know storage type", null);
    //    }
    //};
    //get_client_json = function() {
    //    var err, file_key, filetype, milli, size, unique, value;
    //    milli = 0;
    //    if (typeof _meta.timestamp === "function" ? _meta.timestamp(i) : void 0) {
    //        if (u.isNumber(_meta.timestamp)) {
    //            milli = _meta.timestamp;
    //        } else {
    //            try {
    //                milli = parseInt(_meta.timestamp);
    //            } catch (_error) {
    //                err = _error;
    //                milli = 0;
    //            }
    //        }
    //    }
    //    value = 0;
    //    if (_meta.value != null) {
    //        if (_meta.value.amount != null) {
    //            value = _meta.value.amount;
    //        }
    //    }
    //    file_key = null;
    //    if (_meta.storage != null) {
    //        if (_meta.storage.key != null) {
    //            file_key = _meta.storage.key;
    //        }
    //    }
    //    if (_meta['client_json'] == null) {
    //        _meta['client_json'] = {};
    //    }
    //    size = -1;
    //    if (_meta.size != null) {
    //        size = _meta.size;
    //    }
    //    filetype = '';
    //    if (_meta.filetype != null) {
    //        filetype = _meta.filetype;
    //    }
    //    unique = false;
    //    if ((_meta.unique != null)) {
    //        unique = _meta.unique;
    //    }
    //    _meta['client_json'] = {
    //        name: _meta.name,
    //        path: _meta.path,
    //        uuid: _meta.uuid,
    //        path_uuid: _meta.path_uuid,
    //        file_key: file_key,
    //        value: value,
    //        order: 0 - milli,
    //        milli: milli,
    //        size: size,
    //        filetype: filetype,
    //        unique: unique
    //    };
    //    return _meta['client_json'];
    //};
    //update_meta = function(hash, callback) {
    //    var i, _i, _len, _ref;
    //    if (hash.value) {
    //        _meta.value += hash.value;
    //        delete _meta.value;
    //    }
    //    if (hash.uuid) {
    //        delete hash.uuid;
    //    }
    //    if (hash.path_uuid) {
    //        delete hash.path_uuid;
    //    }
    //    if (hash.dir) {
    //        delete hash.dir;
    //    }
    //    p('update meta: hash: ', hash);
    //    _ref = Object.keys(hash);
    //    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    //        i = _ref[_i];
    //        _meta[i] = hash[i];
    //    }
    //    return save_file_to_folder().then(function(this_get_s3_write_reply) {
    //        var j;
    //        j = get_client_json();
    //        return callback(null, j);
    //    });
    //};
    //remove_storage = function(callback) {
    //    return bucket.delete_object(_meta.storage.key, callback);
    //};
    //get_owner_id = function() {
    //    var guess;
    //    if (_meta_.owner_id != null) {
    //        return _meta.owner_id;
    //    }
    //    guess = _meta.path.split("/")[0];
    //    if (u.isString(guess)) {
    //        return guess;
    //    }
    //    return null;
    //};
    //get_complex_auxiliary_path = function() {
    //    var auxiliary_path, create_time, oid;
    //    create_time = -1;
    //    if (_meta['create_time'] != null) {
    //        create_time = _meta['create_time'];
    //    }
    //    oid = get_owner_id();
    //    if ((oid == null) || !oid) {
    //        throw new Exception('no owner id for folder: ' + _meta.path);
    //    }
    //    oid = oid.toString();
    //    auxiliary_path = path.join(oid, _meta.uuid, create_time);
    //    return auxiliary_path;
    //};
    //file_uuid = function() {
    //    return _meta.uuid;
    //};
    //callback_milli_uuid = function(callback) {
    //    var create_time, milli_uuid;
    //    if (_meta['milli_uuid'] != null) {
    //        return callback(null, _meta['milli_uuid']);
    //    }
    //    if (_meta['create_time'] != null) {
    //        create_time = _meta['create_time'];
    //    } else {
    //        create_time = Date.now();
    //    }
    //    milli_uuid = path.join(create_time.toString(), _meta.uuid);
    //    _meta['milli_uuid'] = milli_uuid;
    //    return save_file_to_folder().then(function() {
    //        return callback(null, milli_uuid);
    //    })["catch"](function(err) {
    //        return callback(err, null);
    //    });
    //};
    //get_file_auxiliary_path = function() {
    //    var key, muuid;
    //    muuid = null;
    //    if (_meta.milli_uuid != null) {
    //        muuid = _meta.milli_uuid;
    //        key = path.join(myconfig.file_auxiliary_prefix, muuid);
    //        _meta.aux_path = key;
    //        return key;
    //    }
    //    return null;
    //};
    //callback_file_auxiliary_path = function(callback) {
    //    if (_meta.aux_path != null) {
    //        return callback(null, _meta.aux_path);
    //    }
    //    callback_milli_uuid(function(err, muuid) {
    //        var key;
    //        if (err) {
    //            return callback(err, null);
    //        }
    //        key = path.join(myconfig.file_auxiliary_prefix, muuid);
    //        _meta.aux_path = key;
    //        return save_file_to_folder().then(function(what) {
    //            return callback(null, key);
    //        })["catch"](function(err) {
    //            return callback(err);
    //        });
    //    });
    //    return null;
    //};
    //_file.version = '3 simple file';
    //_file.get_meta = get_meta;
    //_file.delete_s3_storage = delete_s3_storage;
    //_file.promise_to_delete_s3_storage = promise_to_delete_s3_storage;
    //_file.read_to_string = read_to_string;
    //_file.read_file_to_buffer = read_file_to_buffer;
    //_file.read_stream = read_stream;
    //_file.set_meta = set_meta;
    //_file.calculate_meta_defaults = calculate_meta_defaults;
    //_file.calculate_meta = calculate_meta;
    //_file.increase_value = increase_value;
    //_file.save_meta_file = save_meta_file;
    //_file.retrieve_meta = retrieve_meta;
    //_file.get_saved_meta = get_saved_meta;
    //_file.prepare_html_elements = prepare_html_elements;
    //_file.render_html_repr = render_html_repr;
    //_file.save_file_to_folder = save_file_to_folder;
    //_file.write_s3_storage = write_s3_storage;
    //_file.convert_meta_to_ul = convert_meta_to_ul;
    //_file.build_util_list = build_util_list;
    //_file.build_file_info_list = build_file_info_list;
    //_file.meta2s3 = meta2s3;
    //_file.update_storage = update_storage;
    //_file.update_storage_a = update_storage_a;
    //_file.get_client_json = get_client_json;
    //_file.update_meta = update_meta;
    //_file.remove_storage = remove_storage;
    //_file.callback_milli_uuid = callback_milli_uuid;
    //_file.file_uuid = file_uuid;
    //_file.get_file_auxiliary_path = get_file_auxiliary_path;
    //_file.callback_file_auxiliary_path = callback_file_auxiliary_path;

    return callback(null, _file);
}
module.exports.new_obj = new_obj;



if(require.main === module){
    var p = console.log;
    p('require main === module');
    var file_path = 'tmp/public/t.png';
    var owner = 'tmp';

    function c_a(){
        var file_path = 'tmp/public/t.png';
        var owner = 'tmp';

        var info = {
            path: file_path,
        };

        new_obj(info, function(err, obj){
            //p(err, obj);
            obj.calculate_meta_defaults(function(err, what){
                p(2, err, what);
                p('file meta: ', obj.get_meta());

                setTimeout(process.exit, 2000);
            });
        });
    }
    //c_a();


    function c_0424(file_path, owner){

        var info = {
            path: file_path,
        };

        new_obj(info, function(err, obj){
            //p(err, obj);
            obj.make_s3key_and_meta_s3key(function(err, what){
                //p(2, err, what);
                p('file meta: ', obj.get_meta());

                setTimeout(process.exit, 2000);
            });
        });
    }
    c_0424(file_path, owner);
}
