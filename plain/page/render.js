
/*
 * render handlebar templates
 */

var mutil = require("gg-util");


var reader = require("./sreader.js");

var p = console.log;


function fill_handlebars(relative_file_path, context, callback){
    reader.r2s(relative_file_path, function(err, text){
        if(err) return callback(err);

        mutil.tpl.render_template_str(text, context, callback);
    });
}


exports = module.exports;
exports.fill_handlebars = fill_handlebars;


// fast checkings

function c_r_a(){
    p('c r a');
    reader.set_cwd("/tmp");
    reader.r2s('renderjs', function(err, text){
        p(err, text.slice(0, 300));
    });
}

if(require.main === module){
    c_r_a();
}

