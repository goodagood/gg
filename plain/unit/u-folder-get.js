//
// Try to test: get things from folder.
// 0205, 2015
//

var assert  = require("assert");
var u       = require("underscore");
var async   = require("async");
var path    = require("path");
var Promise = require("bluebird");
var fs      = require("fs");

var folder_module = require("../aws/folder-v5.js");

var myconfig =   require("../config/config.js");
var config = require("../test/config.js");

var bucket = require("../aws/bucket.js");
var ttool  = require ("../myutils/test-util.js");

// folders, files used in testing //
var _test_folder_path = 'abc';
var _test_file_name   = 'test-write-20';
var _test_file_path   = 'abc/test-write-20';
var _test_user_name   = 'abc';

var _gg_folder_name  = 'goodagood';
var _new_folder_name = 'test';
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

// end of the headings //


function test_folder_exists(test){
    folder_module.is_folder_exists(_test_folder_path, function(err, yes_){
        test.ok(yes_, 'the test folder should exists');
        //test.done();
    }).then(function(){
        folder_module.retrieve_file_meta(_test_file_path, function(err, metas){
            p (err, metas);
        });
    }).then(function(){
        test.done();
    });
}

function t2_we_get_sorted(test){
    folder_module.retrieve_folder(_test_folder_path).then(function(folder){
        test.ok(u.isObject(folder));
        var sorted = folder.sort_files_by_date();

        test.ok(u.isArray(sorted));

        var s2 = folder.sort_files('name', true);
        test.ok(u.isArray(s2));
        test.ok(s2.length == sorted.length);

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
    "test 2: we get sorted" : t2_we_get_sorted

};


module.exports.last = function(test){
    test.expect(1);
    p(' -- going to force stop --');
    test.ok(true);
    ttool.stop();
    test.done();
};


// -- some fast checkings -- //

function check_0205(){
    folder_module.is_folder_exists(_test_folder_path, function(err, yes_){
        assert(yes_, 'the test folder should exists');
        //test.done();
    }).then(function(){
        folder_module.retrieve_file_meta(_test_file_path, function(err, metas){
            //p (err, metas);
            //p ('length: ', metas.length);
            var m0 = metas[0];
            var path_uuid = m0.path_uuid;
            p ('path_uuid: ', path_uuid);

            // by 'path uuid'
            folder_module.retrieve_file_meta_pu(path_uuid, function(err, meta){
                //p ('meta:', meta);
                p ('meta.path_uuid:', meta.path_uuid);
                p ('meta.storage.key:', meta.storage.key);
                stop();
            });
        });
    }).then(function(){
        //
    });
}


function check_sort(){
    folder_module.retrieve_folder(_test_folder_path).then(function(folder){
        assert(u.isObject(folder));
        var sorted = folder.sort_files_by_date();
        var t = u.pluck(sorted, 'lastModifiedDate');
        var ts = u.pluck(sorted, 'timestamp');
        var pa = u.pluck(sorted, 'path');

        var s = u.zip(ts, pa, t);
        console.log ('what?\n', s);


        var ts0 = parseInt(ts[0]);
        var ts1 = parseInt(ts[1]);
        //assert(ts0 > ts1);

        //var meta = folder.get_meta();
        //p ('meta ', meta);

        //var ul = meta.renders.ul


        stop();
    });
}


function check_comm_sort(){
    folder_module.retrieve_folder(_test_folder_path).then(function(folder){
        assert(u.isObject(folder));

        //var sorted = folder.sort_files('name', false);

        //var names = u.pluck(sorted, 'name');
        //var ts = u.pluck(sorted, 'timestamp');

        //var s = u.zip(names, ts);
        //console.log ('sorted?\n', s);

        // sort by timestamp
        var sorted = folder.sort_files('timestamp', false);

        var names = u.pluck(sorted, 'name');
        var ts = u.pluck(sorted, 'timestamp');

        var s = u.zip(ts, names);
        console.log ('sorted?\n', s);


        //var meta = folder.get_meta();
        //p ('meta ', meta);
        //var ul = meta.renders.ul


        stop();
    });
}


function file_exists(){
    folder_module.retrieve_folder(_test_folder_path).then(function(folder){
        assert(u.isObject(folder));

        var pat = /.gg.member\w+/;
        //var pat = /\w+/;
        //var pat = /jq.+/;
        var uuid_list = folder.pattern_to_uuids(pat); 

        var meta      = folder.get_meta();
        //var names     = u.map(uuid_list, function(uuid){ return meta.files[uuid].name; });
        //var to_show   = u.map(uuid_list, 
        //    function(uuid){
        //        return u.pick(meta.files[uuid], 'timestamp');
        //    });

        var meta_list  = u.map(uuid_list,
            function(uuid){
                return meta.files[uuid];
            });
        var to_write   = JSON.stringify(meta_list);

        fs.writeFile('/tmp/dup.mem.js', to_write, function(err, res){
            p('after writting, err res:', err, res);
            stop();
        });

        //p('got uuid list: ', uuid_list);
        //p('got to show: ', to_show);

        // Write to file

        //assert(names.length > 0);

        //var uuid = uuid_list[0];
        //var name = names[0];
        //var file_meta = meta.files[uuid];
        //p(folder.file_exists(name));
        //p(file_meta);

    });
}


function write_metas(cwd, pat, file_name){

    folder_module.retrieve_folder(_test_folder_path).then(function(folder){
        assert(u.isObject(folder));

        var pat = /.gg.member\w+/;
        var uuid_list = folder.pattern_to_uuids(pat); 

        var meta      = folder.get_meta();

        var meta_list  = u.map(uuid_list,
            function(uuid){
                return meta.files[uuid];
            });
        var to_write   = JSON.stringify(meta_list, null, 4);

        fs.writeFile('/tmp/dup.mem.js', to_write, function(err, res){
            p('after writting, err res:', err, res);
            stop();
        });

    });
}


function uuid_time(uuid){
    return u.map(uuid_list, function(uuid){
        //return meta.files[uuid].timestamp;
        return meta.files[uuid];
    });
}

if(require.main === module){
    //check_0205();
    //check_sort();
    //check_comm_sort();

    //file_exists(); //0329, before doing file update
    write_metas();
}


