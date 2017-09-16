/*
 * Under url  /user/...
 * user register
 * 2015 1221
 */

var express = require("express");
var router  = express.Router();

var sh = require("../home/slow-home.js");

var cel = require('connect-ensure-login');

var path = require("path");
var u    = require("underscore");
var querystring = require('querystring');

var request = require("request");
//var url     = require("url");

var cwdChain = require("../cwd-chain/cwd-chain.js");
var p = console.log;

var to_https = require("../myutils/to-https.js");
router.get("/slow-home", function(req, res){
    var comments = 'This supposed to be slow, we try to make user id same as user name';
    var title    = 'to build home slowly, but try to fit id with user name';

    if(req.protocol === "http") return res.redirect(to_https.make_https_href(req));
    if(req.session) req.session["slow_home_visit_milli"] = Date.now().toString();
    res.render('slow-home', {title:title, comments:comments });
});


router.post('/slow-home', function(req, res, next){
    var geturl = '/user/slow-home/';
    var user_info = {};
    if(!check_adduser_body(req, user_info)){
        p('!--!! not ok check user info in /user/slow-home?', user_info);
        return res.redirect(geturl);
    }
    p('\n\npost /slow-home got user_info: ', user_info);

    if(!req.login || !req.session) p('we should not continure, if req has no function of login or session, 0309, 2016 0201');

    return sh.new_home(user_info, function(err, what){
        if (err) {
            p('post /user/slow-home, new home err: ', err);
            return res.redirect(geturl);
        }

        console.log('\n\nbefore req.login for post adduser');
        req.login(user_info, function(err){
            console.log('wow, in post /user/slow-home -- req.login --', err);
            if(err) {return next(err);}

            //var where = '/ls/' + username;
            console.log('\n\nin post /user/slow-home, to redirect');
            if(req.protocol === "https") return res.redirect(to_https.make_https_href(req, '/ls/'));
            return res.redirect('/ls/'); 
        });

    });
});


router.get("/check-name-can-be-used", function(req, res){
    var title    = 'used when no js '

    var ok;

    var username;
    if(req.query.username) username = req.query.username;

    if(req.protocol === "http") return res.redirect(to_https.make_https_href(req));
    res.render('name-can-be-used', {title:title, message: "Type name to check" });
});


var nameid = require('../users/validate-name.js');
router.post('/check-name-can-be-used', function(req, res, next){
    var msg = '';

    var username;
    if(!req.body.username) return res.render('name-can-be-used', {message:"give me a user name" });
    username = req.body.username;

    nameid.user_name_could_be_used_as_id(username, function(err, yes, reason){
        if(err)    msg += 'err: ' + err.toString();
        if(yes)    msg += 'Ok, seems the name: "' + username + '" is ok to register. ';
        if(reason) msg += reason.toString();
        if(!msg)   msg  = ":: The server must be down, or doing some stupid things.";

        res.render('name-can-be-used', {message: msg });
    });
});


// tools

function check_adduser_body(req, user){
  if(!req.body.username) return false;
  if(!req.body.password) return false;
  if(!req.body.repeat_password) return false;
  if(!u.isObject(user)) return false;

  var username = req.body.username;
  var password = req.body.password;
  var repeat_password = req.body.repeat_password;

  var referrer = null;
  if(req.body.referrer) referrer = req.body.referrer;

  //var user = {}; // this error drop user away.
  user.username = username;
  user.password = password;
  user.repeat_password = repeat_password;
  user.referrer = referrer;
  return true;
}


module.exports = router;


//-- checkings

var stop = function() { return setTimeout(process.exit, 5000); };

function make_qs(){
    // make query string
    p( 'testing    .....');
    stop();
}

if(require.main === module){
    make_qs();
}
