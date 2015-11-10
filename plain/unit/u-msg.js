//
// nodeunit test
//
// This test need at least 1 message in 'abc/goodagood/message'
//
// Test 'simple-msg.coffee/js'
//


var assert = require("assert");
var u = require("underscore");
var async = require("async");
var path = require("path");
var Promise = require("bluebird");

var fm = require("../aws/folder-v5.js");

var msg_module = require("../aws/simple-msg.js");
var config = require("../test/config.js");

var tool  = require("../myutils/test-util.js");


var _folder_path    = 'abc';
var _user_name      = 'abc';
var _gg_folder_name = 'goodagood';
var _new_folder_name= 'test';

var p = console.log;

var stop = function(period) {
    var milli_seconds;
    period = period || 1;
    if (!u.isNumber(period)) {
        period = 1;
    }
    milli_seconds = period * 1000;
    return setTimeout(process.exit, milli_seconds);
};



var get_json_of_the_1st = function(test){
    _folder_path = 'abc/goodagood/message';
    var Folder;
    test.expect(9);
    fm.retrieve_promisified_folder(_folder_path).then(function(folder) {
        Folder = folder;
        meta = folder.get_meta();
        uuid_list = Object.keys(meta.files);
        return uuid_list;
    }).then(function(list){
        //p('list: ', list);
        test.ok(u.isArray(list)); //1
        test.ok(list.length > 0); //2
        return list[0];
    }).then(function(first){
        // 'first' is the first uuid of msg file.
        //p('the first uuid: ', first);
        test.ok(u.isString(first)); //3

        Folder.uuid_to_file_obj(first, function(err, file){
            //p('get the file obj: \n',err,  file);
            test.ok(u.isObject(file)); //4
            test.ok(u.isFunction(file.delete_s3_storage)); //5

            var info = file.get_meta();
            test.ok(u.isObject(info)); //6
            p('the first file name: ', info.name);
            test.ok(u.isString(info.name));

            file.fetch_msg_json(function(err,json){
                p('json: ', json);
                test.ok(u.isString(json.to));
                test.ok(u.isString(json.from));
                //file.get_msg_text(function(err, txt){
                //    p ('text of the msg: ', txt);
                //    //test.ok(u.isString(txt));
                //    //test.done();
                //});
                test.done();
            });
        });

    });
};


get_txt_of_the_1st_msg = function(test){
    _folder_path = 'abc/goodagood/message';
    var Folder;
    test.expect(1);
    fm.retrieve_promisified_folder(_folder_path).then(function(folder) {
        Folder = folder;
        meta = folder.get_meta();
        uuid_list = Object.keys(meta.files);
        return uuid_list;
    }).then(function(list){
        //p('list: ', list);
        return list[0];
    }).then(function(first){
        // 'first' is the first uuid of msg file.
        //p('the first uuid: ', first);
        //test.ok(u.isString(first)); //3

        Folder.uuid_to_file_obj(first, function(err, file){
            //p('get the file obj: \n',err,  file);
            //test.ok(u.isObject(file)); //4
            //test.ok(u.isFunction(file.delete_s3_storage)); //5

            var info = file.get_meta();
            //test.ok(u.isObject(info)); //6
            p('the first file name: ', info.name);
            //test.ok(u.isString(info.name));

            file.get_msg_text(function(err, txt){
                p ('text of the msg: ', txt);
                test.ok(true);
                //test.ok(u.isString(txt));
                test.done();
            });

        });

    });
};


first_msg = function(test){
    _folder_path = 'abc/goodagood/message';
    var Folder;
    test.expect(3);
    msg_module.get_first_msg(_user_name, function(err, msg){
        //p("msg:\n", msg);
        test.ok(u.isObject(msg));
        test.ok(u.isFunction(msg.get_msg_text));
        msg.get_msg_text(function(err, txt){
            //p( 'txt:', txt);
            test.ok(u.isString(txt));
            test.done();
        });
    });

};


test_del_first_msg = function(test){
    msg_folder = 'abc/goodagood/message';

    var Mfolder;
    test.expect(2);
    fm.retrieve_promisified_folder(msg_folder).then(function(folder) {
        Mfolder = folder;
        meta = folder.get_meta();
        uuid_list = Object.keys(meta.files);
        return uuid_list;
    }).then(function(list){
        //p('list got in "test del first":\n', list);
        test.ok(u.isArray(list));
        //test.done();
        return list;
    }).then(function(list){
        var la = list[0];
        //p('the first in "test del first":\n', la);
        test.ok(u.isString(la));
        Mfolder.delete_uuid(la, function(err, reply){
            //p('delete one? err, rep: ', err, reply);
            test.done();
        });
    });

};


tm1_compose_msg = function(test){
    var from_user_name = 'abc';
    var to_user_name   = 'tmpab';

    msg_module.compose_msg(from_user_name, to_user_name,
            '1:54\nthis is testing,\nto send a msg\n',
            function(err, msg){
                
                test.ok(! err);
                test.ok(u.isObject(msg));
                p('the msg composed\n', msg);
                test.done();
    });
}



test_write_and_get_uuid = function(test){

    // settings of the test:
    var folder_path = 'abc';
    var file_name = "test-write-and-get-uuid";
    var file_text = "this is a test\n" +
        "this is the second line\n" +
        " -- to wriet this file, and check to get it by uuid --" +
        "this is the time: " + new Date() ;

    // global vars:
    var Meta, Folder;

    fm.retrieve_promisified_folder(folder_path).then(function(folder) {
        Folder = folder;
        test.expect(5); // number of tests:
        test.ok(u.isObject(Folder));
        return folder.write_text_file(file_name, file_text);
    }).then(function(what){
        //p('Going to sleep 30 secs. We should already wrote the file: ', file_name);
        return config.promise_to_wait(30);
    }).then(function(){
        return Folder.promise_to_retrieve_saved_meta();
    }).then(function(meta){
        Meta = meta;
        test.ok(u.isObject(Meta));
        test.ok(u.isString(Meta.name));
        test.ok(Meta.path === folder_path);
        //test.ok(Folder.file_exists(file_name));  // till not wrote.
        test.done();
    });

}


module.exports = {
    setUp: function (callback) {
        this.foo = 'bar';
        callback();
    },
    tearDown: function (callback) {
        stop(3); // stop in a seconds any way.
        callback();
    },


    "test-1 : test send msg then check" : tm1_compose_msg
};


// -- checkings -- //


function check_get_1st_msg(){
    //var user_name = _user_name;
    var user_name = 'tmp';
    msg_module.get_first_msg(user_name, function(err, first){
        //p ('got first msg:\n', err, first);
        var keys_of_methods = u.keys(first).sort();
        //p ('methods:\n', keys_of_methods);

        var meta = first.get_meta();
        //p ('the meta of the first:\n', meta);
        p ('the path of the first:\n', meta.path);

        first.get_msg_text(function(err, txt){
            p( 'txt:', txt);
            tool.stop();
        });


        //p (meta.html.li)
    });
}


var check_compose_msg = function(from, to, text){
    from = from || 'tmp';
    to   = to   || 'abc';
    text = text || 'check compose msg at ' + new Date();

    msg_module.compose_msg(from, to, text, function(err, ret){
        p('in check send msg', err, ret);
        tool.stop();
    });
}

function check_write_msg (){
    var from_user = 'tmp', to_user='abc';

    msg_module.write_msg_file(from_user, to_user, 'oh, 0710, 0641am\nhi', function(err, what){
            p("what you got after 'check write msg'?\n", err, typeof what);
            tool.stop();
    });
}


function check_to_multiple_receiver(){
    var from_user = 'aa', to_user='abc', user3='tmpab';
    var to    = [user3, to_user];

    msg_module.to_multiple_receiver(from_user, to, '0710, 0702am  \nmultiple', function(err, what){
        p("what you got after 'check write msg'?\n", err, typeof what);
        tool.stop();
    });
}


function check_re_render(){
    //var user_name = _user_name;
    var user_name = 'abc';
    msg_module.get_first_msg(user_name, function(err, first){
        //p ('got first msg:\n', err, first);
        var keys_of_methods = u.keys(first).sort();
        //p ('methods:\n', keys_of_methods);

        var meta = first.get_meta();
        //p ('the meta of the first:\n', meta);
        p ('the path of the first:\n', meta.path);
        p ("the keys in the file meta of the first:\n", u.keys(meta).join(", "));
        p ("the html in the file meta of the first:\n", meta.html);

        first.get_msg_text(function(err, txt){
            p( 'txt:', txt);
            tool.stop();
        });


        //p (meta.html.li)
    });
}



if(require.main === module){
    //check_get_1st_msg();
    //check_compose_msg();
    //check_write_msg();

    //check_to_multiple_receiver();

    check_re_render();
}



// -- drop into REPL -- //

function pick_file_attr(folder_meta, attr_name){
    attr_name = attr_name || 'path';

    var ofiles = u.values(folder_meta.files);  
    var oattrs = ofiles.map(function(file_meta){return file_meta[attr_name]});

    return oattrs;
}

function del_test_msg(folder){
    var pat = /test-msg/;

    //var meta = folder.get_meta();
    var uuids  = folder.pattern_to_uuids(pat);

    var funs = [];
    u.each(uuids, function(uuid){
        funs.push(function(callback){
            p('doing, ', uuid);
            folder.delete_file_by_uuid(uuid, callback);
        });
    });

    async.series(funs, function(err, what){
        p('err, what: ', err, what);
    });
}

function drop_msg_folder_into_repl(o, dir){
    // drop variable/objects into REPL, o is the object to save variables
    o   = o   || {};
    dir = dir || 'abc/goodagood/message';

    fm.retrieve_folder(dir).then(function(folder){
        o.folder = folder;
        o.mfolder= folder.get_meta();
        o.shorts = u.omit(o.mfolder, 'files', 'html', 'renders', 'file_uuids', 'file_names');

        o.names = pick_file_attr(o.mfolder, 'name');
    });
}
//var o = {}; drop_msg_folder_into_repl(o);



function drop_1st_msg_into_repl(o, dir){
    // drop variable/objects into REPL, o is the object to save variables
    o   = o   || {};
    dir = dir || 'abc/goodagood/message';
    var user_name = 'abc';

    msg_module.get_first_msg(user_name, function(err, first){
        first.fetch_msg_json(function(err, j){
            o.errfetch = err;
            o.first = first;
            o.mfirst= first.get_meta();
            o.shorts = u.omit(o.mfirst,  'html' );
        });
    });

}
var o = {}; drop_1st_msg_into_repl(o);


// a signal to 'expect'
console.log("ok start interact:");
u.keys(o);


