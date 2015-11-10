
/*
 * Give a file path uuid, or full path, render a html for the file display.
 *
 * ../unit/u-rvp.js will be the test file.
 */


var fs   = require('fs');
var path = require('path');
var handlebars = require('handlebars');

var folder_module = require("../aws/folder-v5.js");
var vpt = require("./video-player-tpl.js");

var tpl  = require("../myutils/tpl.js");


var p = console.log;


// Constants

var Html_template = path.join(__dirname, "video.html");

/*
 *
 */
function render_video_page_pu(path_uuid, callback){
    folder_module.retrieve_file_meta_pu(path_uuid, function(err, meta){
        var s3key = meta.storage.key;
        var vid_src = path.join('/ss/', s3key);

        console.log('console.log vid src: ', vid_src);

        var video_html = vpt.render_video_element(meta);

        var context = { 
            video_element : video_html,
        };


        tpl.render_template(Html_template, context, callback);
        //callback(null, video_html);
    });
}


var get_file = require("../aws/get-file.js");
/*
 * Given video file full path, give an html render of the video player.
 */
function render_video_page(video_full_path, callback){
    get_file.get_1st_file_obj_with_auxpath_by_path(video_full_path, function(err, file){
        if(err)  return callback(err);

        var meta = file.get_meta();
        render_video_meta_to_web_page(meta, callback);
    });
}


function render_video_meta_to_web_page(meta, callback){
    var video_html = vpt.render_video_element(meta);

    var context = { 
        video_element : video_html,
    };

    tpl.render_template(Html_template, context, callback);
}


module.exports.render_video_meta_to_web_page = render_video_meta_to_web_page;
module.exports.render_video_page_pu = render_video_page_pu;
module.exports.render_video_page    = render_video_page;




//todo
function render_html (context, callback) {
    tpl.render_template(Html_template, context, callback);

    //return fs.readFile(Html_template, 'utf-8', function(err, str){
    //    if(err) return callback(err);

    //    p(str.slice(0, 300));
    //    callback(null,null);
    //});
};


// -- checkings -- //

function c_render_html(){
    render_html({}, function(err, what){
        p(err, what);
        process.exit();
    });
}


/*
 * to give video element <video...> </video>
 */
function c_v_element(fpath){
    fpath = fpath || {};
}


if(require.main === module){
    //p(Html_template);

    c_render_html();
}

