/*
 * Check ./md-with-loc.js
 * 2015 1110
 */

var mdloc = require("./md-with-loc.js");

var fs = require("fs");


var p = console.log;


function c_a(){
    //var fpath = "intro/public/reason.md";
    var fpath = "intro/public/test10.md";

    mdloc.render_md_with_local_files(fpath, function(err, renderred){
        p('in ca got :');
        p(err, renderred);
        fs.writeFile('/tmp/mdr.html', renderred, 'utf-8', function(err){
            p(err);
            process.exit();
        });
    });
}


if(require.main === module){
    c_a();
}

