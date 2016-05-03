/*
 * Before this we have folder_keys.js, but it's good to put things together.
 *
 * 2016 0313
 */

var path = require("path");

var jconfig  = require("../myutils/json-cfg.js");
var s3prefix = jconfig.s3_prefix_configure();


function get_prefixes(callback){
    /*
     * basically pass to jconfig.callback_s3_prefixes
     */
    jconfig.callback_s3_prefixes(callback);
}


function make_folder_meta_s3key(folder_path, callback){
    if(!folder_path) return callback('no folder path given');
    s3prefix('folder_meta', function(err, folder_meta_prefix){
        if(err) return callback(err);

        var s3key = path.join(folder_meta_prefix, folder_path);
        callback(null, s3key);
    });
}
module.exports.make_folder_meta_s3key = make_folder_meta_s3key;


/*
 * folder_info:
 *   {
 *      uuid:
 *      path:
 *      //owner: 'actually the root'
 *   }
 */
function make_folder_name_space_prefix(folder_info, callback){

    if(!folder_info || !folder_info.uuid || !folder_info.path) return callback('no enough folder info given');
    var uuid = folder_info.uuid;
    //var name = folder_info.owner; // or root when owner is different from root
    var root = get_root(folder_info.path); // root and owner can be different.

    s3prefix('folder_name_space', function(err, folder_name_space_prefix){
        if(err) return callback(err);

        var s3key = path.join(folder_name_space_prefix, root, uuid);
        callback(null, s3key);
    });
}
module.exports.make_folder_name_space_prefix = make_folder_name_space_prefix;



function make_file_s3key(file_path, callback){
    if(!file_path) return callback('no file path given for making file s3key');
    s3prefix('file', function(err, prefix){
        if(err) return callback(err);

        var s3key = path.join(prefix, file_path);
        callback(null, s3key);
    });
}
module.exports.make_file_s3key = make_file_s3key;


function make_file_meta_s3key(file_path, callback){
    if(!file_path) return callback('no file path given for making file meta s3key');
    s3prefix('file_meta', function(err, prefix){
        if(err) return callback(err);

        var s3key = path.join(prefix, file_path);
        callback(null, s3key);
    });
}
module.exports.make_file_meta_s3key = make_file_meta_s3key;


function make_s3keys_for_file_path(file_path, callback){
    if(!file_path) return callback('no file path given for making file meta s3key');
    jconfig.callback_s3_prefixes(function(err, prefixes){
        if(err) return callback(err);

        var keys = {};
        keys.s3key = path.join(prefixes['file'], file_path);
        keys.meta_s3key = path.join(prefixes['file_meta'], file_path);
        callback(null, keys);
    });
}
module.exports.make_s3keys_for_file_path = make_s3keys_for_file_path;


/*
 * @info is file information(meta) must have: {uuid: , path: }
 */
function make_file_name_space_prefix(info, callback){
    if(!info) return callback('no file information given for making file name space s3key');

    if(!info || !info.uuid || !info.path) return callback('no enough folder info given');
    var uuid = info.uuid;
    var root = get_root(info.path); // root and owner can be different.


    s3prefix('file_name_space', function(err, prefix){
        if(err) return callback(err);

        var s3key = path.join(prefix, root, uuid);
        callback(null, s3key);
    });
}
module.exports.make_file_name_space_prefix = make_file_name_space_prefix;



// to move to local-util.js
function get_root(full_path){
    if(!full_path) return null;

    return full_path.split('/')[0];
}
module.exports.get_root = get_root;
