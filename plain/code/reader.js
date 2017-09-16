
/*
 * read codes from file.
 *
 * 2016 0120
 */

var path = require("path");
var u    = require("underscore");


var getter = require("../aws/get-file.js");

var txt    = require("../file-basic/append-txt.js");


var User_code_name = ".after.upload.js";
var Log_file_name  = "code.hook.log";

var p = console.log;



function read(code_file_path, callback){
    getter.get_1st_file_obj_by_path(code_file_path, function(err, code_file){
        if(err) return callback(err);

        code_file.read_to_string(callback);
    });
}


module.exports.read = read;


// -- fast checkings

function chk_load(file_path){
    file_path = file_path || 'abc/tadd/.after.upload.js';

    read(file_path, function(err, code){
        p(err, code);
        process.exit();
    });
}




if(require.main === module){
    chk_load();
}


