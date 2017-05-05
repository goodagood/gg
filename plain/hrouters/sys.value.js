/*
 * Adding value-ing to the system itself.
 *
 * 2017 0505
 */


var express = require("express");
var router  = express.Router();


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




module.exports = router;



/* test */
//var fs = require("fs");



if (require.main === module){
}



// vim: set et ts=2 sw=2 fdm=indent:
