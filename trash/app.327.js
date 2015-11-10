var flash = require('connect-flash')
  , express = require('express')
  , passport = require('passport')
  , util = require('util')
  , LocalStrategy = require('passport-local').Strategy;
  
var connect = require('connect');

//var mylog = require('./mylog.js');

var port = 9090, port_ssl = 9099;

var findByUsername = require('./myuser').findByUsername;

var cel = require('connect-ensure-login');

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


// --- express
//var session = require('express-session') , RedisStore = require('connect-redis')(session);
//app.use(session({ store: new RedisStore(options), secret: 'keyboard cat' }))

var app = express();

// session backup by redis DB, RedisStore should be a class:
var RedisStore = require('connect-redis')(express);
var conf =   require("../config/config.js");
var redis_store_instance = new RedisStore({
  port: conf.redis_port,
  host: conf.redis_host,
  prefix: 'e.sess.rs'
});

// template engine:
var consolidate = require("consolidate");
app.engine('html', consolidate.handlebars);
// configure Express
app.configure(function() {
//  app.set('views', __dirname + '/views');
//  app.set('view engine', 'ejs');
  app.set('views', __dirname + '/handlebars-views');
  app.set('view engine', 'html');

  //app.use(express.static(__dirname + '/../../public'));
  // make another prefixed static server, start to replace the old one.
  app.use('/static', express.static(__dirname + '/static'));
  app.use(express.static(__dirname + '/static'));

  app.use(express.logger());
  app.use(express.cookieParser());

  app.use(express.methodOverride());
  // we use redis backed session:
  app.use(express.session({ 
    store: redis_store_instance,
    secret: 'keyboard ca-t, this should be secret' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(flash());
  app.use(connect.favicon('./static/favicon.ico'));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);

  //app.use(express.bodyParser());
  // for express 3, the above is recommended to change to =>
  app.use(express.json());
  app.use(express.urlencoded());
  //app.use(express.multipart());


});


app.get('/', 
    cel.ensureLoggedIn('/login'),
    function(req, res){

  // might cause: can not read username of undefined  0615
  //res.render('index', { user: req.user, username: req.user.username });
  res.redirect('/ls/');
  //res.render('index', {  });
});

//app.get('/account', ensureAuthenticated, function(req, res){
//  res.render('account', { user: req.user });
//});

app.get('/login', function(req, res){
  res.render('login', { user: req.user, message: req.flash('error') });
});

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:port/login
//app.post('/login', 
//  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
//  function(req, res, next) {
//    mylog.info('util.inspect(req): '); //checking
//    myog.info(util.inspect(req)); //checking
//    //console.log(mylog);
//    //console.log('mylog.info(util.inspect(req)); //checking');
//
//    //res.redirect('/');  // can we use next();
//    next();
//  });
//

app.post('/login', passport.authenticate('local', { successReturnToOrRedirect: '/ls/', failureRedirect: '/login' }));
  
// POST /login
//   This is an alternative implementation that uses a custom callback to
//   acheive the same functionality.
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

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// testing put some `path` outside other module
var user_router = require("./route_user.js");
user_router.route_user(app);


// upload files, /upload
var upload_files_router = require("./upload.js");
upload_files_router.myupload(app);


// s3 storage, download files
var s3_down_stream = require("./myutils/s3_down_stream.js");
s3_down_stream.s3_down_stream(app);


// list files
var list_files = require("./hrouters/file-list.js");
list_files.list(app);

// editors
var editor = require("./hrouters/editor.js");
editor.ed(app);

var folder_tool = require("./hrouters/folder-tools.js");
folder_tool.folder_tool_urls(app);

app.listen(port);
console.log("app listen on port: ", port);

// https secury server
var https = require('https');
var fs = require('fs');

var options = {
  key: fs.readFileSync('/var/my-certs/ssl.com.signed/privateKey.key'),
  cert: fs.readFileSync('/var/my-certs/ssl.com.signed/www_goodagood_com.crt')//?
};

https.createServer(options, app).listen(port_ssl  );
console.log("app listen on port: ", port_ssl, " for https\n");

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

// vim: set et ts=2 sw=2:
