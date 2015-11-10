

// trying to separate folder deleting out from 'folder-v5'
// 2015, 0409

var u = require("underscore");
var assert = require("assert");

var myconfig =   require("../config/config.js");
var myutil   = require("../myutils/myutil.js");

var folder_module = require("../aws/folder-v5.js");
var bucket        = require("../aws/bucket.js");

var rmfile = require("./rm-file.js");

var p      = console.log;


//// todo
//function rm_folder_path (folder_path, callback) {
//    return retrieve_folder(folder_path).then(function(folder) {
//        var folder_meta = folder.get_meta();
//        //folder.rm_all_uuids ...
//
//        callback(null, uuid);
//        build_file_list();
//        //return promise_to_save_meta(callback);
//    });
//};



function rm_uuid(folder, uuid, callback){
    var folder_meta = folder.get_meta();
    var files = folder_meta.files;

    if(!files[uuid]) return callback('no such file: ' + uuid + ' in folder: ' + folder_meta.path, null);

    show_info_before_rm(files, uuid);

    var what = files[uuid].what;
    if(what === myconfig.IamFolder){
        return rm_folder_by_uuid(folder, uuid, callback);
    }else if(what === myconfig.IamFile){
        return rmfile.rm_file_by_uuid(folder, uuid, callback);
    }else{
        // same as file
        //return rm_file_uuid(folder, uuid, callback)
    }
}

// small tool in dev.
function show_info_before_rm(files, uuid){
    p('to rm: ', files[uuid].path, files[uuid].what);
}


function rm_home_folder(root_folder_name, callback){
    // This remove the home folder, @root_folder_name is the name/id of root
    // It's convenient to give just a name.
    
    folder_module.retrieve_folder(root_folder_name).then(function(folder){

        rm_all_uuids(folder, function(err, folder){
            if(err) return callback(err, null);

            rm_empty_home(folder, function(err, what){
                if(err) return callback(err, null);
                callback(null, null);
            });
        });
    });
}

function rm_empty_home(folder, callback){
    var meta = folder.get_meta();
    assert(!!meta.folder_meta_s3key);
    bucket.delete_object(meta.folder_meta_s3key, callback);
}


function rm_folder_by_uuid(folder, uuid, callback){
    // @folder : object of the 'parent' folder
    // @uuid : of sub folder going to be removed

    var folder_meta = folder.get_meta();
    var files       = folder_meta.files;

    var sub_meta    = files[uuid];
    var sub_name    = sub_meta.name;
    var sub_s3key   = sub_meta.folder_meta_s3key;

    folder.get_folder(sub_name).then(function(sub_folder){
        rm_all_uuids(sub_folder, function(err, sub_folder_again){
            bucket.delete_object(sub_s3key, function(err, s3rep){
                folder.clear_file_meta(uuid);
                folder.build_file_list();
                folder.save_meta(function(err, s3rep){
                    callback(null, folder);
                })
            })
        });
    });
}


// Remove all uuids, files, (links) and folders, it gets to be recursive.
// Each time, the 1st uuid get to be removed,
// 'rm uuid' set up to call 'rm all uuids' again, so keep in loops.
//
// If no more uuid need to remove, 'rm all uuids' will callback,
// and the loop stops.  Of course, it will callback when err.
//
// Each time, it should be tried to give back a refreshed folder object, 
// but, we are trying to 'retrieve saved meta' anyway, everytime.
//
function rm_all_uuids(folder, callback){
    folder.retrieve_saved_meta(function(err, meta){
        if(err) return callback(err, meta);

        if(meta.files){
            var file_uuids = u.keys(meta.files);
            if(file_uuids.length > 0){
                return rm_uuid(folder, file_uuids[0], function(err, folder){
                    if(err){ return callback(err, folder);
                    // reccursivly call self:
                    }else  { return rm_all_uuids(folder, callback); }
                });
            }else{  return callback(null, folder); }
        }
        callback('wierd there is no meta.files? ' + folder.path, folder);
    });
}



module.exports.rm_all_uuids   = rm_all_uuids;
module.exports.rm_folder_by_uuid   = rm_folder_by_uuid;
//module.exports.rm_folder_path = rm_folder_path;
module.exports.rm_home_folder = rm_home_folder;

// expose for testing
module.exports.rm_empty_home = rm_empty_home;


