
/*
 * Check "../s3/s3-a.js"
 * 2015 1021
 */


var u     = require("underscore");
var async = require("async");

var s3a = require("../s3/s3-a.js");



var secret = require('../config/secret-dir.js');
//var myconfig = secret.get_my_config();  // this is also ok.

var conf     = secret.conf;
var myconfig = conf.myconfig;
var root_bucket = conf.aws.root_bucket;

var p   = console.log;


function check_get_s3(){
    var s3 = s3a.get_s3_obj();
    p('s3:'); p(s3);
    p('u.keys s3:'); p(u.keys(s3).sort().join(" \t "));
}


var s3a = require('../s3/s3-a.js');
/*
 * This function copied from bucket.js, it's to test s3-a.js working.
 * list objects in the bucket, with the prefix
 */
function list(prefix, callback){

    var params = {
        Bucket : root_bucket,
        //Prefix : 'tmp',
        Prefix : prefix,
    };

    //var s3 = new AWS.S3();
    var s3 = s3a.get_s3_obj();
    s3.listObjects(params, function(err, data) {
        //console.log('---');
        //console.log(data);
        callback(err, data['Contents']);
        /*
         * data['Contents'] is an array like:

           [ { Key: 'tmp/',
               LastModified: Tue Apr 15 2014 08:18:59 GMT+0000 (UTC),
               ETag: '"d41d8cd98f00b204e9800998ecf8427e"',
               Size: 0,
               Owner: [Object],
               StorageClass: 'STANDARD' }, ...... ]

         */
    });
}


function check_list(){
    list('andrew', function(e, s3reply){
        if(e) p(e);
        p(s3reply);
    });
}

function check_list_parallel(){
    var prefix_list = ['andrew', 'abc', 'andrew'];
    async.map(prefix_list, list, function(err, what){
        if(err) p(err);
        p(what);
    });
}


if(require.main === module){
    //p(s3a.aws4s3);
    //p(s3a.aws4s3.config);
    //p(s3a.get_s3_obj);

    //check_get_s3();
    //check_list();

    check_list_parallel();
}
