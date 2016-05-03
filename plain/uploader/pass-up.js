
/*
 * Get file uploading info, pass it to python by zmq.
 *
    [ 
        { 
            fieldname: 'ofiles',
            originalname: 'h5.html',
            encoding: '7bit',
            mimetype: 'text/html',
            destination: '/tmp/',
            filename: 'f2a4e5f36bc5604193f5cfee38d7213f',
            path: '/tmp/f2a4e5f36bc5604193f5cfee38d7213f',
            size: 1121 
        }
    ]
 *
 *
 * 2016 0427
 */

var u     = require("underscore");
var fs    = require("fs");
var async = require("async");

var asker = require("plain/asker/tasks.js");

var p = console.log;


function pass_upload_infos(reqfiles, username, cwd, callback){
    if(!u.isArray(reqfiles)) return callback('except an array of uploading info');

    async.map(reqfiles, function(file, callback){
        //p('async.map 1, ', file);
        return pass_upload_info(file, username, cwd, callback);
    },
    callback);
}
module.exports.pass_upload_infos = pass_upload_infos;


function pass_upload_info(reqfile, username, cwd, callback){
    if(!reqfile['path']) return callback('can not get info[path] from data');

    reqfile['username'] = username;
    reqfile['cwd'] = cwd;

    var info           = JSON.stringify(reqfile);
    p('before pass to asker file upload, ', info);

    //write to a tmp file is extra action.
    //var info_file_name = reqfile['path'] + '.info.json';
    //fs.writeFile(info_file_name, info, function(err){});

    asker.file_upload(info, callback);
}
