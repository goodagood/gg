// need test, 2015 1111

// Listing Large S3 Buckets with the AWS SDK for Node.js
// By Reason May 24th, 2015 Permalink
// https://www.exratione.com/2015/05/listing-large-s3-buckets-with-the-aws-sdk-for-node-js/

// A number of posts here exist because I don't like redoing the same small
// piece of functionality over and again. When you're out there consulting you
// don't take the inevitable swathes of glue code with you when you leave, and
// you don't tend to have access to it down the line. There is always some
// commonplace implementation detail for an API or a third party package that
// you will forget to take notes on or fail to recreate for your own toolkit at
// the time - and you only realize a year later when you find yourself having
// to spend a few hours reworking from scratch the same small annoying
// functions and rediscovering the same small annoying pitfalls. Wait, didn't I
// do this last year? Or was it the year before?

// Listing very large numbers of files in S3 buckets via the AWS SDK is one of
// these items in my case. I've neglected to set up my own reference
// implementation at least twice in the past few years, and that's time spent
// on a trivial thing that I'm never getting back. The main point of contention
// here is that for large sets of S3 keys you have to page over multiple API
// calls, and the SDK documentation, while complete, is not as clear as it
// might be on that topic. Hence this post, in which you'll find the
// implementation below that uses the Javascript AWS SDK.

//var AWS = require('aws-sdk');
var _ = require('underscore');

// Create an S3 client.
//
// This will pick up the default credentials you have set up, such as
// via a credentials file in the standard location, or environment
// variables. See:
// http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html
// var s3Client = new AWS.S3();

var s3a = require("../s3/s3-a.js");
var s3Client = s3a.get_s3_obj();


// How many keys to retrieve with a single request to the S3 API.
// Larger key sets require paging and multiple calls. 1000 is a 
// sensible value for near all uses.
var maxKeys = 1000;

/**
 * List keys from the specified bucket.
 * 
 * If providing a prefix, only keys matching the prefix will be returned.
 *
 * If providing a delimiter, then a set of distinct path segments will be
 * returned from the keys to be listed. This is a way of listing "folders"
 * present given the keys that are there.
 *
 * @param {Object} options
 * @param {String} options.bucket - The bucket name.
 * @param {String} [options.prefix] - If set only return keys beginning with
 *   the prefix value.
 * @param {String} [options.delimiter] - If set return a list of distinct
 *   folders based on splitting keys by the delimiter.
 * @param {Function} callback - Callback of the form function (error, string[]).
 */
function listKeys (options, callback) {
    var keys = [];

    /**
     * Recursively list keys.
     *
     * @param {String|undefined} marker - A value provided by the S3 API
     *   to enable paging of large lists of keys. The result set requested
     *   starts from the marker. If not provided, then the list starts
     *   from the first key.
     */
    function listKeysRecusively (marker) {
        options.marker = marker;

        listKeyPage(options, function (error, nextMarker, keyset) {
            if (error) {
                return callback(error, keys);
            }

            keys = keys.concat(keyset);

            if (nextMarker) {
                listKeysRecusively(nextMarker);
            } else {
                callback(null, keys);
            }
        });
    }

    // Start the recursive listing at the beginning, with no marker.
    listKeysRecusively();
}

/**
 * List one page of a set of keys from the specified bucket.
 * 
 * If providing a prefix, only keys matching the prefix will be returned.
 *
 * If providing a delimiter, then a set of distinct path segments will be
 * returned from the keys to be listed. This is a way of listing "folders"
 * present given the keys that are there.
 *
 * If providing a marker, list a page of keys starting from the marker
 * position. Otherwise return the first page of keys.
 *
 * @param {Object} options
 * @param {String} options.bucket - The bucket name.
 * @param {String} [options.prefix] - If set only return keys beginning with
 *   the prefix value.
 * @param {String} [options.delimiter] - If set return a list of distinct
 *   folders based on splitting keys by the delimiter.
 * @param {String} [options.marker] - If set the list only a paged set of keys
 *   starting from the marker.
 * @param {Function} callback - Callback of the form 
 function (error, nextMarker, keys).
 */
function listKeyPage (options, callback) {
    var params = {
        Bucket : options.bucket,
        Delimiter: options.delimiter,
        Marker : options.marker,
        MaxKeys : maxKeys,
        Prefix : options.prefix
    };

    s3Client.listObjects(params, function (error, response) {
        if (error) {
            return callback(error);
        } else if (response.err) {
            return callback(new Error(response.err));
        }

        // Convert the results into an array of key strings, or
        // common prefixes if we're using a delimiter.
        var keys;
        if (options.delimiter) {
            // Note that if you set MaxKeys to 1 you can see some interesting
            // behavior in which the first response has no response.CommonPrefix
            // values, and so we have to skip over that and move on to the 
            // next page.
            keys = _.map(response.CommonPrefixes, function (item) {
                return item.Prefix;
            });
        } else {
            keys = _.map(response.Contents, function (item) {
                return item.Key;
            });
        }

        // Check to see if there are yet more keys to be obtained, and if so
        // return the marker for use in the next request.
        var nextMarker;
        if (response.IsTruncated) {
            if (options.delimiter) {
                // If specifying a delimiter, the response.NextMarker field exists.
                nextMarker = response.NextMarker;
            } else {
                // For normal listing, there is no response.NextMarker
                // and we must use the last key instead.
                nextMarker = keys[keys.length - 1];
            }
        }

        callback(null, nextMarker, keys);
    });
}

// Two Functions in One Endpoint


/*
 *
listKeys({
    bucket: 'myBucket',
    prefix: 'myKey/'
}, function (error, keys) {
    if (error) {
        return console.error(error);
    }
    _.each(keys, function (key) {
        console.log(key);
    });
});
 *
 */

// myKey/alpha/1
// myKey/alpha/2
// myKey/beta/1
// myKey/gamma/1

// The other function is analogous to listing folders at a given depth in a
// file system, but over a set of keys. Given a delimiter, such as "/", used to
// split up keys into path segments, find the set of distinct path segments
// immediately following the provided prefix. This is easier to show by example
// than to describe. For the set of keys shown above, listing the first set of
// "folders" following the prefix runs as follows:

/*
 *
listKeys({
    bucket: 'myBucket',
    delimiter: '/',
    prefix: 'myKey/'
}, function (error, folders) {
    if (error) {
        return console.error(error);
    }
    _.each(folders, function (folder) {
        console.log(folder);
    });
});
 *
 */

// myKey/alpha/
// myKey/beta/
// myKey/gamma/

