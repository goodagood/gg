var favicon = require('serve-favicon');
var flash   = require('connect-flash');

var express  = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var cookie_parser = require('cookie-parser');
var body_parser   = require('body-parser');
var method_override = require('method-override');
//var swig          = require('swig');

var util = require('util');
var cel  = require('connect-ensure-login');
  
//var connect = require('connect');

// the old config-mj.js:
var myconfig =  require("./config/config.js");
var pages    =  require("./config/pages.js");

var port = 9090, port_ssl = 9099;

//var findByUsername = require('./myuser').findByUsername;
//var findByUsername = require('./users/a.js').findByUsername;


var lang = require("./users/lang.js");

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  if(!user.username) return done('username is needed, it should be unique, 20160305-1728');

  // userid serve as key? 2016 0305
  return done(null, user.username);

  // Give up approaches:
  //   Once: tried to set up user id,  and let username duplicatable.
  //   as 'tmpe' has 'id': 17,
  //
  // commented out 2016 0305
  // if(typeof user.id !== 'undefined') return done(null, user.id);
  //return done('no id, no username', null);
});


var muser = require("./users/muser.js");
passport.deserializeUser(function(username, done) {
  muser.find_by_user_name(username, function (err, user) {
    done(err, user);
  });
});



var m_hash_pass = require("./users/m-hash-pass.js");
passport.use(
    new LocalStrategy(
      function(username, password, done) {
        process.nextTick(function () {
          m_hash_pass.find_and_check(username, password, done);
        });
      }
    )
);



var google = require('./users/prepp.js');
google.set_google(passport);


// --- express
//var session = require('express-session') , RedisStore = require('connect-redis')(session);
//app.use(session({ store: new RedisStore(options), secret: 'keyboard cat' }))

var app = express();

// session backup by redis DB, RedisStore should be a class:
//var RedisStore = require('connect-redis')(express);
var session    = require('express-session') , 
    RedisStore = require('connect-redis')(session);

var secrets = require("./config/secret-dir.js");
var redis_host = secrets.conf.redis.redis_host;
var redis_port = secrets.conf.redis.redis_port;
var redis_pass = secrets.conf.redis.requirepass;

var redis_store_instance = new RedisStore({
  port: redis_port,
  host: redis_host,
  pass: redis_pass,
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

//var logger = require('morgan');
var morgan_skip = require('./myutils/morgan-skip.js');
var logger = morgan_skip.fire2s3;
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

//

app.get('/', 
    cel.ensureLoggedIn('/login'),
    function(req, res){

      // might cause: can not read username of undefined  0615
      //res.render('index', { user: req.user, username: req.user.username });
      if(req.user && req.user.username){
        res.redirect('/ls/');
      }else{
        res.redirect(pages.front);
      }
      //res.render('index', {  });
});

//app.get('/account', ensureAuthenticated, function(req, res){
//  res.render('account', { user: req.user });
//});



// split auth out, 2016 0201
var name_pass = require("./users/name-pass.js");
app.use("/", name_pass);


// testing put some `path` outside other module
var user_router = require("./route_user.js");
user_router.route_user(app);


// upload files, /upload,  //old
// 2016 0516, to be replaced by /upload/...
var upload_files_router = require("./hrouters/upload.js");
upload_files_router.myupload(app);


// s3 storage, download files
var s3_down_stream = require("./myutils/s3_down_stream.js");
s3_down_stream.s3_down_stream(app);


// list files
var list_files = require("./hrouters/file-list-v3.js");
list_files.list(app);

// editors
var editor = require("./hrouters/editor.js");
editor.ed(app);

var folder_tool = require("./hrouters/folder-tools.js");
folder_tool.folder_tool_urls(app);

// get /login can not move away?
//var basic = require("./hrouters/basic.js");
//app.use("/basic", basic);

// Start to refactor routes?
var wlink = require("./hrouters/web-link.js");
app.use("/link", wlink);

var test = require("./hrouters/test-a.js");
app.use("/test", test);

var code = require("./hrouters/code.js");
app.use("/code", code);

var client = require("./hrouters/client.js");
app.use("/client", client);


var ggfile = require("./hrouters/file.js");
app.use("/file", ggfile);


/* still need to change things about basic user registration, 2015 1221 */
var user2 = require("./hrouters/user.js");
app.use("/user", user2);

// for google auth.
//google.routes(app, passport);

var img = require("./hrouters/img.js");
app.use("/img", img);

var vid = require("./hrouters/vid.js");
app.use("/vid", vid);

var upload_y6 = require("./hrouters/up.y6.0516.js");
app.use("/upload", upload_y6);



app.listen(port);
console.log("app listen on port: ", port);

// https secury server
var https = require('https');
var fs = require('fs');


// Put ssl later, better to move to a single credential storage.
// 2015 1018
//var options = {
//  key: fs.readFileSync('/secret-dir/my-certs/ssl.com.signed/privateKey.key'),
//  cert: fs.readFileSync('/secret-dir/my-certs/ssl.com.signed/www_goodagood_com.crt')//?
//};
//
//https.createServer(options, app).listen(port_ssl  );
//console.log("app listen on port: ", port_ssl, " for https\n");

// 2016 0109
var https_srv = require("./myutils/https.js");
https_srv.make_https_server(app).listen(port_ssl);
console.log("app listen on port: ", port_ssl);



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
