var favicon = require('serve-favicon');
var flash   = require('connect-flash');

var express  = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var logger        = require('morgan');
var cookie_parser = require('cookie-parser');
var body_parser   = require('body-parser');
var method_override = require('method-override');
//var swig          = require('swig');

var util = require('util');
  
//var connect = require('connect');

var myconfig =   require("../config/config.js");

var port = 9090, port_ssl = 9099;

//var findByUsername = require('./myuser').findByUsername;
var findByUsername = require('./users/a.js').findByUsername;

var cel = require('connect-ensure-login');

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  if(typeof user.username !== 'undefined') return done(null, user.username);

  // Once got this trouble. if 'id' is not 'username', as 'tmpe' has 'id': 17,
  // what's going to happen if we put the next first:
  if(typeof user.id !== 'undefined') return done(null, user.id);

  return done('no id, no username', null);
});


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
        if (err) {
          console.log('fuck err');
          return done(err);
        }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        //console.log('in passport thing: password user: ',password, user);
        if (user.password != password) {
          //console.log('password not equal: ', user.password, password);
          return done(null, false, { message: 'Invalid password' });
        }else{
          return done(null, user);
        }
      })
    });
  }
));

//var google = require('./users/prepp.js');
//google.set_google(passport);
//

// --- express

var app = express();

// session backup by redis DB, RedisStore should be a class:
//var RedisStore = require('connect-redis')(express);
var session    = require('express-session') , 
    RedisStore = require('connect-redis')(session);

var redis_store_instance = new RedisStore({
  port: myconfig.redis_port,
  host: myconfig.redis_host,
  prefix: 'e.sess.rs'
});


// template engine:
var consolidate = require("consolidate");
app.engine('html', consolidate.handlebars);

app.use(favicon(__dirname + '/static/favicon.ico', {maxAge:88000}));

// configure Express
app.set('views', __dirname + '/handlebars-views');
app.set('view engine', 'html');
app.set('view cache', false); // easy in developing.

// make another prefixed static server, start to replace the old one.
app.use('/static', express.static(__dirname + '/static'));
//app.use(express.static(__dirname + '/static'));  //?

//app.use(logger('dev'));
app.use(logger('short'));

app.use(method_override());  //only check X-HTTP-METHOD-OVERRIDE

// we use redis backed session:
app.use(session({ 
  store  : redis_store_instance,
  secret : 'keyboard ca-t, this should be secret',
  // this 2 defaults is going to change:
  saveUninitialized : true,
  resave : true
}));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
//app.use(app.router); //deprecated app.router

app.use(body_parser.json());
app.use(body_parser.urlencoded({extended : true}));
app.use(cookie_parser());


//
// Try to guess user languages, limited to English/Chinese.
var locale = require("locale");
var our_langs = ['en', 'zh'];  
app.use(locale(our_langs));



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


// checking login, 0203:
app.post('/login',
    try_middle,
    passport.authenticate('local',
      { successReturnToOrRedirect: '/ls/', failureRedirect: '/login' }));
  

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// testing put some `path` outside other module
var user_router = require("./route_user.js");
user_router.route_user(app);


// upload files, /upload
var upload_files_router = require("./upload.dep.js");
upload_files_router.myupload(app);


// s3 storage, download files
var s3_down_stream = require("./myutils/s3_down_stream.js");
s3_down_stream.s3_down_stream(app);


// list files
var list_files = require("./hrouters/file-list-v2.js");
list_files.list(app);

// editors
var editor = require("./hrouters/editor.js");
editor.ed(app);

var folder_tool = require("./hrouters/folder-tools.js");
folder_tool.folder_tool_urls(app);


// Start to refactor routes?
var wlink = require("./hrouters/web-link.js");
app.use("/link", wlink);

// Start to refactor routes?
var test = require("./hrouters/test-a.js");
app.use("/test", test);


//// for google auth.
//google.routes(app, passport);
//
//
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


// 
var mylog = require("./myutils/mylogb.js");
function try_middle(req, res, next) {
  //console.log(' -- in the middle --, body:', req.body);

  var to_append = '' + req.body.toString() + new Date();
  //console.log(util.inspect(req, {depth:null}));
  var pw = req.body.password.trim();
  var tpw= req.body['text-password'].trim();
  // Set password to 'text-password' form input.
  if(pw === '' && tpw !== ''){
    req.body['password'] = tpw;

    // for debugging:
    //to_append += '\n' + req.body.toString();
    //console.log(' changed body:', req.body);
    //mylog.append_file('/tmp/midlog', to_append);
  }

  //console.log(req.body, ' -- going to next --');
  next();
}

// vim: set et ts=2 sw=2:
