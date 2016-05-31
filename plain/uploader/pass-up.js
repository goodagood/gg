
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


/*
 * Parameter: cached, the file info get by previous phases. 
 *   When pass to backend via zmq, it must include:
 *     path, username, cwd
 *     where: cwd is the online folder path to put the file.
 *            path is the local file uploaded from client
 *
 *   It might include:
 *     milli, signature
 *     Where milli is the string of milli-seconds when file uploading.
 *     When 'milli' appears, signature must appear.
 */
function pass_upload_info(cached, username, cwd, callback){
    if(!cached['path']) return callback('can not get info[path] from data');

    cached['username'] = username;
    cached['cwd'] = cwd;

    var info           = JSON.stringify(cached);
    p('before pass to asker file upload, ', info);

    //write to a tmp file is extra action.
    //var info_file_name = cached['path'] + '.info.json';
    //fs.writeFile(info_file_name, info, function(err){});

    asker.file_upload(info, callback);
}
