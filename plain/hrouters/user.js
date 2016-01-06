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

router.get("/slow-home", function(req, res){
    var comments = 'This supposed to be slow, we try to make user id same as user name';
    var title    = 'to build home slowly, but try to fit id with user name';

    res.render('slow-home', {title:title, comments:comments });
});


router.post('/slow-home', function(req, res, next){
    var geturl = '/user/slow-home/';
    var user_info = {};
    if(!check_adduser_body(req, user_info)){
        p('!--!! not user info in /user/slow-home');
        return res.redirect(geturl);
    }
    p('\n\npost /slow-home got user_info: ', user_info);

    // change from init_user_c to _d, 0425:
    //myuser.init_user_d(user_info, function(err, user_obj){});
    sh.new_home(user_info, function(err, what){
        if (err) {
            p('post /user/slow-home, new home err: ', err);
            return res.redirect(geturl);
        }

        console.log('\n\nbefore req.login for post adduser');
        req.login(user_info, function(err){
            console.log('wow, in post /user/slow-home -- req.login --', err);
            if(err) {return next(err);}

            //var where = '/ls/' + username;
            var where = '/ls/'; //+ username; //?
            console.log('\n\nin post /user/slow-home, to redirect');
            return res.redirect(where); 
        });

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
