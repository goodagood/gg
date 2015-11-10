/*
 * Trying to upgrade 'bucket.js'
 * 2014, 12, 30
 */

var myconfig =   require("../config/config.js");
//var meta_file_ext = myconfig.meta_file_ext;

var AWS   = require('aws-sdk');
var fs    = require('fs');
var path  = require('path');
var u     = require('underscore');
var Promise = require('bluebird');
var assert  = require('assert');


var myutil = require('../myutils/myutil.js');


// set up aws region:
AWS.config.region = myconfig.region;
var s3 = new AWS.S3();



var bucket_v1 = require("./bucket.js");

var v1_promised = Promise.promisifyAll(bucket_v1, {suffix : '_promised'});
module.exports.v1          = bucket_v1;
module.exports.v1_promised = v1_promised;



//module.exports.promise_to_delete_object = Promise.promisify(bucket_v1.delete_object);





// -- checkings -- //
var tool = require('../myutils/test-util.js');

function should_promised(){
  assert(u.isFunction(old_promised.delete_object_promised));
  tool.stop();
}



if (require.main === module){
  should_promised();
}

