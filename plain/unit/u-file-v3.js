
var assert = require("assert");
var u = require("underscore");
var async = require("async");
var path = require("path");
var Promise = require("bluebird");

var file_module   = require("../aws/simple-file-v3.js");
var folder_module = require("../aws/folder-v5.js");
var folder_module_promised = Promise.promisifyAll(folder_module, {suffix:'_promised'});

var config = require("../test/config.js");


var _test_folder_path    = 'abc';
var _test_user_name      = 'abc';
var _test_file_name = 'move';
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


// Assume 'abc/folder.css' exists
var t1_get_a_file = function(test){
    var _test_file_path = 'abc/folder.css';
    var Meta, Obj;
    folder_module.retrieve_file_objs(_test_file_path, function(err, obj){
        //p('obj:', obj);
        test.ok(u.isObject(obj));
        test.ok(u.isArray(obj));
        Obj = obj[0];
        Meta = Obj.get_meta();
        //p('meta: \n', Meta);
        test.ok(u.isString(Meta.name));
        //assert(false);
        var ul = Obj.convert_meta_to_ul();
        //p('ul\n', ul);
        test.ok(u.isString(ul));
        test.done();
    });
};



module.exports.group_one = {
    setUp: function (callback) {
        callback();
    },
    tearDown: function (callback) {
        callback();
    },

    "test-1 : get a file obj" : t1_get_a_file,
    //"test-1 : get all uuids" : test_get_all_uuid,
};



module.exports.last = function(test){
    test.expect(1);
    test.ok(true);
    stop();
    test.done();
}



// 2015, 0129, 0710
function t2_write_txt_file(test){
    var owner = 'abc';
    var dir   = 'abc/test';
    var txt_file_name = 't-' + (new Date()).getMinutes().toString();

    var txt = "test\n" +
        "it's flowing\n" +
        "07 10 " + 
        "2015";

    file_module.write_text_file(owner, dir, txt_file_name, txt).then(function(what){
        p("after writing\n", what);
        stop();
        //test.done();
    });
}


function check_file_util_list(test){
    var _test_file_path = 'abc/move';
    var Meta, Obj;

    p('-- in "check file a", ', __filename);

    folder_module.retrieve_file_objs(_test_file_path, function(err, objs){
        //p(1,  objs);
        assert(objs.length === 1);
        var obj = objs[0];
        var meta = obj.get_meta();
        p('-- meta of ', _test_file_path);
        p(meta);
        if(typeof meta.path_uuid !== 'string'){
            p('re-calculate the meta defaults');
            obj.calculate_meta_defaults();
            obj.save_file_to_folder();
        }

        p('-- the util list:\n', obj.build_util_list());
        //p('meta:\n', meta);
        stop();
    });
}

function check_file_info_list(){
    //var file_path = file_path || 'abc/folder.css';
    var file_path =  'abc/move';
    //var _test_file_path = 'abc/move';
    var Meta, Obj;

    p('-- in "check file a", ', __filename);

    folder_module.retrieve_first_file_obj(file_path, function(err, file){
        var meta = file.get_meta();
        var info = file.build_file_info_list();
        p ('check file info list:', meta);
        p ('file info:\n', info);
        stop();
    });
}

check_get_one_file_by_name = function(file_path){
    file_path = file_path || 'abc/public/txt-15';

    //var folder_path = path.dirname(file_path);

    p('in "check get one file by name", ', __filename);
    folder_module.retrieve_first_file_obj(file_path, function(err, file){
        var meta = file.get_meta();
        //p ('retrieved first file obj:', meta);

        file.read_to_string(function(err, what){
            p('read to string:\n', err, what);
            stop();
        });
    });
}


if(require.main === module){
    //check_file_util_list();
    //check_file_info_list();
    //check_get_one_file_by_name();


    t2_write_txt_file();
}


