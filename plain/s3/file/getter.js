
/*
 * get file
 * 2016 0409
 */

var o = require("./obj.js");


function getfile(file_path, callback){
    o.new_obj(file_path, function(err, obj){
        if(err) return callback(err);
        obj.cal_s3key_and_meta_s3key(function(err, _m){
            if(err) return callback(err);
            callback(null, obj);
        });
    });
}
module.exports.getfile = getfile;


function pubkey(user_name, callback){
    var file_path = user_name + '/gg/gg.public.key';
    getfile(file_path, function(err, f){
        if(err) return callback(err);
        f.read_to_string(callback);
    });
}
module.exports.pubkey = pubkey;
