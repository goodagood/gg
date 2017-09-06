
/*
 * Check the hash of uploaded file.
 */

var hash_files = require("hash-files");


var Algorithm  = 'sha256';

/*
 * @file: req.file get from middle 'multer'
 */
function get_hash(file, callback){
    hash_files(
            {
                file:      [file.path],
                algorithm: Algorithm
            },
            callback
    );
}


function check_file_hash(req, callback){
    if(!req.body) return callback('no req body');

    var signed_hash = body.get_field(req, 'signed_hash');
    if(!signed_hash) return callback('no signed_hash');

}


function get_file_hash(req, callback){
    p(req.file);
}


