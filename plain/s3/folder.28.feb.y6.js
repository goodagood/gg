
/*
 * Redo folder object for s3 storage.
 *
 * 2016 0227
 */

var path = require("path");
var fs   = require("fs");
var u    = require("underscore");


var s3prefix = require("../myutils/json-cfg.js").s3_prefix_configure();
var myutil   = require("../myutils/myutil.js");
var user_module = require("../users/a.js");


/*
 * @folder_path : full path of the folder.
 */
function new_obj(folder_path, callback){

    var add_file, add_file_save_folder, add_folder, build_file_list,
        callback_folder_auxiliary_path,
        callback_milli_uuid, check_username, clear_empty_names,
        clear_file_meta, del_uuid_and_name, delete_all_uuid_recursively,
        delete_file, delete_file_by_uuid, delete_folder, delete_name,
        delete_uuid, delete_uuid_in_hash_of_file_names,
        delete_uuid_without_save, file_exists, file_identified_by_uuid,
        folder_milli_uuid, folder_uuid, get_1st_file_obj, get_file_name_array,
        get_file_obj_by_uuid, get_file_objs, get_file_objs_by_name, get_folder,
        get_folder_auxiliary_path, get_member_manager, get_meta,
        get_number_of_name, get_one_file_obj, get_owner_id, get_owner_name,
        get_recent_file_by_name, get_root_name, get_ul_renderring, get_uuids,
        init, is_name_in_meta_files, is_name_unique, is_owner, list_file_tmp,
        list_files, list_files_and_save, list_files_for_owner,
        list_files_for_viewer, lock, lock_async, locker, make_template_data,
        members, name_to_metas, name_to_uuids,
        old_build_blueimp_pic_gallery_list, old_get_file_objs_by_name,
        pattern_to_uuids, promise_to_add_file_save_folder,
        promise_to_clear_empty_names, promise_to_delete_file_by_uuid,
        promise_to_delete_name, promise_to_give_obj,
        promise_to_list_files_and_save, promise_to_one_file_obj,
        promise_to_retrieve_saved_meta, promise_to_save_meta,
        promise_to_write_meta, read_file, read_file_12_15, read_file_by_uuid,
        read_files, read_in_template, read_recent_file_by_name, read_text,
        render_template, retrieve_saved_meta, save_meta, self_render_as_a_file,
        set_attr, sort_files, sort_files_by_date, try_template, update_file,
        update_name, update_sub_folder, update_uuid_storage, user_module,
        uuid_to_delete_file_fun, uuid_to_file_obj, uuid_to_meta, write_meta,
        write_text_file, _add_extra_0929, _add_file_obj_save_folder,
        _add_file_thorough, _add_file_to_redis_list,
        _build_blueimp_pic_gallery_list, _check_in_file, _d_read_file,
        _delete_file, _dot_filter, _empty_promise, 
        _folder_css_file_name_, _get_files_by_name, _get_owner_obj,
        _get_renderring_for_public, _get_renderring_for_viewer,
        _get_short_json_repr, _get_uuids, _give_ul_renderring,
        _list_files_by_id, _member_, _meta_css_file_name_,
        _meta_smells, _new_json_file, _old_get_folder_auxiliary_path,
        _prepare_redis_file_list_key, _ready_, _rename_file, _render_all_files,
        _render_file, _render_folder, _short_clone_of_folder_meta, _sleep,
        _template_file_;


    var _folder = {}; // The object.
    var _meta   = {};

    _member_ = null;
    _ready_ = 0;
    _folder_css_file_name_ = ".gg.folder.css";
    _meta_css_file_name_ = ".gg.meta.css";
    _template_file_ = path.join(__dirname, 'folder-template.html');


    function get_meta () {
        return _meta;
    }

    _folder.get_meta = get_meta;


    function calculate_meta_s3key(callback){
        var path_ = _meta.path || folder_path;

        make_s3key_for_folder_meta_file(path_, function(err, s3key){
            if(err) return callback(err);

            _meta.meta_s3key = s3key;
            callback(null, s3key);
        });
    }

    _folder.calculate_meta_s3key = calculate_meta_s3key;


    function calculate_name_space(){
        if (typeof _meta.uuid === "undefined") {
        }
    }

    // owner: {name: string, id: string}
    function set_owner(owner){
        _meta.owner = owner;
        return _folder;
    }

    function user_can_read(username){
        return false;
    }

    _folder.user_can_read = user_can_read;


    function user_can_write(username){
        return false;
    }

    _folder.user_can_write = user_can_write;


    function user_can_do(username){
        return false;
    }

    _folder.user_can_do = user_can_do;


    // useless?
    function prepare_basic_path(callback) {
        if (typeof _meta.path === 'undefined' || ! _meta.path ) {
            _meta.path = folder_path;
        }
        return calculate_meta_s3key(callback);
    }


    init = function() {
        if (typeof _meta.uuid === "undefined") {
            _meta.uuid = myutil.get_uuid();
        }

        prepare_basic_path();
        _meta.error = false;
        if (typeof _meta.name === "undefined") {
            _meta.name = path.basename(folder_path);
        }
        _meta.filetype = "goodagood-folder";
        if (typeof _meta.renders === "undefined") {
            _meta.renders = {};
        }
        if (typeof _meta.html === "undefined") {
            _meta.html = {};
        }
        if (typeof _meta.files === "undefined") {
            _meta.files = {};
        }
        if (typeof _meta.file_uuids === "undefined") {
            _meta.file_uuids = {};
        }
        if (typeof _meta.file_names === "undefined") {
            _meta.file_names = {};
        }
        _meta.what = myconfig.IamFolder;
        return _meta;
    };

    file_exists = function(filename) {
        if (typeof _meta === "undefined") {
            return false;
        }
        if (typeof _meta.file_names === "undefined") {
            return false;
        }
        if (_meta.file_names[filename] != null) {
            return true;
        }
        return is_name_in_meta_files(filename);
    };
    is_name_in_meta_files = function(name) {
        var candidate, file_meta_list;
        file_meta_list = u.values(_meta.files);
        candidate = u.find(file_meta_list, function(file_meta) {
            return file_meta.name === name;
        });
        if (!candidate) {
            return false;
        }
        if (u.isEmpty(candidate)) {
            return false;
        }
        return candidate.name === name;
    };
    _prepare_redis_file_list_key = function(callback) {
        if (typeof _meta.redis_file_list === "string") {
            return;
        }
        return redis_basic.serial_number(function(err, number) {
            var key;
            if (err) {
                return null;
            }
            key = myconfig.redis_folder_file_list_prefix + number;
            _meta.redis_file_list = key;
            return save_meta(function(err, _meta) {
                if (err) {
                    log28("save _meta ERROR in prepare redis file list key", _meta);
                }
                if (callback) {
                    return callback();
                }
            });
        });
    };
    _add_file_to_redis_list = function(file_meta, callback) {
        var simple_info, str;
        if (typeof _meta.redis_file_list !== "string") {
            return _prepare_redis_file_list_key(callback);
        }
        log28("add file to redis list, redis key: ", _meta.redis_file_list);
        simple_info = u.pick(file_meta, "name", "size", "meta_file", "meta_s3key", "filetype");
        str = JSON.stringify(simple_info);
        redis_basic.client.lpush(_meta.redis_file_list, str, callback);
    };
    _add_file_thorough = function(file_meta, callback) {
        _add_file_to_redis_list(file_meta, function(err, reply) {
            if (err) {
                log28("failed to add file info to redis", file_meta.path);
            }
            _meta.files[file_meta.name] = file_meta;
            build_file_list();
            if (callback) {
                callback();
            }
        });
    };
    _check_in_file = function(file_meta, callback) {
        _meta.file_uuids[file_meta.uuid] = file_meta;
        if (typeof _meta.file_names[file_meta.name] === "undefined") {
            _meta.file_names[file_meta.name] = [file_meta];
        } else if (u.isArray(_meta.file_names[file_meta.name])) {
            _meta.file_names[file_meta.name].push(file_meta);
        } else {
            return callback("err, it is not an array", null);
        }
        build_file_list();
        return callback(null, _meta.file_name[file_meta.name]);
    };
    _add_extra_0929 = function(file_meta) {
        var repr;
        repr = _get_short_json_repr(file_meta);
        _meta.file_uuids[file_meta.uuid] = repr;
        if (_meta.file_names[file_meta.name] != null) {
            if (_meta.file_names[file_meta.name].indexOf(file_meta.uuid) < 0) {
                return _meta.file_names[file_meta.name].push(file_meta.uuid);
            }
        } else {
            return _meta.file_names[file_meta.name] = [file_meta.uuid];
        }
    };
    add_file = function(file_meta) {
        if ((_meta.files != null) && _meta.files) {
            _meta.files[file_meta.uuid] = file_meta;
        }
        _add_extra_0929(file_meta);
        sort_files_by_date();
        return build_file_list();
    };
    add_file_save_folder = function(file_meta, callback) {
        add_file(file_meta);
        return save_meta(callback);
    };
    promise_to_add_file_save_folder = Promise.promisify(add_file_save_folder);
    _add_file_obj_save_folder = function(file_obj, callback) {
        return add_file_save_folder(file_obj.get_meta(), callback);
    };
    update_sub_folder = function(sub_folder_meta, callback) {
        add_file(_short_clone_of_folder_meta(sub_folder_meta));
        return save_meta(callback);
    };
    get_file_objs = function(name, callback) {
        var err, ulist;
        if (!file_exists(name)) {
            return callback('no such file: ' + name, null);
        }
        ulist = get_uuids(name);
        p('ulist 0923: ', ulist);
        if ((ulist == null) || u.isEmpty(ulist)) {
            err = "Can not get uuid in folder " + _meta.path + ", in 'get file objs'.";
            return callback(err, null);
        }
        if (!u.isArray(ulist)) {
            err = "uuid is not an array in folder " + _meta.path + ", in 'get file objs'.";
            return callback(err, null);
        }
        return async.map(ulist, uuid_to_file_obj, callback);
    };
    get_1st_file_obj = function(name, callback) {
        var err, ulist;
        if (!file_exists(name)) {
            return callback('no such file: ' + name, null);
        }
        ulist = get_uuids(name);
        p('ulist 1031: ', ulist);
        if ((ulist == null) || u.isEmpty(ulist)) {
            err = "Can not get uuid in folder " + _meta.path + ", in 'get file objs'.";
            return callback(err, null);
        }
        if (!u.isArray(ulist)) {
            err = "uuid is not an array in folder " + _meta.path + ", in 'get file objs'.";
            return callback(err, null);
        }
        return uuid_to_file_obj(ulist[0], callback);
    };

    retrieve_saved_meta = function(callback) {
        var folder_meta_key;
        if (_meta.meta_s3key == null) {
            prepare_basic_path();
        }
        folder_meta_key = void 0;
        if (_meta.meta_s3key != null) {
            folder_meta_key = _meta.meta_s3key;
        }
        if (_meta.folder_meta_s3key != null) {
            folder_meta_key = _meta.folder_meta_s3key;
        }
        return bucket.read_json(folder_meta_key, function(err, meta_) {
            if (err) {
                _meta.error = err;
                return callback(err, null);
            }
            _meta = meta_;
            return callback(null, _meta);
        });
    };
    promise_to_retrieve_saved_meta = Promise.promisify(retrieve_saved_meta);
    is_owner = function(username) {
        var guess_root_str;
        if (!u.isString(username)) {
            return false;
        }
        if (_meta.owner != null) {
            if (typeof _meta.owner === "string" && username === _meta.owner) {
                return true;
            }
        }
        if (_meta.owner.username != null) {
            if (username === _meta.owner.username) {
                return true;
            }
        }
        guess_root_str = _meta.path.split("/")[0];
        if (username === guess_root_str) {
            return true;
        }
        return false;
    };

    get_owner_name = function() {
        var guess, r;
        r = /^\s*$/;
        if (_meta.owner != null) {
            if (u.isString(_meta.owner) && !r.test(_meta.owner)) {
                return _meta.owner;
            }
            if (!u.isEmpty(_meta.owner.name)) {
                return _meta.owner.name;
            }
        }
        guess = _meta.path.split("/")[0];
        if (u.isString(guess) && !r.test(guess)) {
            _meta.owner = guess;
            return _meta.owner;
        }
        return null;
    };
    get_root_name = function(callback) {
        var guess, owner;
        owner = get_owner_name();
        if (owner) {
            return user_module.get_user_id(owner, callback);
        }
        guess = _meta.path.split("/")[0];
        return callback(null, guess);
    };
    get_owner_id = function() {
        var guess;
        if (_meta.owner_id != null) {
            return _meta.owner_id;
        }
        guess = _meta.path.split("/")[0];
        if (u.isString(guess)) {
            return guess;
        }
        return null;
    };
    _get_owner_obj = function(callback) {
        var name, user;
        name = get_owner_name();
        if (name) {
            user = avatar.make_user_obj(name);
            avatar.make_user_obj(name, function(user) {
                user.init(callback);
            });
        } else {
            callback(null);
        }
    };
    _new_json_file = function(filename, content_json) {
        var data, file_name, file_path;
        file_name = filename;
        file_path = path.join(_meta.path, file_name);
        data = {
            name: file_name,
            path: file_path,
            filetype: "json",
            owner: {
                username: _meta.path,
                timestamp: Date.now()
            },
            permission: {
                owner: "rwx",
                group: "",
                other: ""
            }
        };
        return json_file.new_json_file_obj(data, function(jobj) {
            jobj.set_up_from_json(content_json);
            add_file(jobj.get_meta());
            return save_meta();
        });
    };
    build_file_list = function() {
        _list_files_by_id();
        return list_files_for_owner();
    };
    _list_files_by_id = function() {
        var ul;
        ul = "<ul class=\"file-list list-unstyled\">";
        u.each(_meta.files, function(file) {
            var li;
            if (file.name.indexOf(".gg") !== 0) {
                li = "<li class=\"file\">\n";
                li += "<span class=\"filename\">" + file.name + "</span>&nbsp;\n";
                if (file.size) {
                    li += "<span class=\"size\">" + file.size + "</span>&nbsp;\n";
                }
                li += "<span class=\"size\">" + file.path + "</span>&nbsp;\n";
                li += "<span class=\"size\">" + file.uuid + "</span>&nbsp;\n";
                li += "</li>\n";
                ul += li;
            }
        });
        ul += "</ul>";
        _meta.renders.simple_ul = ul;
    };
    _dot_filter = function(file_list) {
        if (!u.isArray(file_list)) {
            p('fuck not array found in "dot filter"');
        }
        return file_list.filter(function(file) {
            if (file.name.indexOf(".") === 0) {
                return false;
            } else {
                return true;
            }
        });
    };
    list_files = function(file_list) {
        var ul, ulv;
        file_list = _dot_filter(file_list);
        ul = "<ul class=\"folder-list list-unstyled\">";
        ulv = "<ul class=\"folder-list list-unstyled\">";
        u.each(file_list, function(file) {
            if (file.html != null) {
                if (file.html.li != null) {
                    if (file.name.indexOf(".gg") !== 0) {
                        ul += file.html.li;
                        return ulv += file.html.li_viewer;
                    }
                }
            }
        });
        ul += "</ul>";
        ulv += "</ul>";
        _meta.renders.ul = ul;
        return _meta.renders.ul_for_viewer = ulv;
    };
    list_files_for_owner = function() {
        var ul;
        ul = '<ul class="folder-list list-unstyled" data-cwd="">';
        u.each(_meta.files, function(file) {
            if (file.html != null) {
                if (file.html.li != null) {
                    if (file.name.indexOf(".gg") !== 0) {
                        return ul += file.html.li;
                    }
                }
            }
        });
        ul += "</ul>";
        return _meta.renders.ul = ul;
    };
    list_files_for_viewer = function() {
        var ul;
        ul = "<ul class=\"folder-list list-unstyled\">";
        u.each(_meta.files, function(file) {
            if (file.html != null) {
                if (file.html.li_viewer != null) {
                    if (file.name.indexOf(".gg") !== 0) {
                        return ul += file.html.li_viewer;
                    }
                }
            }
        });
        ul += "</ul>";
        return _meta.renders.ul_for_viewer = ul;
    };
    _render_folder = function() {
        return build_file_list();
    };
    get_ul_renderring = function() {
        if (_meta == null) {
            return "<ul> <li> ERROR, _meta is undefined </li></ul>";
        }
        if (!_meta) {
            return "<ul> <li> ERROR, _meta is equal to something false? </li></ul>";
        }
        if (_meta.renders == null) {
            return "<ul> <li> ERROR, _meta.renders is undefined? </li></ul>";
        }
        if (_meta.renders.ul == null) {
            return "<ul> <li> ERROR, _meta.renders.ul is undefined </li></ul>";
        }
        return _meta.renders.ul;
    };
    _get_renderring_for_viewer = function() {
        if (typeof _meta.renders === "undefined") {
            _meta.renders = {};
        }
        if (typeof _meta.renders.ul_for_viewer !== "undefined") {
            return _meta.renders.ul_for_viewer;
        }
        return "<ul><li>Currently not prepared ready for viewers</li></ul>";
    };
    _get_renderring_for_public = function() {
        if (typeof _meta.renders === "undefined") {
            _meta.renders = {};
        }
        if (typeof _meta.renders.ul_for_public !== "undefined") {
            return _meta.renders.ul_for_public;
        }
        return "<ul><li>Currently not prepared for public viewers</li></ul>";
    };
    _give_ul_renderring = function(viewer_name, callback) {
        if (is_owner(viewer_name)) {
            return callback(get_ul_renderring());
        }
        if (_member_ === null) {
            return callback(_get_renderring_for_public());
        }
        return _member_._has_member(viewer_name, function(is_member) {
            if (is_member) {
                return callback(get_ul_renderring());
            }
            return _member_._has_viewer(viewer_name, function(is_viewer) {
                if (is_viewer) {
                    return callback(_get_renderring_for_viewer());
                }
                return callback(_get_renderring_for_public());
            });
        });
    };
    members = require("./members.js");
    get_member_manager = function() {
        return members.retrieve_member_obj(_meta.path).then(function(obj) {
            _member_ = obj;
            return _member_;
        });
    };
    check_username = function(username, callback) {
        var err;
        if (is_owner(username)) {
            return callback(null, "owner");
        }
        if (_member_ == null) {
            return callback(null, "who-known");
        }
        if (u.isNull(_member_)) {
            return callback(null, "who-known");
        }
        if (!_member_.folder_initialized()) {
            return callback(null, "who-known");
        }
        if ((_member_ != null) && !u.isNull(_member_)) {
            return _member_.check_members_file_exists().then(function(exists) {
                if (!exists) {
                    return callback(null, "who-known");
                } else {
                    return _member_.check_user_role(username, callback);
                }
            });
        } else {
            err = 'has no member manager';
            p(err, ' in check username, ', _meta.path);
            return callback(err, 'who-known');
        }
    };
    locker = require("./folder-lock.js");
    lock = function() {
        return locker.lock_path(_meta.path);
    };
    lock_async = function(callback) {
        return locker.lock_path_async(_meta.path, callback);
    };
    save_meta = function(callback) {
        p('in save meta, ', _meta.meta_s3key, _meta.path);
        return lock_async(function(lock_err, unlocker) {
            if (lock_err) {
                p(lock_err, '--!!--');
            }
            return bucket.write_json(_meta.meta_s3key, _meta, function(write_err, write_reply) {
                return unlocker(function(unlock_err, unlock_reply) {
                    return callback(write_err, write_reply);
                });
            });
        });
    };
    promise_to_save_meta = Promise.promisify(save_meta);
    write_meta = function(callback) {
        return bucket.write_json(_meta.meta_s3key, _meta, callback);
    };
    promise_to_write_meta = Promise.promisify(write_meta);
    _meta_smells = function() {
        if (u.isEmpty(_meta)) {
            return true;
        }
        if (typeof _meta.name === "undefined") {
            return true;
        }
        if (!_meta.name) {
            return true;
        }
        if (typeof _meta.path === "undefined") {
            return true;
        }
        if (!_meta.path) {
            return true;
        }
        if (typeof _meta.meta_file_path === "undefined") {
            return true;
        }
        if (!_meta.meta_file_path) {
            return true;
        }
        return false;
    };
    _render_file = function(filename, callback) {
        get_file_objs(filename, function(file_obj) {
            var file_meta;
            file_obj.render_html_repr();
            file_meta = file_obj.get_meta();
            _meta.files[filename] = file_meta;
        });
    };
    _render_all_files = function() {
        var keys;
        keys = u.keys(_meta.files);
        keys.forEach(function(filename) {
            console.log(filename);
            return _render_file(filename, function() {});
        });
        build_file_list();
        save_meta();
    };
    _delete_file = function(filename, callback) {
        get_file_objs(filename, function(fobj) {
            fobj.delete_s3_storage();
        });
        delete _meta.files[filename];
        build_file_list();
        save_meta();
        if (callback) {
            callback();
        }
    };
    _rename_file = function(filename, new_name) {
        var new_meta;
        new_meta = u.omit(_meta.files[filename], "path", "html", "local_file", "timestamp", "s3_stream_href", "delete_href");
        new_meta.name = new_name;
        new_meta.path = path.join(_meta.path, new_name);
        return s3file.simple_s3_file_obj(new_meta, function(err, fobj) {
            fobj.set_meta(new_meta);
            fobj.calculate_meta_defaults();
            return fobj.switch_with_filetype(function(typed_fobj) {
                typed_fobj.render_html_repr();
                add_file(typed_fobj.get_meta());
                delete _meta.files[filename];
                build_file_list();
                return save_meta(function() {});
            });
        });
    };
    self_render_as_a_file = function() {
        var li;
        li = "<li class=\"folder\">";
        li += "<span class=\"glyphicon glyphicon-folder-close\"> </span>&nbsp;";
        li += "&nbsp;<a href=\"/ls/" + _meta.path + "\" >" + _meta.name + "</a>";
        li += "</li>\n";
        if (_meta.html == null) {
            _meta.html = {};
        }
        return _meta.html.li = li;
    };
    _build_blueimp_pic_gallery_list = function() {
        var file_uuids, list;
        list = [];
        file_uuids = Object.keys(_meta.files);
        p('length: ', file_uuids.length);
        file_uuids.forEach(function(uuid) {
            var file_info, href, one, thumb, value;
            if (_meta.files[uuid].filetype === "image") {
                file_info = _meta.files[uuid];
                href = path.join('/file-full-path', file_info.path);
                thumb = void 0;
                if (file_info.thumb.defaults.s3key != null) {
                    thumb = path.join(myconfig.s3_stream_prefix, file_info.thumb.defaults.s3key);
                } else {
                    thumb = "";
                }
                value = 'not calculated';
                if (file_info.value != null) {
                    value = file_info.value.amount;
                }
                one = "<a href=\"" + href + "\" title=\"" + file_info.name + "\" \ndata-description=\"Value: " + value + "\" >\n    <img src=\"" + thumb + "\"  alt=\"" + file_info.name + "\"\n         class=\"folder-image\" data-pu=\"" + file_info.path_uuid + "\" > \n</a>";
                return list.push(one);
            }
        });
        return list;
    };
    old_build_blueimp_pic_gallery_list = function() {
        var file_names, list;
        list = [];
        file_names = Object.keys(_meta.files);
        return file_names.forEach(function(name) {
            var fileInfo, one, src, thumb;
            if (_meta.files[name].filetype === "image") {
                fileInfo = _meta.files[name];
                src = path.join(myconfig.s3_stream_prefix, fileInfo.storage.key);
                thumb = void 0;
                if (fileInfo["thumbnail-s3key"]) {
                    thumb = path.join(myconfig.s3_stream_prefix, fileInfo["thumbnail-s3key"]);
                } else {
                    thumb = "";
                }
                one = "<a href=\"" + src + "\" title=\"" + fileInfo.name + "\" data-description=\"The value keep increasing justly\" >";
                one += "<img src=\"" + thumb + "\" alt=\"" + fileInfo.name + "\"> </a>";
                list.push(one);
            }
            return list;
        });
    };
    sort_files_by_date = function() {
        var files;
        files = sort_files('timestamp', true);
        list_files(files);
        return files;
    };
    sort_files = function(key, descend) {
        var files, sorted;
        descend = descend || false;
        files = u.values(_meta.files);
        if ((files.length == null) || files.length < 1) {
            return null;
        }
        sorted = u.sortBy(files, function(element) {
            if (element[key] != null) {
                return element[key];
            } else {
                return 0;
            }
        });
        if (descend) {
            sorted.reverse();
        }
        return sorted;
    };
    uuid_to_meta = function(uuid) {
        var m;
        m = null;
        if (uuid != null) {
            if (_meta.files[uuid] != null) {
                m = _meta.files[uuid];
            }
        }
        return m;
    };
    _get_files_by_name = function(name, callback) {
        var uuid_list;
        uuid_list = _meta.file_names[name];
        return async.parallel(uuid_list, uuid_to_meta, function(err, meta_list) {
            console.log(err, meta_list);
            return callback(err, meta_list);
        });
    };
    _get_short_json_repr = function(_meta) {
        var repr;
        _meta = _meta || _meta;
        repr = u.pick(_meta, "name", "meta_s3key", "size", "timestamp", "filetype");
        repr["short-json"] = true;
        return repr;
    };
    read_text = function(filename, callback) {
        p('read text');
        return get_file_objs(filename, function(err, objs) {
            async.map(objs, function(o, callback) {
                return o.read_to_string(callback);
            }, function(err, read_results) {
                p('got what?\n', err, read_results);
                return callback(err, read_results);
            });
            return callback(err, objs);
        });
    };
    _d_read_file = function(filename) {
        if (_ready_ < 1) {
            throw 'global objects must be _ready_.';
        }
        return new Promise(function(resolve, reject) {
            return get_file_objs(filename, function(err, objs) {
                var file;
                if (objs.length >= 1) {
                    file = objs[0];
                    return file.read_to_string(function(err, str) {
                        if (err) {
                            reject(err);
                        }
                        return resolve(str);
                    });
                } else {
                    return reject('no obj after read file');
                }
            });
        });
    };
    read_file_12_15 = function(filename, callback) {
        return get_file_objs(filename, function(err, objs) {
            var file;
            if (err) {
                callback(err, objs);
            }
            if (u.isNull(objs)) {
                callback(err, objs);
            }
            if ((objs.length != null) && objs.length >= 1) {
                file = objs[0];
                return file.read_to_string(callback);
            } else {
                err = 'no file got in "read file 12 15", ' + filename;
                p('got err in "read file 12 15" ', err);
                return callback(err, null);
            }
        });
    };
    read_file = Promise.promisify(read_file_12_15);
    get_recent_file_by_name = function(filename, callback) {
        var id, metas;
        metas = name_to_metas(filename);
        if (metas == null) {
            return null;
        }
        if (metas.length === 0) {
            return null;
        }
        u.sortBy(metas, function(meta) {
            return meta.timestamp;
        });
        id = metas[0].uuid;
        assert(u.isString(id), 'should we think uuid is a string?');
        return uuid_to_file_obj(id, callback);
    };
    read_recent_file_by_name = function(filename, callback) {
        return get_recent_file_by_name(filename, function(err, file) {
            if (err) {
                return callback('got err when "reading recent file by name": ' + filename + err, null);
            }
            return file.read_to_string(callback);
        });
    };
    read_files = function(filename) {
        if (_ready_ < 1) {
            throw 'global objects must be _ready_.';
        }
        return new Promise(function(resolve, reject) {
            return get_file_objs(filename, function(err, objs) {
                var read_one;
                read_one = function(file_obj, callback) {
                    return file_obj.read_to_string(function(err, str) {
                        if (str) {
                            return callback(null, str);
                        } else {
                            return callback('err happen?', null);
                        }
                    });
                };
                return async.map(objs, read_one, function(err, file_contents) {
                    if (err) {
                        return reject(err);
                    } else {
                        return resolve(file_contents);
                    }
                });
            });
        });
    };
    read_file_by_uuid = function(uuid) {
        if (_ready_ < 1) {
            throw 'global objects must be _ready_.';
        }
        return get_file_obj_by_uuid(uuid).then(function(file) {
            return new Promise(function(resolve) {
                return file.read_to_string(function(err, str) {
                    return resolve(str);
                });
            });
        });
    };
    write_text_file = function(filename, text) {
        var err, _owner, _path;
        _owner = _meta.owner;
        if (!u.isString(_owner)) {
            err = 'no owner information in "write text file" in folder: ' + _meta.path + '. writing filename: ' + filename;
            return Promise.reject(err);
        }
        _path = _meta.path;
        if (!u.isString(_path)) {
            err = 'no path information in "write text file" in folder: ' + _meta.path + '. writing filename: ' + filename;
            return Promise.reject(err);
        }
        return s3file.write_text_file(_owner, _path, filename, text);
    };
    get_file_obj_by_uuid = function(uuid) {
        var file_meta;
        if (_ready_ < 1) {
            throw 'global objects must be ready: _obj_, _meta, _ready_';
        }
        if (!_meta.files[uuid]) {
            throw "no such uuid in _meta.files " + uuid;
        }
        file_meta = _meta.files[uuid];
        return s3file.promised_simple_s3_file_obj(file_meta).then(function(file_obj) {
            return file_obj;
        });
    };
    get_uuids = function(filename) {
        if (_meta.file_names[filename] != null) {
            return _meta.file_names[filename];
        } else {
            return [];
        }
    };
    _get_uuids = function(filename) {
        var metas, uuids;
        metas = u.filter(_meta.files, function(id) {
            return _meta.files[id][name] === filename;
        });
        uuids = u.map(metas, function(m) {
            return m.uuid;
        });
        return uuids;
    };
    name_to_metas = function(filename) {
        var meta_list, meta_want;
        meta_list = u.values(_meta.files);
        meta_want = u.filter(meta_list, function(meta) {
            return meta.name === filename;
        });
        return meta_want;
    };
    name_to_uuids = function(filename) {
        var meta_list, uuid_list;
        meta_list = name_to_metas(filename);
        uuid_list = u.map(meta_list, function(meta) {
            return meta.uuid;
        });
        return uuid_list;
    };
    get_number_of_name = function(filename) {
        if (_meta.file_names[filename] != null) {
            return _meta.file_names[filename].length;
        } else {
            return 0;
        }
    };
    get_file_name_array = function() {
        return Object.keys(_meta.file_names);
    };
    pattern_to_uuids = function(pattern) {
        var flatten, got, names, uuids;
        if (!u.isRegExp(pattern)) {
            pattern = /^[^.]\w.*/;
        }
        names = get_file_name_array();
        got = names.filter(function(str) {
            var place;
            place = str.search(pattern);
            if (place >= 0) {
                return true;
            }
        });
        names = got;
        if (!u.isArray(names)) {
            throw 'get no names in "pattern to uuids"';
        }
        uuids = names.map(get_uuids);
        flatten = u.flatten(uuids);
        return flatten;
    };
    uuid_to_file_obj = function(uuid, callback) {
        var err_msg, file_meta;
        file_meta = _meta.files[uuid];
        if (file_meta != null) {
            if (file_meta.what === myconfig.IamFolder) {
                err_msg = 'It is a folder: ' + uuid;
                return callback(err_msg, null);
            }
        } else {
            return callback('not such uuid as a file', null);
        }
        p('s3file type.set file obj...');
        return s3file_type.set_file_obj_from_meta(file_meta, callback);
    };
    get_file_objs_by_name = get_file_objs;
    old_get_file_objs_by_name = function(name, callback) {
        var uuid_list;
        uuid_list = get_uuids(name);
        return async.map(uuid_list, uuid_to_file_obj, callback);
    };
    get_one_file_obj = function(name, callback) {
        return get_file_objs(name, function(err, obj_list) {
            var err_msg;
            if (err) {
                return callback(err, obj_list);
            }
            if (obj_list.length < 1) {
                err_msg = 'no obj found in: ' + '"get one file obj"';
                return callback(err_msg, null);
            }
            return callback(err, obj_list[0]);
        });
    };
    promise_to_one_file_obj = Promise.promisify(get_one_file_obj);
    del_uuid_and_name = function(uuid, name) {
        var file_meta, fn, idx;
        file_meta = _meta.files[uuid];
        name = name || file_meta.name;
        if (_meta.files[uuid] != null) {
            delete _meta.files[uuid];
        }
        delete _meta.file_uuids[uuid];
        fn = _meta.file_names[name];
        if (!fn) {
            return;
        }
        idx = fn.indexOf(uuid);
        if (idx != null) {
            fn.splice(idx, 1);
        }
        if (fn.length < 1) {
            return delete _meta.file_names[name];
        }
    };
    delete_uuid_without_save = function(uuid, callback) {
        var file_meta, filename;
        p("delete uuid: ", uuid);
        file_meta = _meta.files[uuid];
        filename = file_meta.name;
        p("name is " + filename);
        return get_file_obj_by_uuid(uuid).then(function(obj) {
            p('got obj: ', obj);
            return obj.promise_to_delete_s3_storage();
        }).then(function(what) {
            p('what in "delete uuid": ', what);
            del_uuid_and_name(uuid);
            return callback(null, uuid);
        });
    };
    delete_uuid = function(uuid, callback) {
        return delete_uuid_without_save(uuid, function(err, uuid) {
            build_file_list();
            return promise_to_save_meta().then(function(what) {
                return callback(null, what);
            })["catch"](callback);
        });
    };
    delete_file_by_uuid = function(uuid, callback) {
        var file_meta, filename;
        p("delete file by uuid: ", uuid);
        file_meta = _meta.files[uuid];
        assert(u.isObject(file_meta), "we can not get file meta of the uuid: " + uuid);
        filename = file_meta.name;
        assert(u.isString(filename), "we can not get file name of the uuid: " + uuid);
        p("name is " + filename);
        return uuid_to_file_obj(uuid, function(err, obj) {
            return obj.delete_s3_storage(function(err, res) {
                del_uuid_and_name(uuid);
                build_file_list();
                return save_meta(callback);
            });
        });
    };
    promise_to_delete_file_by_uuid = Promise.promisify(delete_file_by_uuid);
    clear_file_meta = function(uuid) {
        var file_meta, name;
        file_meta = _meta.files[uuid];
        if (u.isEmpty(file_meta)) {
            return false;
        }
        name = file_meta.name;
        delete_uuid_in_hash_of_file_names(uuid, name);
        if (_meta.files[uuid] != null) {
            delete _meta.files[uuid];
        }
        return delete _meta.file_uuids[uuid];
    };
    delete_uuid_in_hash_of_file_names = function(uuid, name) {
        var idx, uuids_with_same_name;
        name = name || _meta.files[uuid].name;
        if (!name) {
            return false;
        }
        uuids_with_same_name = _meta.file_names[name];
        if (!uuids_with_same_name) {
            return false;
        }
        idx = uuids_with_same_name.indexOf(uuid);
        if (idx != null) {
            uuids_with_same_name.splice(idx, 1);
        }
        if (uuids_with_same_name.length < 1) {
            delete _meta.file_names[name];
        }
        return true;
    };
    _sleep = function(seconds) {
        seconds = seconds || 1;
        return new Promise(function(resolve) {
            return setTimeout(resolve, seconds * 1000);
        });
    };
    _empty_promise = new Promise(function(resolve) {});
    delete_name = function(name, callback) {
        var funs, uuids;
        uuids = _meta.file_names[name];
        if ((uuids == null) || !uuids || u.isEmpty(uuids || uuids.length === 0)) {
            return callback("no uuid to delete? in 'delete name', path: " + _meta.path, null);
        }
        funs = uuids.map(function(id) {
            return function(callback) {
                return delete_file_by_uuid(id, callback);
            };
        });
        return async.series(funs, callback);
    };
    promise_to_delete_name = Promise.promisify(delete_name);
    delete_folder = function(uuid, callback) {
        var err, name;
        name = _meta.files[uuid].name;
        if (!file_exists(name)) {
            err = 'no such folder to delete: ' + name;
            return callback(err, null);
        }
        folder_path = path.join(_meta.path, name);
        return retrieve_folder(folder_path).then(function(child_folder) {
            return child_folder.delete_all_uuid_recursively(function(err, del) {
                var file_meta, filename;
                p("delete uuid: ", uuid);
                file_meta = _meta.files[uuid];
                filename = file_meta.name;
                p("name is " + filename);
                del_uuid_and_name(uuid);
                callback(null, uuid);
                build_file_list();
                return promise_to_save_meta(callback);
            });
        });
    };
    clear_empty_names = function(callback) {
        var key, uuids, _i, _len, _ref;
        p(Object.keys(_meta.file_names));
        _ref = Object.keys(_meta.file_names);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            key = _ref[_i];
            p('here: ', key);
            uuids = _meta.file_names[key];
            p("see if has uuids, key: " + key + " get uuids: ", uuids);
            if ((uuids == null) || !uuids || u.isEmpty(uuids || uuids.length === 0)) {
                p('try to delete: ', key);
                delete _meta.file_names[key];
            }
        }
        build_file_list();
        return save_meta(callback);
    };
    promise_to_clear_empty_names = Promise.promisify(clear_empty_names);
    uuid_to_delete_file_fun = function(uuid) {
        var fun;
        fun = function(callback) {
            p('going to delete one file: ', uuid);
            return delete_file_by_uuid(uuid, callback);
        };
        return fun;
    };
    delete_file = function(name, callback) {
        var funs, uuids;
        uuids = _meta.file_names[name];
        if (!uuids) {
            return callback("get no uuids for " + name, null);
        }
        if (uuids.length == null) {
            return callback("uuids has no 'length' for " + name, null);
        }
        funs = uuids.map(uuid_to_delete_file_fun);
        return async.series(funs, callback);
    };
    delete_all_uuid_recursively = function(callback) {
        var err, len, uuid, uuid_list;
        uuid_list = Object.keys(_meta.files);
        assert(u.isArray(uuid_list));
        len = uuid_list.length;
        if (len > 0) {
            uuid = uuid_list[0];
            return delete_file_by_uuid(uuid, function(err, result) {
                if (err) {
                    return callback(err, result);
                }
                if (len > 1) {
                    return delete_all_uuid_recursively(callback);
                } else {
                    return callback(err, result);
                }
            });
        } else {
            err = 'empty file list? in "delete all uuid recursively": ' + _meta.path;
            return callback(err, null);
        }
    };
    list_files_and_save = function(callback) {
        build_file_list();
        return save_meta(function(err, meta) {
            return callback(err, _folder);
        });
    };
    promise_to_list_files_and_save = Promise.promisify(list_files_and_save);
    _short_clone_of_folder_meta = function(input_meta) {
        var err, out_meta, to_delete;
        to_delete = ["files", "file_uuids", "file_names", "renders"];
        out_meta = null;
        try {
            out_meta = JSON.parse(JSON.stringify(input_meta));
        } catch (_error) {
            err = _error;
            p('- going to use input meta');
            out_meta = input_meta;
        }
        to_delete.forEach(function(n) {
            return delete out_meta[n];
        });
        return out_meta;
    };
    add_folder = function(name) {
        var Meta, Obj, new_folder_path, opt_;
        new_folder_path = path.join(_meta.path, name);
        opt_ = {
            name: name,
            path: new_folder_path,
            uuid: myutil.get_uuid(),
            'parent-dir': _meta.path,
            timestamp: Date.now(),
            owner: _meta.owner,
            permission: {
                owner: 'rwx',
                group: '',
                other: ''
            },
            html: {}
        };
        if ((_meta['owner-undefined'] != null) && _meta['owner-undefined']) {
            opt_['owner-undefined'] = true;
            opt_['inherite-owner'] = true;
        }
        Obj = null;
        Meta = null;
        return make_promisified_s3folder(opt_.path).then(function(obj) {
            Obj = obj;
            Obj.init(opt_);
            assert(u.isFunction(Obj.self_render_as_a_file_promised));
            return Obj.self_render_as_a_file();
        }).then(function() {
            Obj.build_file_list();
            Meta = Obj.get_meta();
            return Obj.promise_to_write_meta();
        }).then(function() {
            add_file(_short_clone_of_folder_meta(Meta));
            return promise_to_save_meta();
        }).then(function() {
            return Obj;
        });
    };
    get_folder = function(name) {
        if (!file_exists(name)) {
            return Promise.reject('no such name, when "get folder" in ' + _meta.path);
        }
        folder_path = path.join(_meta.path, name);
        return retrieve_folder(folder_path);
    };
    list_file_tmp = function() {
        var str;
        str = '';
        u.each(_meta.files, function(file) {
            if (file.html != null) {
                if (file.html.li != null) {
                    if (file.name.indexOf(".gg") !== 0) {
                        return str += file.html.li;
                    }
                }
            }
        });
        return str;
    };
    read_in_template = function(callback) {
        return fs.readFile(_template_file_, function(err, buf) {
            var str;
            if (err) {
                return callback(err, buf);
            }
            str = buf.toString();
            p('folder template string: ', err, str);
            if (_meta.html == null) {
                _meta.html = {};
            }
            try {
                _meta.html.template = u.template(str);
            } catch (_error) {
                err = _error;
                _meta.html.template = null;
                return callback(err, null);
            }
            callback(null, _meta.html.template);
            return _meta.html.template;
        });
    };
    make_template_data = function() {
        var d;
        d = {};
        d.folder_path = _meta.path;
        d.file_list = list_file_tmp();
        return d;
    };
    render_template = function(callback) {
        var data, template;
        data = make_template_data();
        if ((_meta.html != null) && (_meta.html.template != null)) {
            template = _meta.html.template;
            return try_template(template, data, callback);
        }
        return read_in_template(function(err, template) {
            data = get_client_json();
            return try_template(template, data, callback);
        });
    };
    try_template = function(template, data, callback) {
        var err, html;
        try {
            html = template(data);
            return callback(null, html);
        } catch (_error) {
            err = _error;
            return callback(err, null);
        }
    };
    is_name_unique = function(name) {
        var m0, metas;
        metas = u.filter(u.values(_meta.files), function(m) {
            return m['name'] === name;
        });
        if ((metas.length == null) || metas.length < 1) {
            return false;
        }
        m0 = metas[0];
        if ((m0.unique != null) && m0.unique) {
            return true;
        }
        return false;
    };
    update_file = function(meta, callback) {
        if ((meta.name != null)) {
            return update_name(name, meta, callback);
        }
        if ((meta.uuid != null)) {
            return update_uuid(uuid, meta, callback);
        }
    };
    update_name = function(name, callback) {
        return callback('not implemented', null);
    };
    update_uuid_storage = function(meta, callback) {
        var old, uuid;
        if ((meta.uuid == null) || !meta.uuid) {
            return callback('uuid should come when update uuid', null);
        }
        uuid = meta.uuid;
        return old = _meta.files[uuid];
    };
    _old_get_folder_auxiliary_path = function() {
        var auxiliary_path, create_time, oid;
        create_time = 'negative-one';
        if (_meta['create_time'] != null) {
            create_time = _meta['create_time'];
            if (!u.isEmpty(create_time)) {
                create_time = 'ct-' + create_time;
            }
        }
        oid = get_owner_id();
        if ((oid == null) || !oid) {
            throw new Exception('no owner id for folder: ' + _meta.path);
        }
        oid = oid.toString();
        auxiliary_path = path.join(oid, _meta.uuid, create_time);
        return auxiliary_path;
    };
    folder_uuid = function() {
        return _meta.uuid;
    };
    folder_milli_uuid = function() {
        return _meta.milli_uuid;
    };
    callback_milli_uuid = function(callback) {
        var create_time, milli_uuid;
        if (_meta['milli_uuid'] != null) {
            return callback(null, _meta['milli_uuid']);
        }
        if (_meta['create_time'] != null) {
            create_time = _meta['create_time'];
        } else {
            create_time = Date.now();
        }
        milli_uuid = path.join(create_time.toString(), _meta.uuid);
        _meta['milli_uuid'] = milli_uuid;
        return save_meta(function(err, s3rep) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, milli_uuid);
        });
    };
    get_folder_auxiliary_path = function() {
        var key, muuid;
        muuid = null;
        if (_meta.milli_uuid != null) {
            muuid = _meta.milli_uuid;
            key = path.join(myconfig.folder_auxiliary_prefix, muuid);
            _meta.aux_path = key;
            return key;
        }
        return null;
    };
    callback_folder_auxiliary_path = function(callback) {
        if (_meta.aux_path != null) {
            return callback(null, _meta.aux_path);
        }
        return callback_milli_uuid(function(err, muuid) {
            var key;
            if (err) {
                return callback(err, null);
            }
            key = path.join(myconfig.folder_auxiliary_prefix, muuid);
            _meta.aux_path = key;
            return callback(null, key);
        });
    };
    set_attr = function(name, value, callback) {
        _meta[name] = value;
        return save_meta(callback);
    };
    file_identified_by_uuid = function() {
        if (_meta['file-identified-by-uuid'] != null) {
            return _meta['file-identified-by-uuid'];
        }
        return false;
    };


    _folder.init = init;
    _folder.retrieve_saved_meta = retrieve_saved_meta;
    _folder.promise_to_retrieve_saved_meta = promise_to_retrieve_saved_meta;
    _folder.sort_files_by_date = sort_files_by_date;
    _folder.sort_files = sort_files;
    _folder.file_exists = file_exists;
    _folder.add_file = add_file;
    _folder.save_file = add_file;
    _folder.add_file_save_folder = add_file_save_folder;
    _folder.promise_to_add_file_save_folder = promise_to_add_file_save_folder;
    _folder.update_sub_folder = update_sub_folder;
    _folder.add_file_obj_save_folder = _add_file_obj_save_folder;
    _folder.add_file_to_redis_list = _add_file_to_redis_list;
    _folder.save_meta = save_meta;
    _folder.promise_to_save_meta = promise_to_save_meta;
    _folder.write_meta = write_meta;
    _folder.promise_to_write_meta = promise_to_write_meta;
    _folder.is_owner = is_owner;
    _folder.build_file_list = build_file_list;
    _folder.list_files_and_save = list_files_and_save;
    _folder.get_ul_renderring = get_ul_renderring;
    _folder.give_ul_renderring = _give_ul_renderring;
    _folder.check_username = check_username;
    _folder.render_all_files = _render_all_files;
    _folder.add_folder = add_folder;
    _folder.self_render_as_a_file = self_render_as_a_file;
    _folder.render_html_repr = self_render_as_a_file;
    _folder.rename_file = _rename_file;
    _folder.new_json_file = _new_json_file;
    _folder.build_blueimp_pic_gallery_list = _build_blueimp_pic_gallery_list;
    _folder.get_owner_name = get_owner_name;
    _folder.get_owner_obj = _get_owner_obj;
    _folder.get_short_json_repr = _get_short_json_repr;
    _folder.uuid_to_meta = uuid_to_meta;
    _folder.get_files_by_name = _get_files_by_name;
    _folder.get_file_obj_by_uuid = get_file_obj_by_uuid;
    _folder.uuid_to_file_obj = uuid_to_file_obj;
    _folder.get_file_objs = get_file_objs;
    _folder.get_file_objs_by_name = get_file_objs;
    _folder.get_1st_file_obj = get_1st_file_obj;
    _folder.get_one_file_obj = get_one_file_obj;
    _folder.promise_to_one_file_obj = promise_to_one_file_obj;
    _folder.get_uuids = get_uuids;
    _folder.pattern_to_uuids = pattern_to_uuids;
    _folder.name_to_metas = name_to_metas;
    _folder.name_to_uuids = name_to_uuids;
    _folder.read_file_by_name = read_file;
    _folder.read_files_by_name = read_files;
    _folder.read_file_by_uuid = read_file_by_uuid;
    _folder.delete_file = delete_file;
    _folder.delete_name = delete_name;
    _folder.promise_to_delete_name = promise_to_delete_name;
    _folder.delete_file_by_uuid = delete_file_by_uuid;
    _folder.promise_to_delete_file_by_uuid = promise_to_delete_file_by_uuid;
    _folder.delete_uuid_without_save = delete_uuid_without_save;
    _folder.delete_uuid = delete_uuid;
    _folder.read_text_file = read_file;
    _folder.read_text = read_text;
    _folder.write_text_file = write_text_file;
    _folder.clear_empty_names = clear_empty_names;
    _folder.promise_to_clear_empty_names = promise_to_clear_empty_names;
    _folder.promise_to_list_files_and_save = promise_to_list_files_and_save;
    _folder.delete_all_uuid_recursively = delete_all_uuid_recursively;
    _folder.delete_folder = delete_folder;
    _folder.get_member_manager = get_member_manager;
    _folder.get_number_of_name = get_number_of_name;
    _folder.get_folder = get_folder;
    _folder.get_recent_file_by_name = get_recent_file_by_name;
    _folder.read_recent_file_by_name = read_recent_file_by_name;
    _folder.del_uuid_and_name = del_uuid_and_name;
    _folder.clear_file_meta = clear_file_meta;
    _folder.list_files = list_files;
    _folder.read_in_template = read_in_template;
    _folder.render_template = render_template;
    _folder.is_name_unique = is_name_unique;
    _folder.get_root_name = get_root_name;
    _folder.get_owner_id = get_owner_id;
    _folder.get_folder_auxiliary_path = get_folder_auxiliary_path;
    _folder.callback_folder_auxiliary_path = callback_folder_auxiliary_path;
    _folder.callback_milli_uuid = callback_milli_uuid;
    _folder.folder_uuid = folder_uuid;
    _folder.folder_milli_uuid = folder_milli_uuid;
    _folder.set_attr = set_attr;
    _folder.is_name_in_meta_files = is_name_in_meta_files;
    _folder.file_identified_by_uuid = file_identified_by_uuid;


    return callback(null, _folder);
}
module.exports.new_obj = new_obj;




function make_s3key_for_folder_meta_file(folder_path, callback){
    if(!folder_path) return callback('no folder path given');
    s3prefix('folder_meta', function(err, folder_meta_prefix){
        if(err) return callback(err);

        var s3key = path.join(folder_meta_prefix, folder_path);
        callback(null, s3key);
    });
}
module.exports.make_s3key_for_folder_meta_file = make_s3key_for_folder_meta_file;
