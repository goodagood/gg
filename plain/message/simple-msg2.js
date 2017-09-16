
/*
 * The file used to pass messages
 *
 * change 0105, 
 *   split into: compose_msg and receive_msg from old write_msg_file, which
 *     use text file; the new two use msg file obj.
 *
 * redo msg module, after a lot fails, based on aws/simple-msg.coffee
 * 2016 0125
 *
 */

var check_new_msg_from_meta, check_receive_msg,
    check_write_msg, compose_msg, file_module, folder_module, get_first_msg,
    json_file, json_to_msg_file, myutil, new_msg_file_from_meta,
    new_msg_file_obj, p, path, promised_new_msg_file_obj, receive_msg, stop,
    test_file_name, test_folder_name, test_json_file_name, test_owner_name,
    to_multiple_receiver, user1, user2, user_module, util, write_msg_file;


var path    = require('path');
var util    = require('util');
var Promise = require('bluebird');
var u       = require("underscore");
var assert  = require('assert');
var async   = require('async');

var file_module   = require("../aws/simple-file-v3.js");
var folder_module = require("../aws/folder-v5.js");
var json_file     = require("../aws/simple-json.js");
var user_module   = require("../users/a.js");
var myutil        = require('../myutils/myutil.js');
var myconfig      = require("../config/config.js");
var tpl           = require("../myutils/tpl.js");

var tpl_strs      = require("./tpl.js");

//  Local const
const Msg_folder  = myconfig.message_folder;
//const Msg_folder  = '.goodagood/message';
//const Msg_folder  = 'gg/message';

var p = console.log;

function new_msg_file_obj(file_meta, pass_out_object) {
    return json_file.new_json_file_obj(file_meta, function(err, jobj) {

        if (err) {
            return pass_out_object(err, jobj);
        }

        var Obj  = jobj;
        var Meta = jobj.get_meta();

        var Err = '';
        var Msg = {};

        function render_html_repr() {

            if (u.isEmpty(Msg) || u.isNull(Msg) || !Msg) {
                throw new Error('Has no Msg json, ' + Meta.path);
            }

            var text;
            if(Msg.text) text = Msg.text;
            if(!text && Msg.msg) text = Msg.msg;

            if ((text == null) || !text) {
                text = "WoW! Message Contents must go to no-where.";
            }

            var context = {
                text: text,
                filename: Meta.name,
                pathuuid: Meta.path_uuid
            };
            context.to = Msg.to;
            context.from = Msg.from;
            context.date = Date().toString();

            var li = tpl.render_str(tpl_strs.msg_li_tpl, context);

            if (Meta.html == null) {
                Meta.html = {};
            }
            Meta.html.li = li;
            return li;
        }


        function fetch_msg_json(callback) {
            return Obj.read_to_string(function(err, str) {
                var j;
                j = JSON.parse(str);
                Msg = j;
                return callback(null, j);
            });
        }

        function get_msg_text (callback) {
            if (!u.isEmpty(Msg)) {
                if (Msg.text != null) {
                    return callback(null, Msg.text);
                } else {
                    return callback('no text in Msg : "get msg text"', null);
                }
            } else {
                return fetch_msg_json(function(err, msg) {
                    p('fetch msg json in get msg text:', msg);
                    Msg = msg;
                    if (Msg.text != null) {
                        return callback(null, Msg.text);
                    } else {
                        return callback('no text after fetched msg', null);
                    }
                });
            }
        }

        Obj.version = 'simple msg js 2';

        //Obj.render_html_repr_old = render_html_repr_old;
        Obj.render_html_repr = render_html_repr;
        Obj.fetch_msg_json = fetch_msg_json;
        Obj.get_msg_text = get_msg_text;
        return pass_out_object(null, Obj);
    });
};

promised_new_msg_file_obj = Promise.promisify(new_msg_file_obj);

new_msg_file_from_meta = function(meta, callback) {
    return new_msg_file_obj(meta, function(err, mobj) {
        mobj.calculate_meta_defaults();
        return mobj.fetch_msg_json(function(err, json) {
            mobj.render_html_repr();
            return mobj.save_meta_file(function(err, reply) {
                p('new from meta, save meta FILE, (err, reply): ', err, reply);
                return callback(err, mobj);
            });
        });
    });
};

compose_msg = function(from, to, text, callback) {
    var err, json, owner;
    if (u.isEmpty(from) || u.isEmpty(to)) {
        err = 'empty sender or receiver when compose message.';
        return callback(err, null);
    }
    json = {
        from: from,
        to: to,
        text: text,
        uuid: myutil.get_uuid(),
        timestamp: Date.now()
    };
    if (u.isArray(json.to)) {
        json.to = json.to.join(' ');
    }
    owner = json.from;
    return user_module.get_user_id(owner, function(err, id) {
        var dir, file_name, file_path;
        dir = path.join(id, Msg_folder);
        file_name = "To_" + json.to + "_" + json.timestamp + ".ggmsg";
        file_path = path.join(dir, file_name);
        return json_to_msg_file(json, owner, file_path, callback);
    });
};

json_to_msg_file = function(json, owner, file_path, callback) {
    return json_file.make_json_file(json, owner, file_path, function(err, file) {
        var meta;
        meta = file.get_meta();
        return new_msg_file_obj(meta, function(err, msg_obj) {
            return msg_obj.fetch_msg_json(function(err, json) {
                var li, _meta;
                li = msg_obj.render_html_repr();
                _meta = msg_obj.get_meta();
                assert(li === _meta.html.li);
                return msg_obj.save_file_to_folder().then(function(what) {
                    return callback(null, msg_obj);
                });
            });
        });
    });
};

receive_msg = function(from, to, text, callback) {
    var err, json, owner;
    if (u.isEmpty(from) || u.isEmpty(to)) {
        err = 'empty sender or receiver when receive message.';
        return callback(err, null);
    }
    json = {
        from: from,
        to: to,
        text: text,
        uuid: myutil.get_uuid(),
        timestamp: Date.now()
    };
    owner = json.to;
    return user_module.get_user_id(owner, function(err, id) {
        var dir, file_path, fname;
        dir = path.join(id, Msg_folder);
        fname = "To_" + json.to + "_" + json.timestamp + ".ggmsg";
        file_path = path.join(dir, fname);
        return json_to_msg_file(json, owner, file_path, callback);
    });
};

to_multiple_receiver = function(from, to_many, text, callback) {
    var err, funs, many;
    if (u.isEmpty(from) || u.isEmpty(to_many)) {
        err = 'empty sender or receiver when receive message.';
        return callback(err, null);
    }
    if (!u.isArray(to_many)) {
        err = 'we need array of username to do job, in ' + 'to multiple receiver from: ' + from;
        return callback(err, null);
    }
    many = to_many.filter(function(i) {
        return !u.isEmpty(i);
    });
    p("after filter: ", many);
    assert(many.length > 0, "there are should be >0 to send");
    funs = [];
    u.each(many, function(who) {
        return funs.push(function(callback) {
            return receive_msg(from, who, text, callback);
        });
    });
    assert(funs.length > 0, "there are should be >0 functions to send");
    return async.parallel(funs, callback);
};

write_msg_file = function(from, to, text, callback) {
    if (!u.isFunction(callback)) {
        callback = (function() {});
    }
    return compose_msg(from, to, text, function(err, ret1) {
        return receive_msg(from, to, text, function(err, ret2) {
            return callback(err, [ret1, ret2]);
        });
    });
};

get_first_msg = function(username, callback) {
    var Folder, _folder_path;
    Folder = null;
    _folder_path = path.join(username, Msg_folder);
    return folder_module.retrieve_promisified_folder(_folder_path).then(function(folder) {
        var meta, uuid_list;
        Folder = folder;
        meta = folder.get_meta();
        uuid_list = Object.keys(meta.files);
        return uuid_list[0];
    }).then(function(first) {
        return Folder.uuid_to_file_obj(first, callback);
    });
};


module.exports.new_msg_file_obj   = new_msg_file_obj;
module.exports.write_msg_file     = write_msg_file;
module.exports.new_msg_file_from_meta = new_msg_file_from_meta;
module.exports.get_first_msg      = get_first_msg;
module.exports.compose_msg        = compose_msg;
module.exports.receive_msg        = receive_msg;
module.exports.to_multiple_receiver = to_multiple_receiver;



p = console.log;

stop = function() {
    return setTimeout(process.exit, 500);
};

user1 = 'abc';

user2 = 'aa';

test_owner_name = 'abc';

test_folder_name = 'abc';

test_json_file_name = 'test.json';

test_file_name = 'txt25';

check_write_msg = function() {
    return write_msg_file(user1, user2, '01/13, 16:22pm\nhi', function(err, what) {
        p("what you got after 'check write msg'?\n", what);
        return stop();
    });
};

check_new_msg_from_meta = function() {
    var meta;
    meta = {
        "name": "To_aa_1417582119799.ggmsg",
        "path": "abc/goodagood/message/To_aa_1417582119799.ggmsg",
        "owner": "abc",
        "size": 154,
        "dir": "abc/goodagood/message",
        "timestamp": 1417582120069,
        "uuid": "97ac58d9-e0e5-4e6b-8e58-27e05ed9ee31",
        "meta_s3key": ".gg.new/abc/goodagood/message/97ac58d9-e0e5-4e6b-8e58-27e05ed9ee31",
        "initial_key": ".gg.new/abc/goodagood/message/97ac58d9-e0e5-4e6b-8e58-27e05ed9ee31",
        "s3key": ".gg.file/abc/goodagood/message/97ac58d9-e0e5-4e6b-8e58-27e05ed9ee31",
        "storage": {
            "type": "s3",
            "key": ".gg.file/abc/goodagood/message/97ac58d9-e0e5-4e6b-8e58-27e05ed9ee31"
        }
    };
    return new_msg_file_from_meta(meta, function(err, obj) {
        p('check new msg from meta, 1, (err, obj): ', err, obj);
        return obj.save_file_to_folder().then(function() {
            return stop();
        });
    });
};

check_receive_msg = function() {
    return receive_msg('aa', 'abc', 'this from aa, 0106', function(err, ret) {
        p('in check receive msg', err, ret);
        return stop();
    });
};



if (require.main === module) {
    check_write_msg();
}

