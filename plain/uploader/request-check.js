/*
 * This is used when uploading without login, with private/public key.
 */  

var u = require("underscore");

var p = console.log;


/*
 * @req is express request object.
 * @callback should give (err, ok, reason_json), where:
 *     ok: true or false,
 *         if the request past check, including hash/signature/ticket.
 *     reason_json: if not ok, give a json of reason.
 */
function check_upload_request(req, callback){
    if(!username_cwd_exists(req)) return callback('no username or cwd');

    var username,
        cwd,
        file_hash,
        signed_file_hash,
        milli_seconds,
        ticket,
        signed_ticket,
        field_signature
        ;

    username         = get_body_field(req.body, 'username');
    cwd              = get_body_field(req.body, 'cwd');
    file_hash        = get_body_field(req.body, 'file_hash');
    signed_file_hash = get_body_field(req.body, 'signed_file_hash');
    milli_seconds    = get_body_field(req.body, 'milli_seconds');
    ticket           = get_body_field(req.body, 'ticket');
    signed_ticket    = get_body_field(req.body, 'signed_ticket');

    field_signature  =  get_body_field(req.body, 'field_signature');

    var to_hash = [
            username,
            cwd,
            file_hash,
            signed_file_hash,
            milli_seconds,
            ticket,
            signed_ticket
        ].join(" ");
    
    //var hash2 = do_hash(to_hash);

    p('in dev, 1024, 0723pm');
    return callback(null, true); //in dev
}


function username_cwd_exists(req){
    p('in checking username cwd exists');
    if(!req.body) return false;

    username = get_body_field(req.body, 'username');
    cwd      = get_body_field(req.body, 'cwd');

    p(1051, username, cwd);
    if( u.isString(username) && username &&  u.isString(cwd) && cwd) return true;

    // currently, let's relax the checking, 2015 1024
    if( username &&  cwd) return true;

    if(!username || !cwd) return false;
    if(u.isNull(username)) return false;
    if(u.isNull(cwd))      return false;

    return false;
}


/*
 * use ./req-body.js get_body_field instead, 2015 1027
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


/*
 * @file is file object pass in by 'multer'.
 */
function check_file_hash(file){
}


module.exports.check_upload_request = check_upload_request;

//module.exports.get_body_field = get_body_field; //moved to req-body.js
