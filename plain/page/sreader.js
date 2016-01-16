
/*
 * For easy to use template, strings
 *
 * A lot things can make it complex:
 * callback recursing, variable names
 *
 * 2016 0113
 */

var fs   = require("fs");
var path = require("path");


var p    = console.log;
var _cwd = __dirname;


function r2s(fpath, callback){
    //p('cwd in r2s: ', _cwd);
    var abs_file_path = path.join(_cwd, fpath);
    fs.readFile(abs_file_path, {'encoding':'utf-8'}, callback);
}


function set_cwd(dir){
    _cwd = dir;
}


exports = module.exports;

exports.r2s     = r2s;
exports.set_cwd = set_cwd;



// -- fast checkings

if(require.main === module){
    p(_cwd);
}
