//
// Try to test: myutils/redis-basic.js
// 0407, 2015
//

var assert  = require("assert");
var u       = require("underscore");
var async   = require("async");
var path    = require("path");
var Promise = require("bluebird");
var fs      = require("fs");

var folder_module = require("../aws/folder-v5.js");

var myconfig =   require("../config/config.js");
var config = require("../test/config.js");

var rbasic = require("../myutils/redis-basic.js");

//var bucket = require("../aws/bucket.js");
var ttool  = require ("../myutils/test-util.js");


// folders, files used in testing //
var _test_folder_path = 'abc';
var _test_file_name   = 'test-write-20';
var _test_file_path   = 'abc/test-write-20';
var _test_user_name   = 'abc';

var _gg_folder_name  = 'goodagood';
var _new_folder_name = 'test';
var _new_folder_name_in_test = 'test';


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

// end of the headings //


function test_seriel_num(test){
    rbasic.serial_number(function(err, num){
        test.ok(!err);
        test.ok(u.isNumber(num));
        test.done();
    });
}


module.exports.group_one = {
    setUp: function (callback) {
        callback();
    },
    tearDown: function (callback) {
        callback();
    },

    "test 1: " : test_seriel_num,

};


module.exports.last = function(test){
    test.expect(1);
    p(' -- going to force stop --');
    test.ok(true);
    ttool.stop();
    test.done();
};


// -- some fast checkings -- //

function check_seriel_num(test){
    rbasic.serial_number(function(err, num){
        assert(!err);
        assert(u.isNumber(num));
        p(err, num);
        stop();
    });
}


function check_seriel_num_str(){
    rbasic.serial_number_str(function(err, numstr){
        assert(!err);
        assert(u.isString(numstr));
        p(err, numstr);
        stop();
    });
}


if(require.main === module){
    //check_seriel_num();
    check_seriel_num_str();
}


