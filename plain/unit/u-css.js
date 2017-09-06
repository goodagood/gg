// Testing 'aws/css-file.js'


var assert = require("assert");
var u = require("underscore");
var path = require("path");
var Promise = require("bluebird");

var css = require("../aws/css-file.js");

var folder_module = require("../aws/folder-v5.js");

var p    = console.log;
var tool = require("../myutils/test-util.js");


var _test_folder_path = 'abc';
var _test_folder_name = 'abc';
var _test_user_name   = 'abc';


function is_string_or_null(what){

    if(what === null) return true;
    if(typeof what === 'string') return true;
    return false;
}


var t1_read_folder_css = function(test){
    test.expect(1);

    css.read_css_file_of_folder(_test_folder_path).then(function(str){
        //p('content should be: ', str);
        test.ok(u.isString(str));
        test.done();
    });
};

var t1a_read_folder_css_with_default = function(test){
    test.expect(1);

    css.read_folder_css(_test_folder_path).then(function(str){
        p("reading folder css with backing to user default, " + _test_folder_path);
        p('content should be: ', str);
        //test.ok(u.isString(str));
        test.ok(is_string_or_null(str));
        test.done();
    });
};


var t2_read_default_folder_css = function(test){
    test.expect(1);

    css.read_default_css_file_of_folder(_test_user_name).then(function(str){
        //p('content of default folder css for user: ' + _test_user_name);
        //p(str);
        //test.ok(u.isString(str));
        test.ok(is_string_or_null(str));
        test.done();
    });
};

var t3_read_file_css = function(test){
    test.expect(1);

    css.read_css_file_for_file_info(_test_folder_path).then(function(str){
        //p('read file css, where: ', _test_folder_path);
        //p('content should be: ', str);
        //p('type of content should be: ', typeof str);
        //test.ok(u.isString(str));
        test.ok(is_string_or_null(str));
        test.done();
    });
};

var t3a_read_file_css_with_back = function(test){
    test.expect(1);

    css.read_file_css(_test_folder_path).then(function(str){
        //p('read file css with DEFAULT, where: ', _test_folder_path);
        //p('content should be: ', str);
        //p('type of content should be: ', typeof str);
        //test.ok(u.isString(str));
        test.ok(is_string_or_null(str));
        test.done();
    });
};


var t4_read_default_file_css = function(test){
    test.expect(1);

    css.read_default_css_file_for_file_info(_test_user_name).then(function(str){
        //p('read file css, where: ', _test_user_name);
        //p('content should be: ', str);
        //p('type of content should be: ', typeof str);
        test.ok(is_string_or_null(str));
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

    "test1 : read folder css" : t1_read_folder_css,
    "test1a: read folder css with back" : t1a_read_folder_css_with_default,
    "test2 : read *default* folder css" : t2_read_default_folder_css,
    "test3 : read file css" : t3_read_file_css,
    "test3a: read file css with BACK" : t3a_read_file_css_with_back,
    "test4 : read *default* file css" : t4_read_default_file_css,
};


module.exports.last = function(test){
    test.expect(1);
    test.ok(true);
    tool.stop();
    test.done();
}


// -- The rest is for checking:



var check_read_folder_css = function(name){
    var name = name || 'abc';
    css.read_css_file_of_folder(name).then(function(str){
        p('content should be: ', str);
        tool.stop();
    });
};

check_read_default_fold_css = function(name){
    var name = name || 'abc';
    css.read_default_css_file_of_folder(name).then(function (str){
        p( "default css file:\n", str);
        tool.stop();
    });
};

var check_read_file_info_css = function(username){
    var username = username || 'abc'; // root path of user == username;
    css.read_css_file_for_file_info(username).then(function(what){
        p('check read file info css:\n');
        p(what);
        tool.stop();
    });
};

var check_read_default_file_css = function(user_name){
    var user_name = user_name || 'abc';
    css.read_default_css_file_for_file_info(user_name).then(function(css){
        p(css);
        tool.stop();
    });
};


function check_read_folder_css_with_back(_path){
    var _path = _path || 'abc';

    css.read_folder_css(_test_folder_path).then(function(str){
        //p("reading folder css with backing to user default, " + _test_folder_path);
        p('get content of css file: ', str);
        tool.stop();
    });
}


// Beside testing , here do some checking:
if (require.main === module){
    //check_read_file_info_css();
    //check_read_default_file_css();

    //check_read_folder_css();
    //check_read_default_fold_css();
    check_read_folder_css_with_back();
}


