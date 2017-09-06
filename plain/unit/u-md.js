// test markdown filetype, aws/markdown-file.js

// todo all

var assert  = require("assert");
var u       = require("underscore");
var path    = require("path");
var Promise = require("bluebird");
var fs      = require("fs");
var async   = require("async");

var folder_module = require("../aws/folder-v5.js");
var file_module = require("../aws/simple-file-v3.js");
var members = require("../aws/members.js");

var p    = console.log;
var stop = function(seconds) {
    var seconds = seconds || 1;
    var milli_sec = seconds * 1000;
    setTimeout(process.exit, milli_sec);
};

var sleep= function(seconds, callback){
    var seconds = seconds || 1;
    var milli_sec = seconds * 1000;

    setTimeout(function(){
        callback(null, seconds);
    }, milli_sec);
}
promise_to_sleep = Promise.promisify(sleep);

var _test_folder_path = 'abc';
var _test_sub_folder_name = 'test-add';
var _test_user_name   = 'abc';

var t1_retrieve_promisfified = function(test){
    var Folder, Meta;
    //test.expect(1);
    folder_module.retrieve_promisified_folder(_test_folder_path).then(
        function (folder){
            Folder = folder;
            test.ok(u.isObject(Folder));
            test.ok(!u.isEmpty(Folder));
            test.ok(!u.isNull(Folder));
            test.ok(u.isFunction(Folder.get_meta));

            //p(1, folder);
            Meta = folder.get_meta();
            test.ok(u.isObject(Meta));
            test.ok(!u.isEmpty(Meta));
            test.ok(!u.isNull(Meta));
            test.ok(u.isString(Meta.name));
            test.ok(u.isString(Meta.path));
            //p(2, Meta);
            test.done();
    });

};


var t2 = function(test){
    //var sub_folder_name = path.basename(_test_folder_path);

    var Folder, Meta, Sub, Sub_meta;
    //test.expect(1);
    folder_module.retrieve_promisified_folder(_test_folder_path).then(
        function (folder){
            Folder = folder;

            //p(1, folder);
            Meta = folder.get_meta();
            return Folder.add_folder(_test_sub_folder_name);
    }).then(function(sub){
        Sub = sub;
        Sub_meta = Sub.get_meta();
        //p('after added, got: \n', Sub_meta);

        //test.ok(Sub_meta.path === _test_folder_path);
        test.ok(u.isString(Sub_meta.name));
        test.ok(u.isString(Sub_meta.uuid));
        p('should be added: ' + _test_sub_folder_name);
    }).then(function(what){
        return promise_to_sleep(20);
    }).then(function(){
        p('going to write text file');
        test.ok(Folder.file_exists(_test_sub_folder_name));
        return Sub.write_text_file('txt', 'this is\n to write\n text file.');
    }).then(function(what){
        p('after write txt, got\n', what);
    }).then(function(){
        return promise_to_sleep(20);
    }).then(function(){
        return Folder.retrieve_saved_meta_promised();
    }).then(function(meta){
        test.ok(Folder.file_exists(_test_sub_folder_name));
        p('going to delete ' + _test_sub_folder_name);
        return Folder.get_uuids(_test_sub_folder_name);
    }).then(function(uuids){
        if(!u.isArray(uuids)){
            return false;
            if(uuids.length < 1){
                return false;
            }
        }
        uuid = uuids[0];

        return Folder.delete_folder_promised(uuid);
    }).then(function(del){
        p('result of del: ', del);

        test.done();
    });
};




module.exports.group_one = {
    setUp: function (callback) {
        //this.foo = 'bar';
        callback();
    },
    tearDown: function (callback) {
        //stop(); // stop in a second any way.
        p ('- in tearDown');
        callback();
    },

    //"test-1 : add folder" : t1_retrieve_promisfified,
    "test-2 : add folder, then file then delete" : t2,

};


module.exports.stop = function(test){
    test.expect(1);
    p(' -- going to force stop --');
    test.ok(true);
    stop();
    test.done();
};


// -- do some in file checking: -- //



function put_md_file_to_abc_test(){
    var md_files = ['md-syntax.md', 'highlight.md']; // current dir
    var user_name= 'tmpab';
    var dir      = 'tmpab';

    var cwd   = path.dirname(__filename);

    var jobs = [];
    u.each(md_files, function(file_name){
        function job(callback){
            var path_ = path.join(cwd, file_name);
            fs.exists(path_, function(yes_){
                if(yes_){
                    p (path_, 'exists.');
                    var meta_ = {
                        name : file_name,
                        path : path.join(dir, file_name),
                        owner: user_name
                    };

                    file_module.put_local_file(path_, meta_, callback);
                }else{ callback(null, null); }

            });
        }
        jobs.push(job);
    });

    async.series(jobs, function(err, what){
        p ('err, what\n', err, what);
        stop(3);
    });
}



// Beside testing , here do some checking:
if (require.main === module){
    put_md_file_to_abc_test();
}


