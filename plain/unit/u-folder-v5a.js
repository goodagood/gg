// test with user folder: abc
// assuming exists : folder.css
// in testing a file will be written: test-write-date
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

var folder_path = 'abc';
var user_name = 'abc';
var gg_folder_name = 'goodagood';
var new_folder_name = 'test';


var p = console.log;

var stop = function(period) {
    period = period || 1;
    if (!u.isNumber(period)) {
        period = 1;
    }
    var milli_seconds = period * 1000;
    return setTimeout(process.exit, milli_seconds);
};



//// have to check others first
//test_write_read = function(test){
//
//    // settings of the test:
//    var file_name = "test-file";
//    var file_text = "this is a test\n" +
//        "this is the second line\n" +
//        "this is the time: " + new Date() ;
//
//    // global vars:
//    var Meta, Folder;
//
//    folder_module.retrieve_promisified_folder(user_name).then(function(folder) {
//        Folder = folder;
//        test.expect(7); // number of tests:
//        test.ok(u.isObject(Folder));
//        test.equal(Folder.file_exists(file_name), false, "We think the file not exists");
//        return folder.write_text_file(file_name, file_text);
//    }).then(function(what){
//        p('what after write text file: ', what);
//
//        return config.promise_to_wait(30)
//    }).then(function(nothing){
//        return Folder.promise_to_retrieve_saved_meta();
//    }).then(function(meta) {
//        Meta = meta;
//
//        test.ok(u.isObject(Meta));
//        test.ok(u.isString(Meta.name));
//        test.ok(u.isArray(Meta.file_names[file_name]));
//        test.ok(Folder.file_exists(file_name), "We think the file become exists");
//        test.ok(u.isArray(Folder.file_uuids[file_name]));
//
//        return Meta;
//    }).then(function(){
//        return Folder.promise_to_delete_name(file_name);
//    }).then(function(after_delete){
//        p('get what after delete? ', after_delete);
//        return config.promise_to_wait(30);
//    }).then(function(nothing){
//        test.done();
//    )};
//    //.then(function(m) {
//    //    var ul = m.renders.ul;
//    //    assert(u.isString(ul));
//    //    test.done();
//    //});
//};



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
        //stop();
        test.done();
    });
}

t4_write_and_get_uuid = function(test){

    // settings of the test:
    var folder_path = 'abc/test';
    var file_name = "test-write-" + (new Date()).getDate();
    var file_text = "this is a test\n" +
        "It realy take a lot tests\n" +
        (new Date()).toString() +
        "before doing file listing    \n" +
        " list for file values \n"  +
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


// files, not folders.
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

function t2_2_test_folder_exists(test){
    folder_module.is_folder_exists('abc', function(err, what){
        p ('err, what:\n', err, what);
        stop();
    });
}


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

    "test-1 : get file objects, folder.css  " : t1_test_get_file_objs_by_name,
    "test-2 : get folder meta, 'abc'" : test_retrieve_folder_meta,
    "test-3 : read file by name, 'abc'" : t3_read_file_by_name,
    "test-4 : write and get uuid " : t4_write_and_get_uuid,
    "test-5 : finding files " : t5_finding_files,
};


module.exports.last = function(test){
    test.expect(1);
    p(' -- going to force stop --');
    test.ok(true);
    stop();
    test.done();
};

check_get_file_objs_by_name = function(){
    var filename = 'folder.css',
        folder_path = 'abc';

    folder_module.retrieve_folder(folder_path).then(function(folder){
        //p('check gfobn ', folder);
        folder.get_file_objs(filename, function(err, objs){
            //p ('2, ', err, objs);
            var oa = objs[0];
            var ma = oa.get_meta()
            p (3, ma);
            stop()
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
        stop();
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
                //        stop();
                //    });
                //});

                folder.delete_file_by_uuid(uuid, function(err, rep){
                        p('delete file by uuid reply: \n', err, rep);
                        stop();
                });

            });
        });
    });
}

check_retrieve_folder_meta = function(){
    folder_module.retrieve_folder_meta(folder_path).then(function(meta){
        p ('meta: \n', meta);
        stop();
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


check_read_b = function(){
    var path_ = 'tmpab/goodagood';
    var file_name_   = '.gg.people.v1.json';

    folder_module.retrieve_folder(path_).then(function(folder){
        folder.read_text_file(file_name_).then(function(what){
            p ('what: \n',  what);
            p ('isString what: \n',  u.isString(what));
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
    var folder_path = 'abc/test';
    var file_name = "txt-" + (new Date()).getDate();
    var file_text = "this is a text file\n" +
        (new Date()).toString() + '\n' + 
        "this is the 3rd line\n" +
        " -- to wriet this file, and check something --\n" +
        " -- now, save meta will locker first, it unlock after saving \n" +
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

function get_a_file(_file_path){
    //_file_path =  _file_path || 'abc/public/txt-15';
    _file_path =  _file_path || 'tmpab/highlight.md';
    folder_module.retrieve_file_objs(_file_path, function(err, files){
        p(err, files);
        var file = files[0];
        //p (Object.keys(file));
        //file.get_meta();
        var meta = file.get_meta();
        p ('meta.html', meta.html);
        stop();
    });
}

function rebuild_all_file(path_){
    path_ = path_ || 'tmpab';
    folder_module.retrieve_folder(path_).then(function(folder){
        var meta = folder.get_meta();
        var keys = Object.keys(meta.files);

        keys = keys.filter(function(uuid){
            var info = meta.files[uuid];
            return info.what !== myconfig.IamFolder;
        });

        async.map(keys, folder.uuid_to_file_obj, function(err, files){
            //p ('err, files: ', err, files);

            var funs  = files.map(function(f){
                // f : file
                return function(callback){
                    rebuild_file(f, function(err, rf){
                        var m = f.get_meta();
                        folder.add_file_save_folder(m, callback);
                    });
                }
            });
            //p('funs:\n', funs);
            //stop();

            async.series(funs, function(err, async_res){
                p('err, async res:\n', err, async_res);
                folder.list_files_and_save(function(){
                    stop();
                });
            })

        });



        //p ('keys: \n', keys);
    });
}

function rebuild_file(file, callback){
    // @file : file object
    file.calculate_meta_defaults();
    file.render_html_repr();
    file.save_meta_file(function(err, what){
        file.save_file_to_folder().then(function(after){
            p ('set time out');
            setTimeout(callback, 5000);
            //callback(null, null);
        });
    });
}


if(require.main === module){
    //check_get_file_objs_by_name();
    //check_get_first_file_by_name();
    //check_retrieve_folder_meta();
    //check_read_a();
    //check_read_b();
    //check_read_member_file_text();
    //uniq_member_file_uuid();

    //check_delete_a_file_by_uuid();

    write_a_txt_file();
    //get_true_file_metas('abc').then(function(file_metas){p(file_metas);}).then(function(){stop();});
    //get_true_file_uuids('abc').then(function(file_uuids){p(file_uuids);}).then(function(){stop();});

    //rebuild_all_file();
    //get_a_file();

    //t2_2_test_folder_exists();
}


