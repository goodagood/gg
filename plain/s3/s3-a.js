/*
 * Moved back from 'gg-credentials/aws-s3-conf.js'
 *
 * The 's3-a.js' means the first attempt, number a: '-a'
 * 2015 1021
 */


var AWS = require('aws-sdk');  //d

//var secrets  =  require("gg-credentials");

var secrets  =  require("../config/secret-dir.js");
var aws_conf =  secrets.conf.aws;

var aws_keys =  aws_conf.keys;
var aws_region =  aws_conf.region;

var root_bucket = aws_conf.root_bucket;


// set up aws region:
AWS.config.region = aws_region;

/*
 * after aws force me to delete root access key and secret access key.
 * updated 0407, this is for aws user: s3-worker-a, to access s3.
 *
 * The key is this format:
 * {
 *   accessKeyId: 'string of the accessKeyId',
 *   secretAccessKey: 'string of the secretAccessKey'
 * }
 */
AWS.config.update(aws_keys);


/*
 * Should we reuse the s3 object?
 * 2015 1021
 */
var s3;
function get_s3_obj(){
    if(s3){
        return s3;
    }else{
        s3 = new AWS.S3();
        return s3;
    }
}

module.exports.aws4s3 = AWS;
module.exports.get_s3_obj = get_s3_obj;

module.exports.root_bucket = root_bucket;


// to use:
//
// var aws = require(".../path/to/this/file/name.extension:/aws-s3-conf.js");
//
// var s3 = new aws.aws4s3.S3();
