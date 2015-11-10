
/*
 * Prepare data for video tags, the 1st function is for <video> of video.js.
 * 2015 0920
 */

var path = require("path");
var u    = require("underscore");


var tags = require("./tags.js");

var p = console.log;


// need refactorring, 0920
function data_for_video_js_video_tag(meta) {
    var data, first, poster, poster_url, s3key, vid_src;

    s3key = meta.storage.key;
    vid_src = path.join('/file-full-path/', meta.path);
    data = {
        width: 'width="640"',
        height: 'height="264"',
        poster: 'poster="wher/the/video/poster/can-be/get"',
        vid_src: '<source src="the source of the video" type="video/mp4">',
        more_vid_src: ''
    };
    if (meta.posters) {
        poster = null;
        if (meta.posters.defaults) {
            poster = meta.posters.defaults;
        } else {
            first = u.values(meta.posters)[0];
            poster = first;
        }
        poster_url = path.join('/ss', poster);
        data.poster = "poster=\"" + poster_url + "\" ";
    }
    if (vid_src != null) {
        if (meta.type != null) {
            data.vid_src = "<source src=\"" + vid_src + "\" type=\"" + meta.type + "\">";
        }
    }
    //p("data: ", data);
    return data;
}


function get_file_info(meta){
    var info = u.pick(meta, 'name', 'owner', 'size', 'type' );

    if(meta.value){
        info.value = meta.value.amount.toString() + " " + meta.value.unit;
    }else{
        info.value = "0 GG";
    }

    return info;
}


function make_file_info_tags(info){
    var keys = u.keys(info);

    var lis = u.map(keys, function(key){
        return tags.kv_li(key, info[key]);
    });

    var li_str = lis.join("\n\n");

    var html   = "<ul>\n" + li_str + "\n</ul>";
    return html
}


module.exports.data_for_video_js_video_tag = data_for_video_js_video_tag;
module.exports.get_file_info = get_file_info;
module.exports.make_file_info_tags = make_file_info_tags;


