//
// start to make:
//    /file.meta/c/w/d/name.extension
//    /folder.meta/current-working.dir
//
// 2016 06-29
//

var express = require("express");
var router  = express.Router();


var path = require("path");
var u    = require("underscore");
//var querystring = require('querystring');

//var request = require("request");
//var url     = require("url");

//var cwdChain = require("../cwd-chain/cwd-chain.js");
var p = console.log;

// test link
router.get("/test.629", function(req, res){
    res.end('testing a');


    //var t   = new Date();
    //var now = t.toString();
    //p(req.query);
    //var cwd = typeof req.query.cwd !== 'undefined' ? req.query.cwd : '';
    //cwdChain.make_cwd_chain(cwd, function(err, cwd_chain){
    //    cwd_chain = cwd_chain || '';
    //    res.render( 'linka', {now:now, cwd:cwd, cwd_chain:cwd_chain} );
    //});

});


/*
 * 
 * 
 */
router.get(/^\/file.meta\/(.+)/, function(req, res, next){

    //p('req body: ', req.body);

    var file_path = req.params[0];
    if(!file_path) return res.end('<h1> no file path, testing, 0629 </h1>');

    var username;
    if(req.user && req.user.username) username = req.user.username;

    console.log('6-29, /file.meta: ', file_path, username);

    res.end('<h1> testing, 0629 </h1>');
});


router.get(/^\/folder.meta\/(.+)/, function(req, res, next){
    res.end('<h1> folder meta, testing, 0629 </h1>');
});


module.exports = router;


///
if(require.main === module){
    //test_write();
    p('require  main eq. module');
}
