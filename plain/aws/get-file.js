//
// supposed to make file retrieving checking things here, 0125
//

var assert = require('assert');
var path   = require('path');
var u      = require('underscore');


var folder_module = require("./folder-v5.js");

var p = console.log;


function retrieve_file_by_path_uuid(path_uuid, callback) {
    var folder_path, uuid;
    folder_path = path.dirname(path_uuid);
    uuid = path.basename(path_uuid);

    return folder_module.retrieve_folder(folder_path).then(function(folder_obj) {
        folder_obj.uuid_to_file_obj(uuid, callback);
    }).catch(callback);
}

function get_number_of_file_name(path_, callback){
    // @path_ is full path: user/path/to/file-name.ext

    var dir      = path.dirname (path_);
    var basename = path.basename(path_);

    return folder_module.retrieve_folder(dir).then(function(folder_obj) {
        assert(u.isObject(folder_obj));
        assert(u.isFunction(folder_obj.get_number_of_name));

        var number =  folder_obj.get_number_of_name(basename);
        callback(null, number, folder_obj);
    }).catch(callback);
}

function file_path_exists(path_, callback){
    // @path_ is full path: user/path/to/file-name.ext

    var dir      = path.dirname(path_);
    var basename = path.basename(path_);

    get_number_of_file_name(path_, function(err, number){
        if (err) return callback(err, false);
        if (number > 0) return callback(null, true);
        callback(null, false);
    });
    //return folder_module.retrieve_folder(dir).then(function(folder_obj) {
    //    assert(u.isObject(folder_obj));
    //    ////p(assert(u.isString(folder_obj.version)));
    //    //var meta = folder_obj.get_meta();
    //    //p ('len: ', meta.file_names[basename].length);
    //    ////p ('meta:\n', meta);
    //    //p('number of the name: ',  folder_obj.get_number_of_name(basename) );
    //    var number =  folder_obj.get_number_of_name(basename);
    //    if(number > 0){
    //        callback(null, true);
    //    }else{
    //        callback(null, false);
    //    }
    //});
}


function get_folder_for_file(file_path, callback){
    if (!u.isString(file_path)) return callback('give file path string');

    var name = path.basename(file_path);
    var cwd  = path.dirname (file_path);
    //p('0814 1143 name, cwd: ', name, cwd);
    if(!cwd) return callback('got no cwd, how to get folder?');

    folder_module.retrieve_folder(cwd).then(function(folder){
        //p('retrieve folder, keys: ', u.keys(folder).sort().join(', '));
        //p('folder get file objs is function? ', u.isFunction(folder.get_file_objs));
        //p('--folder path: ', folder.get_meta().path);

        if(!u.isFunction(folder.get_1st_file_obj)) return callback('not a function: get_1st_file_obj');
        return callback(null, folder);
    }).catch(callback);
}


function get_file_objs_by_path(file_path, callback){
    if (!u.isString(file_path)) return callback('give file path string');

    var name = path.basename(file_path);
    var cwd  = path.dirname (file_path);
    //p('0814 1143 name, cwd: ', name, cwd);

    folder_module.retrieve_folder(cwd).then(function(folder){
        //p('retrieve folder, keys: ', u.keys(folder).sort().join(', '));
        //p('folder get file objs is function? ', u.isFunction(folder.get_file_objs));
        //p('--folder path: ', folder.get_meta().path);

        if(!u.isFunction(folder.get_file_objs)) return callback('not a function: get_file_objs');
        p('goint to get file objs for: ', name);
        folder.get_file_objs(name, callback);
    }).catch(callback);
}


function get_1st_file_obj_by_path(file_path, callback){
    var file_name = path.basename(file_path);
    if(!file_name) return callback('got no file name, how to get file?');
    return  get_folder_for_file(file_path, function(err,  folder){
        if(err){
            //p('1031 0219am, in get 1st file obj by path, you got this? ', err);
            return callback(err);
        }

        folder.get_1st_file_obj(file_name, callback);
    });
}


function get_1st_file_obj_with_auxpath_by_path(file_path, callback){
    get_1st_file_obj_by_path(file_path, function(err, file){
        if(err){
            p('1 get 1st file obj with  aux path by path , in get file, got err: ', err);
            return callback(err);
        }

        //var meta = file.get_meta();

        //p('2, go to get aux path, callback way');
        file.callback_file_auxiliary_path(function(err, auxpath){
            if(err) return p('oh err, get 1st file obj with auxpath by path in get-file.js, : ', err);

            //p('got aux path: ', auxpath);
            return callback(null, file);
        });
    });
}


function get_file_obj_with_auxpath_by_pathuuid(path_uuid, callback){
    retrieve_file_by_path_uuid(path_uuid, function(err, file) {
        if(err){
            p('1 get file obj with aux path by path UUID , got err: ', err);
            return callback(err);
        }
        //var meta = file.get_meta();
        //p('2, go to get aux path, callback way');
        file.callback_file_auxiliary_path(function(err, auxpath){
            if(err) return p('oh err, get file obj with auxpath by path UUID in get-file.js, : ', err);

            p('got aux path: ', auxpath);
            return callback(null, file);
        });
    });
}



module.exports.get_number_of_file_name = get_number_of_file_name;
module.exports.file_path_exists = file_path_exists;

module.exports.retrieve_file_by_path_uuid = retrieve_file_by_path_uuid;
module.exports.get_file_by_path_uuid      = retrieve_file_by_path_uuid;

module.exports.get_file_objs_by_path = get_file_objs_by_path;
module.exports.get_1st_file_obj_by_path = get_1st_file_obj_by_path;
module.exports.get_1st_file_obj_with_auxpath_by_path = get_1st_file_obj_with_auxpath_by_path;
module.exports.get_file_obj_with_auxpath_by_pathuuid = get_file_obj_with_auxpath_by_pathuuid;


// -- doing some fast checkings -- //
var ttool = require('../myutils/test-util.js');

function check_get_number_of_file_name(name){
    name = name || 'tmpab/ports.md';
    get_number_of_file_name(name, function(err, num){
        p('err, num:\n', err, num);
        ttool.stop();
    });
}


if(require.main === module){
    //file_path_exists('tmpab/ports.md');
    check_get_number_of_file_name('tmpab/ports.md');
}



