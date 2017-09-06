// Testing 'aws/client-json-filter.js'
// Assert:  folder: 'abc/test' get files.


var assert = require("assert");
var u = require("underscore");
var path = require("path");
var Promise = require("bluebird");

var cjf = require("../aws/client-json-filter.js");

var folder_module = require("../aws/folder-v5.js");

var p    = console.log;
var tool = require("../myutils/test-util.js");


var _test_folder_path = 'abc/test';
var _test_user_name   = 'abc';


var test_Get_file_list_json = function(test){
    test.expect(1);

    folder_module.retrieve_folder(_test_folder_path).then(function(folder){
        test.ok(u.isObject(folder));

        test.done();
    });
};



module.exports.test_one = {
    setUp: function (callback) {
        //this.foo = 'bar';
        callback();
    },
    tearDown: function (callback) {
        p ('- in tearDown');
        callback();
    },

    "test1 : test get file list json" : test_Get_file_list_json,
};


module.exports.last = function(test){
    test.expect(1);
    test.ok(true);
    tool.stop();
    test.done();
}



// -- The rest is for checking:


function check_Get_file_list_json (){
    folder_module.retrieve_folder(_test_folder_path).then(function(folder){
        var keys = u.keys(folder).sort();
        //p('keys in folder object: ', keys.join(',\t '));
        var flj = cjf.get_file_list_json(folder);
        //p('file list json: ', flj);
        p('file list json is array: ', u.isArray(flj));
        p('file list json length: ', flj.length);
        p('one file json for client: ', flj[0]);

        tool.stop();
    });
}

function check_File_meta_4_client (){
    cjf.file_metas_for_client(_test_folder_path, function(err, list){
        p('f m 4 c: ', err, list);
        tool.stop();
    });
}



// Beside testing , here do some checking:
if (require.main === module){
    //check_Get_file_list_json();
    check_File_meta_4_client();
}


// -- drop into REPL -- //
// .load  this-file     // in node REPL, and get variables prepared.



