/*
 * Check ./md-with-loc.js
 * 2015 1110
 */

var mdloc = require("./md-with-loc.js");


var p = console.log;

function c_a(){
    var fpath = "intro/public/reason.md";

    mdloc.render_md_with_local_files(fpath, function(err, renderred){
        p('in ca got :');
        p(err, renderred);
        process.exit();
    });
}


if(require.main === module){
    c_a();
}

