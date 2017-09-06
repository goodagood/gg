//
// Try to test: aws/bucket.js
// This is a must after aws force me to change security settings.
// 0408, 2015
//

var assert  = require("assert");
var u       = require("underscore");
var async   = require("async");
var path    = require("path");
//var Promise = require("bluebird");
var fs      = require("fs");

//var folder_module = require("../aws/folder-v5.js");

//var myconfig =   require("../config/config.js");
//var config = require("../test/config.js");

var bucket = require("../aws/bucket.js");
//var phome = require("../aws/prepare-home.js");
//var iroot = require("../aws/init-root.js");

var tutil  = require ("../myutils/test-util.js");


// folders, files used in testing //
var _test_s3key       = '.gg.folder.meta/abc';
var _test_folder_path = 'abc';
var _test_file_name   = 'test-write-20';
var _test_file_path   = 'abc/test-write-20';
var _test_user_name   = 'abc';

var _gg_folder_name  = 'goodagood';
var _new_folder_name = 'test';
var _new_folder_name_in_test = 'test';


var p = console.log;

// end of the headings //



function write_text_and_read_back(test){
    var t = new Date();
    var ts= t.toISOString();
    var s3key = 'test/' + ts + '.text';
    p('\nwrite to s3 key: ', s3key);

    var txt = 'Here write, ' + ts;

    function del(){
        bucket.delete_object(s3key, function(err, del_reply){
            test.ok(!err);
            //p('del, err reply:', err, del_reply);
            test.done();
        });
    } 

    bucket.write_text_file(s3key, txt, function(err, what){
        test.ok(!err);
        p('write text file got: ',err, what);

        bucket.read_data(s3key, function(err, read_what){
            test.ok(!err);
            //p(1, err, read_what);
            var read_txt = read_what.toString();
            //p(2, err, read_txt);
            test.ok(txt === read_txt);
            setTimeout(del, 60000);
        });
    });
}


module.exports.group_one = {
    setUp: function (callback) {
        callback();
    },
    tearDown: function (callback) {
        callback();
    },

    "test 1: " : write_text_and_read_back,

};


module.exports.last = function(test){
    test.expect(1);
    p(' -- going to force stop --');
    test.ok(true);
    tutil.stop();
    test.done();
};


// -- some fast checkings -- //

function check_read(key){
    s3key = key || _test_s3key;
    bucket.read_data(s3key, function(err, what){
        p(err, what);
        //p(what.toString());
        p(what.toString().substr(0, 100));
        tutil.stop();
    });
}

function write_text(key){
    var t = new Date();
    var ts= t.toISOString();
    var s3key = key || 'test/' + ts + '.text';
    p('write to s3 key: ', s3key);

    var txt = 'Here write, ' + ts;
    function del(seconds){
        seconds = seconds || 60;
        bucket.delete_object(s3key, function(err, del_reply){
            p('del, err reply:', err, del_reply);
            p('going to stop in seconds: ', seconds);
            tutil.stop(seconds);
        });
    } 

    bucket.write_text_file(s3key, txt, function(err, what){
        p(err, what);

        bucket.read_data(s3key, function(err, read_what){
            p(1, err, read_what);
            var read_txt = read_what.toString();
            p(2, err, read_txt);
            assert(txt === read_txt);
            del(); // del will stop, in about 60 seconds.
        });
    });
}



if(require.main === module){
    //check_read();
    write_text();
}


