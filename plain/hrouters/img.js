/*
 * Serve images
 * Change from myutils/s3_down_stream.js
 *
 * 2016 0424
 */


var path = require('path');
var u    = require("underscore");

var mime = require('mime');
var gm   = require('gm');

var express = require("express");
var router  = express.Router();

var exists = require("plain/s3/exists.js");
var imgobj = require("plain/s3/file/img.js");

var bucket = require('../aws/bucket.js');



var p = console.log;






/*
 * whp: width height file_path
 * try to make thumb/width/height/path-of-the-image-file
 *
 */
router.get(/^\/whp\/([-0123456789]+)\/([-0123456789]+)\/(.+)/, 
function(req, res, next){
    //console.log(req.params);
    var width  = parseInt(req.params[0]);
    var height = parseInt(req.params[1]);
    if(width < 0) width = null;
    if(height < 0) height = null;

    var file_path = req.params[2];

    var username;
    if(req.user){
        if(req.user.username) username = req.user.username;
    }

    //p('fp w h un: ', file_path, width, height, username);
    if(!file_path) return next('no path for /twhp/w/h/path');

    imgobj.new_obj(file_path, function(err, iobj){
        if(err) return next(err);
        iobj.make_s3key_and_meta_s3key(function(err, meta){
            if(err) return next(err);
            iobj.file_exists(function(err, yes){
                if(err) return next(err);
                if(!yes) return next(`image ${meta.path} not exists`);
                iobj.load();
                iobj.resize(width, height);
                iobj.estimate_image_file_size(function(err, size){
                    if(err) return next(err);
                    var headers = {server: 'goodagood/goodogood tmp server'};
                    headers['Content-Type']   = meta.type || mime.lookup(meta.path);
                    //headers['Content-Length'] = size;
                    res.writeHead(200, headers);

                    iobj.get_img_obj().stream(function(err, stdout, stderr){
                        if(err) return next(err);
                        stdout.pipe(res);
                    });
                });
            });
        });
    });
});


/*
 * whk: width height s3Key
 * try to make thumb/width/height/path-of-the-image-file
 *
 */
router.get(/^\/whk\/([-0123456789]+)\/([-0123456789]+)\/(.+)/, 
function(req, res, next){
    console.log(req.params);
    var width  = parseInt(req.params[0]);
    var height = parseInt(req.params[1]);
    var s3key = req.params[2];

    if(width < 0) width = null;
    if(height < 0) height = null;

    var username;
    if(req.user){
        if(req.user.username) username = req.user.username;
    }

    p('3key w h un: ', s3key, width, height, username);
    if(!s3key) return next('no path for /twhp/w/h/path');

    exists.key_exists(s3key, function(err, yes){
        if(err) return next(err);
        if(!yes) return next('check key exists: ' + s3key);

        var content_type = mime.lookup(s3key) || 'image/jpg';

        var src = bucket.s3_object_read_stream(s3key);
        var img = gm(src, s3key);
            
        img.resize(width, height);
        var headers = {server: 'goodagood/goodogood tmp server'};
        headers['Content-Type']   = content_type;
        //headers['Content-Length'] = size;
        res.writeHead(200, headers);

        img.stream(function(err, stdout, stderr){
            if(err) return next(err);
            stdout.pipe(res);
        });
    });
});


module.exports = router;
//exports.route_img = route_img;


function stream_img(file_path, width, height, callback){
      imgobj.new_obj(file_path, function(err, iobj){
          if(err) return next(err);
          iobj.make_s3key_and_meta_s3key(function(err, meta){
              if(err) return next(err);
              iobj.file_exists(function(err, yes){
                  if(err) return next(err);
                  if(!yes) return next(`image ${meta.path} not exists`);
                  iobj.load();
                  iobj.resize(width, height);
                  iobj.estimate_image_file_size(function(err, size){
                      if(err) return next(err);

                      p('estimated size: ', size);

                      // callback gets: (err, stdout, stderr)
                      return callback(null, iobj.get_img_obj().stream());
                  });
              });
          });
      });

}


/* test */
var fs = require("fs");

function c_i_stream(){
    file_path = 'tmp/public/t.png';
    width  = 256;
    height = 144;
    out_file = '/tmp/ci.png';

    stream_img(file_path, width, height, function(err, stdout, stderr){
        if(err){
            p('2016 0424 8:15pm');
            return p(err);
        }

        p(1, u.keys(stdout));

        write_stream = fs.createWriteStream(out_file);
        stdout.pipe(write_stream);

        setTimeout(process.exit, 5*1000);
    });
}


if (require.main === module){
    c_i_stream();
}



// vim: set et ts=2 sw=2 fdm=indent:
