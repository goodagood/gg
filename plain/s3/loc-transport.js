
/*
 * Transport local file to s3, the loc file got from node.js.
 * 
 * 2016 0327
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
 *
 * @nfile, file uploading hash (req.file) from node.js
 * {
 *         fieldname: 'file_to_upload',
 *         originalname: '9.jpg',
 *         encoding: '7bit',
 *         mimetype: 'image/jpeg',
 *         destination: '/tmp/',
 *         filename: '0367d5c0df013c23067c99052bbc1cef',
 *         path: '/tmp/0367d5c0df013c23067c99052bbc1cef',
 *         size: 52045 
 * }
 *
 * @info: {
        target_folder_path: 't0326y6/public',
        user_name:   't0326y6'
    }
 *
 * 2016 0327
 */
function transport(nfile, info, callback){
    if(!info || !info.user_name || !info.target_folder_path) return callback('lack info');

    var meta = {};

    if(nfile.originalname) meta.name = nfile.originalname;
    if(nfile.size)         meta.size = nfile.size;
    if(nfile.mimetype)     meta.mimetype = nfile.mimetype;
    if(nfile.encoding)     meta.encoding = nfile.encoding;

    meta.path = path.join(info.target_folder_path, meta.name);
    meta.owner = info.user_name;

    ggfile.new_obj(meta.path, function(err, obj){
        p(err, obj);
        obj.extend_meta(meta);
        obj.calculate_meta_defaults(function(err, what){
            var meta = obj.get_meta();
            //p('2, info: ', info);  p('3, nfile: ', nfile); 
            //p('file meta defaults: ', meta);
            //return callback(null, obj); //indev
            bucket.put_one_file(nfile.path, meta.file_s3key, function(err, s3reply){
                if(err) return callback(err);

                // write file info to folder name space
                folder.retrieve_folder(info.target_folder_path, function(err, folder_obj){
                    if(err) return callback(err);

                    var folder_meta = folder_obj.get_meta();
                    p('before intern, folder meta: ', folder_meta);
                    folder_writter.intern_file(folder_obj, obj, callback)
                });
            });
        });
    });
}
module.exports.transport = transport;




// indev checking and testings

var tmp_data = {
        fieldname: 'file_to_upload',
        originalname: '9.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: '/tmp/',
        filename: '0367d5c0df013c23067c99052bbc1cef',
        path: '/tmp/0367d5c0df013c23067c99052bbc1cef',
        size: 52045 
};

/*
iam-tmp-user

t0326y6/public
*/

/*
 * @nfile: what node.js got the file informations.
 * @info: {
 *   target_path
 *   user_name
 * }
 */
function c_loc_transport(nfile, info){
    nfile = nfile || tmp_data;
    info  = info  || {
        target_folder_path: 't0326y6/public',
        user_name:   't0326y6'
    };

    transport(nfile, info, function(err, rep){
        if(err) p(err);
        p(err, rep);
        setTimeout(process.exit, 5000);
    });
}



if(require.main === module){
    c_loc_transport();
}

