//

var assert = require("assert");
var u = require("underscore");
var async = require("async");
var path = require("path");
var Promise = require("bluebird");

var folder_module = require("../aws/folder-v5.js");
var file_module   = require("../aws/simple-file-v3.js");

var walker = require("../aws/walk-through.js");


var myconfig =   require("../config/config.js");
//var config = require("../test/config.js");

//var bucket = require("../aws/bucket.js");

var folder_path = 'abc';
var user_name = 'abc';


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
//    var folder_path = 'abc';
//
//    // global vars:
//    var Meta, Folder;
//
//    folder_module.retrieve_folder(folder_path).then(function(folder) {
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
    //"test-2 : get folder meta, 'abc'" : test_retrieve_folder_meta,
    //"test-3 : read file by name, 'abc'" : t3_read_file_by_name,
    //"test-4 : write and get uuid " : t4_write_and_get_uuid,
    //"test-5 : finding files " : t5_finding_files,
};


module.exports.last = function(test){
    test.expect(1);
    p(' -- going to force stop --');
    test.ok(true);
    stop();
    test.done();
};



// -- checkings -- //




// give functions to deal file and folder:
var do_file_do_folder = {

    do_file: function do_file(opt, callback){
        var cwd     = opt.cwd_folder_obj;
        var mfolder = opt.cwd_folder_meta;
        var uuid    = opt.file_uuid;
        // the file meta saved in folder meta:
        var meta    = mfolder.files[uuid];

        p('got file uuid, path: ', meta.uuid, meta.path );
        callback(null, null)
            //cwd.uuid_to_file_obj(uuid, function(err, file){
            //    p('do file, ', meta.path, meta.what);
            //    callback(null, null);
            //})
    },

    do_folder: function do_folder(opt, callback){
        var cwd_meta =  opt.cwd_folder_meta;
        var cwd      =  opt.cwd_folder_obj;
        var meta     =  opt.sub_folder_meta;
        var sub_folder = opt.sub_folder_obj;

        //p ('- in do folder, ', meta.path);
        var mfolder = sub_folder.get_meta();
        p('got folder uuid, path: ', mfolder.uuid, mfolder.path );
        callback(null, null);

        //folder.callback_folder_auxiliary_path(function(err, apath){
        //    p('in folder: ', meta.path);
        //    p('callback folder auxiliary path: err apath: ', err, apath);
        //    walk_through(folder, callback);
        //});

    }

};

function check_walk_through(dir){
    dir = dir || '19';

    folder_module.retrieve_folder(dir).then(function(folder){
        walker.walk_through(folder, do_file_do_folder, function(err, what){
            p('after walk through: ', err, what);
            stop();
        });
    });
}


var user   = require("../users/a.js");
function walk_user_homes(){
    user.get_user_names(function(err, names){

        async.whilst(
            function(){return names.length > 0;}
            ,function(callback){one_home(names.pop(), callback);}
            ,function(err, what){
                p('after async whilst: ', err, what);
                stop(3);
            });

    });
}


function one_home(name, callback){
    user.get_user_id(name, function(err, id){
        folder_module.retrieve_folder(id).then(function(folder){
            //walk_through(folder, callback);
            walker.walk_through(folder, do_file_do_folder, callback);
            // debug:
            //p('got folder, ', u.isEmpty(folder));
            //callback(null, null);
        });
    });
}

function check_one_home(name){
    name = name || 'cat-02';
    one_home(name, function(err, what){
        p('one home get err: ', err);
        stop();
    });
}

var adding = {
    size : 0,

    do_file: function do_file(opt, callback){
        var cwd     = opt.cwd_folder_obj;
        var mfolder = opt.cwd_folder_meta;
        var uuid    = opt.file_uuid;
        // the file meta saved in folder meta:
        var meta    = mfolder.files[uuid];

        p('got file uuid, path: ', meta.uuid, meta.path, meta.size );
        this.size += get_number(meta.size);
        callback(null, null)
            //cwd.uuid_to_file_obj(uuid, function(err, file){
            //    p('do file, ', meta.path, meta.what);
            //    callback(null, null);
            //})
    },

    do_folder: function do_folder(opt, callback){
        var cwd_meta =  opt.cwd_folder_meta;
        var cwd      =  opt.cwd_folder_obj;
        var meta     =  opt.sub_folder_meta;
        var sub_folder = opt.sub_folder_obj;

        //p ('- in do folder, ', meta.path);
        var mfolder = sub_folder.get_meta();
        p('got folder uuid, path: ', mfolder.uuid, mfolder.path );
        this.size += 400000; // 400k   g000 m000 k000
        callback(null, null);

        //folder.callback_folder_auxiliary_path(function(err, apath){
        //    p('in folder: ', meta.path);
        //    p('callback folder auxiliary path: err apath: ', err, apath);
        //    walk_through(folder, callback);
        //});

    }

};

function add_up_home_size(name){
    //name = name || 'cat-02';
    name = name || 'abc';
    user.get_user_id(name, function(err, id){
        folder_module.retrieve_folder(id).then(function(folder){
            //walk_through(folder, callback);
            walker.walk_through(folder, adding, function(err, what){
                p('add up... after walk through, err: ', err);
                p('adding size: ', adding.size);
                stop();
            });
        });
    });
}

function add_up_dir_size(dir){
    dir = dir || 'abc/test';
    folder_module.retrieve_folder(dir).then(function(folder){
        walker.walk_through(folder, adding, function(err, what){
            p('add up... after walk through, err: ', err);
            p('adding size: ', adding.size);
            stop();
        });
    });
}

function get_number(int_or_str){
    if(!int_or_str) return 0;

    if(typeof int_or_str === 'number') return int_or_str;

    if(typeof int_or_str === 'string'){
        try{
            var num = parseInt(int_or_str);
            return num;
        }catch(err){
            return 0;
        }
    }
    return 0;
}

// for file_1st_walk_through

function check_file1st(pwd){
    pwd = pwd || 'abc/test';

    var worker = function(folder, uuid, callback){
        var meta = folder.get_meta().files[uuid];
        //p(uuid, meta.what, meta.path);
        callback(null, null);
    };

    folder_module.retrieve_folder(pwd).then(function(folder){
        walker.file_1st_walk_through(folder, worker, function(err, what){
            p(1, err);
            stop();
        });
    });
}

function size_folder(pwd){
    pwd = pwd || 'abc/test';

    var worker = function(folder, uuid, callback){
        var meta = folder.get_meta().files[uuid];
        //p(uuid, meta.what, meta.path);
        if(meta.what === myconfig.IamFolder){
            p('got a folder, ', meta.path);
        }else{
            p(meta.size);
        }
        callback(null, null);
    };

    folder_module.retrieve_folder(pwd).then(function(folder){
        walker.file_1st_walk_through(folder, worker, function(err, what){
            p(1, err);
            stop();
        });
    });
}


if(require.main === module){

    //check_walk_through();
    //check_one_home();
    //add_up_home_size();
    //add_up_dir_size();

    check_file1st();
    //size_folder();
}


var o = {}
function drop_into_repl(o, dir){
    // drop variable/objects into REPL, o is the object to save variables
    o   = o   || {};
    dir = dir || 'abc/test';

    folder_module.retrieve_folder(dir).then(function(folder){
        o.folder = folder;
        //walk_through(folder, function(err, what){
        //    p('after walk through: ', err, what);
        //    stop();
        //});

    });
}

