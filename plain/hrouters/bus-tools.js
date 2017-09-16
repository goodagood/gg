// let py check it ? 2016 0521
const u = require('underscore');


/*
 * Names might be in fields:
 *   username
 *   cwd
 *   milli
 *   signature
 */
function check_needed(fields, needed, milli_limit){
    milli_limit = milli_limit || 2 * 60 * 60 * 1000; // 2 hours

    var ok = true;
    if(needed){
        if(!u.isArray(needed)) return false;
        needed.forEach(function(ele, ind){
            if(!u.has(fields, ele)) ok = false;
        });
        if(!ok) return false;
    }

}


function verify_mili(fields, callback){
    if(u.has(fields, 'milli')){
        var res;
        res = milli_signature_checking(fields);
        if(!u.isArray(res)) return false;
        if(res.length != 2) return false;
        // [verify ok, milli seconds difference]
        if(!res[0]) return false; // signature not verified
        if(res[1] > milli_limit) return false;
    }
}


var verifier = require("plain/myutils/rsa.verify.js");
/*
 * return [true, milli_lapse] if verified ok.
 */
function milli_signature_checking(fields, callback){

    if(!u.has(fields, 'signature')) return callback('no signature');
    if(!u.has(fields, 'username'))  return callback('no username');
    verifier.milli_verify(fields.username,
            fields.milli,
            fields.signature,
            callback);
}
