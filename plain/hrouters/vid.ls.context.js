
/*
 * Give context to ls videos in a folder, for a user name.
 *
 * 2016 0510
 */

var path = require('path');

var u = require("underscore");

var mime = require("mime");

var asker = require("plain/asker/tasks.js");

var p = console.log;

/*
    var context = {
      file_path: file_path,
      file_name: path.basename(file_path),
    };
 */
function ls_vids(username, cwd, callback){
    asker.meta_list(username, cwd, function(err, metas){
        if(err) return callback(err);

        var vids = u.filter(metas, function(m){
            //p('meta path: ', m.path, m.name);
            if(u.isString(m.type)) return m.type.includes('video');

            var guess = mime.lookup(m.name);
            //p('guess: ', guess)
            if(u.isString(guess)) return guess.includes('video');

            return false;
        });

        u.each(vids, function(vmeta){
            if(!vmeta.path) vmeta.path = path.join(cwd, vmeta.name);
        });

        var vtags = u.map(vids, meta_to_vid_tag);
        var html  = vtags.join("\r\n");

        return callback(null, html);
    });
}
module.exports.ls_vids = ls_vids;


/*
 *
   <div class="poster">
      <div class="thumb-wrapper">
         <img src="{thumb_of_video}" alt="{img_alt}" height="160">
         <div class="play-button"></div>
      </div>
      <div class="text">
          <span class="value">value</span>
          <i class="fa fa-tint value-unit"></i>
          <span class="name"> file-name</span>
      </div>
   </div>
 */

function meta_to_vid_tag(meta){
    var file_name = meta.name;

    var file_value = 0;
    if(meta.value) file_value = meta.value;

    var thumb_href;
    if(meta.thumb){
        thumb_href = path.join('/s3key', meta.thumb);
    }else{
        thumb_href = '/static/404.html';
    }

    var video_player_href = '/static/404.html';
    if(meta.first_action){
        video_player_href = meta.first_action;
    }else{
        video_player_href = '/vid/vjs/' + meta.path;
    }


    var vtag = `

       <div class="poster">
          <div class="thumb-wrapper">
              <a href="${video_player_href}" target=_blank class="video-player">
                  <img src="${thumb_href}" alt="${file_name}" height="160">
              </a>
              <span class="play-button"></span>
          </div>
          <div class="text">
              <span class="value">${file_value}</span>
              <i class="fa fa-tint value-unit"></i>
              <span class="name"> ${file_name}</span>
          </div>
       </div>
        `;
    return vtag;
}


if(require.main == module){
    function c_tmp_public(user, cwd){
        user = user || 'tmp';
        cwd  = cwd  || 'tmp/public';

        ls_vids(user, cwd, function(err, html){
            if(err) return p('err: ', err);
            p(html);
            
        });

        setTimeout(process.exit, 5000);
    }

    c_tmp_public();

    var vid_meta = { thumb: '.gg.file.name.space/tmp/7857cd02-b922-48aa-8e7f-564d9a04735e/posters/thumb-0.0h160.png',
        poster: '.gg.file.name.space/tmp/7857cd02-b922-48aa-8e7f-564d9a04735e/posters/0.0.png',
        name: 'dog2014.mp4',
        posters: { '0.0': [Object] },
        type: 'video/mp4',
        size: 32663915,
        path: 'tmp/public/dog2014.mp4' 
    };

    //p(meta_to_vid_tag(vid_meta));
}
