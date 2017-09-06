
var morgan = require('morgan')
var path = require('path');
var util = require('util');

var bucket = require("../aws/bucket.js");
myutil  = require("./myutil.js");

var p = console.log;

//    app.use(morgan('combined'))

//var skipped_logged_morgan = morgan();

/*
 * We use the options.skip, which is an function, to fire our logging.
 * If it has old value, it will be tried to keep on, not asured.
 * req, res is logged by `log2s3` which log it to s3 storage, the s3 key 
 * will be s3prefix, epoch milli-second, uuid
 * as an example: basic-morgan-bypass/123443...123/a813...
 *
 * After setting of options.skip, morgan is return, use it as normal.
 */

function fire2s3(format, options){
    options = options || {};
    var s3prefix;
    if(typeof options.s3prefix !== 'string'){
        s3prefix = 'basic-morgan-bypass';
    }else{
        s3prefix = options.s3prefix;
    }

    var t = Date.now().toString();
    var uuid = myutil.get_uuid();
    //p(1, s3prefix, t, uuid);
    var key = path.join(s3prefix, t, uuid);

    var old_skip;
    if(typeof options.skip === 'function') old_skip = options.skip;

    function skip(req, res){
        //log2s3(req,  res, key);

        if(old_skip) return old_skip(req, res);

        if(typeof req.url === 'string'){
            if(req.url.indexOf('ping.html') >= 0){
                //p('ping.html omitted');
                return true;
            }
        }
        return false;
    }

    options.skip = skip;
    return morgan(format, options);
}

function log2s3(req, res, key){
    var tmp = util.inspect([req, res]);
    bucket.write_text_file(key, tmp
            , function(err, s3reply){
                // in testing
                p('log2s3 ', err, s3reply);

                var afile = require('./mylogb.js').append_file;
                //afile('/tmp/mlog', [req, res]);
            }
    );
}

//module.exports.skipped_logged_morgan = skipped_logged_morgan;
module.exports.fire2s3 = fire2s3;
