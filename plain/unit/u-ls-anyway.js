// checking 'ls-anyway.js'
// 2015 0507

var assert = require("assert");
var u = require("underscore");
var async = require("async");
var path = require("path");
var Promise = require("bluebird");

var folder_module = require("../aws/folder-v5.js");
var file_module   = require("../aws/simple-file-v3.js");

var anyway   = require("../hrouters/ls-anyway.js");
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


function check_parts(params){
    params = params || {
        username: "abc",
        cwd : 'abc/test',
    };
    anyway.give_folder_listing_parts(params, function(err, parts){
        p('got listing parts: ', err, parts);
        require ("../myutils/test-util.js").stop();
    });
}




function check_anyway(){
    var params = {
        username: 'abc',
        cwd:      'abc/test',
    };

    anyway.list_folder_anyway(params, function(err, html){
        if(err)  {p(1, err); return stop();}
        p(err, html);
        //p(err, html.slice(300, 500));
        stop();

        //fun_to_list(params, function(err, html){
        //    if(err)  {p(err); return stop();}
        //});
    });
}


if(require.main === module){
    p(' do some checking');
    //check_get_folder_listor();
    //check_parts();
    check_anyway();
}


// -- dropping -- //


var o = {}
function drop_into_repl(o, params){
    // drop variable/objects into REPL, o is the object to save variables
    if(!o) { this.dropobj={}; o=this.dropobj; }

    params = params || {
        username: "abc",
        cwd : 'abc/test',
    };
    anyway.give_folder_listing_parts(params, function(err, parts){
        if(err) return o.err = err;

        p('got listing parts: ', err, parts);
        o.parts = parts;
    });

}

function drop_waterfall(o, params){
    // drop variable/objects into REPL, o is the object to save variables
    if(!o) { this.dropobj={}; o=this.dropobj; }

    params = params || {
        user_name: "abc",
        cwd : 'abc/test',
    };
    anyway.give_folder_listing_parts_0601(params, function(err, parts){
        if(err) return o.err = err;

        p('got listing parts: ', err, u.keys(parts));
        o.parts = parts;
    });

}

drop_waterfall(o);


// a signal to 'expect'
console.log("ok start interact:");
