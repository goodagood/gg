/*
 * checking if we can write/read s3.
 * 2015 1205
 */

var bucket = require("../aws/bucket.js");

var p = console.log;

var tmpkey = 'test/t1205.01.45pm.json';

function read_json(key){
    key = key || tmpkey;
    //var key = ('.gg.folder.meta', 'jobs');

    bucket.read_file(key, function(err, text){
        p(err); p(text);
        process.exit(p('read jobs meta'));
    });
}



function write_json(key){
    key = key || 'test/t1205.01.45pm.json';

    var j = {
        a: 'i am a',
        b: 'i am b',
    };

    bucket.write_json(key, j,  function(err, what){
        p(err); p(what);
        process.exit(p('write json?'));
    });
}



//p( "ok start interact:");

if(require.main === module){
    read_json();
    //write_json();
}
