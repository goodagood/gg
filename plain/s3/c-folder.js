
var folder = require("./folder.js");
var keys   = require("./folder-keys.js");
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
        process.exit();
    });
}


if(require.main === module){
    s3key();
    //new_folder();
}