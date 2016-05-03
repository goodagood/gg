
var s3a = require("./s3-a.js");
var keys = require("./s3keys.js");

//var s3 = s3a.get_s3_obj();


function key_exists(key, callback){
    var params = {
        Bucket: s3a.root_bucket,
        Key:    key,
    };
    var s3 = s3a.get_s3_obj();
    s3.headObject(params, function(err, res){
        if(err){
            if(err.code !== "NotFound") return callback(err, false, 'code is not NotFound', res);
            return callback(err, false);
        }
        if(res.LastModified) return callback(err, true, res);

        // If we can't determine true/false for it:
        callback(err, res);
    });
}
module.exports.key_exists = key_exists;


function head_info(key, callback){
    var params = {
        Bucket: s3a.root_bucket,
        Key:    key,
    };
    var s3 = s3a.get_s3_obj();
    s3.headObject(params, callback);
}
module.exports.head_info = head_info;


function file_exists(fpath, callback){
    keys.make_file_s3key(fpath, function(err, key){
        if(err) return callback(err);

        key_exists(key, callback);
    });
}
module.exports.file_exists = file_exists;


function folder_exists(fpath, callback){
    keys.make_folder_meta_s3key(fpath, function(err, key){
        if(err) return callback(err);

        key_exists(key, callback);
    });
}
module.exports.folder_exists = folder_exists;


if (require.main === module){
    function c_file_exists(){
        file_exists('tmp/public/t.png', function(err, exists, a,b,c){
            //console.log(arguments);
            console.log(err, exists);
        });
        file_exists('tmp/public/t.pngaa', function(err, exists, a,b,c){
            //console.log(arguments);
            console.log(err, exists);
        });
        folder_exists('tmp/public', function(err, exists, a,b,c){
            //console.log(arguments);
            console.log(err, exists);
        });
    }
    c_file_exists();
}
