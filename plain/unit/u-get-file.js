// 
// 2015, 1016
//

var assert = require("assert");
var u = require("underscore");
var async = require("async");
var path = require("path");
var Promise = require("bluebird");

var folder_module = require("../aws/folder-v5.js");
var get_file      = require("../aws/get-file.js");

var myconfig =   require("../config/config.js");
var config = require("../test/config.js");


var getfile = require("../aws/get-file.js");

var folder_path = 'abc';
var user_name = 'abc';
var gg_folder_name = 'goodagood';
var new_folder_name = 'test';


var fs = require('fs');

var p = console.log;
var stop = function(seconds){setTimeout(process.exit, (seconds||1)*1000);};




var Test_file_1   = 'abc/test/s.html';
var Test_file_2   = 'abc/test/11.jpg';


function chk_file_objs(full_path){
    var full_path = full_path || Test_file_1;

    getfile.get_file_objs_by_path(full_path, function(err, files){
        if(err){p('chk file objs failed, ', err); return stop();}

        //p('1 st check: ', err, files);
        p('u.isArray(files)'); p(u.isArray(files));
        p(files.length);

        stop();
    });
}


function chk_file_obj(full_path){
    var full_path = full_path || Test_file_1;
    getfile.get_1st_file_obj_by_path(full_path, function(err, file){
        if(err){p('chk get 1st file obj failed, ', err); return stop();}

        //p('1 st check: ', err, file);
        p('u.isArray(file)'); p(u.isArray(file));
        //p(file);
        p(u.keys(file).sort().join(" \t "));

        p(file.get_meta());

        stop();
    });
}

if(require.main === module){
    //chk_file_objs();

    //chk_file_obj(Test_file_2);
    chk_file_obj('abc/tadd/test.log');
}




//-- dropping to REPL --//



function drop_a_video_file_into_repl(o, file_path){
    o   = o   || this;
    file_path =  file_path || 'abc/test/small3.mp4';

    get_file.get_1st_file_obj_with_auxpath_by_path(file_path, function(err, file){
        if(err) return p('You got err when dropping: ', err);

        var meta = file.get_meta();
        o.file = file;
        o.meta = meta;

        o.tb   = tb;

        p('object should be populated');
    });
}


//var o = {}; drop_a_video_file_into_repl(o);


// a signal to 'expect'
//console.log("ok start interact:");
