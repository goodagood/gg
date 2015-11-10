//
// Test/check folder lock.
//   'unit folder lock' -> uf-lock
//
//
// Assuming the following:
//   user:   abc
//   folder: abc/test

var assert = require("assert");
var u = require("underscore");
var async = require("async");
var path = require("path");
var Promise = require("bluebird");

var folder_module = require("../aws/folder-v5.js");
var locker = require("../aws/folder-lock.js");

var myconfig =   require("../config/config.js");
var config = require("../test/config.js");

var bucket = require("../aws/bucket.js");
var tutil  = require ("../myutils/test-util.js");

var _test_folder_path = 'abc';
var _test_user_name   = 'abc';
var gg_folder_name  = 'goodagood';
var new_folder_name = 'test';
var _new_folder_name_in_test = 'test';


var p = console.log;




function tmp_check_test_file(test){
    // for this file: abc/test/test-file

    var folder_path = 'abc/test';

    var Folder, Meta, Names, Uuids;
    var tuuids;

    folder_module.retrieve_folder(folder_path).then(function(folder){
        Folder = folder;
        Meta = folder.get_meta();

        test.ok(u.isObject(Folder));
        test.ok(u.isObject(Meta));

        Uuids = Object.keys(Meta.files);
        test.ok(Uuids.length > 0, 'we should get uuid list');

        Names = u.map(Uuids, function(id){
            return Meta.files[id].name;
        });
        test.ok(Names.length > 0, 'we should get name list');

        tuuids = Meta.file_names[filename];
        p(tuuids, 'test file uuids');


        // we just go to 'then'



    }).then(function(){
        //u.each(tuuids, function(uuid){
        //    var meta = Meta.files[uuid];
        //    if(typeof meta === 'undefined'){
        //        p('catch one: ', uuid);
        //    }else{
        //        p('ok:\n', meta.path, meta.timestamp);
        //    }
        //    
        //});

    }).then(function(){
        // add names, rm by accidences
        p('add names');
        var N = Meta.file_names;

        u.each(Uuids, function(uuid){
            var name = Meta.files[uuid].name;
            if(N[name] === 'undefined') N[name] = [];
            N[name].push(uuid);
            p('meta.file_names[' + name + ']', N[name]);
        });
    }).then(function(){
        // check uuids
        p('checking file_uuids\n');
        var ulist = Object.keys(Meta.file_uuids);
        var to_rm = [];
        u.each(ulist, function(id){
            // `in` is not reliable.
            //if( !(id in Uuids) && Uuids.indexOf(id) > -1){
            //    p('what the fuck?\n', id, '\n', Uuids.indexOf(id), Uuids);
            //}
            //if(!(id in Uuids))
            if(Uuids.indexOf(id) < 0){
                p('this one: ', Meta.file_uuids[id]);
                to_rm.push(id);
                delete Meta.file_uuids[id];
                //return p('this one: ', id, Uuids, Uuids.indexOf(id));
            }else{
                //p('it is in the list');
            }
        });
        p('removed from file_uuids:', to_rm);
    }).then(function(){
        p('right uuids');
        var ulist = Object.keys(Meta.file_uuids);
        u.each(Uuids, function(id){
            if(ulist.indexOf(id) < 0){
                // add the id
                var add = u.pick(Meta.files[id], 'name', 'size', 'filetype', 'timestamp');
                add['short-json'] = true;
                Meta.file_uuids[id] = add;
                p('added one:', add);
            }
        });
    }).then(function(){
        p('check:\n', Meta.file_names, Meta.file_uuids);
    }).then(function(){
        //return tutil.idle_out(5);
    }).then(function(){
        //return Folder.promise_to_save_meta();
    }).then(function(){
        test.done();
    });
}

function check_uuid_name(test){

    var folder_path = 'abc/test';

    var Folder, Meta, Names, Uuids;
    var tuuids;

    folder_module.retrieve_folder(folder_path).then(function(folder){
        Folder = folder;
        Meta = folder.get_meta();

        test.ok(u.isObject(Folder));
        test.ok(u.isObject(Meta));

        Uuids = Object.keys(Meta.files);
        test.ok(Uuids.length > 0, 'we should get uuid list');

        Names = u.map(Uuids, function(id){
            return Meta.files[id].name;
        });
        test.ok(Names.length > 0, 'we should get name list');


        // we just go to 'then'

    }).then(function(){
        p("each name get uuid list in 'file names', all uuid should appear in 'files'");
        u.each(Names, function(name){
            // we are going to check each name's uuid
            var uuidlist = Meta.file_names[name];
            //p('name: ', name, uuidlist.length);
            var to_rm = [];
            u.each(uuidlist, function(id){
                //p('try one, ', Uuids.indexOf(id),  id, name);
                if( Uuids.indexOf(id) < 0){
                    p(' - catch one, ', Uuids.indexOf(id),  id, name);
                    to_rm.push(id);
                }
            });
            test.ok(to_rm.length == 0, 'every uuid in file_names should appear in files');
        });

    }).then(function(){

    }).then(function(){
        // all uuids appears in file_names
        var N = Meta.file_names;

        u.each(Uuids, function(uuid){
            var name = Meta.files[uuid].name;
            test.ok(typeof N[name] !== 'undefined');
            test.ok(N[name].indexOf(uuid) >= 0);
        });
    }).then(function(){
        p('In meta, all uuids in "file uuids" should appear in "files"');
        var ulist = Object.keys(Meta.file_uuids);
        u.each(ulist, function(id){
            // `in` is not reliable:
            //if( !(id in Uuids) ...
            test.ok(Uuids.indexOf(id) >= 0);
        });
    }).then(function(){
        p('In meta, all uuids in "files" should appear in "file uuids" ');
        var ulist = Object.keys(Meta.file_uuids);
        u.each(Uuids, function(id){
            test.ok(ulist.indexOf(id) >= 0);
        });
    }).then(function(){
    }).then(function(){
        test.done();
    });
}


function show_uuids_names(test){
    // abc/test/test-file

    var filename = 'test-file',
        folder_path = 'abc/test';

    var Folder, Meta, Names, Uuids;
    var tuuids;

    folder_module.retrieve_folder(folder_path).then(function(folder){
        Folder = folder;
        Meta = folder.get_meta();

        test.ok(u.isObject(Folder));
        test.ok(u.isObject(Meta));

        Uuids = Object.keys(Meta.files);
        test.ok(Uuids.length > 0, 'we should get uuid list');

        Names = u.map(Uuids, function(id){
            return Meta.files[id].name;
        });
        test.ok(Names.length > 0, 'we should get name list');

        p('file_names:\n', Meta.file_names);
        p('file_uuids:\n', Meta.file_uuids);

        // we just go to 'then'



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

    "test 1 : test lock sync version " : test_lock,
    "test 2 : test lock async version" : test_lock_async,

};


module.exports.last = function(test){
    test.expect(1);
    p(' -- going to force stop --');
    test.ok(true);
    tutil.stop();
    test.done();
};


function test_lock(test){
    var folder_path = "abc/test";

    var Unlock;
    locker.lock_path(folder_path).then(function(unlock){
        Unlock = unlock;
        test.ok(u.isFunction(Unlock));
    }).then(function(){
        return tutil.idle_out(3);
    }).then(function(){
        p('after 3 seconds.');
        locker.check_folder_locker(folder_path, function(err, what){
            test.ok(!err, 'check folder lock should get no err');
            test.ok(u.isArray(what), 'check lock get array of time [milli, sec, hh:mm:ss]');
        });
    }).then(function(){
        return tutil.idle_out(3);
    }).then(function(){
        return Unlock();
    }).then(function(what){
        locker.check_folder_locker(folder_path, function(err, what){
            test.ok(!err, 'check folder lock should get no err');
            test.ok(u.isNull(what), 'check lock get null');
        });
        return tutil.idle_out(3);
    }).then(function(){
        test.done();
    });
}

function test_lock_async(test){
    var folder_path = "abc/test";

    locker.lock_path_async(folder_path, function(err, unlocker){
        test.ok(u.isFunction(unlocker));
        //p('we have locked it: ', folder_path);
        tutil.sleep(5, function(err, sec){
            p('after 5 seconds.');
            locker.check_folder_locker(folder_path, function(err, what){
                //p('check the locker: ' + folder_path, '\n', err, what);
                test.ok(!err, 'check folder lock should get no err');
                test.ok(u.isArray(what), 'check lock get array of time [milli, sec, hh:mm:ss]');
                unlocker(function(err, reply){
                    p('should be unlocked');
                    locker.check_folder_locker(folder_path, function(err, what){
                        p('check the locker: ' + folder_path, '\n', err, what);
                        test.ok(!err, '2, check folder lock should get no err');
                        test.ok(u.isNull(what), '2, check lock get null');
                        test.done();
                    });
                });
            });
        });
    });
}


check_retrieve_folder_meta = function(){
    folder_module.retrieve_folder_meta(folder_path).then(function(meta){
        p ('meta: \n', meta);
        tutil.stop();
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
}


