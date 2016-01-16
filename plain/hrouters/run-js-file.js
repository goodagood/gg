
var path = require('path');

var folder_module = require("../aws/folder-v5.js");

var p = console.log;

function run_js(abs_path){
    var file_name = path.basename(abs_path);
    var cwd       = path.dirname (abs_path);

    folder_module.retrieve_folder(cwd).then(function(folder){
        return folder.read_text_file(file_name);
    }).then(function(str){
        p('read the file? ', str);
        oeval(str);
    }).catch(function(err){
        p('here, err: ', err);
    });
}


function oeval(str){
    try{
        eval(str);
    }catch(err){
        console.log(err);
    }
}


module.exports.run_js = run_js;


