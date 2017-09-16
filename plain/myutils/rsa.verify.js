

const fs = require("fs");//d

const getter = require("plain/s3/file/getter.js");

const crypto = require('crypto');
//const verify = crypto.createVerify('RSA-SHA256');
//const verify = crypto.createVerify('RSA-SHA1');

var p = console.log;
//verify.update('some data to sign');

function aa(){
    var key_file = '/tmp/gg.private.key';
    var pub_file = '/tmp/gg.public.key';

    var m2 = '1463737143068';
    var h2 = '9b0ffbcb65e7a267c6d26e0a3563df738464dbe8b36f003c432aac9271f50fbdf1f7b86084b99da6f5aa4b19c5d1ac4eb466e23949dbb4657e725d8e1d7676390997170c6b9b3f2891097cb04aca9d9d9e0a7bd76dcfe39419ce76846e4ce78505a9c0aece9ced817b00d50e4b64be92eb104a3396f8b96a370539148efd1d45';

    //const public_key = getPublicKeySomehow();
    //const signature = getSignatureToVerify();

    verify.update(m2);
    var pubkey = fs.readFileSync(pub_file, 'utf-8');
    p(pubkey);
    //console.log(verify.verify(public_key, signature));
    console.log(verify.verify(pubkey, h2, 'hex'));
    // Prints true or false
    //
}


function milli_verify(username, msg, signature, callback){
    const verify = crypto.createVerify('RSA-SHA1');
    verify.update(msg);
    getter.pubkey(username, function(err, pubkey){
        if(err) return callback(err);
        //p(pubkey);

        var v = verify.verify(pubkey, signature, 'hex');

        var lap = Date.now() - parseInt(msg);
        callback(null, [v, lap]);
    });

}
module.exports.milli_verify = milli_verify;


if(require.main === module){
    var m2 = '1463737143068';
    var sig2 = '9b0ffbcb65e7a267c6d26e0a3563df738464dbe8b36f003c432aac9271f50fbdf1f7b86084b99da6f5aa4b19c5d1ac4eb466e23949dbb4657e725d8e1d7676390997170c6b9b3f2891097cb04aca9d9d9e0a7bd76dcfe39419ce76846e4ce78505a9c0aece9ced817b00d50e4b64be92eb104a3396f8b96a370539148efd1d45';
    var username = 'tmp';

    milli_verify(username, m2, sig2, function(err, what){
        p('v: ', err, what);
    });
}

