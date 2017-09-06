// ...  2015, 0410
// 0627, try to check and repaire root folders and sub-folders


var assert = require("assert");
var u = require("underscore");
var path = require("path");
var Promise = require("bluebird");
var async = require('async');

var folder_module = require("../aws/folder-v5.js");

var phome = require("../aws/prepare-home.js");

var p    = console.log;
var stop = function(seconds) {
    var seconds = seconds || 1;
    var milli_sec = seconds * 1000;
    setTimeout(process.exit, milli_sec);
};

// end of heading.


var _test_folder_path = 'abc';
var _test_sub_folder_name = 'test-add';
var _test_user_name   = 'abc';





//module.exports.group_one = {
//    setUp: function (callback) {
//        //this.foo = 'bar';
//        callback();
//    },
//    tearDown: function (callback) {
//        //stop(); // stop in a second any way.
//        p ('- in tearDown');
//        callback();
//    },
//
//    //"test-2 : add folder, then file then delete" : t2,
//
//};
//
//
//module.exports.stop = function(test){
//    test.expect(1);
//    p(' -- going to force stop --');
//    test.ok(true);
//    stop();
//    test.done();
//};


// -- do some checking: -- //


var va = {};
function check_folder(folder_path){
    folder_path = folder_path || 'abc';

    // Sub is added new folder
    var Folder, Meta, Sub;
    folder_module.retrieve_folder(folder_path).then(function(folder){
        Folder = folder;
        Meta   = Folder.get_meta();
        p('path: ', Meta.path);
        //p('uuid: ', Meta.uuid);
    }).then(function(){
        return Folder.get_folder('goodagood');
    }).then(function(g){
        var goodagood = g;
        var gmeta     = g.get_meta();
        p(gmeta.path);
        stop();
    });
}


/*
 * check 'muji' folder exist, and viewer set to '*'
 */
function check_muji(folder, callback){
    if(!folder.file_exists('muji')) return callback('file/folder not exists');

    folder.get_folder('muji').then(function(f){
        assert(!u.isEmpty(f));
        var meta = f.get_meta();
        assert(meta.name === 'muji');
        callback(null,null);
    });
}


/* add muji to all prepared ids */
function muji_to_empty_rooms(){

    phome.list_ids(function(err, list){
        p(err, list);

        async.map(list, add_folder_muji, function(err, what){
            p('after map, ', err, what);
            stop();
        });

    });
}

var user = require("../users/a.js");
function muji_to_users(){
    // add 'muji' folder for each user
    user.get_user_names(function(err, name_list){
        p(err, name_list.join(', '));
        async.map(name_list, user.get_user_id, function(err, id_list){
            assert(u.isArray(id_list));
            async.map(id_list, add_folder_muji, function(err, what){
                p('muji-ed? ', err, what);
                stop();
            });
        });
    });
}

function add_folder_muji(id, callback){

    var Home, Meta;
    folder_module.retrieve_folder(id).then(function(folder){
        Home = folder;
        Meta   = Home.get_meta();
        p('path: ', Meta.path);
        p('owner: ', Meta.owner);
    }).then(function(){
        return Home.add_folder('muji');
    }).then(function(muji){
        p('gmeta.path');
        muji.set_attr('listor', {'default': 'img-value'}, function(err, what){
            if(err) return callback(err);

            callback(null,null);
        });
    }).catch(callback);

}

function aa(){
    // check to add 'muji' for aa

    var id = 'aa';
    add_folder_muji(id, function(err, what){
        p(err, what);
        stop();
    });
}

function add_viewer_to_public(){
    // add 'muji' folder for each user
    user.get_user_names(function(err, name_list){
        //p(err, name_list.join(', '));
        async.map(name_list, user.get_user_id, function(err, id_list){
            p('aa add viewer to public: err, list: ', err, id_list.join(', '));
            stop();

            //async.map(id_list, add_folder_muji, function(err, what){
            //    p('muji-ed? ', err, what);
            //    stop();
            //});
        });
    });
}

// Beside testing , here do some checking:
if (require.main === module){
    //check_folder();
    //muji_to_empty_rooms();
    //muji_to_users();
    //aa();

}


// drop into REPL
var va = {};
function drop_folder(folder_path, v){
    folder_path = folder_path || 'abc';
    v = v || va;

    // Sub is added new folder
    var Folder, Meta, Sub;
    folder_module.retrieve_promisified_folder(folder_path).then(function(folder){
        Folder = folder;
        Meta   = Folder.get_meta();
        p('path: ', Meta.path);
        p('uuid: ', Meta.uuid);
        v.folder = Folder;
        v.meta   = Meta;
    }).then(function(){
        return Folder.get_folder('goodagood');
        //stop();
    }).then(function(g){
        v.goodagood = g;
        v.gmeta     = g.get_meta();
    });
    
}

//drop_folder();
p( "ok start interact:");
