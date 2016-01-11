// -- going to be under url  /client/...

var express = require("express");
var router  = express.Router();

var cel = require('connect-ensure-login');

var path = require("path");
var u    = require("underscore");


//var css        = require('../aws/css-file.js');
var mytemplate = require('../myutils/template.js');


//var filelist   = require('./file-list-v2.js');
//var people_ed  = require("../users/people-edit.js");

var p = console.log;


router.get("/a", function(req, res){
    var t   = new Date();
    var now = t.toString();
    res.json( {now:now, what: '/a in client.js'} );
});


router.get(/\/get-file-meta-list\/(.+)/, function(req, res){
    var get_file_list = require("../aws/get-file-list.js");
    p('in get file meta list');

    var cwd = req.params[0];
    var username;

    if(req.user) username = req.user.username;

    if(!username || !cwd) return res.json({username:username, cwd:cwd, err:'no username or cwd'});

    // for testing
    var t   = new Date();
    var now = t.toString();

    get_file_list.basic_file_meta_list(username, cwd, function(err, meta_list){
        if(err) return res.json({err:err});

        p('meta list is array?: ', u.isArray(meta_list));
        res.json({
            meta_list: meta_list,
            cwd: cwd, username:username, now:now, what: '/a in client.js'});
    });

});


router.post("/post-for-file-meta-list", function(req, res){
    var get_file_list = require("../aws/get-file-list.js");
    p('in post for file meta list');

    var cwd      = req.body.cwd;
    var username = req.body.username; // this not supposed to go product
    check_id(req);

    if(req.user) username = req.user.username;

    if(!cwd) return res.json({username:username, cwd:cwd, err:'no cwd'});
    p('i p 4 f m l: ', cwd, username);

    get_file_list.basic_file_meta_list(username, cwd, function(err, meta_list){
        if(err) return res.json({err:err});

        p('meta list is array?: ', u.isArray(meta_list));
        res.json({
            meta_list: meta_list,
            cwd: cwd, username:username, what: '/post ... in client.js'});
    });

});


function check_id(req){
    p('check id, req headers');
    p(req.headers);
}



module.exports = router;










