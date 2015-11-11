var path     = require('path');

var fm_v5    = require('../aws/folder-v5.js');

var get_file = require("../aws/get-file.js");


var md_render = require("./md-render.js");
var htpl      = require("./htpl.js"); // template for markdown
var convert_path_in_html = require("./html-path.js");


var p = console.log;


/*
 * Given markdown file path, read the file, render it, convert relative path.
 */
function render_md_with_local_files(file_path, callback){
    console.log("In r m w l f , 2015 1110 ", file_path );
    var cwd = path.dirname(file_path);
    if(!cwd) return callback('can not get cwd, 2015 1110, md with loc, render md with local file.');

    get_file.get_1st_file_obj_with_auxpath_by_path(file_path, function(err, file_obj){
        if(err) return callback('err 1, in g f f o w ap b p" ' + file_path);
        //console.log('get file obj in view text', file_obj.get_meta());

        file_obj.read_to_string(function(err, txt){
            if(err) return callback(err);
            if(!txt) return callback('not text?');

            //console.log('--  text', txt); 

            md_render.md_to_html(txt, function(err, renderred){
                if(err) return callback(err);
                var context = {
                    html_of_markdown : renderred,
                };
                htpl.fill_in_markdown('mdhtml.html', context, function(err, webpage){
                    if(err) return callback(err);
                    //return callback(null, webpage); //indev
                    try{
                        var html = convert_path_in_html.transfer_html(webpage, cwd, '/file/get/');
                        callback(null, html);
                    }catch(err){return callback(err);}
                });
            });
        });

    });
}


module.exports.render_md_with_local_files = render_md_with_local_files;
