
/*
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
 * This use req, and check req.body by itself.
 */
function get_field(req, name){
    if(!req.body) return null;

    return get_body_field(req.body, name);
}



module.exports.get_body_field = get_body_field;
module.exports.get_field      = get_field;

