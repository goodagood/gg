// 0525, routes to list files
//
//var passport = require('passport')
var u    = require('underscore');
var util = require('util');
var path = require('path');
var markdown = require('markdown').markdown;

var myuser = require('../myuser.js');
var myutil = require('../myutils/myutil.js');

var cel = require('connect-ensure-login');

var myconfig =   require("../config/config.js");
var myconfig =  require("../config/config.js");

var bucket   = require('../aws/bucket.js');
var meta     = require('../aws/meta.js');

var s3folder = require('../aws/folder.js');
var deliver  = require('../aws/file-deliver.js');
var social   = require('../aws/social.js');

var mytemplate = require('../myutils/template.js');

var log28  = require('../myutils/mylogb.js').double_log('/tmp/log28');

function folder_tool_urls(app){

  app.get(/^\/tools\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){

      var username = req.user.username; 
      //if (typeof username === 'undefined' || !username) username = 'anonymous';

      var cwd = req.params[0];
      if ( typeof cwd === 'undefined' || cwd === '' || !cwd  ){ 
        cwd = username;
      }
      var cwd_chain = myutil.path_chain(cwd, '/ls/');


      s3folder.retrieve_folder(cwd, function(folder){
        var meta = folder.get_meta();

        // button will set to be empty string if no needed.
        var start_to_have_viewers_btn = util.format(
          '<p> <a href="/open2viewer/%s"> <span class="btn btn-default">Open folder to</span></a>  viewers</p>',
          cwd);
        if (typeof meta.is_open_folder !== 'undefined' && meta.is_open_folder) start_to_have_viewers_btn = '';

        // button will set to be empty string if no needed.
        var convert_to_team_btn = util.format(
          '<p> <a href="/toteamfolder/%s"> <span class="btn btn-default">Convert to</span></a> team folder.</p>',
          cwd);
        if (typeof meta.is_team_folder !== 'undefined' && meta.is_team_folder) convert_to_team_btn = '';

        var convert_to_value_folder_btn = util.format(
          '<p> <a href="/tovaluefolder/%s"> <span class="btn btn-default">Make folder to</span></a>  value each file.</p>',
          cwd);
        if (typeof meta.is_value_folder !== 'undefined' && meta.is_value_folder) convert_to_value_folder_btn = '';

        var people_list = social.get_people_list_ul(username, function(alist){
          var body_context = { username : username,
            cwd : cwd,
            cwd_chain : cwd_chain,
            people_list : alist,
            open_folder : start_to_have_viewers_btn,
            to_team : convert_to_team_btn,
            value_folder : convert_to_value_folder_btn,
            };
          var contexts = {body:body_context};
          html_files = {body:'folder-tools-body.html', script:'folder-tools-script.html' };
          mytemplate.assemble_html(html_files, contexts, function(html){
            res.send(html);
          });
          //mytemplate.render_file_to_string('folder-tools-body.html', context, function(err, body){
          //  mytemplate.render_file_to_string('folder-tools-navbar.html', context, function(err, navbar){
          //    mytemplate.render_file_to_string('folder-tools.html', {body:body, navbar:navbar}, function(err, html){
          //        res.send(html);
          //    });
          //  });
          //});
        });

      });


    });


  app.get(/^\/toteamfolder\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      var username = req.user.username; 
      //if (typeof username === 'undefined' || !username) username = 'anonymous';

      var cwd = req.params[0];
      //if ( typeof cwd === 'undefined' || cwd === '' || !cwd  ){ 
      //  cwd = username;
      //}
      //var cwd_chain = myutil.path_chain(cwd, '/ls/');

      s3folder.retrieve_folder(cwd, function(folder){
        folder.init_members_file();
      });
      res.redirect('/tools/' + cwd);
    });

  app.get(/^\/tovaluefolder\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      var username = req.user.username; 
      //if (typeof username === 'undefined' || !username) username = 'anonymous';

      var cwd = req.params[0];
      //if ( typeof cwd === 'undefined' || cwd === '' || !cwd  ){ 
      //  cwd = username;
      //}
      //var cwd_chain = myutil.path_chain(cwd, '/ls/');

      s3folder.retrieve_folder(cwd, function(folder){
        var meta = folder.get_meta();
        meta.is_value_folder = true;
        folder.save_meta();
      });
      res.redirect('/tools/' + cwd);
    });

  app.get(/^\/open2viewer\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      var username = req.user.username; 
      //if (typeof username === 'undefined' || !username) username = 'anonymous';

      var cwd = req.params[0];
      //if ( typeof cwd === 'undefined' || cwd === '' || !cwd  ){ 
      //  cwd = username;
      //}
      //var cwd_chain = myutil.path_chain(cwd, '/ls/');

      s3folder.retrieve_folder(cwd, function(folder){
        folder.init_viewers_file();
      });
      res.redirect('/tools/' + cwd);
    });


  app.get(/^\/add-members\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      var username = req.user.username; 

      var cwd = req.params[0];
      if ( typeof cwd === 'undefined' || cwd === '' || !cwd  ) return res.send("no a path");

      s3folder.retrieve_folder(cwd, function(folder){
        if(!folder) return res.send("no folder");


        social.get_people_list_ul(username, function(people_list){

          folder.get_all_members(function(member_list){
            var member_check_list = myutil.username_to_list(member_list);

            var body_context = { username : username,
              cwd : cwd, 
              people_list : people_list, member_list : member_list };
            var script_context = { cwd : cwd };
            var contexts = { body : body_context, script: script_context,};

            var html_files = {
              body : 'folder-tools-member.html',
              script : 'folder-tools-script.html',
              frame: 'frame-a.html',
            };
            mytemplate.assemble_html(html_files, contexts, function(html){
              res.send(html);
            });
          });

        });

      });

    });



  app.post(/^\/add-member\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){

      //var cwd  = req.params[0];
      var username = req.user.username;
      //if( typeof cwd === 'undefined' || !cwd ) return res.end('cwd = ?');

      var names = req.body.names;
      if( !names) names = '';
      var name_list = JSON.parse(names);
      if(! u.isArray(name_list)) name_list = [];

      var folder_path        = req.body.folder_path;

      console.log(folder_path);
      //return res.json({});

      s3folder.retrieve_folder(folder_path, function(folder){
        console.log('folder.get_meta().path');
        console.log(folder.get_meta().path);
        folder.add_members(name_list, function(){
          res.json({ok:'ok'});
        });
      });

    });


  app.get(/^\/delete-members\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      var username = req.user.username; 

      var cwd = req.params[0];
      if ( typeof cwd === 'undefined' || cwd === '' || !cwd  ) return res.send("no a path");

      s3folder.retrieve_folder(cwd, function(folder){
        if(!folder) return res.send("no folder");

        //var meta = folder.get_meta();

        folder.get_all_members(function(member_list){
          var member_check_list = myutil.array_to_checkbox_list(member_list);

          var body_context = { 
            username : username,
            cwd : cwd,     
            member_list : member_check_list,
            };
          var script_context = { cwd : cwd };
          var contexts = { body : body_context, script: script_context,};

          var html_files = {
            body : 'folder-tools-member-del.html',
            script : 'folder-tools-script.html',
            //frame: 'frame-a.html',
          };
          mytemplate.assemble_html(html_files, contexts, function(html){
            res.send(html);
          });
        });

      });

    });


  app.post(/^\/delete-members\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){

      //var cwd  = req.params[0];
      var username = req.user.username;
      //if( typeof cwd === 'undefined' || !cwd ) return res.end('cwd = ?');

      var viewer_name = req.body.name;
      log28('viewer name: ', viewer_name);
      if (!viewer_name) viewer_name = '';
      var name_list   = JSON.parse(viewer_name);
      if(! u.isArray(name_list)) name_list = [];
      var team_path        = req.body.team_path;
      log28('team_path string: ', team_path);

      //console.log(viewer_name, team_path);
      //return res.json({});

      s3folder.retrieve_folder(team_path, function(folder){
        if( !folder ){
          //log28('folder not found?', folder);
          return res.json({ok: false});
        }

        //var cwd_chain = path_chain(cwd, '/ls/');  // '/ls/' is start of the href
        //console.log('folder.get_meta().path');
        //console.log(folder.get_meta().path);
        folder.delete_members(name_list, function(){
          res.json({ok:'ok'});
        });

      });

    });




  app.get(/^\/add-viewer\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      var username = req.user.username; 

      var cwd = req.params[0];
      if ( typeof cwd === 'undefined' || cwd === '' || !cwd  ) return res.send("no a path");

      s3folder.retrieve_folder(cwd, function(folder){
        if(!folder) return res.send("no folder");

        var meta = folder.get_meta();

        // init_button will set to be empty string if no needed.
        var start_to_have_viewers_btn = util.format(
          '<p> <a href="/open2viewer/%s"> <span class="btn btn-default">Open folder to</span></a>  viewers</p>',
          cwd);
        if (meta.is_open_folder) start_to_have_viewers_btn = '';

        //var people_list = social.get_people_list_ul(username, function(alist)
        social.get_people_list_ul(username, function(alist){
          var every_one = '<ul  class="usernames list-inline">';
          every_one    += '<li class="username">\n<input type="checkbox" name="users[]" value="*"  /> &nbsp;';
          every_one    += 'Every One CAN view &nbsp</li></ul>\n';
          alist = every_one + alist;


          folder.get_all_viewers(function(view_list){
            var view_list_str = view_list.join(', ');

            var body_context = { username : username,
              cwd : cwd,           start_to_have_viewers_btn : start_to_have_viewers_btn,
              people_list : alist, current_viewers : view_list };
            var script_context = { cwd : cwd };
            var contexts = { body : body_context, script: script_context,};

            var html_files = {
              body : 'folder-tools-viewer.html',
              script : 'folder-tools-script.html',
              frame: 'frame-a.html',
            };
            mytemplate.assemble_html(html_files, contexts, function(html){
              res.send(html);
            });
          });

        });

      });

    });


  app.post(/^\/add-viewer\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){

      //var cwd  = req.params[0];
      var username = req.user.username;
      //if( typeof cwd === 'undefined' || !cwd ) return res.end('cwd = ?');

      var viewer_name = req.body.name;
      log28('viewer name: ', viewer_name);
      if (!viewer_name) viewer_name = '';
      var name_list   = JSON.parse(viewer_name);
      if(! u.isArray(name_list)) name_list = [];
      var team        = req.body.team;
      log28('team string: ', team);

      //console.log(viewer_name, team);
      //return res.json({});

      s3folder.retrieve_folder(team, function(folder){
        if( !folder ){
          log28('folder not found?', folder);
          return res.json({ok: false});
        }

        //var cwd_chain = path_chain(cwd, '/ls/');  // '/ls/' is start of the href
        //console.log('folder.get_meta().path');
        //console.log(folder.get_meta().path);
        folder.add_viewers(name_list, function(){
          res.json({ok:'ok'});
        });

      });

    });


  app.get(/^\/delete-viewer\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      var username = req.user.username; 

      var cwd = req.params[0];
      if ( typeof cwd === 'undefined' || cwd === '' || !cwd  ) return res.send("no a path");

      s3folder.retrieve_folder(cwd, function(folder){
        if(!folder) return res.send("no folder");

        var meta = folder.get_meta();

        folder.get_all_viewers(function(viewer_list){
          var viewer_check_list = myutil.array_to_checkbox_list(viewer_list);

          var body_context = { 
            username : username,
            cwd : cwd,     
            viewer_list : viewer_check_list,
            };
          var script_context = { cwd : cwd };
          var contexts = { body : body_context, script: script_context,};

          var html_files = {
            body : 'folder-tools-viewer-del.html',
            script : 'folder-tools-script.html',
            //frame: 'frame-a.html',
          };
          mytemplate.assemble_html(html_files, contexts, function(html){
            res.send(html);
          });
        });

      });

    });


  app.post(/^\/delete-viewer\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){

      //var cwd  = req.params[0];
      var username = req.user.username;
      //if( typeof cwd === 'undefined' || !cwd ) return res.end('cwd = ?');

      var viewer_name = req.body.name;
      log28('viewer name: ', viewer_name);
      if (!viewer_name) viewer_name = '';
      var name_list   = JSON.parse(viewer_name);
      if(! u.isArray(name_list)) name_list = [];
      var team_path        = req.body.team_path;
      log28('team_path string: ', team_path);

      //console.log(viewer_name, team_path);
      //return res.json({});

      s3folder.retrieve_folder(team_path, function(folder){
        if( !folder ){
          //log28('folder not found?', folder);
          return res.json({ok: false});
        }

        //var cwd_chain = path_chain(cwd, '/ls/');  // '/ls/' is start of the href
        //console.log('folder.get_meta().path');
        //console.log(folder.get_meta().path);
        folder.delete_viewers(name_list, function(){
          res.json({ok:'ok'});
        });

      });

    });



}


exports.folder_tool_urls = folder_tool_urls;


if (require.main === module){
  //test_clone_default_folder_file();
  //test_check_out_cwd_tree();

  setTimeout(function(){ process.exit(1); }, 3000);  // close the process.
}


// vim: set et ts=2 sw=2 fdm=indent:
