
var folder = require("./folder.js");
var fkey   = require("./folder-keys.js");
var p      = console.log;


function s3key(dir){
    dir = dir || 'aa/bb/cc';

    fkey.make_meta_s3key(dir, function(err, s3key){
        p(err, s3key);
    });
}


module.exports.new_folder_obj = function(test){
    var owner = 't0310y6'; //name

    var patha = owner;

    folder.new_obj(patha, function(err, obj){
        test.ok(!err);
        test.ok(u.isFunction(obj.set_meta));
        p(err, obj);
        test.done();
    });
}


if(require.main === module){
    //s3key();
    //new_folder();
}
