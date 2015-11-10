// 
// to make video file checking easy.
// 2015, 0814
//

var assert = require("assert");
var u = require("underscore");
var async = require("async");
var path = require("path");
var Promise = require("bluebird");

var folder_module = require("../aws/folder-v5.js");
var get_file      = require("../aws/get-file.js");

var myconfig =   require("../config/config.js");
var config = require("../test/config.js");

var bucket = require("../aws/bucket.js");

var folder_path = 'abc';
var user_name = 'abc';
var gg_folder_name = 'goodagood';
var new_folder_name = 'test';


var fs = require('fs');
var tb = require("../video/thumbnail.js");

var p = console.log;
var stop = process.exit;








var tag4videojs = require("../video/vjs-tag.js");

var rvp = require("../video/render-video-player.js");


// check with an small mp4 video file
function video_tag(){
    var file_path = 'abc/test/small3.mp4';

    get_file.get_1st_file_obj_by_path(file_path, function(err, file){
        if(err){
            p(' ----- video tag got err: ', err);
            return process.exit();
        }

        var m = file.get_meta();
        var fp = m.path;
        var pu = m.path_uuid;

        //p('meta path: ', m.path);
        p('0822 meta path: ', fp);
        //p('meta path uuid: ', m.path_uuid);
        p('0822 meta path uuid: ', pu);

        tag4videojs.render_video_tag(fp, function(err, html){
            p(' -- 0819 you  got: ', err, html.slice(0,300));
            process.exit();
        });

    });
}





if(require.main === module){
    video_tag();
}



//-- dropping to REPL --//

// helpers in checking
function pick_file_attr(folder_meta, attr_name){
    attr_name = attr_name || 'path';

    var ofiles = u.values(folder_meta.files);  
    var oattrs = ofiles.map(function(file_meta){return file_meta[attr_name]});

    return oattrs;
}



function drop_a_video_file_into_repl(o, file_path){
    o   = o   || this;
    file_path =  file_path || 'abc/test/small3.mp4';

    get_file.get_1st_file_obj_with_auxpath_by_path(file_path, function(err, file){
        if(err) return p('You got err when dropping: ', err);

        var meta = file.get_meta();
        o.file = file;
        o.meta = meta;

        o.tb   = tb;

        p('object should be populated');
    });
}


//var o = {}; drop_a_video_file_into_repl(o);


// a signal to 'expect'
//console.log("ok start interact:");
