
//
// users/pre-people-file.js
// changed people manager, try to be non-blocking, 
// in case it was not initialized, it will do initialize
// or give null or err
// 0419, 2015.
//

var assert  = require("assert");
var u       = require("underscore");
var async   = require("async");
var path    = require("path");
var Promise = require("bluebird");
var fs      = require("fs");

//var bucket        = require("../aws/bucket.js");
var folder_module = require("../aws/folder-v5.js");
//var file_module   = require("../aws/simple-file-v3.js");
//var file_types    = require("../aws/s3-file-types.js");
//var update        = require("../aws/file-update.js");
//
//var myconfig =   require("../config/config.js");
//var config = require("../test/config.js");

var a      = require("../users/a.js");
var ttool  = require("../myutils/test-util.js");

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



var pre = require("../users/pre-people-file.js");


function wrt_people_file(home_id){
    home_id = home_id || '17';
    pre.write_people_json(home_id, {}, function(err, repl){
        p("write people file : ", err, repl);
        pre.read_people_json(home_id, function(err, j){
            p('read back: ', j);
            stop();
        });
    });
}

function get_people_json(username){
    username = username || 'tmpe';

    pre.make_people_manager_for_user(username, function(err, manager){
        p('the manager: ', manager);

        p(manager.get_json());
        stop();
    });


    //stop(10);
}


if(require.main === module){
    //wrt_people_file();

    get_people_json();
}


// -- used when drop into REPL -- //

// for home id: 19

function get_home_num (hid, robj){
    folder_module.retrieve_folder(hid).then(function(folder){
        robj.folder = folder;
        robj.mfolder= folder.get_meta();

        pre.write_people_json(hid, null, function(err, what){
            if(err) return p('write people j err: ', err, what);

            pre.read_people_json(hid, function(err, json){
                p('read p j: ', err, json);
                robj.pjson = json;
            });
        });
    });
}
var o = {};
get_home_num('19', o);
