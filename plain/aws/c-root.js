/*
 * redis got crached and flushed.
 * try to find all user/id from root folders.
 */


var bucket = require("./bucket.js");

var myconfig =  require("../config/config.js");

var Folder_meta_prefix = myconfig.folder_meta_prefix;

var p = console.log;


var u = require("underscore");


function list_root_a(){
    p(Folder_meta_prefix);

    bucket.list(Folder_meta_prefix, function(err, what){
        if(err) process.exit(p('oh, err: ', err));

        p('0 - 3:');
        p(what.slice(0, 3));

        var fkeys = u.map(what, function(one){
            return one.Key;
        });

        p(fkeys, fkeys.length);

        process.exit();
    });
}


function list_root_b(){
    p(Folder_meta_prefix);

    bucket.list_all(Folder_meta_prefix, 50, function(err, what){
        if(err) process.exit(p('oh, err: ', err));

        p('0 - 3:');
        p(what.slice(0, 3));

        var fkeys = u.map(what, function(one){
            return one.Key;
        });

        p(fkeys, fkeys.length);

        process.exit();
    });
}


function all_folder_keys(callback){
    p(Folder_meta_prefix);

    bucket.list(Folder_meta_prefix, function(err, what){
        if(err) callback(err);

        var fkeys = u.map(what, function(one){
            return one.Key;
        });
        callback(null, fkeys);
    });
}

function aa(){
    all_folder_keys(function(err, all_keys){
        if(err) process.exit(p('oh, err: ', err));

        var pat = /^[^\/]+\/[^\/]+$/;

        var roots = u.filter(all_keys, function(key){
            return pat.test(key);
        });

        p(roots);
        process.exit();
    });
}

function abb(){
    var pat = /^[^\/]+\/[^\/]+$/;

    p(pat.test('abc/def'));
    p(pat.test('abc/def/defkk'));

    process.exit();
}


if(require.main === module){
    //list_root_a();
    //list_root_b();

    aa();
    //abb();
}

