//
// Prepare testing of folder, make required file and folder ready
//

var assert = require("assert");
var u = require("underscore");
var async = require("async");
var path = require("path");
var Promise = require("bluebird");

var folder_module = require("../aws/folder-v5.js");

var myconfig =   require("../config/config.js");
var config = require("../test/config.js");

var bucket = require("../aws/bucket.js");
var ttool  = require ("../myutils/test-util.js");

var folder_path = 'abc';
var _test_folder_path = 'abc';
var user_name   = 'abc';
var _test_user_name   = 'abc';
var gg_folder_name  = 'goodagood';
var new_folder_name = 'test';
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

function test_folder_exists(test){
    folder_module.is_folder_exists(folder_path, function(err, yes_){
        test.ok(yes_, 'the test folder should exists');
        test.done();
    });
}

function p1_folder_meta_exists(test){
    folder_module.retrieve_folder_meta(folder_path).then(function(meta){
        test.ok(u.isObject(meta));
        test.ok(! u.isNull(meta));
        test.ok(u.isString(meta.name));
        test.ok(meta.path ===  folder_path);
        //p ('meta: \n', meta);
        //ttool.stop();
        test.done();
    });
}

function p2_make_the_test_folder(test){

    var file_name = "txt";
    var file_text = "this file is a for test\n" +
        "this is the second line\n" +
        "this is the time: " + new Date() ;
    var sub_test_name = 'sub-test';

    var Root, Test, SubTest;

    folder_module.retrieve_folder(_test_folder_path).then(function(root_folder){
        Root = root_folder;
        //p ('root folder: \n', root_folder);
        test.ok(! u.isNull(root_folder));

        if(root_folder.file_exists(_new_folder_name_in_test)){
            var test_folder_path = path.join(_test_folder_path, _new_folder_name_in_test);
            return folder_module.retrieve_folder(test_folder_path).then(function(test_folder){
                Test = test_folder;
                return Test;
            });
        }else{
            return Root.add_folder(_new_folder_name_in_test);
        }

    }).then(function(test_folder_obj){
        Test = test_folder_obj;
        test.ok(u.isFunction(Test.get_meta));
        var meta = Test.get_meta();
        test.ok(u.isString(meta.name));
        test.ok(u.isString(meta.path));
    }).then(function(){
        p( _test_folder_path, '/', _new_folder_name_in_test, ' should exists now');
        p( 'sleep 20 secs');
        return ttool.sleep_again(30);
    }).then(function(){
        if(Test.file_exists(file_name)) return file_name + " file exists";
        return Test.write_text_file(file_name, file_text);
    }).then(function(what){
        p ('what got after write text file?\n', what);
    }).then(function(){
        if(Test.file_exists(sub_test_name)) return sub_test_name + ' exists';
        return Test.add_folder(sub_test_name);
    }).then(function(){
        return Test.get_folder(sub_test_name);
    }).then(function(subtest){
        SubTest = subtest;
        
        test.ok(! u.isNull(SubTest));
        test.ok(u.isFunction(SubTest.get_meta));
    }).then(function(){
        if(SubTest.file_exists(file_name)) return file_name + " file exists";
        return SubTest.write_text_file(file_name, file_text);
    }).then(function(){
        p('sleep 20 secs');
        return ttool.sleep_again(20);
    }).then(function(){
        // get back meta, assert file exists
        return SubTest.promise_to_retrieve_saved_meta();
    }).then(function(meta){
        // This is folder meta.
        //p ('meta.name: ', meta.name);
        test.ok(u.isString(meta.name));
        test.ok(SubTest.file_exists(file_name));
    }).then(function(){
        test.done();
    });
}



test_write_read = function(test){

    // settings of the test:
    var folder_path = 'abc/test'
    var file_name = "test-file";
    var file_text = "this is a test\n" +
        "this is the second line\n" +
        "this is the time: " + new Date() ;

    // global vars:
    var Meta, Folder;
    //test.expect(7); // number of tests:

    folder_module.retrieve_promisified_folder(folder_path).then(function(folder) {
        Folder = folder;
        test.ok(u.isObject(Folder));
        // it can exists after amany time of test and re-test
        //test.equal(Folder.file_exists(file_name), false, "We think the file not exists yet.");
        return folder.write_text_file(file_name, file_text);
    }).then(function(what){
        //p('what after write text file: ', what);
        p ('the file should exists now, ', file_name);

        return ttool.sleep_again(20)
    }).then(function(nothing){
        return Folder.promise_to_retrieve_saved_meta();
    }).then(function(meta) {
        Meta = meta; // this is folder meta.

        test.ok(u.isObject(Meta));
        test.ok(u.isString(Meta.name));
        test.ok(u.isArray(Meta.file_names[file_name]));
        test.ok(Folder.file_exists(file_name), "We think the file become exists");
        test.ok(u.isArray(Meta.file_names[file_name]));

        return Meta;
    }).then(function(){
        return Folder.promise_to_delete_name(file_name);  /// todo
    }).then(function(after_delete){
        p('get what after delete? ', after_delete);
        return ttool.sleep_again(30);
    }).then(function(){
        return Folder.promise_to_retrieve_saved_meta();
    }).then(function(meta) {
        Meta = meta; // this is folder meta.
        test.ok(! Folder.file_exists(file_name), "We think the file be deleted, 169 84 0119");
    }).then(function(nothing){
        test.done();
    });
};


// the rest need editing?

// This test assume there are files in the folder, with sub-folders or not.
t5_finding_files = function(test){

    // settings of the test:
    var folder_path = 'abc';

    // global vars:
    var Meta, Folder;

    folder_module.retrieve_folder(folder_path).then(function(folder) {
        Folder = folder;
        test.ok(! u.isEmpty(Folder));
        Meta = Folder.get_meta();
        var files = Meta.files;

        //u.each(files, function(f){
        //    p(f.what, f.name, f.timestamp);
        //});
        var true_files = u.filter(files, function(f){return f.what === myconfig.IamFile;});
        test.ok(u.size(files) >= u.size(true_files));
        //u.each(true_files, function(f){
        //    p(f.what, f.name, f.timestamp);
        //});
        test.ok(u.isObject(files))
        test.ok(! u.isEmpty(Meta));
        test.ok(u.isString(Meta.name));
    }).then(function(){
        //ttool.stop();
        test.done();
    });
}

t4_write_and_get_uuid = function(test){

    // settings of the test:
    var folder_path = 'abc';
    var file_name = "test-write-and-get-uuid" + (new Date()).getDate();
    var file_text = "this is a test\n" +
        "It realy take a lot tests\n" +
        (new Date()).toString() +
        "and become crashing    \n" +
        " -- " +
        " -- to wriet this file, and check to get it by uuid --" +
        "this is the time: " + new Date() ;

    // global vars:
    var Meta, Folder;

    folder_module.retrieve_promisified_folder(folder_path).then(function(folder) {
        Folder = folder;
        //test.expect(5);
        test.ok(u.isObject(Folder));
        return folder.write_text_file(file_name, file_text);
    }).then(function(what){
        p('-- Going to sleep 20 secs. We should already wrote the file: ', file_name);
        return config.promise_to_wait(20);
    }).then(function(){
        // need to update folder itself:
        return Folder.promise_to_retrieve_saved_meta();
    }).then(function(meta){
        Meta = meta;
        test.ok(u.isObject(Meta));
        test.ok(u.isString(Meta.name));
        test.ok(Meta.path === folder_path);

        p('file exists? if this is not true, something might be wrong: ');
        p('file exists: ', Folder.file_exists(file_name)); 
        //test.ok(Folder.file_exists(file_name));  // till not wrote.
        test.done();
    });

}


function get_true_file_metas(folder_path){
    // This works as a tool, it try to give a list of files in the folder.

    return folder_module.retrieve_folder(folder_path).then(function(folder) {
        Meta = folder.get_meta();
        var files = Meta.files;

        //u.each(files, function(f){
        //    p(f.what, f.name, f.timestamp);
        //});
        var true_files = u.filter(files, function(f){return f.what === myconfig.IamFile;});
        return true_files; //metas
    });
}

function get_true_file_uuids(folder_path){
    // return a promise, which carry the list of uuids, all files, not folder.

    return get_true_file_metas(folder_path).then(function(metas){
        var uuids = u.map(metas, function(m){return m.uuid;});
        return uuids;
    });
}


// before this test, assume the file exists.
t1_test_get_file_objs_by_name = function(test){

    var filename = 'folder.css',
        folder_path = 'abc';

    folder_module.retrieve_folder(folder_path).then(function(folder){
        //p('check gfobn ', folder);
        folder.get_file_objs_by_name(filename, function(err, objs){
            //p ('2, ', err, objs);
            test.ok(!err, 'no err');
            test.ok(u.isArray(objs));
            var oa = objs[0];
            var ma = oa.get_meta()
            test.ok(u.isObject(ma));
            test.ok(! u.isEmpty(ma));
            test.ok(u.isString(ma.path));
            //p (3, ma);
            test.done()
        });
    });
}


var test_retrieve_folder_meta = function(test){
    folder_module.retrieve_folder_meta(folder_path).then(function(meta){
        //p ('meta: \n', meta);
        test.ok(u.isObject(meta));
        test.ok(u.isString(meta.path));
        test.done();
    });
};


function t3_read_file_by_name(test){
    var filename = 'folder.css',
        folder_path = 'abc';

    folder_module.retrieve_folder(folder_path).then(function(folder){
        //p('check t3 rfbn ', folder);
        //folder.get_file_objs_by_name(filename, function(err, objs){
        //});
        return folder.read_file_by_name(filename);
    }).then(function(str){
        p(2, str);
        test.ok(u.isString(str));

    }).then(function(){
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

    "test 0.1: " : test_folder_exists,
    "test-1 : folder exists  " : p1_folder_meta_exists,
    "prepare 2 : folder of test " : p2_make_the_test_folder,
    "test 2 : " : test_write_read,



    //"test-1 : get file objects, folder.css  " : t1_test_get_file_objs_by_name,
    //"test-2 : get folder meta, 'abc'" : test_retrieve_folder_meta,

    //"test-3 : read file by name, 'abc'" : t3_read_file_by_name,

    //"test-4 : " : t4_write_and_get_uuid,

    //"test-5 : finding files " : t5_finding_files,

};


module.exports.last = function(test){
    test.expect(1);
    p(' -- going to force stop --');
    test.ok(true);
    ttool.stop();
    test.done();
};

check_get_file_objs_by_name = function(){
    var filename = 'test-file',
        folder_path = 'abc/test';

    folder_module.retrieve_folder(folder_path).then(function(folder){
        //p('check gfobn ', folder);
        folder.get_file_objs(filename, function(err, objs){
            //p ('2, ', err, objs);
            var oa = objs[0];
            var ma = oa.get_meta()
            p (3, ma);
            ttool.stop()
        });
    });
}

check_get_first_file_by_name = function(){
    var file_path = 'abc/folder.css',
        folder_path = 'abc';

    p('in "check get first file by name": ');
    folder_module.retrieve_first_file_obj(file_path, function(err, file){
        var meta = file.get_meta();
        p ('retrieved first file obj:', meta);
        ttool.stop();
    });
}

check_delete_a_file_by_uuid = function(){
    // checking delete a file
    var file_path = 'abc/txt-15',
        folder_path = 'abc';

    p('in "check get first file by name": ');
    folder_module.retrieve_first_file_obj(file_path, function(err, file){
        var meta = file.get_meta();
        //p ('retrieved first file obj:', meta);
        var uuid = meta.uuid;
        p ('uuid: ', uuid);
        folder_module.retrieve_folder(folder_path).then(function(folder){
            folder.uuid_to_file_obj(uuid, function(err, file){
                //p('file object:\n', file);
                var meta2 = file.get_meta();
                //p('file meta2:\n', meta2);
                //bucket.s3_object_exists(meta2.storage.key, function(err, aws_reply){
                //    //p('s3 reply: \n', err, aws_reply);
                //    file.delete_s3_storage(function(err,reply){
                //        p('dele reply: \n', err, reply);
                //        ttool.stop();
                //    });
                //});

                folder.delete_file_by_uuid(uuid, function(err, rep){
                        p('delete file by uuid reply: \n', err, rep);
                        ttool.stop();
                });

            });
        });
    });
}

check_retrieve_folder_meta = function(){
    folder_module.retrieve_folder_meta(folder_path).then(function(meta){
        p ('meta: \n', meta);
        ttool.stop();
    });
}

check_read_a = function(){
    folder_module.retrieve_folder(folder_path).then(function(folder){
        folder.read_text('.gg.members.json', function(err, what){
            //p ('err, what: \n', err, what);
            stop();
        });
    });
    //.then(function(text){
    //    p ('text a\n', text);
    //});

}


check_read_member_file_text = function(){
    folder_module.retrieve_folder(folder_path).then(function(folder){
        return folder.read_text_file('.gg.members.json')
    }).then(function(str){
        p('get to try again?\n', str);
        p('get to try again?\n', str);
    }).then(function(whatever){
        stop();
    });
};


uniq_member_file_uuid = function(){
    folder_path = 'abc';
    members_file_name = '.gg.members.json';
    var Folder, Meta;
    folder_module.retrieve_folder(folder_path).then(function(folder){
        Folder = folder;
        Meta = folder.get_meta();
        return Folder.get_uuids(members_file_name);
    }).then(function(uuid_list){
        p ('uuid list: \n', uuid_list);
        Meta.file_names[members_file_name] = u.uniq(uuid_list);
        p('meta file names get :', Meta.file_names[members_file_name]);
        return Folder.promise_to_save_meta();
    }).then(function(){
        stop();
    });
};


var write_a_txt_file = function(){

    // settings of the test:
    var folder_path = 'abc';
    var file_name = "txt-" + (new Date()).getDate();
    var file_text = "this is a text file\n" +
        (new Date()).toString() + '\n' + 
        "this is the 3rd line\n" +
        " -- to wriet this file, and check something --" +
        "this is the time: " + new Date() ;

    // global vars:
    var Meta, Folder;

    folder_module.retrieve_promisified_folder(folder_path).then(function(folder) {
        Folder = folder;
        return folder.write_text_file(file_name, file_text);
    }).then(function(what){
        p ('what got:\n', what);
        stop();
    });
};

function get_a_file(){
    var _file_path = 'abc/public/txt-15';
    folder_module.retrieve_file_objs(_file_path, function(err, file){
    });
}


function check_folder_exists(test){
    folder_module.is_folder_exists(folder_path, function(err, yes_){
        p (yes_, 'the test folder should exists');
        stop();
    });
}


if(require.main === module){
    check_get_file_objs_by_name();
    //check_get_first_file_by_name();
    //check_retrieve_folder_meta();
    //check_read_a();
    //check_read_member_file_text();
    //uniq_member_file_uuid();

    //check_delete_a_file_by_uuid();

    //write_a_txt_file();
    //get_true_file_metas('abc').then(function(file_metas){p(file_metas);}).then(function(){stop();});
    //get_true_file_uuids('abc').then(function(file_uuids){p(file_uuids);}).then(function(){stop();});

    //check_folder_exists();
}


