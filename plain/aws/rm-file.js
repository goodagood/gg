
// trying to separate file removing into this file
// 2015, 0410
//
// It's un-avoidably need reference to rm-folder.js,
// when folder need to be deleted, the vice versa,
// this can cause a kind of loop, so try to deel with file only.

var u = require("underscore");
var assert = require("assert");

var folder_module = require("../aws/folder-v5.js");
var file_module   = require("../aws/simple-file-v3.js");
var myutil  = require("../myutils/myutil.js");

var myconfig  =   require("../config/config.js");

var p       = console.log;


function rm_file_by_uuid(folder, uuid, callback) {
    // @folder: the folder object.

    var folder_meta = folder.get_meta();
    assert(folder_meta.files[uuid].uuid === uuid);

    rm_uuid_without_save_folder(folder, uuid, function(err, what){
        if(err) return callback(err, what);

        //folder.save_meta(callback);
        folder.save_meta(function(err, s3rep){
            callback(null, folder);
        })
    });
}


function rm_uuid_without_save_folder(folder, uuid, callback){
    // @folder : folder object.
    var folder_meta, file_meta, filename;

    folder_meta = folder.get_meta();

    //p("delete uuid: ", uuid);
    file_meta = folder_meta.files[uuid];

    // only file get remove, here.
    if(file_meta.what !== myconfig.IamFile){
        return callback('"rm uuid without save folder" can do file ONLY', null);
    }

    filename = file_meta.name;
    //p("name is " + filename);

    return folder.get_file_obj_by_uuid(uuid).then(function(obj) {
        //p('got obj: ', obj);
        return obj.promise_to_delete_s3_storage();
    }).then(function(what) {
        //p('what in "delete uuid": ', what);
        folder.clear_file_meta(uuid);
        folder.build_file_list();
        return callback(null, uuid);
    });
}




module.exports.rm_file_by_uuid = rm_file_by_uuid;



