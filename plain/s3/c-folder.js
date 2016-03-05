
var folder = require("./folder.js");
var p      = console.log;


function s3key(dir){
    dir = dir || 'aa/bb/cc';

    folder.make_s3key_for_folder_meta_file(dir, function(err, s3key){
        p(err, s3key);
    });
}

function new_folder(){
    var owner = {
        name : 'some-one',
        id : 'some-one-28-feb-y6'
    }

    var patha = 'some-one/first';

    folder.new_obj(patha, function(err, obj){
        p(err, obj);
        process.exit();
    });
}


if(require.main === module){
    //s3key();
    new_folder();
}
