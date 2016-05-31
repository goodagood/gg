/*
 * As webpage of video file.
 *
 * 2016 0430
 */


var path = require('path');
var util = require('util');
//var u    = require("underscore");

//var mime = require('mime');
//var gm   = require('gm');

var express = require("express");
var router  = express.Router();


var myutil = require("plain/myutils/myutil.js");

var p = console.log;






/*
 *
 */
router.get(/^\/bare-single\/(.+)/, function(req, res, next){
    //console.log(req.params);
    var cwd = req.params[0];
    if(!cwd) return next('no path for /bare-single (file uploading)');

    var username;
    if(req.user){
        if(req.user.username) username = req.user.username;
    }

    var chain = myutil.path_chain(cwd, '/ls');
    var context = {cwd_chain: chain, cwd: cwd };

    //res.end(`file path: ${cwd}`);//indev
    res.render("up-b-s.html", context);
});


/*
 * The form using multiple
 */
router.get(/^\/bare-multiple\/(.+)/, function(req, res, next){
    //console.log(req.params);
    var cwd = req.params[0];
    if(!cwd) return next('no path for /bare-single (file uploading)');

    var username;
    if(req.user){
        if(req.user.username) username = req.user.username;
    }

    var chain = myutil.path_chain(cwd, '/ls');
    var context = {cwd_chain: chain, cwd: cwd };

    //res.end(`file path: ${cwd}`);//indev
    res.render("up-b-m.html", context);
});


var passer = require("plain/uploader/pass-up.js");
var bus = require("plain/uploader/tmp-bus.js");
var tmp_bus = bus.setup({});
// better to put command line uploading later. 2016 0523
router.post("/up/", function(req, res){
  // <!-- This COST me a lot time:  enctype="multipart/form-data"  --> 

  var username;
  if(req.user) username = req.user.username; 
  p('-- /upload post /up, username: ', username, req.body);
  if(!username) return next('no user name found'); //!


  tmp_bus(req, function(err, files){
    if(err) return next(err);
    var fields = req.busboy['fields'];
    p(util.inspect(req.busboy, {depth: 5}));

    var cwd   = fields.cwd;
    var infos = files.map( f => {
      f.cwd = cwd;
      f.destination = cwd;
      f.username = username;
      return f;
    });

    passer.pass_upload_infos(infos, username, cwd, function(err, results){
        if(err) return next(err);

        if(fields['return']){
          var ret = fields['return'];
          if(ret !== '0' && ret) return res.redirect(ret);
        }
        res.json({'sucess': true});
    });
  });
});


// post single file


module.exports = router;



/* test */
//var fs = require("fs");



if (require.main === module){
}



// vim: set et ts=2 sw=2 fdm=indent:
