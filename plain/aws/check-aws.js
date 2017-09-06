/*
 * check-basics of aws access
 */

var myconfig =   require("../config/config.js");

var AWS = require('aws-sdk');


// need to test after myconfig --> secrets, 2015 1028
var secrets = require("../config/secret-dir.js");

var aws_conf   =  secrets.conf.aws;
var aws_keys   =  aws_conf.keys;
var aws_region =  aws_conf.region;


// set up aws region:
AWS.config.region = aws_region;

// after aws force me to delete root access key and secret access key.
// updated 0407, this is for aws user: s3-worker-a
AWS.config.update(aws_keys);

var s3 = new AWS.S3();

var root_bucket = aws_conf.root_bucket;


var bucket = require("./bucket.js");

var p = console.log; 
function check_list(){
  bucket.list('abc/goodagood', function(err, what){
    p(err, what);
    process.exit();
  });
}


if (require.main === module){
  check_list();
}

// vim: set et ts=2 sw=2 fdm=indent:
