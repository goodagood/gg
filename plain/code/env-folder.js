/*
 * Prepare enviroment, or sandbox, to work in a folder.
 *
 * 2016 0120
 */


var u = require("underscore");

var folder_module = require("../aws/folder-v5.js");


/*
 * the env, the sandbox get:
 *   folder object
 *   ability to get file object
 *   ability to write folder, file and it's meta data in the cwd
 *   ability to do logging
 */
function mk_env(cwd, callback){
    if(!u.isString(cwd)) return callback('cwd not string, in mk env, 2016 0120');
    if( u.isEmpty (cwd)) return callback('cwd empty string, in mk env, 2016 0120');

    var box = {};

    folder_module.retrieve_folder(cwd).then(function(folder){
        box.folder = folder;
        box.ggfile = ggfile;

        box.clog   = console.log;

        callback(null, box);
    }).catch(callback);
}


// suppose we have folder object
function ggfile(name, callback){
    if(typeof folder === 'undefined') return callback('no folder object');

    folder.get_1st_file_obj(file_name, callback);
}


module.exports.mk_env = mk_env;


