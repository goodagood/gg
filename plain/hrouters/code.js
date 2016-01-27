// -- under url  /test/...

var express = require("express");
var router  = express.Router();

var cel = require('connect-ensure-login');

var path = require("path");
var u    = require("underscore");

//var css        = require('../aws/css-file.js');
//var mytemplate = require('../myutils/template.js');
//
//var filelist   = require('./file-list-v2.js');
//var people_ed  = require("../users/people-edit.js");

var p = console.log;


router.get("/a", function(req, res){
    var t   = new Date();
    var now = t.toString();
    res.render( 'testa', {now:now} );
    //res.send( t.toString() );
});


var runner = require("../code/runner.js");
router.get(/^\/run\/(.+)/, function(req, res){
    var to_run_file_path = req.params[0];
    //var username = req.user.username;

    runner.run(to_run_file_path, function(err, out){

        var msg;
        if(out) msg = out.toString();
        res.end(`<h1>runner got: ${msg} </h1>`);
    });
});


var code_reader = require("../code/reader.js");
router.get(/read\/(.+)/, function(req, res){
    var full_code_file_path = req.params[0];
    //var username = req.user.username;

    code_reader.read(full_code_file_path, function(err, codes){
        if(err) return callback(err);
        p('codes: '); p(codes);

        res.render('code-view.html', {codes:codes, file_path:full_code_file_path});
    });
});


//// 2016 0120
//// in test-a.js there is a:
//router.get(/^\/run(.+)/, function(req, res, next){
//    var to_run_file_path = req.params[0];
//    var error = null;
//
//    try{
//        var run = require("./run-js-file.js");
//        run.run_js(to_run_file_path);
//    }catch(err){
//        if(err) error = err;
//    }
//    res.end("<h1>" + to_run_file_path + " </h1> <p> error: " + error + "</p>");
//});




module.exports = router;




