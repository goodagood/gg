//

var assert = require("assert");
var u = require("underscore");
var async = require("async");
var path = require("path");
var Promise = require("bluebird");

var folder_module = require("../aws/folder-v5.js");
var file_module   = require("../aws/simple-file-v3.js");

var listor   = require("../aws/listor.js");

var myconfig =   require("../config/config.js");
//var config = require("../test/config.js");

//var bucket = require("../aws/bucket.js");

var _folder_path = 'abc/imgvid';
var _user_name = 'abc';
var _gg_folder_name = 'goodagood';
var _new_folder_name = 'test';


var p = console.log;

var stop = function(period) {
    period = period || 1;
    if (!u.isNumber(period)) {
        period = 1;
    }
    var milli_seconds = period * 1000;
    return setTimeout(process.exit, milli_seconds);
};





//// This test assume there are files in the folder, with sub-folders or not.
//t5_finding_files = function(test){
//
//    // settings of the test:
//    var _folder_path = 'abc';
//
//    // global vars:
//    var Meta, Folder;
//
//    folder_module.retrieve_folder(_folder_path).then(function(folder) {
//        Folder = folder;
//        test.ok(! u.isEmpty(Folder));
//        Meta = Folder.get_meta();
//        var files = Meta.files;
//
//        //u.each(files, function(f){
//        //    p(f.what, f.name, f.timestamp);
//        //});
//        var true_files = u.filter(files, function(f){return f.what === myconfig.IamFile;});
//        test.ok(u.size(files) >= u.size(true_files));
//        //u.each(true_files, function(f){
//        //    p(f.what, f.name, f.timestamp);
//        //});
//        test.ok(u.isObject(files))
//        test.ok(! u.isEmpty(Meta));
//        test.ok(u.isString(Meta.name));
//    }).then(function(){
//        //stop();
//        test.done();
//    });
//}


module.exports.group_one = {
    setUp: function (callback) {
        callback();
    },
    tearDown: function (callback) {
        callback();
    },

    //"test-1 : get file objects, folder.css  " : t1_test_get_file_objs_by_name,
};


module.exports.last = function(test){
    test.expect(1);
    p(' -- going to force stop --');
    test.ok(true);
    stop();
    test.done();
};



// -- checkings -- //

check_get_folder_aux_path = function(){
    var filename = 'folder.css';
    var folder_path = 'abc';

    folder_module.retrieve_folder(folder_path).then(function(folder){
        //p('check gfobn ', folder);
        folder.get_root_name(function(err, rname){
            p('got root name: ', err, rname);
            var oid = folder.get_owner_id();
            p('got id: ', oid);
            var auxpath = folder.get_folder_auxiliary_path();
            p ('aux path: ', auxpath);
        });
        stop(3);
    });
}

check_get_folder = function(){
    var folder_path = 'abc/imgvid';

    folder_module.retrieve_folder(folder_path).then(function(folder){
        var mfolder = folder.get_meta();
        p( 'folder meta milli uuid: ', mfolder['milli_uuid']);
        folder.callback_milli_uuid(function(err, muuid){
            p(' callback milli uuid got: ', err, muuid);

            var apath = folder.get_folder_auxiliary_path();
            p('in get  got aux path: the path: ' , apath);
            folder.callback_folder_auxiliary_path(function(err, apath_in){
                p('in callback of got aux path: err, the path: ', err, apath_in);
                stop();
            });
        });
    });
}

function check_listor_a(){
    var params = {
        username: 'abc',
        cwd:      'abc/imgvid',
    };

    listor.list(params, function(err, w){
        if(err) {
            p('err: ',err );
            return stop();
        }
        //p('text: ', w.slice(0, 200));
        p(err, w);
        stop();
    });
}


function check_set_attr (folder_path){
    folder_path = folder_path  || 'abc/add-2/img2';

    var list_setting = {
        //'default': 'user-index',
        'default': 'img-value',
    };

    folder_module.retrieve_folder(folder_path).then(function(folder){
        folder.set_attr('listor', list_setting, function(err, what){
            p(err, what);

            // go to check the attribute set.
            stop();
        });
    });
}


function check_move_to_select_listor(){
    var folder_path = 'abc/imgvid';
    var user_name = 'abc';
    var params = {
        username: 'abc',
        cwd:      'abc/imgvid',
    };

    folder_module.retrieve_folder(folder_path).then(function(folder){
        var meta = folder.get_meta();
        var lopt = meta.listor;
        var listor_name = lopt['default'];

        var do_list = listor.get_listor(listor_name);
        do_list(params, function(err, html){
            //p('got list: ', err, html);
            p('got list: ', err, html.slice(0, 200));
            stop();
        });

        //p('default listor: ', lopt['default']);

    });
}


function check_a_listor(){
    var folder_path = 'abc/imgvid';
    var user_name = 'abc';

    var params = {
        username: 'abc',
        cwd:      'abc/imgvid',
    };

    listor.list_folder_by_setting(params, function(err, html){
        if(err)  {p(err); return stop();}
        p(err, html.slice(0, 500));
        //p('ok?');
        stop();
    });
}


function check_listor_anyway(){
    var params = {
        username: 'abc',
        cwd:      'abc/test',
    };

    listor.get_folder_listor(params.cwd, function(err, fun_to_list){
        if(err)  {p(1, err); return stop();}
        fun_to_list(params, function(err, html){
            if(err)  {p(err); return stop();}
            p(err, html);
            //p(err, html.slice(300, 500));
            stop();
        });
    });
}


if(require.main === module){
    //p(' do some checking');
    //check_get_folder();
    //check_listor_a();
    check_set_attr();
    //check_move_to_select_listor();
    //check_a_listor();
    //check_listor_anyway();
}


// -- dropping -- //


function drop_into_repl(o, dir){
    // drop variable/objects into REPL, o is the object to save variables
    o   = o   || {};
    dir = dir || 'abc/imgvid';

    folder_module.retrieve_folder(dir).then(function(folder){
        o.folder = folder;
        o.mfolder= folder.get_meta();
        o.shorts = u.omit(o.mfolder, 'files', 'html', 'renders', 'file_uuids', 'file_names');
        //walk_through(folder, function(err, what){
        //    p('after walk through: ', err, what);
        //    stop();
        //});

    });
}

//var o = {}; drop_into_repl(o, 'abc/imgvid');



// a signal to 'expect'
console.log("ok start interact:");

