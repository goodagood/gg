
/*
 * Re-write functions (middle-wares) to do name/password login.
 * Before, we put it in app.js (app.818.js etc.), and used passport.js' own
 * authentication function as the middle-ware, it can only point to url of
 * success or fail, we need more control.
 *
 * 2016 0201
 */

var express = require("express");
var router  = express.Router();

var passport = require('passport');

var to_https = require("../myutils/to-https.js");
var lang     = require("./lang.js");

var p = console.log;


var msg_in_querystring = require("../myutils/qstr.js");
router.get('/login', function(req, res, next){
  //res.render('login', { user: req.user, message: req.flash('error') });

  if(req.protocol === "http") return res.redirect(to_https.make_https_href(req));

  //put something in session to make sure it's there.
  if(req.session) req.session["login_visit_milli"] = Date.now().toString();

  var msg = msg_in_querystring.list_msgs(req);
  //if(u.isEmpty(msg)) msg = 'what'; //msg = 'oo, ook';
  res.render('login.html', { message : msg });
  //lang.render_lang(req, res, next, 'login.html', { user: req.user, message: msg });
});


/*
 * http://passportjs.org/docs
 *
   In the following /post method, note that authenticate() is called from within the route
   handler, rather than being used as route middleware. This gives the callback
   access to the req and res objects through closure.

   If authentication failed, user will be set to false. If an exception occurred,
   err will be set. An optional info argument will be passed, containing
   additional details provided by the strategy's verify callback.

   The callback can use the arguments supplied to handle the authentication result
   as desired. Note that when using a custom callback, it becomes the
   application's responsibility to establish a session (by calling req.login())
   and send a response.
 */
router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        p('0, in post login, got err: ', err);
        p('1, in post login, got user: ', user);
        p('2, in post login, got info: ', info);
        if (err)   { return next(err); }
        if (!user) { return res.redirect( msg_in_querystring.add_ggmsg('no user found', '/login/')); }

        req.login(user, function(err) { //logIn?
            if (err) { return next(err); }
            //return res.redirect('/users/' + user.username);

            //p('going to redirect, in post login');
            return res.redirect('/ls/');
        });
    })(req, res, next);
});



//// checking login, 0203:
//router.post('/login',
//    try_middle,
//    passport.authenticate('local',
//      { successReturnToOrRedirect: '/ls/', failureRedirect: '/login' }));
  

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


/* google */
router.get('/auth-google',
        passport.authenticate('google', { scope: [ 'https://www.googleapis.com/auth/plus.login',
            , 'https://www.googleapis.com/auth/plus.profile.emails.read' ] }
            ));

router.get( '/auth-google-callback', 
        passport.authenticate( 'google', { 
            //successRedirect: '/auth/google/success',
            //failureRedirect: '/auth/google/failure'
            successRedirect: '/ls',
            failureRedirect: '/login'
        }));




module.exports = router;


