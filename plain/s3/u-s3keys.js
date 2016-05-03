
//var folder = require("./folder.js");
var s3keys = require("./s3keys.js");
var jconfig  = require("gg/myutils/json-cfg.js");

var uuid = require("node-uuid");
var path = require("path");

var u = require('underscore');
var p = console.log;


function s3key(dir){
    dir = dir || 'aa/bb/cc';

    fkey.make_meta_s3key(dir, function(err, s3key){
        p(err, s3key);
    });
}


module.exports.file_s3key = function(test){
    var file_path = 't0310y6/ok/yes/pic.jpg';
    var owner = 't0310y6'; //name

    var root = s3keys.get_root(file_path);
    test.ok(root === owner);
    s3keys.make_file_s3key(file_path, function(err, key){
        test.ok(!err);
        test.ok(u.isString(key));
        p('testing file s3key: ', key);
        test.done();
    });
}

module.exports.file_meta_s3key = function(test){
    var root = 't0310y6'; //name
    var file_path = path.join(root, '/ok/yes/pic.jpg');

    var root = s3keys.get_root(file_path);
    test.ok(root === root);

    s3keys.make_file_meta_s3key(file_path, function(err, key){
        test.ok(!err);
        test.ok(!!key);
        test.ok(u.isString(key));
        p('testing file meta s3key: ', key);
        test.done();
    });
}


module.exports.file_name_space_s3key = function(test){
    var root = 't0310y6'; //name
    var file_path = path.join(root, '/ok/yes/pic.jpg');

    var info = {
        root: root,
        path: file_path,
        uuid: uuid.v4()
    };

    var root = s3keys.get_root(file_path);
    test.ok(root === root);

    s3keys.make_file_name_space_prefix(info, function(err, key){
        test.ok(!err);
        test.ok(!!key);
        test.ok(u.isString(key));
        p('testing file name space s3key: ', key);
        test.done();
    });
}


module.exports.folder_meta_s3key = function(test){
    var root = 't0310y6'; //name
    var folder_path = path.join(root, '/ok/yes/sub-folder');

    var root = s3keys.get_root(folder_path);
    test.ok(root === root);

    s3keys.make_folder_meta_s3key(folder_path, function(err, key){
        test.ok(!err);
        test.ok(!!key);
        test.ok(u.isString(key));
        p('testing folder meta s3key: ', key);
        test.done();
    });
}


module.exports.folder_name_space_s3key = function(test){
    var root = 't0310y6'; //name
    var folder_path = path.join(root, '/ok/yes/pic.jpg');

    var info = {
        //root: root,
        path: folder_path,
        uuid: uuid.v4()
    };

    var root = s3keys.get_root(folder_path);
    test.ok(root === root);

    s3keys.make_folder_name_space_prefix(info, function(err, key){
        test.ok(!err);
        test.ok(!!key);
        test.ok(u.isString(key));
        p('testing folder name space s3key: ', key);
        test.done();
    });
}


function check_s3_prefixes(){
    jconfig.callback_s3_prefixes(function(err, prefixes){
        console.log(err, prefixes)
        setTimeout(process.exit, 5 * 1000);
    });
}


if(require.main === module){
    check_s3_prefixes();
}
