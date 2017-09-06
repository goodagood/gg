// Testing 'aws/simple-json.js'


var assert = require("assert");
var u      = require("underscore");
var path   = require("path");
//var Promise= require("bluebird");

var css = require("../aws/css-file.js");

var folder_module = require("../aws/folder-v5.js");
var file_module   = require("../aws/simple-file-v3.js");
var simple_json   = require("../aws/simple-json.js");


var p    = console.log;
var tutil = require("../myutils/test-util.js");

var _test_folder_path = 'abc';
var _test_folder_name = 'abc';
var _test_user_name   = 'abc';




var t1_make_a_json_file = function(test){
    // 

    var file_path = path.join(_test_folder_path, 'test.json');
    //test.expect(1);

    var json = {
        what : "a json file",
        a    : 'a is a',
        b    : 'b is b',
    }

    simple_json.make_json_file(json, _test_user_name, file_path, function(err, what){
        //p('err, what : ', what);
        test.ok(u.isNull(err));
        test.done();
    });
};


function write_json_as_text(test){
    var user_name   = 'abc';
    var folder_path = 'abc/test';
    var file_name   = 'json-txt.json';

    var json = {
        what : "a json file write as text file",
        a    : 'a is a',
        b    : 'b is b',
        d    : new Date(),
    };
    var text = JSON.stringify(json);

    folder_module.retrieve_folder(folder_path).then(function(folder){
        test.ok(!u.isNull(folder));
        if(folder.file_exists(file_name)){
            return test.done();
        }

        p('going to write text file: ', folder_path, file_name);
        file_module.write_text_file(user_name, folder_path, file_name, text).then(function(s3reply){

            test.ok(!u.isNull(s3reply), 'reply should not be null');
            test.done();
        });
    });
}

var t3_new_from_meta = function(test){
    // We need to prepare a meta, including storage before we test.
    //test.expect(1);

    var json = {
    }

    simple_json.make_json_file(json, _test_user_name, _test_folder_path, function(err, what){
        //p('err, what : ', what);
        //test.ok(u.isString(str));
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

    "test1 : make a json file " : t1_make_a_json_file,
    "test2 : make a json to text file " : write_json_as_text,
};


module.exports.last = function(test){
    test.expect(1);
    test.ok(true);
    tutil.stop();
    test.done();
}


// -- The rest is for checking:


function make_a_json_file (){

    var file_path = 'abc/test/j710501.json';
    var username  = 'abc';

    var json = {
        what : "a json file",
        a    : 'a is a',
        b    : 'b is b',
        time : new Date().toString(),
    };

    simple_json.make_json_file(json, username, file_path, function(err, jfile){
        p('err, u.keys jfile : ', err,  u.keys(jfile).join(', '));
        jfile.read_to_string(function(err, str){
            p('err, str: ', err, str);
            tutil.stop();
        });
    });
}


function check_new_from_meta(){

    var file_path = 'abc/test/json-txt.json';

    //folder_module.retri
    simple_json.read_as_json_file(file_path, function(err, json){
        p('json: \n', json);
        tutil.stop();
    })

}

if (require.main === module){
    make_a_json_file();
    //check_new_from_meta();
}


//-- dropping to REPL --//
function drop_into_repl(o, dir){
    // drop variable/objects into REPL, o is the object to save variables
    o   = o   || {};
    dir = dir || 'abc/imgvid';

    folder_module.retrieve_folder(dir).then(function(folder){
        o.folder = folder;
        o.mfolder= folder.get_meta();
        o.shorts = u.omit(o.mfolder, 'files', 'html', 'renders', 'file_uuids', 'file_names');

        //o.is     = o.folder.is_name_in_meta_files('26.jpg');
        //p('?: ', o.folder.is_name_in_meta_files('26.jpg'));
        //walk_through(folder, function(err, what){
        //    p('after walk through: ', err, what);
        //    stop();
        //});

    });
}

// dog-02 has id: 46
//var o = {}; drop_into_repl(o, '46/public'); o.shorts;
//var o = {}; drop_into_repl(o, 'abc/add-2/img2'); o.shorts;
//var o = {}; drop_into_repl(o); o.shorts;



// a signal to 'expect'
console.log("ok start interact:");
