
var assert = require("assert");
var u = require("underscore");
var async = require("async");
var path = require("path");
var Promise = require("bluebird");

var text_file = require("../aws/text-file-v1.js");
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


var t1_get_a_text_file = function(test){
    var _test_file_path = 'abc/move';

    folder_module.retrieve_file_meta(_test_file_path, function(err, meta_list){
        //p('err, reply', err, meta_list);
        test.ok(u.isArray(meta_list));
        var meta = meta_list[0];
        //p('the path: ', meta.path);
        test.ok(u.isString(meta.path));

        text_file.new_text_file_obj(meta, function(err, tfile){
            p('the text file obj: \n', tfile);
            tfile.read_to_string(function(err, str){
                p('the string:\n', str);
                test.done();
            });
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

    "test-1 : get a file meta" : t1_get_a_text_file,
    //"test-1 : get all uuids" : test_get_all_uuid,
};



module.exports.last = function(test){
    test.expect(1);
    test.ok(true);
    stop();
    test.done();
}



// -- checkings -- //

function check_get_file_meta(_path){
    var _test_file_path = 'abc/move';

    var folder_path = path.dirname(_test_file_path);
    var file_name   = path.basename(_test_file_path);

    folder_module.retrieve_file_meta(_test_file_path, function(err, reply){
        p('err, reply', err, reply);
        stop();
    });

}


/*
 * Write a simple index.html  to the folder path: dir
 */
function write_index_html(owner, dir){
    var file_module = require("../aws/simple-file-v3.js");

    owner = owner || 'abc';
    dir   = dir   || 'abc/test/tindex';

    var file_name = 'index.html';
    var text  = "<h1> index file </h1> <p> a test in u text file v1 </p>";

    file_module.write_text_file(owner, dir, file_name, text).then(function(result){
        p("result");
        p(result);

        stop();
    });
}


if(require.main === module){
    //check_get_file_meta();
    write_index_html();
}


// drop into repl
function drop_file_into_repl(o, dir, filename){
    // drop variable/objects into REPL, o is the object to save variables
    o   = o   || {};
    dir = dir || 'abc/test/tindex';
    filename = filename || 'index.html'

    folder_module.retrieve_folder(dir).then(function(folder){
        o.folder = folder;
        o.mfolder= folder.get_meta();
        o.shorts = u.omit(o.mfolder, 'files', 'html', 'renders', 'file_uuids', 'file_names');
        o.files  = o.mfolder.files;

        p('going to get the index file');
        get_index_file(o.folder, filename, function(err, file){
            if(err) return p('got err, in get index file', err);
            o.indexhtml = file;
        });

        //p('object should be populated');
    });
}

function get_index_file(folder, filename, callback){
    filename = filename || 'index.html';

    folder.get_one_file_obj(filename, function(err, file){
        p('after got the index file : file get meta . path');
        p(err, file.get_meta().path);

        callback(null, file);
    });
}



//var o = {}; drop_file_into_repl(o);



// a signal to 'expect'
console.log("ok start interact:");

