var passport = require('passport');
var u        = require('underscore');
//var myuser = require('./myuser.js');
var myuser = require('./users/a.js');

//var tv = require('./myutils/tv.js');  // for tree views 

var cel = require('connect-ensure-login');

var myconfig =  require("./config/config.js");

var lang     = require("./users/lang.js");

var log28 = require('./myutils/mylogb.js').double_log('/tmp/log28');
var p     = console.log;

function route_user(app){

  //test the i18n 'i18next', it's nice
  app.get('/i18ntest', function(req, res){
    log28('req.user', req.user);
    res.render('testi18', { user: req.user, message: req.flash('error') });
  });

  app.get('/ping.html', function(req, res){
    //log28('req.user', req.user);
    res.end("<html><body><h1> ping.html </h1></body></html>");
  });


  app.get('/6D506D2215AE6C4AEC241F02C138D138', function(req, res){
    //MD5 = 6D506D2215AE6C4AEC241F02C138D138
    //SHA-1 = 2D88131B183CB967B457E5EE5A5200C50F461E66 
    //for csr certify, comod
    res.send('2D88131B183CB967B457E5EE5A5200C50F461E66 \r\n comodoca.com ');
  });

  // test req.login(), req.logout()
  app.get('/i-am-superman', function(req, res, next){
    req.logout();

    var haha = "super man said: Ha Ha haaaa.";
    //req.login('tmpd', function(err)
    req.login({username:'tmpd', id: 'tmpd'}, function(err){
      var message, e;
      if(err){message=JSON.stringify(err);}else{message='no error, super man';}
      log28('err', err);

      var username = "I don't know who who";
      if(req.user) username = req.user.username;

      console.log(typeof req.login);
      log28('typeof req.login', typeof req.login);

      console.log(req.user);
      console.log(typeof req.user);
      console.log(u.isNull( req.user));
      //res.render('testlogin', { user_info: req.user, username : username, message: req.flash('err') });
      res.render('testlogin', 
        { user_info: req.user, 
          username : username, 
          message: message,
        });
    });
    //res.render('testlogin', { user_info: req.user, message: req.flash('error') });
  });

  var social = require('./aws/social.js');
  var mytemplate = require('./myutils/template.js');
  app.get('/addpeople-input', function(req, res){
    // this is going to be replaced by '/people'

    var username = req.user.username;
    //var people_name = req.params['name'];
    //console.log(username, ' add ', people_name);
    //social.add_people(username, people_name);
    
    var people_list = social.get_people_list_ul(username, function(alist){
      res.render('addpeople-input', { user: req.user, people_list:alist });
    });
    //res.json({username:username, peoplename:people_name});
  });

  app.get('/people', 
      cel.ensureLoggedIn('/login'),
      function(req, res){

    var username = req.user.username;
    
    social.get_people_list_ul(username, function(all_men){
      social.get_current_people_list_ul(username, function(current){

        //log28('in people get people list', all_men);

        var contexts = {
          body : {people_list:all_men, current_people:current,},
        };

        var html_elements = {
          body   : 'input-people.html',
          navbar : 'people-file-navtabs.html',
          //navbar : 'file-navbar.html',
          script : 'input-people-script.html',
        };

        mytemplate.assemble_html(html_elements, contexts, function(html){
          res.send(html);
        });
      });
    });
  });

  app.post('/add-default-people/',
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      var username = req.user.username;
      var plist_str  = req.body['people_list'];
      var plist = JSON.parse(plist_str); // array
      log28('plist in add default..', plist);
      social.add_current_people_batch(username, plist, function(){
        res.json({});
      });
    });

  app.post('/rm-default-people/',
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      var username = req.user.username;
      var dlist_str  = req.body['default_list'];
      var dlist = JSON.parse(dlist_str); // array
      social.delete_current_people_batch(username, dlist, function(){
        res.json({});
      });
    });

  app.get('/addpeople/:name', function(req, res){

    var username = req.user.username;
    var people_name = req.params['name'];
    console.log(username, ' add ', people_name);
    social.add_people(username, people_name);
    res.json({username:username, peoplename:people_name});
    //res.render('adduser', { user: req.user, message: req.flash('error') });
  });

  app.get('/adduser', function(req, res){
    res.render('adduser', { user: req.user, message: req.flash('error') });
  });


  app.post('/adduser', function(req, res, next){
    var user_info = {};
    if(!check_adduser_body(req, user_info)){
      p('!--!! not user info in /adduser');
      var tmp = '/adduser/' + 'not user info in /adduser';
      return res.redirect(tmp);
    }
    p('\n\npost /adduser got user_info: ', user_info);

    // change from init_user_c to _d, 0425:
    myuser.init_user_d(user_info, function(err, user_obj){
      if (err) {
        p('init user d err: ', err);
        var to_adduser = '/adduser/' + err.toString();
        return res.redirect(to_adduser);
      }

      console.log('\n\nbefore req.login for post adduser');
      req.login(user_info, function(err){
        console.log('wow, in post add_user -- req.login --', err);
        if(err) {return next(err);}

        //var where = '/ls/' + username;
        var where = '/ls/'; //+ username; //?
        console.log('\n\nin post adduser, to redirect');
        return res.redirect(where); 
      });

    });
  });


  // need testing, try to give fast information let user know the name is ok.
  app.post('/is-name-occupied', function(req, res, next){
    if(!req.body.username) return res.json({err: 'offer username', 'is-name-occupied':'unknown'});

    var username = req.body.username;
    if(!u.isString(username)) return res.json({err: 'not a string', 'is-name-occupied':'unknown'});
    // all name length <= 3 been occupied:
    if(username.length <= 3) return res.json({err: false, 'is-name-occupied':true});

    myuser.is_name_occupied(username, function(err, name_exists){
      if(err){
        return res.json({err: err, 'is-name-occupied':'unknown'});
      }
      res.json({err: false, 'is-name-occupied': name_exists});
    });
  });

  var public_users = require("./users/public-users.js");
  app.get('/try-before-register', function(req, res, next){
    public_users.get_one_public_user(function(err, user){
      if(err){ return res.redirect('/login'); }
      p('got user in try before register: ', user);

      req.login(user, function(err){
        if(err){ return res.redirect('/login'); }
        res.redirect('/ls/');
      });
    });
  });

}

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


function clone_default_folder_file(user_obj){
  // for folders
  myconfig.default_folders.forEach(function(entry){
    user_obj[entry] = '';
  });

  // for files
  myconfig.default_files.forEach(function(entry){
    user_obj[entry] = '';
  });
  return user_obj;
}

exports.route_user = route_user;

/* test */
function test_clone_default_folder_file(){
  var fake_user = {username:'haha', id:'haha'};
  var cloned = clone_default_folder_file(fake_user);
  console.log(cloned);
}


if (require.main === module){
  test_clone_default_folder_file();
}


// vim: set et ts=2 sw=2 fdm=indent:
