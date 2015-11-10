//

var assert = require("assert");
var u = require("underscore");
var async = require("async");
var path = require("path");
var Promise = require("bluebird");

var folder_module = require("../aws/folder-v5.js");
var file_module   = require("../aws/simple-file-v3.js");

var myconfig =   require("../config/config.js");
//var config = require("../test/config.js");

//var bucket = require("../aws/bucket.js");

var folder_path = 'abc';
var user_name = 'abc';
var gg_folder_name = 'goodagood';
var new_folder_name = 'test';


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

check_get_folder_milli_uuid = function(){
    var filename = 'folder.css';
    var folder_path = 'abc';

    folder_module.retrieve_folder(folder_path).then(function(folder){
        var mfolder = folder.get_meta();
        p( 'folder meta milli uuid: ', mfolder['milli_uuid']);
        folder.callback_milli_uuid(function(err, muuid){
            p(' callback milli uuid got: ', err, muuid);

            stop();
        });
    });
}

check_folder_aux_path_by_folder_own = function(){
    var filename = 'folder.css';
    var folder_path = 'abc';

    folder_module.retrieve_folder(folder_path).then(function(folder){
        //p('check gfobn ', folder);
        var apath = folder.get_folder_auxiliary_path(function(err, apath_in){
            p('in callback of got aux path: err, the path: ', err, apath_in);
        });
        p('out callback of got aux path: apath: ', apath);
        stop(5);
    });
}

check_first_file_milli_uuid = function(){
    var file_path = 'abc/folder.css',
        folder_path = 'abc';

    p('in "check get first file by name": ');
    folder_module.retrieve_first_file_obj(file_path, function(err, file){
        var meta = file.get_meta();
        p ('retrieved first file meta path:', meta.path);

        var mfile = file.get_meta();
        p( 'file meta milli uuid: ', mfile['milli_uuid']);
        file.callback_milli_uuid(function(err, muuid){
            p(' cb milli uuid: ', err, muuid);
            stop();
        });
    });
}


check_file_aux = function(){
    var file_path = 'abc/folder.css',
        folder_path = 'abc';

    p('in "check get first file by name": ');
    folder_module.retrieve_first_file_obj(file_path, function(err, file){
        var mfile = file.get_meta();
        p( 'file meta milli uuid: ', mfile['milli_uuid']);

        var faux = file.get_file_auxiliary_path(function(err, apath_in){
            p('in callback of got aux path: err, the path: ', err, apath_in);
        });
        p('out callback of got aux path: faux: ', faux);
        stop(5);
    });
}


// trying to make walk through easy.
// walk_through moved to aws/walk-through.js


function do_file(parent_folder, uuid, callback){
    var mfolder = parent_folder.get_meta();
    var meta    = mfolder.files[uuid];

    callback(null, null)
    //parent_folder.uuid_to_file_obj(uuid, function(err, file){
    //    p('do file, ', meta.path, meta.what);
    //    callback(null, null);
    //})
}

function do_folder(parent_folder, uuid, callback){
    var mpfolder = parent_folder.get_meta();
    var meta    = mpfolder.files[uuid];

    //p ('- in do folder, ', meta.path);
    folder_module.retrieve_folder(meta.path).then(function(folder){
        folder.callback_folder_auxiliary_path(function(err, apath){
            p('in folder: ', meta.path);
            p('callback folder auxiliary path: err apath: ', err, apath);
            walk_through(folder, callback);
        });
        //p( 'still not walk into folder: ', meta.path, meta.what);
        //callback(null, null);
    });
    //callback(null, null);
}



var walker = require("../aws/walk-through.js");

// give functions to deal file and folder:
var functions_do_file_and_folder = {

    do_file: function(cwd_obj, uuid, callback){return callback(null, null);}

    // do folder need not to take care recursive things, no options pass in.
    ,do_folder: function (cwd_obj, uuid, callback){
        var cwd_meta =  cwd_obj.get_meta();
        var meta     = cwd_meta.files[uuid];

        //p ('- in do folder, ', meta.path);
        folder_module.retrieve_folder(meta.path).then(function(folder){
            var mfolder = folder.get_meta();
            p('got sub folder: path, uuid: ', mfolder.path, mfolder.uuid);
            folder.callback_folder_auxiliary_path(function(err, apath){
                p('aux path: ', mfolder.aux_path);
                callback(null, null);
            });
        });
    }

    //,do_file: function (cwd_obj, uuid, callback){
    //    var mfolder = cwd_obj.get_meta();
    //    var meta    = mfolder.files[uuid];
    //    p(meta.path, ', got file meta keep by folder.');

    //    callback(null, null)
    //    //cwd_obj.uuid_to_file_obj(uuid, function(err, file){
    //    //    p('do file, ', meta.path, meta.what);
    //    //    callback(null, null);
    //    //})
    //},



};

function check_walk_through(dir){
    dir = dir || '19';

    folder_module.retrieve_folder(dir).then(function(folder){
        walker.walk_through(folder, functions_do_file_and_folder, function(err, what){
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
            walk_through(folder, callback);
            // debug:
            //p('got folder, ', u.isEmpty(folder));
            //callback(null, null);
        });
    });
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


if(require.main === module){
    p(' do some checking');
    //check_get_folder_aux_path();
    //check_get_folder_milli_uuid();
    //check_first_file_milli_uuid();

    //check_walk_through();
    //check_folder_aux_path_by_folder_own();
    check_file_aux();
    //walk_user_homes();
}


