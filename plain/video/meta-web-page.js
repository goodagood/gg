
/*
 * Make a web page, given video file meta.
 * 2015 0920
 */

var fs   = require("fs");
var path = require("path");

var chain= require("../cwd-chain/cwd-chain.js");
var rvp  = require("./render-video-player.js");
var vpt  = require("./video-player-tpl.js"   );

var tdata = require("./tpl-data.js");

var p    = console.log;



//chain.make_cwd_chain(cwd, function(err, chain_tag){});


// fast checkings

function render_sample_data(){
    var meta = require("./sample-meta.js").data;
    //p(meta);

    rvp.render_video_meta_to_web_page(meta, function(err, html){
        if(err){p('err'); p(err); return process.exit();}
        //p(err, html);

        fs.writeFile('/home/za/tmp/v920.html', html, 'utf-8', function(err,r){
            if(err){p('err'); p(err); return process.exit();}
            p('wrote');
            process.exit();
        });
    });
}


var tpl  = require("../myutils/tpl.js");
var Html_template = path.join(__dirname, "video-920.html");


function render_sample_data2(){
    var meta = require("./sample-meta.js").data;

    var context = tdata.data_for_video_js_video_tag(meta);
    p('context'); p(context); 

    // We are going to test it on local,
    //context.poster = 'poster="/home/za/tmp/sun0888.jpg"';
    //context.vid_src= '<source src="/home/za/tmp/sun.mp4" type="video/mp4">';

    var video_tag = vpt.render_video_js_video_tag(context);
    p('video.js <video>:'); p(video_tag);


    var vid_file_info = tdata.make_file_info_tags(tdata.get_file_info(meta));
    chain.make_cwd_chain(meta["dir"], function(err, chain_tag){

        var context_2 = { 
            video_element : video_tag,
            video_file_info: vid_file_info,
            cwd_chain: chain_tag,
        };
        tpl.render_template(Html_template, context_2, function(err, html){
            if(err){p('708, err'); p(err); return process.exit();}
            p(3, err, html);

            //var save_a_file = '/home/za/tmp/v1a.html';
            var save_a_file = '/tmp/v1a.html';
            fs.writeFile(save_a_file, html, 'utf-8', function(err,r){
                if(err){p('.19 err'); p(err); return process.exit();}
                p('wrote');

                process.exit();
            });

        });
    });
}



function meta_data(){

    var meta = require("./sample-meta.js").data;
    //p(meta);

    var tpl_data = tdata.data_for_video_js_video_tag(meta);
    p(tpl_data);
    process.exit();
}


if(require.main === module){
    //render_sample_data();
    render_sample_data2();
    //meta_data();
}
