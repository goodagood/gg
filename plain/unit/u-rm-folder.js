// test aws/rm-folder.js
// There is an 'u-folder-v5-delete.js',
// it test cases when 'deleting folder' is still
// included in 'folder-v5./js/coffee'
// 2015, 0410


var assert = require("assert");
var u = require("underscore");
var path = require("path");
var Promise = require("bluebird");

var folder_module = require("../aws/folder-v5.js");
var rmfolder = require('../aws/rm-folder.js');

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

// end of heading.

var _test_folder_path = 'abc';
var _test_sub_folder_name = 'test-add';
var _test_user_name   = 'abc';



//var t2 = function(test){
//    //var sub_folder_name = path.basename(_test_folder_path);
//
//    var Folder, Meta, Sub, Sub_meta;
//    //test.expect(1);
//    folder_module.retrieve_promisified_folder(_test_folder_path).then(
//        function (folder){
//            Folder = folder;
//
//            //p(1, folder);
//            Meta = folder.get_meta();
//            return Folder.add_folder(_test_sub_folder_name);
//    }).then(function(sub){
//        Sub = sub;
//        Sub_meta = Sub.get_meta();
//        //p('after added, got: \n', Sub_meta);
//
//        //test.ok(Sub_meta.path === _test_folder_path);
//        test.ok(u.isString(Sub_meta.name));
//        test.ok(u.isString(Sub_meta.uuid));
//        p('should be added: ' + _test_sub_folder_name);
//    }).then(function(what){
//        return promise_to_sleep(20);
//    }).then(function(){
//        p('going to write text file');
//        test.ok(Folder.file_exists(_test_sub_folder_name));
//        return Sub.write_text_file('txt', 'this is\n to write\n text file.');
//    }).then(function(what){
//        p('after write txt, got\n', what);
//    }).then(function(){
//        return promise_to_sleep(20);
//    }).then(function(){
//        return Folder.retrieve_saved_meta_promised();
//    }).then(function(meta){
//        test.ok(Folder.file_exists(_test_sub_folder_name));
//        p('going to delete ' + _test_sub_folder_name);
//        return Folder.get_uuids(_test_sub_folder_name);
//    }).then(function(uuids){
//        if(!u.isArray(uuids)){
//            return false;
//            if(uuids.length < 1){
//                return false;
//            }
//        }
//        uuid = uuids[0];
//
//        return Folder.delete_folder_promised(uuid);
//    }).then(function(del){
//        p('result of del: ', del);
//
//        test.done();
//    });
//};
//



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

    //"test-2 : add folder, then file then delete" : t2,

};


module.exports.stop = function(test){
    test.expect(1);
    p(' -- going to force stop --');
    test.ok(true);
    stop();
    test.done();
};


// -- do some in file checking: -- //


function check_rm_folder(folder_path){
    folder_path = folder_path || 'abc/tadd';
    var dir  = path.dirname (folder_path);
    var name = path.basename(folder_path);

    // Sub is added new folder
    var Folder, Meta, Sub;
    folder_module.retrieve_promisified_folder(dir).then(function(folder){
        Folder = folder;
        Meta   = Folder.get_meta();
        p('path: ', Meta.path);
        p('uuid: ', Meta.uuid);

        return Folder.add_folder(name);

        //Folder.add_folder(name);
    }).then(function(obj){
        Sub = obj;
        var new_meta = Sub.get_meta();
        p('new meta: ', new_meta);
        stop();
    });
    
}


function rm_a_root_folder(name){
    name = name || 'folder-23'; // the name of folder to add

    var opt = {name: name,};

    folder_module.retrieve_folder(name).then(function(folder){
        p('going to rm root folder', opt);
        rmfolder.rm_home_folder(folder, function (err, folder){
            //p(1, folder);
            //meta = folder.get_meta();
            //p(2, meta);
            stop();
        });
    });
}


function rm_empty_home(name){
    name = name || 'folder-23'; // the name of folder to add


    folder_module.retrieve_folder(name).then(function(folder){
        assert(u.isObject(folder));
        assert(!u.isEmpty(folder));
        p('going to rm root folder', folder.get_meta());
        rmfolder.rm_empty_home(folder, function (err, what){
            p("checking: re empty home, ", err, what);
            //meta = folder.get_meta();
            //p(2, meta);
            stop();
        });
    });
}


function check_rm_all_uuids(dir){
    dir = dir || 'abc/add-2/test/test-2';

    // get the folder
    folder_module.retrieve_promisified_folder(dir).then(function(folder){
        meta   = folder.get_meta();
        p('path: ', meta.path);
        p('uuid: ', meta.uuid);

        rmfolder.rm_all_uuids(folder, function(err, what){
            //p('after rm all uuids: ', err, what);
            stop();
        });

    });
}


function chk_rm_folder(dir, sub_folder_name){
    dir = dir || 'abc/add-2/test';
    sub_folder_name = sub_folder_name || 'test-2';

    // get the folder
    folder_module.retrieve_folder(dir).then(function(folder){
        var folder_meta = folder.get_meta();
        
        // get the sub-folder
        folder.get_folder(sub_folder_name).then(function(sub){
            var sub_meta = sub.get_meta();

            rmfolder.rm_folder_by_uuid(folder, sub_meta.uuid, function(err, what){
                p('rm folder by uuid: ', err, what);
                stop();
            });

            //p('dir: ', folder_meta.path, 'sub: ', sub_meta.path, sub_meta.uuid);
        });

    });
}

function check_rm_home(name){
    name = name || '5';
    rmfolder.rm_home_folder(name, function(err, what){
        p('check rm home: ', err, what);
        stop();
    });
}

// Beside testing , here do some checking:
if (require.main === module){
    //rm_a_root_folder();
    //rm_empty_home();
    //check_rm_all_uuids();
    chk_rm_folder('intro', 'goodagood');
    //check_rm_home();
}


