//
// Might do some change to folder, not limit to testing, name in short as
//   'unit folder assure' -> uf-assure
//
// - Assure : name - uuid is in corresponding.
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


function test_folder_exists_again(test){
    p( ' - to test folder: ' + _test_folder_path + ' exists.');
    folder_module.is_folder_exists(_test_folder_path, function(err, yes_){
        test.ok(yes_, 'the test folder should exists');
        test.done();
    });
}





function tmp_check_test_file(test){
    // for this file: abc/test/test-file

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

function tmp_repair_meta(test){

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


        // we just go to 'then'

    }).then(function(){
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
            if(to_rm.length > 0){
                p ('to remove: ', to_rm);
                p ('old list: ', uuidlist);
                Meta.file_names[name] = u.difference(uuidlist, to_rm);
                p ('new list: ', Meta.file_names[name]);
            }
        });

    }).then(function(){

    }).then(function(){
        // add names, rm by accidences
        p('add names');
        var N = Meta.file_names;

        u.each(Uuids, function(uuid){
            var name = Meta.files[uuid].name;
            if(typeof N[name] === 'undefined') N[name] = [];
            if(N[name].indexOf(uuid) < 0) N[name].push(uuid);
            //N[name] = u.uniq(N[name]);
            //p('meta.file_names[' + name + ']', N[name]);
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
        return Folder.promise_to_save_meta();
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

    "test 1: " : test_folder_exists_again,
    "test 2 : check uuid name is ok" : check_uuid_name,

    //"tmp repair: " : tmp_repair_meta,

    //"tmp checking: " : tmp_check_test_file,
    //"tmp show: " : show_uuids_names,
};


module.exports.last = function(test){
    test.expect(1);
    p(' -- going to force stop --');
    test.ok(true);
    tutil.stop();
    test.done();
};




if(require.main === module){
    //check_folder_exists();
}


