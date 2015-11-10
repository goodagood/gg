var myconfig =   require("../config/config.js");

var AWS = require('aws-sdk');
var fs  = require('fs');

/**
 * Don't hard-code your credentials!
 * Export the following environment variables instead:
 *
 * export AWS_ACCESS_KEY_ID='AKID'
 * export AWS_SECRET_ACCESS_KEY='SECRET'
 */

// Set your region for future requests.
//AWS.config.region = 'us-west-2';
AWS.config.region = myconfig.region;

// Create a bucket using bound parameters and put something in it.
// Make sure to change the bucket name from "myBucket" to something unique.
//var s3bucket = new AWS.S3({params: {Bucket: 'ggfsa'}});

//s3bucket.createBucket(function() {
//    var data = {Key: 'myKey', Body: 'Hello!'};
//    s3bucket.putObject(data, function(err, data) {
//        if (err) {
//            console.log("Error uploading data: ", err);
//        } else {
//            console.log("Successfully uploaded data to myBucket/myKey");
//        }
//    });
//});
//

function list_bucket(){
    var s3 = new AWS.S3();
    s3.listBuckets(function(err, data) {
        console.log(data);
        console.log('---');
        for (var index in data.Buckets) {
            var bucket = data.Buckets[index];
            console.log("Bucket: ", bucket.Name, ' : ', bucket.CreationDate);
        }
    });
}


function test_get_object(){
    var s3 = new AWS.S3();
    var params = {Bucket: 'ggfsa', Key: 'abc/Acts_01_00m_00s__00m_30s.mp3'};
    var file = fs.createWriteStream('/tmp/tofile.mp3');
    s3.getObject(params).createReadStream().pipe(file);
}


function test_put_object(){
    //var sample_params = {
    //    Bucket: 'STRING_VALUE', // required
    //    Key: 'STRING_VALUE', // required
    //    ACL: 'private | public-read | public-read-write | authenticated-read | bucket-owner-read | bucket-owner-full-control',
    //    Body: new Buffer('...') || streamObject || 'STRING_VALUE',
    //    CacheControl: 'STRING_VALUE',
    //    ContentDisposition: 'STRING_VALUE',
    //    ContentEncoding: 'STRING_VALUE',
    //    ContentLanguage: 'STRING_VALUE',
    //    ContentLength: 0,
    //    ContentMD5: 'STRING_VALUE',
    //    ContentType: 'STRING_VALUE',
    //    Expires: new Date || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789,
    //    GrantFullControl: 'STRING_VALUE',
    //    GrantRead: 'STRING_VALUE',
    //    GrantReadACP: 'STRING_VALUE',
    //    GrantWriteACP: 'STRING_VALUE',
    //    Metadata: {
    //        someKey: 'STRING_VALUE',
    //        // anotherKey: ...
    //    },
    //    ServerSideEncryption: 'AES256',
    //    StorageClass: 'STANDARD | REDUCED_REDUNDANCY',
    //    WebsiteRedirectLocation: 'STRING_VALUE',
    //};

    var s3 = new AWS.S3();

    var params = {
        Bucket: 'ggfsa',
        Key: 'abc/mxargs.txt',
        Body: fs.createReadStream('/tmp/mxargs.txt')
    };

    s3.putObject(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
    });
}


function stream_down_so(){
    // codes from stackoverflow
    //s3.GetObject(options, { stream : true }, function(err, data) {
    //    res.attachment('test.pdf');
    //    data.Stream.pipe(res);
    //});


    var s3 = new AWS.S3();
    var key = 'abc/Acts_01_00m_00s__00m_30s.mp3';
    var params = {Bucket: 'ggfsa', Key: key};

    // get s3 object, read the stream and pipe it to target stream?
    var file = fs.createWriteStream('/tmp/stream-down-test-a.mp3');
    s3.getObject(params).createReadStream().pipe(file);

}


function test_create_bucket(){
    var s3 = new AWS.S3();
    s3.listBuckets(function(err, data) {
        console.log(data);
        console.log('---');
        for (var index in data.Buckets) {
            var bucket = data.Buckets[index];
            console.log("Bucket: ", bucket.Name, ' : ', bucket.CreationDate);
        }
    });
}


// Create a bucket using bound parameters and put something in it.
// Make sure to change the bucket name from "myBucket" to something unique.
//var s3bucket = new AWS.S3({params: {Bucket: 'ggfsa'}});

//s3bucket.createBucket(function() {
//    var data = {Key: 'myKey', Body: 'Hello!'};
//    s3bucket.putObject(data, function(err, data) {
//        if (err) {
//            console.log("Error uploading data: ", err);
//        } else {
//            console.log("Successfully uploaded data to myBucket/myKey");
//        }
//    });
//});
//


//var fs = require('fs');
//var express = require('express');
//var app = express();
// 
//app.get('/', function (req, res) {
//    res.attachment();
//    fs.createReadStream('test.pdf').pipe(res);
//});
// 
//app.listen(8080);


if (require.main === module){
    //test_get_object();
    //test_put_object();
    stream_down_so();
}
