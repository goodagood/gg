// test aws/rm-file.js
// 2015, 0411


var assert = require("assert");
var u = require("underscore");
var path = require("path");
var Promise = require("bluebird");

var folder_module = require("../aws/folder-v5.js");
var rmfile = require('../aws/rm-file.js');

var p    = console.log;
var stop = function(seconds) {
    var seconds = seconds || 1;
    var milli_sec = seconds * 1000;
    setTimeout(process.exit, milli_sec);
};

var sleep= function(seconds, callback){
    var seconds = seconds || 1;
    var milli_sec = seconds * 1000;

    setTimeout(function(){
        callback(null, seconds);
    }, milli_sec);
}
promise_to_sleep = Promise.promisify(sleep);

// end of heading.

var _test_folder_path = 'abc/test';
var _test_sub_folder_name = 'test-add';
var _test_user_name   = 'abc';




module.exports.group_one = {
    setUp: function (callback) {
        //this.foo = 'bar';
        callback();
    },
    tearDown: function (callback) {
        //stop(); // stop in a second any way.
        p ('- in tearDown');
        callback();
    },

    //"test-2 : add folder, then file then delete" : t2,

};


module.exports.stop = function(test){
    test.expect(1);
    p(' -- going to force stop --');
    test.ok(true);
    stop();
    test.done();
};


// -- do some in file checkings: -- //


function get_a_file(folder_path, pat, callback){
    pat         = pat || /du.+/;
    folder_path = folder_path || 'abc/add-2';

    var Folder, Meta, Sub;

    folder_module.retrieve_files_by_pattern(folder_path, pat, function(err, files){
        if(err) return callback(err, null);

        p('get first from number of files: ', files.length);
        callback(null, files[0]);
    });
}


function get_a_folder_and_a_file(folder_path, file_pat, callback){
    folder_path = folder_path || 'abc/add-2';
    file_pat    = file_pat    || /du.+/;

    folder_module.retrieve_promisified_folder(folder_path).then(function(folder){
        var uuids = folder.pattern_to_uuids(file_pat);
        p('tool, get a folder and a file: get first from number of uuids: ', uuids.length);
        assert(uuids.length > 0);
        folder.uuid_to_file_obj(uuids[0], function(err, file){
            callback(err, folder, file);
        });
    });
}


function check_get_a_file(){
    get_a_file('abc/add-2', /du.+/, function(err, file){
        p('get the file: ', err, file);
        stop();
    });
}



function check_get_a_folder_and_file(){
    get_a_folder_and_a_file('abc/add-2', /du.+/, function(err, folder, file){
        //p('get the f f: ', err, folder, file);
        p('folder obj version: ', folder.version, file.version);
        stop();
    });
}




// Beside testing , here do some checking:
if (require.main === module){
    //get_a_file(null, null, function(err, files){stop();});
    //check_get_a_file();
    check_get_a_folder_and_file();
}



// to drop into REPL
var ff={}; // a folder and a file: {folder: obj, file: obj}

function repl_get_folder_file(cwd, pat, v){
    folder_path = cwd || 'abc/add-2';
    pat         = pat || /Press.+/;
    v           = v   || ff; // where save information in REPL.

    get_a_folder_and_a_file(folder_path, pat, function(err, folder, file){
        if(err) throw new Exception(err);

        v.folder = folder;
        v.file   = file;
        v.mfile  = file.get_meta();
        v.mfolder= folder.get_meta();

        //rmfile.rm_file_by_uuid(folder, v.mfile.uuid, function(err, what){
        //    if(err) return p('rm file by uuid got err: ', err);
        //    v.rmres = what;
        //    p('assigned "rm file by uuid" results to v.rmres');
        //    p('folder not SAVED');
        //});
    });
}


// todo
function repl_rm_file(cwd, pat, v){
    folder_path = cwd || 'abc/add-2';
    pat         = pat || /Press.+/;
    v           = v   || ff; // where save information in REPL.

    get_a_folder_and_a_file(folder_path, pat, function(err, folder, file){
        if(err) throw new Exception(err);

        v.folder = folder;
        v.file   = file;
        v.mfile  = file.get_meta();
        v.mfolder= folder.get_meta();

        //rmfile.rm_file_by_uuid(folder, v.mfile.uuid, function(err, what){
        //    if(err) return p('rm file by uuid got err: ', err);
        //    v.rmres = what;
        //    p('assigned "rm file by uuid" results to v.rmres');
        //    p('folder not SAVED');
        //});
    });
}



function repl_get_folder(dir){
    dir = dir || 'abc/add-2';

    folder_module.retrieve_promisified_folder(dir).then(function(folder){
        ff.folder = folder;
        folder.build_file_list();
        folder.save_meta(function(err, what){
            p('save meta got: ', err, what);
        });
    });
}



var buck = require('../aws/bucket.js');

function check_s3exists(key){
    buck.s3_object_exists(key, function(e,w){
        p('s3 obj exists?: ', e,w);
    });
}

function tmp(){
    va.folder.clear_file_meta(va.file.uuid);
    va.folder.build_file_list();
    va.folder.save_meta(function(err, what){
        p('save meta got: ', err, what);
    });
}

function repl_chk_rm(cwd, pat, v){
    folder_path = cwd || 'abc/add-2';
    pat         = pat || /food.+/;
    v           = v   || ff; // where save information in REPL.

    get_a_folder_and_a_file(folder_path, pat, function(err, folder, file){
        if(err) throw new Exception(err);

        v.folder = folder;
        v.file   = file;
        v.mfile  = file.get_meta();
        v.mfolder= folder.get_meta();

        rmfile.rm_file_by_uuid(folder, v.mfile.uuid, function(e,w){
            p(e,w);
            p('now check if removed: ', v.mfile.path);
        });
    });
}

//var va = {};
//repl_get_folder_file('abc/add-2', /r2v.+/, va);


p('ok start interact:');
