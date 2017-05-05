
//var util = require('util');

var express  = require('express');

var favicon = require('serve-favicon');
var flash   = require('connect-flash');


var myauth = require("plain/auth/pp.js");

var cookie_parser = require('cookie-parser');
var body_parser   = require('body-parser');
var method_override = require('method-override');

var cel  = require('connect-ensure-login');
  

// the old config-mj.js:
//var myconfig =  require("./config/config.js");
var pages    =  require("./config/pages.js");

var port = 9090, port_ssl = 9099;


var lang = require("./users/lang.js");


var app = express();


// template engine:
var consolidate = require("consolidate");
app.engine('html', consolidate.handlebars);

app.use(favicon(__dirname + '/static/favicon.ico', {maxAge:88000}));

// configure Express
app.set('views', __dirname + '/handlebars-views');
app.set('view engine', 'html');
app.set('view cache', false); // easy in developing.


app.use('/static', express.static(__dirname + '/static'));


//c
//var logger = require('morgan');
var morgan_skip = require('./myutils/morgan-skip.js');
var logger = morgan_skip.fire2s3;
//app.use(logger('dev'));
app.use(logger('short'));


// a logger to mongodb as start of attack awareness, 2016 0608
var jsonLogger = require("plain/myutils/jlog.js");
app.use(jsonLogger);



app.use(method_override());  //only check X-HTTP-METHOD-OVERRIDE



app.use(body_parser.json());
app.use(body_parser.urlencoded({extended : true}));
app.use(cookie_parser());



var prepare_session = require("plain/auth/prepare.sess.js");
app.use(prepare_session.prepared_session_middle_ware);


app.use(myauth.passport.initialize());
app.use(myauth.passport.session());

//t
//var google = require('./users/prepp.js');
//google.set_google(myauth.passport);

//app.use(flash());


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
      if(req.user && req.user.username){
        res.redirect('/ls/');
      }else{
        res.redirect(pages.front);
      }
      //res.render('index', {  });
});




// split auth out, 2016 0201
var name_pass = require("./users/name-pass.js");
app.use("/", name_pass);


// 
//var meta_viewers = require("./hrouters/metas.js");
//app.use("/", meta_viewers);


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


var folder0602 = require("./hrouters/folder.y6.0602.js");
app.use("/folder", folder0602);

// editors
var editor = require("./hrouters/editor.js");
editor.ed(app);

var folder_tool = require("./hrouters/folder-tools.js");
folder_tool.folder_tool_urls(app);


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


var img = require("./hrouters/img.js");
app.use("/img", img);

var vid = require("./hrouters/vid.js");
app.use("/vid", vid);

var upload_y6 = require("./hrouters/up.y6.0516.js");
app.use("/upload", upload_y6);


// 2017 0505
var sysvalue = require("./hrouters/sys.value.js");
app.use("/sysvalue", sysvalue);



app.listen(port);
console.log("app listen on port: ", port);

// https secury server
var https = require('https');
var fs = require('fs');



// 2016 0109
var https_srv = require("./myutils/https.js");
https_srv.make_https_server(app).listen(port_ssl);
console.log("app listen on port: ", port_ssl);




// vim: set et ts=2 sw=2:
