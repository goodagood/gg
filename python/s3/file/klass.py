
import os
import json
import time

import path_setting

import config_dir
import util.mis as util
import s3.keys  as keys

import s3.crud as crud
import s3.folder.getter


class File:
    def __init__(self, _path, opts={}):
        if isinstance(opts, dict):
            self.meta = opts
        else:
            self.meta = {}

        self.meta['path'] = _path


    def get_meta(self):
        return self.meta

    def set_meta(self, meta):
        self.meta = meta

    def set_attr(self, name, value):
        self.meta[name] = value

    def get_attr(self, name):
        if 'name' in self.meta:
            return self.meta['name']
        else:
            return None

    def make_up_basic_meta(self):
        ''' Here we make up meta for file, but a file can have no meta.
        '''
        if 'path' not in self.meta:
            raise Exception('Folder must have PATH')
        if 'name' not in self.meta:
            self.meta['name'] = os.path.basename(self.meta['path'])

        # if there is no owner, we set root, this is a little bit weird.
        if 'owner' not in self.meta:
            self.meta['root'] = util.getroot(self.meta['path'])

        if 'meta_s3key' not in self.meta:
            self.calculate_prefix_and_keys()


    def calculate_prefix_and_keys(self):
        self.calculate_keys()

        if 'uuid' not in self.meta:
            self.meta["uuid"] = util.getuuid()

        # note name space prefix depend on root not owner's name
        self.meta['name_space_prefix'] = keys.file_name_space(
                self.meta['path'], self.meta['uuid'])

        return self


    def calculate_keys(self):
        self.meta["s3key"]      = keys.file_content(self.meta['path'])
        self.meta["meta_s3key"] = keys.file_meta(self.meta['path'])


    def save_meta(self):
        '''Haven't done locking
        '''
        jstr = json.dumps(self.meta)
        crud.save(self.meta['meta_s3key'], jstr)
        return self.meta


    def retrieve_meta(self):
        '''
        '''
        if not 'meta_s3key' in self.meta:
            self.calculate_keys()

        # Not to fail silently?
        if not crud.key_exists(self.meta['meta_s3key']):
            raise Exception(
                "meta s3 key not exists: {0}".format(self.meta['path']))
            return None

        self.meta = crud.get_json(self.meta['meta_s3key'])
        return self.meta


    def touch(self):
        self.meta['timestamp'] = time.time() * 1000 # epoch milliseconds

    def read(self):
        ''
        return crud.get_txt(self.meta['s3key'])

    def write(self, text):
        ''
        crud.save(self.meta['s3key'], text)

    def get_folder(self):
        ''' Get the folder containing this file.
        '''
        cwd = os.path.dirname(self.meta['path'])
        return s3.folder.getter.folder(cwd)

    def add_to_folder_ns(self):
        ''' Add file info to folder name space.

        Suppose the prefix of folder name space is: 'foprefix'
        file info will be added to: foprefix/files/file-name.extension
        '''
        fo = self.get_folder()
        fo.add_file(self.meta)
        return self


    def as_li(self):
        '''
        '''
        #tpl = """
        #<li class="file">
        #    <span class="name">{name}</span>
        #</li>
        #"""
        #li = tpl.format(name=self.meta['name'], path=self.meta['path'])

        li = util.simple_li(self.meta)

        self.meta['li'] = li
        return li


# Utility functions
def retrieve_file(_path):
    f = File(_path)
    f.retrieve_meta()
    return f


'''


/*
 * The file object, rewrite from ../aws/simple-file-v3.js(coffee).
 * Should be ok to play with plain utf-8 files.
 *
 * 2016 0313
 */


function new_obj(file_info, callback) {






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
'''

if __name__ == "__main__":
    ''
    #fi = retrieve_file('tmp/t.text')

    # another
    #fia = File('tmp/s.text')
    #fia.make_up_basic_meta()
    #fia.write('s test of text file, apr.07 2:15pm')
    fia = retrieve_file('tmp/s.text')
    fo = fia.get_folder()

    print fia.get_meta()
