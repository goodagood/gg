
var path   = require('path');
var assert = require('assert');
var u      = require('underscore');

var folder_module = require("./folder-v5.js");
var bucket        = require("./bucket.js");
var file_types    = require("./s3-file-types.js");

var p = console.log;


// Think to change:
// Should we delete the old file, then save the new one?
// Then all file should be capable to delete themself.
// 2015 0926
//
function update_file(meta, callback){
    // @meta: file meta, full_path contains path and name/extension.
    //        get the old meta, update it.

    var full_path   = meta.path;
    var name        = meta.name;
    var folder_path = path.dirname(full_path);

    folder_module.retrieve_folder(folder_path).then(function(folder){
        assert(folder.file_exists(name)); // if not exists, why update.

        var folder_info = folder.get_meta();

        var uuids = folder.get_uuids(name);
        var uuid  = uuids[0]; // Only deal the first.
        var old_meta = folder_info.files[uuid];

        if(meta.storage){
            p(meta.storage, old_meta.storage);
            update_storage(meta.storage, old_meta.storage, function(err, s3rep){
                old_meta.timestamp = Date.now();

                old_meta.size = meta.size;

                //delete meta.storage;
                //delete meta.uuid;
                //delete meta.path_uuid;
                //delete meta.path;
                //delete meta.name;
                //u.extend(old_meta, meta);

                file_types.set_file_obj_from_meta(old_meta, function(err, file){
                    if(err) return callback(err, null);
                    file.save_file_to_folder().then(function(s3_write_reply){
                        callback(null, file);
                    })["catch"](callback);
                });

            });
        }

    });
}


// This only do the file-meta.storage, no aux storage such as
// thumbnails of image file, posters of video file get change.
function update_storage(src, tgt, callback){
    // storage: {type: , key: }
    if(!src.key) return callback('no src key', null);
    if(!tgt.key) return callback('no target key', null);

    if(src.key === tgt.key) p(null, 'no need to update storage'); // in dev
    if(src.key === tgt.key) return callback(null, 'no need to update storage');

    //bucket.copy_object(src.key, tgt.key, callback);
    bucket.move_object(src.key, tgt.key, callback);
}


// to test
function update_file_pu(file_path_uuid, meta, callback){
    // @meta: used to update the file
    // We should not change uuid, folder path.

    var folder_path = path.dirname(file_path_uuid);

    folder_module.retrieve_file_by_path_uuid(file_path_uuid, function(err, file){
        if(err) return callback(err, null);

        var file_meta = file.get_meta();

        function update_meta(_meta, callback){
            file.update_meta(_meta, callback);
        }

        if(meta.storage && meta.storage.key){
            update_storage(meta.storage, file_meta.storage, function(err, what){
                var _meta = u.omit(meta, 'storage');
                return update_meta(_meta, callback);
            });
        }else{
            return update_meta(meta, callback);
        }
    });
}


// folder.is_name_unique
//function should_be_unique(folder, name){
//    var folder_meta = folder.get_meta();
//}

module.exports.update_file = update_file;


