
var assert = require("assert");
var u = require("underscore");
var async = require("async");
var path = require("path");
var Promise = require("bluebird");

var file_list = require("../hrouters/file-list-v2.js");
var folder_module = require("../aws/folder-v5.js");

var config = require("../test/config.js");


_test_folder_path    = 'abc';
_test_folder_path2    = 'abc/goodagood';
_test_user_name      = 'abc';
_test_file_name = 'move';
_gg_folder_name = 'goodagood';
_new_folder_name= 'test';


p = console.log;

stop = function(period) {
    var milli_seconds;
    period = period || 1;
    if (!u.isNumber(period)) {
        period = 1;
    }
    milli_seconds = period * 1000;
    return setTimeout(process.exit, milli_seconds);
};


var t1_ls_for_username = function(test){

    folder_path = _test_folder_path || 'abc';

    folder_module.retrieve_folder(folder_path).then(function(folder){
        var username = folder.get_owner_name();
        file_list.ls_for_owner(username, folder, function(err, html){
            //p('html?\n', html);
            test.ok(u.isString(html));
            test.done();
        });
    });
};

module.exports.group_one = {
    setUp: function (callback) {
        callback();
    },
    tearDown: function (callback) {
        callback();
    },

    "test-1 : ls for user name" : t1_ls_for_username,
    //"test-1 : get all uuids" : test_get_all_uuid,
};



module.exports.last = function(test){
    test.expect(1);
    test.ok(true);
    stop();
    test.done();
}


// -- checkings -- //

function check_ls_for_owner(folder_path){
    folder_path = folder_path || 'abc';
    //var _test_folder_path = 'abc/goodagood';

    folder_module.retrieve_folder(folder_path).then(function(folder){
        var username = folder.get_owner_name();
        file_list.ls_for_owner(username, folder, function(err, html){
            p('html?\n', html);
            stop();
        });
    });
};


function check_ls_for_username(user_name){
    user_name = user_name || 'abc';
    p('user name: ', user_name);
    //var _test_folder_path = 'abc/goodagood';

    folder_module.retrieve_folder(user_name).then(function(folder){
        p(2);
        assert(u.isObject(folder));
        //var username = folder.get_owner_name();

        file_list.ls_for_username(user_name, user_name, function(err, html){
            p(3);
            // 
            p('html?\n', html);
            stop();
        });
    });
}


function check_list_style (){
    // user 'tmpe' has home id: '17', take it as a string, not number

    var username = 'tmpe';
    var cwd = '17';
    file_list.list_style(username, cwd, function(err, html){
        console.log( err, html.slice(0, 100));
    });
}


function check_list_tmp (){
    // user 'tmpe' has home id: '17', take it as a string, not number

    var username = 'tmpe';
    var cwd = '17';
    file_list.list_tmp(username, cwd, function(err, html){
        p( err, html);
        //p( err, html.slice(0, 100));
        stop();
    });
}

function retrieve_17(){
    folder_module.retrieve_folder('17').then(function(folder){
        p('folder: ', Object.keys(folder));
        stop();
    });
}



if(require.main === module){
    p('checking for file list v2');
    //check_ls_for_owner("tmpab");
    //check_ls_for_username('ab');

    //check_list_style();
    check_list_tmp();
    //retrieve_17();
}


