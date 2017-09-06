
/*
 * got a req, res from /tmp/mlog
 */

var fs = require('fs');

var assert = require("assert");
var u = require("underscore");
var async = require("async");
var path = require("path");

var p = console.log;

//-- dropping to REPL --//
function drop_into_repl(o, dir){
    // drop variable/objects into REPL, o is the object to save variables
    o   = o   || {};
    var file_path = "/home/ubuntu/tmp/mlog";

    fs.readFile(file_path, 'utf-8', function(err, text){
        p(err, text.slice(0, 200));

        var j = JSON.parse(text, function(k,v){
            p(k,v);
        });
        //p(u.keys(j));
    });
}

if(require.main === module){
    drop_into_repl();
}

// dog-02 has id: 46
//var o = {}; drop_into_repl(o, '46/public'); o.shorts;
//var o = {}; drop_into_repl(o, 'abc/add-2/img2'); o.shorts;


// a signal to 'expect'
console.log("ok start interact:");
