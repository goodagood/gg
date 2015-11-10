
var assert = require('assert');
var u      = require('underscore');


var folder_module = require('./folder-v5.js');


var p     = console.log;
var tutil = require("../myutils/test-util.js");

// filter out what client need, the hash is file meta.
function client_json_filter (meta) {
    assert(meta.name != null);
    assert(meta.path != null);
    assert(meta.uuid != null);

    var err
    var milli = 0;
    // Adjust the 'milli'-seconds
    if (u.isNumber(meta.timestamp)) {
        milli = meta.timestamp;
    } else if(u.isString(meta.timestamp)) {
        try {
            milli = parseInt(meta.timestamp);
        } catch (_error) {
            err = _error;
            milli = 0;
        }
    }

    var value = 0;
    if (meta.value != null) {
        if (meta.value.amount != null) {
            value = meta.value.amount;
        }
    }

    var file_key = null;
    if (meta.storage != null) {
        if (meta.storage.key != null) {
            file_key = meta.storage.key;
        }
    }

    var size = -1;
    if (meta.size != null) {
        size = meta.size;
    }

    var filetype = '';
    if (meta.filetype != null) {
        filetype = meta.filetype;
    }

    var owner = null;
    if(typeof meta.owner === 'string') owner = meta.owner;

    var client_json = {
        name:  meta.name,
        path:  meta.path,
        uuid:  meta.uuid,
        owner: owner,
        path_uuid: meta.path_uuid,
        file_key:  file_key,
        value: value,
        order: 0 - milli,
        milli: milli,
        size:  size,
        filetype: filetype
    };

    if(meta.filetype == 'image'){
        var ij = get_image_file_json(meta);
        u.extend(client_json, ij);
    }

    return client_json;
}


function make_file_info_collection_for_client(file_metas){
    var meta_array = u.map(file_metas, client_json_filter);
    return meta_array;
}


function file_metas_for_client(folder_path, callback){
    assert(typeof folder_path === 'string');

    folder_module.retrieve_folder(folder_path).then(function(folder){

        var meta_list = get_file_list_json(folder);
        callback(null, meta_list);
    });
}


function get_file_list_json(folder){
    // Folder object gets metas of file list, filter out json for client.
    var meta = folder.get_meta();
    var files = meta.files;
    var file_metas = u.values(files);
    //var meta_list = make_file_info_collection_for_client(file_metas);

    var meta_array = u.map(file_metas, client_json_filter);
    return meta_array;

    //p('filterred file metas: \n', meta_list);
    //callback(null, meta_list);
}


function file_meta_for_client(path_uuid, callback){
    folder_module.retrieve_file_meta_pu(path_uuid, function(err, meta){
        if(err) return callback(err, null);

        var j = client_json_filter(meta);
        callback(null, j);
    });
}

// This is to optimise, when we already has folder object.  do this later.
function folder_get_file_meta_for_client(folder, path_uuid){
    // Folder object get file meta for client, 
    // file's path_uuid contain folder path, it's duplicated, anyway.
}

get_image_file_json = function(meta) {

    var thumb_key   = 'who-know?';
    var thumb_width = 100;
    var thumb_height= 100;

    if (meta.thumb.defaults.s3key != null) {
        thumb_key    = meta.thumb.defaults.s3key;
        thumb_width  = meta.thumb.defaults.width;
        thumb_height = meta.thumb.defaults.height;
    }

    var thumbj = {
        thumb_key:    thumb_key,
        thumb_width:  thumb_width,
        thumb_height: thumb_height
    };
    return thumbj
};


module.exports.client_json_filter = client_json_filter;
module.exports.file_metas_for_client = file_metas_for_client;
module.exports.get_file_list_json = get_file_list_json;
module.exports.file_meta_for_client  = file_meta_for_client;



// fast checkings

function get_client_file_jsons(folder_path){
    folder_path = folder_path || 'abc/test';

    var Folder, Meta;
    folder_module.retrieve_folder(folder_path).then(function(folder){
        Folder = folder;
        assert(!u.isNull(folder));

        Meta = Folder.get_meta();
        var files = Meta.files;
        var file_metas = u.values(files);
        //p('file metas: \n', file_metas);
        var fed = u.map(file_metas, client_json_filter);
        p('filterred file metas: \n', fed);


    }).then(function(){
        tutil.stop();
    });
}

function check_filemeta4client(path_uuid){

    if(path_uuid){
        return file_meta_for_client(path_uuid, function(err, _meta){
            p('got meta for client: (err, _meta)\n', err, _meta);
            tutil.stop();
        });
    }


    //var file_path = 'abc/mis.md';
    var file_path = 'abc/imgvid/gc-550-11.jpg';

    folder_module.get_file_uuid(file_path).then(function(uuids){
        p(uuids);
        var uuid = uuids[0];
        return uuid;
    }).then(function(uuid){
        p('uuid: ', uuid);
    }).then(function(){
        folder_module.retrieve_file_meta(file_path, function(err, meta){
            if(err) return p(err);
            //p('got meta of: ', file_path, '\n', meta.length);
            var m0 = meta[0];
            var path_uuid = m0.path_uuid;
            assert(u.isString(path_uuid));
            //p('got meta path uuid 0 of: ', file_path, '\n', m0.path_uuid);

            return file_meta_for_client(path_uuid, function(err, _meta){
                p('got meta for client: (err, _meta)\n', err, _meta);
                tutil.stop();
            });
        });
    }).then(function(){

    }).then(function(){
        
    }).then(function(){
        //tutil.stop();
    });

}

function check_get_file_meta_list_for_client(){
    var folder_path = 'abc/imgvid';

    file_metas_for_client(folder_path, function(err, list){
        p('got meta for client list: (err, list):\n', err, list);
        tutil.stop();
    });
}

if(require.main === module){
    p('fast checkings');

    //get_client_file_jsons();
    //check_filemeta4client();
    check_get_file_meta_list_for_client();
}

