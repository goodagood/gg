
const path = require("path");

var folder = require("./folder.js");

var bucket = require('../aws/bucket.js');

var p = console.log;


/*
 * if callback gets: (null, true), it is folder exists
 *                   (null, false), it is folder NOT exists
 *                   otherwise we pass err and s3 replys to callback.
 */
function is_folder_exists(folder_path, callback) {
    folder.new_obj(folder_path, function(err, folder_obj){
        if(err) return callback(err);

        folder_obj.calculate_meta_s3key(function(err, s3key){
            if(err) return callback(err);

            //var meta = folder_obj.get_meta();
            bucket.s3_object_exists(s3key, function(err, aws_reply) {
                if (err) {
                    if(err.code && err.code === 'NotFound') return callback(null, false);
                    return callback(err, null);
                }
                if (aws_reply.ContentLength.length > 0) {
                    return callback(null, true);
                }
                return callback(err, aws_reply);
            });
        });
    });
}
module.exports.is_folder_exists = is_folder_exists;



function get_parent_folder(folder_path, callback){
    var owner       = folder_path.split('/')[0];
    if(owner === folder_path) return callback('This might be root folder', null);

    var parent_path = path.dirname(folder_path);

    p(`getting parent, owner: ${owner}, parent_path: ${parent_path}`);


    folder.retrieve_folder(parent_path, callback);
}
module.exports.get_parent_folder = get_parent_folder;



if(require.main === module){
    function c_f_exist(dir){
        dir = dir || 't0310y6';

        is_folder_exists(dir, function(err, what){
            p('c f exists: ', err, what);
            setTimeout(process.exit, 3*1000);
        });
    }
    //c_f_exist('t0310y6/aa/bb');
    //c_f_exist('t0322y6');

    function check_get_parent(dir){
        dir = dir || 't0322y6';
        get_parent_folder(dir, function(err, parent){
            p('got parent? err: ', err);
            p('parent folder meta: ', parent.get_meta());
            setTimeout(process.exit, 3*1000);

        });
    }
    check_get_parent('t0322y6/gg');
}
