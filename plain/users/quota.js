
// 2015 0621
// thing about user's quote
//


var util = require('util');
var u    = require('underscore');
var async= require("async");

var conf =   require("../config/config.js");

//var s3folder = require("../aws/folder.js");
var bucket = require("../aws/bucket.js");

var redis_basic = require("../myutils/redis-basic.js");
var rclient = redis_basic.client;

var folder_module = require("../aws/folder-v5.js");
var walker = require("../aws/walk-through.js");
var user   = require("./a.js");

var myconfig =   require("../config/config.js");

var p = console.log;


function set_user_quota(username, quota, callback){
  rclient.hset(username, 'quota', quota, callback);
}

function set_user_add_up_bytes(username, callback){
    // @bytes: add up file bytes in bytes

    add_up_home_size2(username, function(err, size){
        if(err) return callback(err, null);

        p( username, ' \t got add up bytes: ', size);
        rclient.hset(username, 'add-up-byte', size, callback);
    });
}



var adding = {
    size : 0,

    do_file: function do_file(opt, callback){
        var cwd     = opt.cwd_folder_obj;
        var mfolder = opt.cwd_folder_meta;
        var uuid    = opt.file_uuid;
        // the file meta saved in folder meta:
        var meta    = mfolder.files[uuid];

        //p('got file uuid, path: ', meta.uuid, meta.path, meta.size );
        this.size += get_number(meta.size);
        p('file size added?  size: ', this.size);
        callback(null, null)
            //cwd.uuid_to_file_obj(uuid, function(err, file){
            //    p('do file, ', meta.path, meta.what);
            //    callback(null, null);
            //})
    },

    do_folder: function do_folder(opt, callback){
        //var cwd_meta =  opt.cwd_folder_meta;
        //var cwd      =  opt.cwd_folder_obj;
        //var meta     =  opt.sub_folder_meta;
        //var sub_folder = opt.sub_folder_obj;

        //p ('- in do folder, ', meta.path);
        //var mfolder = sub_folder.get_meta();
        //p('got folder uuid, path: ', mfolder.uuid, mfolder.path );
        this.size += 400000; // 400k   g000 m000 k000
        p('folder size would be 400 000, 400k, size: ', this.size);
        callback(null, null);
    }

};

function get_number(int_or_str){
    if(!int_or_str) return 0;

    if(typeof int_or_str === 'number') return int_or_str;

    if(typeof int_or_str === 'string'){
        try{
            var num = parseInt(int_or_str);
            return num;
        }catch(err){
            return 0;
        }
    }
    return 0;
}

function add_up_home_size(name){
    //name = name || 'cat-02';
    name = name || 'abc';

    var size = 0;
    var adding = {
        do_file: function do_file(opt, callback){
            var cwd     = opt.cwd_folder_obj;
            var mfolder = opt.cwd_folder_meta;
            var uuid    = opt.file_uuid;
            // the file meta saved in folder meta:
            var meta    = mfolder.files[uuid];

            //p('got file uuid, path: ', meta.uuid, meta.path, meta.size );
            size += get_number(meta.size);
            p('file size added?  size: ', size);
            callback(null, null)
        },

        do_folder: function do_folder(opt, callback){
            //p('got folder uuid, path: ', mfolder.uuid, mfolder.path );
            size += 400000; // 400k   g000 m000 k000
            p('folder size would be 400 000, 400k, size: ', this.size);
            callback(null, null);
        }

    };

    user.get_user_id(name, function(err, id){
        folder_module.retrieve_folder(id).then(function(folder){
            //walk_through(folder, callback);
            walker.walk_through(folder, adding, function(err, what){
                p('add up... after walk through, err: ', err);
                p('adding size: ', size);
                stop();
            });
        });
    });
}

function add_up_home_size2(name, callback){

    var size = 0;
    var worker = function(folder, uuid, callback){
        var meta = folder.get_meta().files[uuid];
        if(!meta) return callback('no meta for: ' + uuid);

        if(meta.what === myconfig.IamFolder){
            p('got a folder, ', meta.path);
            size += 400000; // 400k
        }else{
            if(!meta.size) p('no meta size: ', meta.path)
            size += get_number(meta.size);
            p(meta.size);
        }
        callback(null, null);
    };

    user.get_user_id(name, function(err, id){
        if(err) return callback(err);

        folder_module.retrieve_folder(id).then(function(folder){
            walker.file_1st_walk_through(folder, worker, function(err, what){
                callback(null, size);
            });
        }).catch(callback);
    });
}

function check_add_up_home_size2(name){
    //name = name || 'cat-02';
    name = name || 'abc';

    add_up_home_size2(name, function(err, what){
        p('add up... after walk through, err: ', err);
        p('adding size: ', what);
        stop();
    });
}



// -- checkings

var stop = function(period) {
    period = period || 1;
    if (!u.isNumber(period)) {
        period = 1;
    }
    var milli_seconds = period * 1000;
    return setTimeout(process.exit, milli_seconds);
};

function check_set_a_quota(){
    p('check set a quota');
    var g2 = 2 * 1000 * 1000 * 1000;  // 2 G 
    set_user_quota('abc', g2, function(err, what){
        p('in check user quota, err, what ', err, what);
        stop();
    });
}

function check_set_add_up(){
    var username = 'abc';

    set_user_add_up_bytes(username, function(err, what){
        p('check s u a u b: ', err, what);
        stop();
    });
}

function set_quota_and_add_up(username, callback){
    var username = username || 'abc';
    p('in set quota and add up, for user name: ', username);

    var g2 = 2 * 1000 * 1000 * 1000;  // 2 G 

    set_user_quota(username, g2, function(err, what){
        if(err) return callback(err, null);

        set_user_add_up_bytes(username, callback);
    });
}

function set_all_quota_and_add_up_file_size(){
    user.get_user_names(function(err, names){

        async.whilst(
            function(){return names.length > 0;}

            // get a name and do the job
            ,function(callback){set_quota_and_add_up(names.pop(), callback);}
            ,function(err, what){
                p('after async whilst: ', err, what);
                stop(3);
        });

        //p('names ', err, names.sort().join(', '));
        //stop();

    });
}


if(require.main === module){
    //check_set_a_quota();
    //add_up_home_size('abc');
    //check_add_up_home_size2();
    check_set_add_up();

    //set_all_quota_and_add_up_file_size();

    //set_quota_and_add_up();
}

