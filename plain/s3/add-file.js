
/*
 * Add file to folder.
 * 
 * folder name space/files/name -- json obj
 *
 * 2016 0313
 */

var path = require("path");
var fs   = require("fs");

var mime = require("mime");

var bucket   = require('../aws/bucket.js');
var ggfile   = require('./ggfile.js');
var folder   = require('./folder.js');
var folder_auth    = require('./folder-auth.js');
var folder_writter = require('./folder-writter.js');


const p = console.log;


/*
 * @loc_path: full path of the local file, including file name and extension.
 * @target_folder_path: the path of the folder where file is going to put in.
 *
 * 2016 0315
 */
function add_local_file(loc_path, target_folder_path, callback){
    var name = path.basename(loc_path);
    var target_file_path = path.join(target_folder_path, name);

    var info = {
        path: target_file_path,
    };

    loc_file_info(loc_path, function(err, linfo){
        if(err) return callback(err);
        u.defaults(info, linfo);

        ggfile.new_obj(info.path, function(err, obj){
            //p(err, obj);
            obj.calculate_meta_defaults(function(err, what){
                var meta = obj.get_meta();
                p('file meta defaults: ', meta);
                bucket.put_one_file(loc_path, meta.file_s3key, function(err, s3reply){
                    if(err) return callback(err);

                    // write file info to folder name space
                    folder.retrieve_folder(target_folder_path, function(err, folder_obj){
                        if(err) return callback(err);

                        var folder_meta = folder_obj.get_meta();
                        p('before intern, folder meta: ', folder_meta);
                        folder_writter.intern_file(folder_obj, obj, callback)
                    });
                });
            });
        });
    });
}
module.exports.add_local_file = add_local_file;



var mmm = require('mmmagic'),
    Magic = mmm.Magic;

var magic = new Magic(mmm.MAGIC_MIME_TYPE | mmm.MAGIC_MIME_ENCODING);

function loc_file_info(file_path, callback){
    var info = {};

    info.name = path.basename(file_path);
    info.guess_mime = mime.lookup(file_path);

    magic.detectFile(file_path, function(err, m3) {
        if(err) return callback(err);
        info.mime = m3;

        fs.stat(file_path, function(err, stat){
            if(err) return callback(err);
            info.size = stat.size;
            info.ctime = stat.ctime;
            //p('stat: ', stat, "\r\ninfo:", info);
            callback(null, info);
        });
    });
}
module.exports.loc_file_info = loc_file_info;





///*
// * ?
// * @folder: object
// * @file:   object
// */
//function folder_add_file(folder, file, callback){
//    var username = file.get_owner();
//    folder_auth.can_write(username, folder, function(err, yes){
//        if (err) return callback(err);
//
//        var folder_meta = folder.get_meta();
//        var folder_path = folder_meta['path'];
//        if(!yes) return callback(`${username} tried to add file without auth inside ${folder_path}`);
//
//        var file_meta = file.get_meta();
//
//        var keys = ['name', 'size', 'owner', 'filetype', 'permission', 'timestamp'];
//        var required_meta = u.pick(file_meta, required_meta);
//        // add to folder name space
//        // optionally update folder representation
//    });
//}
