
var util = require("util");
var path = require("path");

var folder = require("./folder.js");
var keys   = require("./folder-keys.js");

var randstr= require("../myutils/rand-str.js");
var p      = console.log;


function s3key(dir){
    dir = dir || 'aa/bb/cc';

    keys.make_meta_s3key(dir, function(err, s3key){
        p(err, s3key);
    });
}


//function name_space_key(folder_meta){
//    dir = dir || 'aa/bb/cc';
//
//    keys.make_meta_s3key(dir, function(err, s3key){
//        p(err, s3key);
//    });
//}

function new_folder(){
    var owner = 't0310y6'; //name

    var patha = owner;

    folder.new_obj(patha, function(err, obj){
        p(err, obj);
        p(obj.get_meta());
        process.exit();
    });
}



function new_folder_meta_and_save(folder_path, owner){
    owner = owner || 't0310y6'; //name
    folder_path = folder_path || owner;

    folder.new_obj(folder_path, function(err, obj){
        //p(err, obj);
        //p(obj.get_meta());
        obj.set_owner(owner);
        obj.calculate_basic_meta(function(err, meta){
            p('after calculate_basic_meta, ', err, meta);
            p(obj.get_meta());
            obj.save_meta(function(err, s3rep){
                p('save meta: ', err, s3rep);
                process.exit();
            });
        });
    });
}


var folder_writter = require('./folder-writter.js');

function c_sub_folder_meta(folder_path, owner){
    owner = owner || 't0310y6'; //name
    folder_path = folder_path || path.join(owner, randstr.random_str(3));

    var parent_path = path.dirname(folder_path);

    folder.retrieve_folder(parent_path, function(err, parent){
        p('parent meta: ', parent.get_meta());

        folder.new_obj(folder_path, function(err, obj){
            //p(err, obj);
            //p(obj.get_meta());
            obj.set_owner(owner);
            obj.calculate_basic_meta(function(err, meta){
                p('after calculate_basic_meta, ', err, meta);
                p(obj.get_meta());
                obj.save_meta(function(err, s3rep){
                    p('save meta: ', err, s3rep);
                    folder_writter.intern_file(parent, obj, function(err, after_intern){
                        p('after intern: ', err, after_intern);
                        setTimeout(process.exit, 5*1000);
                    });
                });
            });
        });
    });
}



function c_retrieve_folder_meta(){
    var owner = 't0310y6'; //name
    var patha = owner;
    
    folder.retrieve_folder(patha, function(err, folder_obj){
        p('retrieve folder', err, folder_obj);

        var meta = folder_obj.get_meta();
        p('the meta: ', util.inspect(meta, {depth: 5}));
        p('meta cache: ', meta.cache);
        setTimeout(process.exit, 2000);
    })
}



if(require.main === module){
    //s3key();
    //new_folder();
    //new_folder_meta_and_save();
    //c_retrieve_folder_meta();

    c_sub_folder_meta('t0310y6/aa', 't0310y6');
}
