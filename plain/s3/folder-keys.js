
/*
 * Deprecated, 2016 0313
 * use ./s3keys.js instead.
 */

var path = require("path");

var s3prefix = require("../myutils/json-cfg.js").s3_prefix_configure();


function make_meta_s3key(folder_path, callback){
    if(!folder_path) return callback('no folder path given');
    s3prefix('folder_meta', function(err, folder_meta_prefix){
        if(err) return callback(err);

        var s3key = path.join(folder_meta_prefix, folder_path);
        callback(null, s3key);
    });
}
module.exports.make_meta_s3key = make_meta_s3key;


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
function make_name_space_s3key(folder_info, callback){

    if(!folder_info) return callback('no folder info given');
    var uuid = folder_info.uuid;
    var name = folder_info.owner_name || folder_info.owner;

    //var id   = folder_info.owner_id   || folder_info.owner.id;
    //var name = folder_info.owner_name || folder_info.owner.name;

    if(!uuid || !name) return callback('no enough folder info given');

    s3prefix('folder_name_space', function(err, folder_name_space_prefix){
        if(err) return callback(err);

        var s3key = path.join(folder_name_space_prefix, name, uuid);
        callback(null, s3key);
    });
}
module.exports.make_name_space_s3key = make_name_space_s3key;



