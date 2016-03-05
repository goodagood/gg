

var path = require("path");

var s3prefix = require("../myutils/json-cfg.js").s3_prefix_configure();


function make_s3key_for_folder_meta(folder_path, callback){
    if(!folder_path) return callback('no folder path given');
    s3prefix('folder_meta', function(err, folder_meta_prefix){
        if(err) return callback(err);

        var s3key = path.join(folder_meta_prefix, folder_path);
        callback(null, s3key);
    });
}
module.exports.make_s3key_for_folder_meta = make_s3key_for_folder_meta;


/*
 * folder_info:
 *   {
 *      uuid:
 *      owner_name:
 *      owner_id:
 *      owner: {
 *          name: 
 *          id:
 *      }
 *   }
 */
function make_s3key_for_folder_name_space(folder_info, callback){

    if(!folder_info) return callback('no folder info given');
    var uuid = folder_info.uuid;
    var id   = folder_info.owner_id   || folder_info.owner.id;
    var name = folder_info.owner_name || folder_info.owner.name;

    if(!uuid || !id) return callback('no enough folder info given');

    s3prefix('folder_name_space', function(err, folder_name_space_prefix){
        if(err) return callback(err);

        var s3key = path.join(folder_name_space_prefix, id, uuid);
        callback(null, s3key);
    });
}
module.exports.make_s3key_for_folder_name_space = make_s3key_for_folder_name_space;



