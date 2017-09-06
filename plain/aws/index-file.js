

var u       = require("underscore");
var path    = require("path");

//var user_module   = require("../users/a.js");
var folder_module = require("./folder-v5.js");

var p = console.log;

var Index_file_name = 'index.html';

function find_index_file_in_folder(cwd, callback){
    folder_module.retrieve_folder(cwd).then(function(folder){
        var metas = folder.name_to_metas(Index_file_name);

        //p(metas);
        if(metas.length > 0){
            return folder.uuid_to_file_obj(metas[0].uuid, callback);
            //return callback(null, uuids[0]);
        }else{
            return callback('no file found: ' + Index_file_name);
        }
    }).catch(function(err){
        p('err in retrieve folder in find index file in folder: ', err);
        return callback(err);
    });
}


function read_folder_index_file_to_string(parameters, callback){
    var cwd = parameters.cwd;

    find_index_file_in_folder(cwd, function(err, file){
        if(err) return callback(err, null);

        file.read_to_string(callback);
    });
}


module.exports.read_folder_index_file_to_string = read_folder_index_file_to_string;


//-- checkings
function stop(){ setTimeout(process.exit, 500); }

function chk_index(cwd){
    cwd = cwd || 'abc/add-2';

    find_index_file_in_folder(cwd, function(err, file){
        file.read_to_string(function(err, str){
            p(err, str);
            stop();
        });
    });
}

if(require.main === module){
    chk_index();
}
