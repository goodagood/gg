var flash = require('connect-flash')
  , express = require('express')
  , passport = require('passport')
  , util = require('util')
  , LocalStrategy = require('passport-local').Strategy;
  

var port = 9090, port_ssl = 9099;

var findByUsername = require('./myuser.js').findByUsername;


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});


// passport.old_deserializeUser(function(id, done) {
//   findById(id, function (err, user) {
//     done(err, user);
//   });
// });

passport.deserializeUser(function(username, done) {
  findByUsername(username, function (err, user) {
    done(err, user);
  });
});


// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));


var app = express();

// connect-redis get a change after  1.5.0 for express 4.0:
// Here using express-session, there is an `express-sessions`, to make 
// things more trouble.
var session = require('express-session') , RedisStore = require('connect-redis')(session);
//app.use(session({ store: new RedisStore(options), secret: 'keyboard cat' }))
//var redis = require('redis');
var conf =   require("../config/config.js");
//var client = redis.createClient(conf.redis_port, conf.redis_host);

var redis_store_instance = new RedisStore({
  port: conf.redis_port,
  host: conf.redis_host,
  prefix: 'e.sess.rs'
});



// template engine:
var consolidate = require("consolidate");
app.engine('html', consolidate.handlebars);
// configure Express
//  app.set('views', __dirname + '/views');
//  app.set('view engine', 'ejs');
app.set('views', __dirname + '/handlebars-views');
app.set('view engine', 'html');

var logger = require('morgan');
app.use(logger());

var cookie_parser = require('cookie-parser');
app.use(cookie_parser());

var bodyparser = require('body-parser');
app.use(bodyparser());

//app.use(express.multipart());

var method_override = require('method-override');
app.use(method_override());

// we use redis backed session:
// from express 4.0  connect-redis need channges

app.use(session({
secret: 'keyboard ca-t, this should be secret',
//cookie: { maxAge: 2628000000 },
store: redis_store_instance })); 


// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
//app.use(express.static(__dirname + '/../../public'));
app.use(express.static(__dirname + '/static'));


// Testing block:
console.log('here');
if( typeof util === 'undefined'){
console.log('util undefined');
}else{
//console.log('util is defined');
console.log( util.inspect(RedisStore));
//console.log( util.inspect(redis_store_instance));
}
process.exit(0);



//app.get('/', function(req, res){
//  res.render('index', { user: req.user });
//});
//
//app.get('/account', ensureAuthenticated, function(req, res){
//  res.render('account', { user: req.user });
//});
//
//app.get('/login', function(req, res){
//  res.render('login', { user: req.user, message: req.flash('error') });
//});
//
//// POST /login
////   Use passport.authenticate() as route middleware to authenticate the
////   request.  If authentication fails, the user will be redirected back to the
////   login page.  Otherwise, the primary route function function will be called,
////   which, in this example, will redirect the user to the home page.
////
////   curl -v -d "username=bob&password=secret" http://127.0.0.1:port/login
//app.post('/login', 
//  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
//  function(req, res) {
//    res.redirect('/');
//  });
//  
//// POST /login
////   This is an alternative implementation that uses a custom callback to
////   acheive the same functionality.
///*
//app.post('/login', function(req, res, next) {
//  passport.authenticate('local', function(err, user, info) {
//    if (err) { return next(err) }
//    if (!user) {
//      req.flash('error', info.message);
//      return res.redirect('/login')
//    }
//    req.logIn(user, function(err) {
//      if (err) { return next(err); }
//      return res.redirect('/users/' + user.username);
//    });
//  })(req, res, next);
//});
//*/
//
//app.get('/logout', function(req, res){
//  req.logout();
//  res.redirect('/');
//});
//
//var tp = require("./testpath.js");
//tp.testpath(app);
//
//app.listen(port);
//console.log("app listen on port: ", port);
//
//// https server
//var https = require('https');
//var fs = require('fs');
//
//var options = {
//  key: fs.readFileSync('/var/my-certs/ssl.com.signed/privateKey.key'),
//  cert: fs.readFileSync('/var/my-certs/ssl.com.signed/www_goodagood_com.crt')//?
//};
//
//https.createServer(options, app).listen(port_ssl  );
//console.log("app listen on port: ", port_ssl, " for https\n");
//
//// Simple route middleware to ensure user is authenticated.
////   Use this route middleware on any resource that needs to be protected.  If
////   the request is authenticated (typically via a persistent login session),
////   the request will proceed.  Otherwise, the user will be redirected to the
////   login page.
//function ensureAuthenticated(req, res, next) {
//  if (req.isAuthenticated()) { return next(); }
//  res.redirect('/login')
//}
//
// vim: set et ts=2 sw=2:
