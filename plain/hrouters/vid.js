/*
 * As webpage of video file.
 *
 * 2016 0430
 */


var path = require('path');
//var u    = require("underscore");

//var mime = require('mime');
//var gm   = require('gm');

var express = require("express");
var router  = express.Router();

//var exists = require("plain/s3/exists.js");
//var imgobj = require("plain/s3/file/img.js");
//
//var bucket = require('../aws/bucket.js');



var p = console.log;






/*
 * plyr: https://github.com/selz/plyr
 * try to make thumb/width/height/path-of-the-image-file
 *
 */
router.get(/^\/plyr\/(.+)/, 
function(req, res, next){
    //console.log(req.params);
    var file_path = req.params[0];
    if(!file_path) return next('no path for /plyr');

    var username;
    if(req.user){
        if(req.user.username) username = req.user.username;
    }

    var context = {file_path: file_path,
      file_name: path.basename(file_path),
    };

    //res.end(`file path: ${file_path}`);//indev
    res.render("plyr.html", context);
});


router.get(/^\/vjs\/(.+)/, 
function(req, res, next){
    //console.log(req.params);
    var file_path = req.params[0];
    if(!file_path) return next('no path for /plyr');

    var username;
    if(req.user){
        if(req.user.username) username = req.user.username;
    }

    var context = {file_path: file_path,
      file_name: path.basename(file_path),
    };

    //res.end(`file path: ${file_path}`);//indev
    res.render("video.js.html", context);
});


//var asker = require("plain/asker/tasks.js");

var vls = require("./vid.ls.context.js");
router.get(/^\/ls\/(.+)/, 
function(req, res, next){
    //console.log(req.params);
    var file_path = req.params[0];
    if(!file_path) return next('no path for /plyr');

    var username;
    if(req.user){
        if(req.user.username) username = req.user.username;
    }

    vls.ls_vids(username, file_path, function(err, thumb_list){
      if(err) return next('list vid (thumb/posters) err: ' + err.toString());

      var context = {file_path: file_path,
        file_name: path.basename(file_path),
        vid_list: thumb_list
      };

      //res.end(`file path: ${file_path}`);//indev
      res.render("video.ls.html", context);
    });

});

module.exports = router;



/* test */
//var fs = require("fs");



if (require.main === module){
}



// vim: set et ts=2 sw=2 fdm=indent:
