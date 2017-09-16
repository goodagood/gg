/*
 * Adding value-ing to the system itself.
 *
 * 2017 0505
 *
 * del 0902
 */


var express = require("express");
var router  = express.Router();

const render = require('./render.js');


//var path = require('path');
//var u    = require("underscore");

//var mime = require('mime');
//var gm   = require('gm');

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
router.get('/a', 
function(req, res, next){
    //console.log(req.params);

    var username;
    if(req.user){
        if(req.user.username) username = req.user.username;
    }

    var context = {
      title: 'testing sys value /a 2017 0505',
      //file_path: file_path,
      //file_name: path.basename(file_path),
    };

    //res.render("plyr.html", context);
    res.end('testing the sys value a page, 2017 0505');
});


router.get('/add', function(req, res, next){
    //console.log(req.params);

    //var username;
    //if(req.user){
    //    if(req.user.username) username = req.user.username;
    //}

    var context = {
      title: 'testing sys value /a 2017 0505',
      //file_path: file_path,
      //file_name: path.basename(file_path),
    };
    p(context);


    render.render_file('simple.pug', context, function(err, html){
      if(err) return next(err);
      res.end(html);
    });

    //p('33, dirname: ', __dirname);
    //res.end("testing");
});



const dbvalue = require("plain/dbs/value.js");
router.post('/add', function(req, res, next){
    console.log(req.body);

    dbvalue.insert_one(req.body, function(err, what){
      //p(what, err);
      res.redirect("");
    });

});


//const J = require('JSON');
router.get('/list', function(req, res, next){

    //var username;
    //if(req.user){
    //    if(req.user.username) username = req.user.username;
    //}


    dbvalue.find({}, function(err, list){
      //p(list, err);
      //var liststring = list.toString();
      var liststring = JSON.stringify(list);

      var context = {
        title: 'testing sys value /a 2017 0505',
        liststring: liststring,
        //file_path: file_path,
        //file_name: path.basename(file_path),
      };
      p(context);
      p('0209am context');

      render.render_file('list.pug', context, function(err, html){
        if(err) return next(err);
        res.end(html);
      });
    });

});


module.exports = router;



/* test */
//var fs = require("fs");



if (require.main === module){
}



// vim: set et ts=2 sw=2 fdm=indent:
