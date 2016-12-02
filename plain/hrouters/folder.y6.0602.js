// -- under url  /test/...

var express = require("express");
var router  = express.Router();

//var cel = require('connect-ensure-login');

//var u    = require("underscore");



var p = console.log;


router.get("/oo", function(req, res){
    // test routing is ok, 2016 0602
    //res.render( 'testa', {now: user} );
    res.send( `<h1> oo, ${Date()} </h1>` );
});


var go_to_python = require("plain/asker/folder.list.js");
// regex:  /^\/list\/(.*)/,  start at '/', followed by 'list/', and the path
router.get(/^\/list\/(.*)/, function(req, res){
    var username;
    if (req.user) username = req.user.username;

    var cwd = req.params[0];

    go_to_python.folder_list(username, cwd, function(err, str_of_listing){
        if(err) return next(err);
        res.send(str_of_listing);
    });
});


//var local_port = require("plain/asker/lh5.js"); // local host:5555
var local_port = require("plain/asker/client.0707.y6.js"); // local host:5555
router.post("/json_post_for_file_meta_list", function(req, res){
    p('post /json post for file m l: ', req.body);

    var cwd;
    if(req.body.cwd) cwd = req.body.cwd;
    if(!cwd) return res.json( {error: 'no cwd (path of current working dir) found'});

    var username = 'anonymous';
    if(req.user && req.user.username) username = req.user.username;

    var info = {
        'who':  username,
        //'ask-for': 'ls_meta',
        'ask4': 'ls_meta',
        'path': cwd
    }

    local_port.ask(info, function(err, json_rep){
        if(err) return res.json( {error: err});

        // json_rep.input will be the 'info'
        if(!json_rep.output) return res.json({error: 'not get output, what asked for'});

        // it might cause trouble if return an array as json.
        res.json({meta_list: json_rep.output});
    });

});


module.exports = router;



// prepare to do a page of backbone ... 0106






