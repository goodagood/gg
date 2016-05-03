/*
 * Redo for new folder/file meta structure, 2016 0326.
 *
 * Uploading without web ui log in, easy to be used with command line.
 *
 * 'multer' is used to deal the file field.
 *
 * file hash are signed with user's private key,  the public key is saved in:
 *     user-home/goodagood/pub.pem
 *
 * All field names should be ok for command line (curl),
 * not '-'(dash) but '_'(underline) as word seperator:
 *
 *     file_to_upload
 *     file_hash
 *     signed_file_hash
 *
 * other fields:
 *
 *     milli_seconds
 *     cwd
 *     username
 *     hash_of_above: hash of [file_hash, milli.., cwd, username].join(" ")
 *     signed_hash
 *
 *     ticket:
 *         The id/number string, which should be applied before, for the file.
 *     signed_ticket: use private key to sign the ticket.
 *
 *     # should we complex it now?
 *
 *
 * 2015 1024
 *
 */


var fs     = require("fs");
var crypto = require("crypto");

var req_chk = require("./request-check.js");
var myparse   = require('../aws/parse.js');

var p = console.log;

//var transporter = require("../s3/loc-transport.js");
var passer = require("plain/uploader/pass-up.js");
function work_request(req, callback){
    req_chk.check_upload_request(req, function(err, ok, reason_json){
        if(err) return callback(err);

        ////indev
        //return rm_tmp_file(req, function(err, what){ callback(null, {testing: true}); });

        if(ok){
            p('0328 4:57, it is ok');
            var username = get_body_field(req.body, 'username');
            var cwd = get_body_field(req.body, 'cwd');
            if(!username || !cwd) return callback('not enough info, 0328 4:16am');

            p('ok, run to transport, ', req.file, "\r\nreq body:", req.body, username, cwd);
            //return transporter.transport(req.file, info, callback);

            return passer.pass_upload_infos([req.file], username, cwd, callback);

        }

        if(reason_json) return callback(reason_json);

        return callback('failed to make sure the file can be uploaded.');
    });
}


/*
 * moved to './check-req.js'
 *
 * @body is req.body from express.js with 'multer' middleware.
 */
function get_body_field(body, name){
    if(!body) return null;
    if(!name) return null;
    if(body[name]){
        return body[name];
    }
    return null;
}


function prep_info(req_body){
    var info = {};
    
    info['target_folder_path'] = get_body_field(req_body, 'cwd');
    info['user_name'] = get_body_field(req_body, 'username');

    return info;
}


/*
 * hash the input text.
 */
function do_hash(text, algorithm, input_encoding, digest_encoding){
    if(!text) return null;

    algorithm       = algorithm       || 'sha256';
    input_encoding  = input_encoding  || 'utf8';
    digest_encoding = digest_encoding || 'base64';


    var hash = crypto.createHash(algorithm);
    hash.update(text, input_encoding);

    var dig = hash.digest(digest_encoding);
    return dig;
}


function decrypt(secret, username){
}


/*
 * To remove the saved file after file uploading.
 * pass out results instead of fs.unlink.
 */
function rm_tmp_file(req, callback, results){
    results = results || {};
    callback = callback || function(){};

    p('rm upload tmp');
    p(req.file);

    //fs.unlink(req.file.path, callback);
    fs.unlink(req.file.path, function(err, fs_reply){
        if(!err) return callback(null, results);

        callback(err, fs_reply);
    });
}

module.exports.work_request = work_request;

