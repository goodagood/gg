var fs = require('fs');

var full_the_path = require('./full-path.js');
var getfile = require("../aws/get-file.js");

var Test_file_1   = 'abc/test/s.html';

var p = console.log;


function chk_get_converted(test_file_full_path){
    fpath = test_file_full_path || Test_file_1;

    full_the_path.get_html_converted(fpath, function(err, html){
        if(err){ p('oo, err: ', err); return setTimeout(process.exit, 2000);}

        p('html: ');
        //p('html: ', html);

        fs.writeFile('/tmp/ghc1031.html', html, 'utf-8', function(err, what){
            if(err){ p('oo2, err: ', err); return setTimeout(process.exit, 2000);}
            process.exit();
        });
    });
}


if(require.main === module){
    chk_get_converted();
}


function drop_a_file_into_repl(o, file_path){
    o   = o   || this;
    //file_path =  file_path || 'abc/test/small3.mp4';
    file_path =  file_path || Test_file_1;

    p('going to get the first file obj: ', file_path);
    p('to populate the obj: ', o);
    getfile.get_1st_file_obj_with_auxpath_by_path(file_path, function(err, file){
        if(err) return p('You got err when dropping: ', err);

        var meta = file.get_meta();
        o.file = file;
        o.meta = meta;
        o.mkeys= u.keys(o.meta).sort();
        o.file.read_to_string(function(err, html){
            o.text = html;
        });

        full_the_path.transfer_relative_pathes(o.file, function(err, html){
            if(err) return p(err);

            o.chtml = html;
            p('0145pm object should be populated');
        });

    });
}


/*
 *  Have to check it step by step.
 *  full-path.js:
 *      get_html_converted....
 */
function drop_steps(o, file_path){
    o   = o   || this;
    file_path =  file_path || 'abc/test/small3.mp4';
    full_the_path.get_html_converted(file_path, function(e,r){
    });
}


//var doft = full_the_path; // I really hate the name;
//var o = {}; drop_a_file_into_repl(o, Test_file_1);

// a signal to 'expect'
//console.log("ok start interact:");
