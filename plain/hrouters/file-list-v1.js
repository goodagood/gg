// 0525, routes to list files
//
//var passport = require('passport')
var util = require('util');
var path = require('path');
var markdown = require('markdown').markdown;

var myuser = require('../myuser.js');
var tv = require('../myutils/tv.js');  // for tree views 
var myutil = require('../myutils/myutil.js');

var cel = require('connect-ensure-login');

var myconfig =   require("../config/config.js");
var bucket   = require('../aws/bucket.js');
var meta     = require('../aws/meta.js');

var s3folder = require('../aws/folder-v1.js');
var folder_v4 = require('../aws/folder-v4.js');

var deliver  = require('../aws/file-deliver.js');
var social   = require('../aws/social.js');

var mytemplate = require('../myutils/template.js');

var log28    = require('../myutils/mylogb.js').double_log('/tmp/log28');

function list(app){

  ///* show only folders, not going to use after 2014 0530 */
  //app.get(/\/treeview\/(.*)/,
  //  cel.ensureLoggedIn('/login'),
  //  function(req, res, next){
  //    var cwd = req.params[0];
  //    var username = req.user.username;
  //    if (typeof username === 'undefined' || !username){
  //      res.end('Not found username'); next();
  //    }

  //    bucket.read_home_structure(username, function(err, tree_obj){
  //      if (err){ res.end('Read file error'); next(); }

  //      var checkout = myutil.check_out_cwd_tree(cwd, tree_obj);
  //      var user_folder_ul = tv.folder_to_ul(checkout.tree, checkout.cwd);
  //      var cwd_chain = make_cwd_chain(checkout.cwd);
  //      res.render('treeview', {cwd_chain:cwd_chain, user_folder_ul:user_folder_ul});

  //    });
  //  });

  //// before 0529, already be replaced by list2, which is also replaced.
  //app.get(/^\/list\/(.+)/, 
  //  cel.ensureLoggedIn('/login'),
  //  function(req, res, next){
  //    //res.end('testing s'); next();
  //    //console.log(11); console.log((req.params[0]));
  //    var path  = req.params[0],
  //        username = req.user.username;
  //    if (! check_path_username_agree(path, username)){
  //      res.end("<h1> Are you sure you are " + username + " </h1>");
  //    }

  //    ///
  //    var user_clone = JSON.parse(JSON.stringify(req.user));
  //    //delete user_clone.password;
  //    //var user_folder_ul = tv.make_ul_list(user_clone);


  //    bucket.list(path, function(err, data){

  //      //console.log(data);
  //      var html_ul = tv.make_ul_from_listObjects(data);
  //      //res.end('testing'); next();
  //      //console.log('obj user: ', user_clone);
  //      res.render('list-a', 
  //        {user:user_clone, 
  //          path: path,
  //          user_folder_ul:html_ul});
  //    });

  //  });



  //// this is testing 0613, to let user select and send files
  //app.get(/^\/list3\/(.*)/, 
  //  cel.ensureLoggedIn('/login'),
  //  function(req, res, next){
  //    //res.end('testing s'); next();
  //    //console.log(0529-1); console.log((req.params[0]));
  //    var cwd  = req.params[0];
  //    var username = req.user.username;

  //    // todo : make a list of files plus folders.
  //    bucket.list3(username, cwd, function(err, data){

  //      var cwd_chain = path_chain(cwd, '/list3/');  // '/list2/' is start of the href

  //      //console.log(data);
  //      //var html_ul = tv.make_ul_from_listObjects(data);
  //      //res.end('testing'); next();
  //      res.render('list3', 
  //        {user:req.user, 
  //          username: req.user.username,
  //          cwd:cwd,
  //          cwd_chain: cwd_chain,
  //          user_folder_ul:data});
  //    });

  //  });


  // 0629, after file and folder changed to new meta data.
  //app.get(/^\/ls-old-87\/(.*)/, 
  //  cel.ensureLoggedIn('/login'),
  //  function(req, res, next){
  //    //res.end('testing s'); next();
  //    //console.log(0529-1); console.log((req.params[0]));
  //    var cwd  = req.params[0];
  //    var username = req.user.username;
  //    if( typeof cwd === 'undefined' || !cwd ) cwd = username; //dir anyway.

  //    s3folder.retrieve_folder(cwd, function(folder){
  //      if(!folder) return res.end('cwd: ' + cwd);
  //      var cwd_chain = path_chain(cwd, '/ls/');  // '/ls/' is start of the href
  //      var ul = folder.get_ul_renderring();

  //      res.render('ls', 
  //        {user:req.user, 
  //          username: req.user.username,
  //          cwd:cwd,
  //          cwd_chain: cwd_chain,
  //          user_folder_ul : ul
  //        }
  //      );
  //    });

  //  });


  // 0806, testing the new UI, replace of 'ls'. for basic file listing and people
  //app.get(/^\/ls-old-0816\/(.*)/, 
  //    cel.ensureLoggedIn('/login'),
  //    function(req, res, next){
  //      //res.end('testing s'); next();
  //      //console.log(0529-1); console.log((req.params[0]));
  //      var cwd  = req.params[0];
  //      var username = req.user.username;
  //      if( typeof cwd === 'undefined' || !cwd ) cwd = username; //dir anyway.

  //      s3folder.retrieve_folder(cwd, function(folder){
  //        if(!folder) return res.end('?cwd: ' + cwd);
  //        var cwd_chain = path_chain(cwd, '/ls/');  // '/ls/' is start of the href
  //        //var ul = folder.get_ul_renderring();
  //        folder.give_ul_renderring(username, function(ul){
  //          ////

  //          social.get_current_people_list_ul(username, function(current_people){
  //            if(!current_people) current_people = '<p>error or chose people from <a href="/people"> people</a></p>';

  //            assemble_html_for_listing(
  //              username, ul, cwd, cwd_chain, current_people, function(html){
  //                res.send(html);
  //            });

  //            //var contexts = {
  //            //  body : {user_folder_ul:ul, cwd:cwd, cwd_chain:cwd_chain,current_people:current_people},
  //            //};
  //            ////log28('user folder in ls86', ul);
  //            ////log28('user name in ls86', username);
  //            ////log28('cwd name in ls86', cwd);

  //            //var html_elements = {
  //            //  body   : 'file-list.html',
  //            //  header : 'goodheader.html',
  //            //  navbar : 'people-file-navtabs.html',
  //            //  script : 'file-list-script.html',
  //            //  frame  : 'frame-a.html',
  //            //};

  //            //mytemplate.assemble_html(html_elements, contexts, function(html){
  //            //  res.send(html);
  //            //});
  //          });
  //          ////
  //        });

  //      });

  //    });


  // 0816, testing give page according username and membership.
  app.get(/^\/ls\/(.*)/, 
      cel.ensureLoggedIn('/login'),
      function(req, res, next){
        var cwd  = req.params[0];
        var username = req.user.username;
        if( typeof cwd === 'undefined' || !cwd ) cwd = username; //dir anyway.

        //log28('username, cwd in ls', [username, cwd]);

        ls_for_username(username, cwd, function(err, html){
          res.send(html);
        });
      });

  var fileinfo = require( '../myutils/fileinfo-a.js');
  var folder_v4= require( '../aws/folder-v4.js');
  // Get file information by: dir/uuid
  // Let's call it: puuid
  app.get(/^\/fileinfo-pathuuid\/(.*)/, 
      cel.ensureLoggedIn('/login'),
      function(req, res, next){
        var username = req.user.username;

        var puuid = req.params[0];
        var dir   = path.dirname(puuid);
        var uuid  = path.basename(puuid);

        folder_v4.make_s3folder_v4(dir).then(
          function(folder){
            folder.get_file_obj(uuid).then(
              function(file){
                var ul = file.convert_meta_to_ul();

                fileinfo.assemble_file_info_html(username, ul, dir, function(html){
                  res.send(html);
                });

              }
            );
          }
        );
      });


  // 0725, what's the good way to do UI?  todo
  app.get(/^\/message\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      //res.end('testing s'); next();
      //console.log(0529-1); console.log((req.params[0]));
      var cwd  = req.params[0];
      var username = req.user.username;

      s3folder.retrieve_folder(cwd, function(folder){
        var cwd_chain = path_chain(cwd, '/ls/');  // '/ls/' is start of the href
        var ul = folder.get_ul_renderring();

        res.render('ls', 
          {user:req.user, 
            username: req.user.username,
            cwd:cwd,
            cwd_chain: cwd_chain,
            user_folder_ul : ul
          }
        );
      });

    });

  // this is testing 0613, to let user select and send files
  app.get(/^\/list-msg\/(.*)/, 
      //cel.ensureLoggedIn('/login'),
      function(req, res, next){
        var cwd  = req.params[0];
        console.log('cwd'); console.log(cwd);
        var username = req.user.username;
        if( typeof cwd === 'undefined' || !cwd ) cwd = path.join(username, 'goodagood/.in');
        console.log('cwd 2'); console.log(cwd);

        // todo : make a list of files plus folders.
        //bucket.list_msg_folder(username, cwd, function(err, data){
        meta.get_file_list_in_folder(cwd, function(err, data){

          var cwd_chain = path_chain(cwd, '/list-msg/');  // '/list2/' is start of the href

          //console.log(data);
          res.render('list3', 
            {user:req.user, 
              username: req.user.username,
            cwd:cwd,
            cwd_chain: cwd_chain,
            user_folder_ul:data});
        });

      });

  
  // do the sending file, get parameters from url query string.
  app.get('/testsend', 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      console.log('\n testsend \n');
      console.log(req.query);
      var src = decodeURIComponent(req.query.src);
      var target_user = decodeURIComponent( req.query.targetuser);

      //var target = path.join(target_user, 'goodagood/in');
      var target = path.join(target_user, myconfig.message_folder);

      //console.log(src, '  ', target);
      deliver.copy_file(src, target);

      //res.send(JSON.stringify(req.query));
      res.json(req.query);
      next();
    });

  app.post('/save-file-list/',  // not use this one?
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      var list_str = req.body.file_list_str;
      var file_list= JSON.parse(list_str);
      //log28(file_list);
      // check and save to file list, todo
    });

  app.post('/send-file/', 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      var file_list_str = req.body.file_list_str;
      var file_list= JSON.parse(file_list_str);

      var people_list_str = req.body.people_list_str;
      var people_list= JSON.parse(people_list_str);

      console.log('send-file post here');
      log28('file list: ', file_list);
      log28('people list:', people_list);

      file_list.forEach(function(src_file){
        people_list.forEach(function(target_user){
          var target = path.join(target_user, myconfig.message_folder);
          log28('to deliver with copy_file( ', [src_file, target]);
          deliver.copy_file(src_file, target);
        });
      });

      // check and save to file list, todo
      res.json({});
      next();
    });

  // add folder, 0529:
  app.get(/\/add-folder\/(.*)/,
    cel.ensureLoggedIn('/login'),
    function(req, res){
      //console.log(req.user);
      console.log("add-folder ...");
      console.log(req.user.username);

      // calculate current directory:
      var current_dir = req.params[0];
      var cwd_chain = path_chain(current_dir, '/ls/');

      console.log('current_dir');
      console.log(current_dir);

      res.render('add-folder', 
        { user: req.user, 
          message: req.flash('error'),
          current_dir: current_dir,
          cwd_chain:cwd_chain,
        });
  });


  app.post(/\/add-folder\/(.*)/, function(req, res){

    //console.log('add folder post...');

    var cwd = req.params[0];
    var username = req.user.username;
    var folder_name = req.body.folder_name;

    /// re-write:
    s3folder.retrieve_folder(cwd, function(current_dir_obj){
      current_dir_obj.add_folder(folder_name, function(new_folder){
        res.redirect('/ls/' + cwd);
      });
    });

    //res.redirect('/ls/' + cwd);

  });

  app.get(/\/view\/(.*)/, function(req, res, next){
    var file_path = req.params[0];
    var username = req.user.username;
    console.log('view-- ', file_path);

    //var ext = path.extname(file_path);
    //if( ext !== '.md' ) {res.end('not markdown file.'); next();}

    s3folder.retrieve_file_meta(file_path, function(meta){
      if(meta.storage.type === 'meta-text'){
        var text = meta.storage.text;
        var contents = markdown.toHTML(text);
        res.render('view', 
          { user: req.user, 
            message: req.flash('error'),
          contents: contents,
        });
        //next(); // I am not sure if 'next()' could stop running the rest.
      }
      if(meta.storage.type === 's3'){
        bucket.read_file(meta.storage.key, function(err, text){
          var contents = markdown.toHTML(text);
          res.render('view', 
            { user: req.user, 
              message: req.flash('error'),
            contents: contents,
          });
          //next(); // I am not sure if 'next()' could stop running the rest.
        });
      }

    });

  });

}




function ls_for_username(username, cwd, callback){
  s3folder.retrieve_folder(cwd, function(err, folder){
    if(!folder) return callback('?cwd: ' + cwd);
    folder.check_username(username, function(what){
      log28('check user name, what', what);
      switch (what){
        case "owner" :
          ls_for_owner(username, folder, callback);
          break;
        case "member" :
          ls_for_owner(username, folder, callback);
          break;
        case "viewer" :
          ls_for_viewer(username, folder, callback);
          break;
        case "who-known" :
          ls_for_public(username, folder, callback);
          break;
        default :
          ls_for_public(username, folder, callback);
          break;
      };
    });
  });
}

function ls_for_owner(username, folder, callback){
  log28('function ls_for_owner(username, typeof folder)', [username, typeof folder]);
  var meta = folder.get_meta();
  var cwd  = meta.path;
  var cwd_chain = myutil.path_chain(cwd, '/ls/');  // '/ls/' is start of the href
  //log28('ls for owner, folder meta', meta);

  folder.give_ul_renderring(username, function(ul){
    //log28('folder.give_ul_renderring(username, function(ul)', ul);
    social.get_current_people_list_ul(username, function(current_people){
      //log28('social.get_current_people_list_ul(username, function(current_people)', current_people);
      if(!current_people) current_people = '<p>error or chose people from <a href="/people"> people</a></p>';

      var css_file = require("../aws/css-file.js");
      css_file.read_folder_css_file(meta.path).then(function(css_as_string){
        assemble_html_with_css(
          username, ul, cwd, cwd_chain, current_people, css_as_string, function(html){
            callback(null, html);
          });

      });


    });
  });
}

function ls_for_viewer(username, folder, callback){
  var meta = folder.get_meta();
  var cwd  = meta.path;
  var cwd_chain = myutil.path_chain(cwd, '/ls/');  // '/ls/' is start of the href

  folder.give_ul_renderring(username, function(ul){
    // 
    assemble_folder_list_for_viewer(
        username, ul, cwd, cwd_chain, null, callback);

  });
}

function ls_for_public(username, folder, callback){
  var meta = folder.get_meta();
  var cwd  = meta.path;
  var cwd_chain = myutil.path_chain(cwd, '/ls/');  // '/ls/' is start of the href

  folder.give_ul_renderring(username, function(ul){
    // 
    assemble_folder_listing_for_public(username, ul, null, null, null, callback);

  });
}

function assemble_folder_listing_for_public(
    username,
    ul_file_list,
    cwd, 
    cwd_chain,
    current_people,
    callback
    ){
        var contexts = {
          body : {user_folder_ul : ul_file_list,
            cwd : cwd, 
            cwd_chain : cwd_chain,
            current_people : current_people},
          header : { username : username },
        };
        //log28('user folder in ls86', ul);
        //log28('user name in ls86', username);
        //log28('cwd name in ls86', cwd);

        var html_elements = {
          body   : 'public-list.html',
          header : 'goodheader.html',
          navbar : 'empty.html',
          script : 'empty.html',
          frame  : 'frame-a.html',
        };

        mytemplate.assemble_html(html_elements, contexts, function(html){
          callback(html);
        });
}

function assemble_folder_list_for_viewer(
    username, ul_file_list, cwd, cwd_chain, current_people, callback
    ){
        var contexts = {
          body : {user_folder_ul : ul_file_list,
            cwd : cwd, 
            cwd_chain : cwd_chain,
            current_people : current_people},
          header : { username : username },
        };
        //log28('user folder in ls86', ul);
        //log28('user name in ls86', username);
        //log28('cwd name in ls86', cwd);

        var html_elements = {
          body   : 'viewer-folder-list.html',
          header : 'goodheader.html',
          navbar : 'people-file-navtabs.html',
          script : 'file-list-script.html',
          frame  : 'frame-a.html',
        };

        mytemplate.assemble_html(html_elements, contexts, function(html){
          callback(null, html);
        });
}


// really tedious job, make change to use css, as: assemble html with css
function assemble_html_for_listing(
    username, 
    ul_file_list,
    cwd, cwd_chain,
    current_people,
    callback
    )
{
        var contexts = {
          body : {user_folder_ul : ul_file_list,
            cwd : cwd, 
            cwd_chain : cwd_chain,
            current_people : current_people},
          header : { username : username },
        };
        //log28('user folder in 88', ul_file_list);
        //log28('user name in ls86', username);
        //log28('cwd name in ls86', cwd);

        var html_elements = {
          body   : 'file-list.html',
          header : 'goodheader.html',
          navbar : 'people-file-navtabs.html',
          script : 'file-list-script.html',
          frame  : 'frame-a.html',
        };

        //mytemplate.assemble_html(html_elements, contexts, function(html){
        //  callback(html);
        //});
        mytemplate.assemble_html_v1(html_elements, contexts).then(
            function(html){ callback(html); }
        );
}


function assemble_html_with_css(
    username, 
    ul_file_list,
    cwd, cwd_chain,
    current_people,
    css,
    callback
    )
{
        var contexts = {
          body : {user_folder_ul : ul_file_list,
            cwd : cwd, 
            cwd_chain : cwd_chain,
            current_people : current_people},
          header : { username : username },
          frame : {css : css},
        };
        //log28('user folder in 88', ul_file_list);
        //log28('user name in ls86', username);
        //log28('cwd name in ls86', cwd);

        var html_elements = {
          body   : 'file-list.html',
          header : 'goodheader.html',
          navbar : 'people-file-navtabs.html',
          script : 'file-list-script.html',
          frame  : 'frame-a.html',
        };

        //mytemplate.assemble_html(html_elements, contexts, function(html){
        //  callback(html);
        //});
        mytemplate.assemble_html_v1(html_elements, contexts).then(
            function(html){ callback(html); }
        );
}


function isEmpty(str) {
      return (!str || 0 === str.length);
}


// For checking if a string is blank, null or undefined:
function isBlank(str) {
      return (!str || /^\s*$/.test(str));
}


function check_path_username_agree(path, username){
  // Because all user's home folder would be: username/
  // so, the path should starts from username, as: 'username/path/file/name...'
  if (path.indexOf(username) !== 0) return false;
  return true;
}


function path_chain(path_string, prefix){
    if (typeof path_string !== 'string') return;

    var parts = path_string.split('/');
    parts = parts.filter(function(e){return e !== '';}); //no empty ''

    var all_path = [];
    var tmp = '';
    for (var i = 0; i < parts.length; i++){
        tmp = path.join(tmp, parts[i]);
        all_path.push(tmp);
    }

    var href = [];
    var chain = '\n';
    var one_path = '';
    for (var j = 0; j < all_path.length; j++){
      one_path = path.join(prefix, all_path[j]);
      chain = chain + '\n<a class="path_part" href="' + one_path + '"> ' + parts[j] + ' </a>/';
    }
    //chain = '<a href="/treeview/">Home</a>/' + chain;
    return chain;

}


function make_cwd_chain(path_string){
    if (typeof path_string !== 'string') return;

    var parts = path_string.split('/');
    parts = parts.filter(function(e){return e !== '';}); //no empty ''

    var all_path = [];
    var tmp = '';
    for (var i = 0; i < parts.length; i++){
        tmp = path.join(tmp, parts[i]);
        all_path.push(tmp);
    }

    var href = [];
    var chain = '';
    var one_path = '';
    for (var j = 0; j < all_path.length; j++){
      one_path = path.join('/treeview/', all_path[j]);
      chain = chain + '<a href="' + one_path + '"> ' + parts[j] + ' </a>/';
    }
    chain = '<a href="/treeview/">Home</a>/' + chain;
    return chain;

}


function test_make_cwd_chain(){
  var a = make_cwd_chain('abc/goodagood/etc');
  console.log(a);
  console.log(make_cwd_chain('goodagood/public/images'));
}


/* test */
function test_clone_default_folder_file(){
  var fake_user = {username:'haha', id:'haha'};
  var cloned = clone_default_folder_file(fake_user);
  console.log(cloned);
}


exports.list = list;

// export for testing:
exports.ls_for_owner = ls_for_owner;


if (require.main === module){
  //test_clone_default_folder_file();
  //test_check_out_cwd_tree();
  test_make_cwd_chain();

  setTimeout(function(){ process.exit(1); }, 3000);  // close the process.
}


// vim: set et ts=2 sw=2 fdm=indent:
