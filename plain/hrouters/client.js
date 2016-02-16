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

var get_file_list = require("../aws/get-file-list.js");

var p = console.log;


router.get("/a", function(req, res){
    var t   = new Date();
    var now = t.toString();
    res.json( {now:now, what: '/a in client.js'} );
});


router.get(/\/get-file-meta-list\/(.+)/, function(req, res){
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
            cwd: cwd, username:username, now:now, what: 'let user render their folder'});
    });

});


        //cel.ensureLoggedIn('/login'),


router.post("/post-for-file-meta-list", 
        check_id,
        function(req, res){

            //var get_file_list = require("../aws/get-file-list.js");
            p('in post for file meta list');

            var cwd      = req.body.cwd;
            var username = req.body.username; // this not supposed to go product

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


/*
 * Make new folder by client request, post.
 * 2016 0215
 */
var folder_module = require("../aws/folder-v5.js");
router.post("/mkdir", function(req, res){

    p('in mkdir post request, 2016 0215 08:59am ');

    var util = require('util');
    p(`req.body in post mkdir: ${util.inspect(req.body)}`);

    if(!req.body.folder_path) return res.json({err: 'got no path'});

    var folder_path = req.body.folder_path.trim();
    if(!folder_path) return res.json({err: 'got empty path'});

    var cwd         = path.dirname (folder_path);
    var folder_name = path.basename(folder_path);
    p(`the cwd, name is ${cwd} ${folder_name}`);

    folder_module.is_folder_exists(folder_path, function(err, yes){
        // err means exists!? this need change.
        //if(err) return res.json({err: err, where: 'is folder exists'});
        if(yes) return res.json({folder_already_exists: yes});

        p(`to retrieve folder ${cwd}`);
        folder_module.retrieve_folder(cwd).then( function(current_dir_obj){
            p(`to add folder ${folder_name}`);
            return current_dir_obj.add_folder(folder_name);
        }).then(function(new_folder){
            return res.json({success: true});
        }).catch(function(err){
            return res.json({err: err, where: 'catched'});
        });
    });

});


function check_id(req, res, next){
    //p('check id, req headers');
    //p(req.headers);

    if (!req.isAuthenticated || !req.isAuthenticated()) {
        // Because this is call be ajax, we are not going to send error page.
        //return res.redirect(url);
        res.locals.check_user_id_maybe_failed = true;
        p('res.locals.check_user_id_maybe_failed = true');
    }
    next();
}



module.exports = router;










