// 0525,  01-26/2015, editor
//
//var passport = require('passport')
var util = require('util');
var path = require('path');
var u    = require('underscore');

var myuser = require('../myuser.js');
var myutil = require('../myutils/myutil.js');

var cel = require('connect-ensure-login');

var myconfig =   require("../config/config.js");
var bucket   = require('../aws/bucket.js');
var file_module = require('../aws/simple-file-v3.js');

var s3folder = require('../aws/folder.js');
var folder_module = require('../aws/folder-v5.js');

var mytemplate = require('../myutils/template.js');

var msg_file = require('../aws/message-file-2.js');
var deliver = require('../aws/file-deliver.js');

var social   = require('../aws/social.js');

//var log28  = require('../myutils/mylogb.js').double_log('/tmp/log28');
var p = console.log;

function ed(app){

  // test edit txt file
  app.get(/^\/edita\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      //console.log(0618-1); console.log((req.params[0]));
      var cwd  = req.params[0];
      var username = req.user.username;

      var context = { username : username, cwd : cwd, message : '', };
      mytemplate.render_file_to_string('edita.html', context, function(err, body){
            res.send(body);
      });

    });


  var get_file = require('../aws/get-file.js');
  app.post(/^\/edit-save\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      //console.log(0618-1); console.log((req.params[0]));
      var path_uuid  = req.params[0];
      var username = req.user.username;
      var cwd = path.dirname(path_uuid);
      if (!path_uuid) return res.json({});

      //console.log(req.body);
      var text   = req.body['md-edit-area'];
      var origin = req.body['origin'];
      //console.log('post edit-save, origin: ', origin);

      get_file.retrieve_file_by_path_uuid(path_uuid, function(err, file){
        file.update_storage(text, function(err, reply){
          //res.json({success:true});
          res.redirect(origin);
        });
      });
      
    });

  // using aloha as editor
  app.get(/^\/editb\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      //console.log(0618-1); console.log((req.params[0]));
      var cwd  = req.params[0];
      var username = req.user.username;

      var context = { username : username, cwd : cwd, message : '', };
      res.render('aloha-a.html', context);
    });

  // todo for wysihtml, 01 25
  app.get(/^\/editwy\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      //console.log(0618-1); console.log((req.params[0]));
      var cwd  = req.params[0];
      var username = req.user.username;
      if (!cwd) cwd = username;

      var context = { username : username, cwd : cwd, message : '', };
      res.render('editwy.html', context);
    });


  app.get(/^\/edit-path-uuid\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      //console.log(0618-1); console.log((req.params[0]));
      var pu  = req.params[0]; // path-uuid
      var username = req.user.username;
      if(!pu) pu = username; //?

      folder_module.retrieve_file_by_path_uuid(pu, function(err, file){
        file.read_to_string(function(err, str){
          //console.log ('the str 1, \n', str);
          var context = { username : username, pu : pu, text:str, message : '', };
          mytemplate.render_file_to_string('edit-path-uuid.html', context, function(err, body){
                res.send(body);
          });
        });
      });

    });

  // using bootstrap-markdown:  http://www.codingdrama.com/bootstrap-markdown/
  // post go to edit-save
  app.get(/^\/edit-md\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){

      //console.log(0618-1); console.log((req.params[0]));
      var pu  = req.params[0]; // path-uuid
      var username = req.user.username;
      if(!pu) return res.end('/ls');

      var post2 = path.join('/edit-save/', pu);
      var send2 = path.join('/send-one/', pu);
      var origin= path.join('/edit-md/', pu);
      console.log('get edit-md, origin: ', origin);

      folder_module.retrieve_file_by_path_uuid(pu, function(err, file){
        file.read_to_string(function(err, str){
          console.log ('the str 1, \n', str);
          var context = { username : username, origin:origin, post2 : post2, send2:send2, text:str, message : '', };
          mytemplate.render_file_to_string('edit-md.html', context, function(err, body){
                console.log ('the context, \n', context);
                res.send(body);
          });
        });
      });

    });


  var msg_module = require('../aws/simple-msg.js');
  var people  = require("../users/people.js");
  //app.get('/msgto/:who?', 
  //  cel.ensureLoggedIn('/login'),
  //  function(req, res, next){
  //    var username = req.user.username;
  //    var towhom = req.params.who;
  //    if (!towhom) towhom = username;


  //    var towhom_checkbox = util.format( 
  //      '<input type="checkbox" name="users[]" checked="checked" value="%s"  />' + 
  //      ' <span class="username"> %s </span>\n', 
  //      towhom, towhom) ;

  //    var Man;
  //    people.make_people_manager_for_user(username).then(function(man){
  //        Man = man;
  //        return man.get_a_few();
  //    }).then(function(name_list){
  //      var msg_list = '';  // make the list laster.

  //      if(! u.isArray(name_list)) name_list = [];
  //      name_list.push(towhom);
  //      names = u.uniq(name_list);
  //      check_boxs= name_list_to_checkbox(names);

  //      var body_context = { 
  //        messageList : msg_list,
  //        username : username, 
  //        towhom : towhom,
  //        towhom_checkbox  : '',
  //        message : '', 
  //        people_list : check_boxs,
  //      };

  //      var contexts = {
  //        body : body_context,
  //        frame : {css : '<link rel="stylesheet" href="/static/css/c2.css">\n', },
  //        script : {towhom : towhom},
  //      };

  //      var html_elements = {
  //        body   : 'msgto-body.html',
  //        header : 'goodheader.html',
  //        navbar : 'people-file-navtabs.html',
  //        script : 'msgto-script.html',
  //        frame  : 'frame-a.html',
  //      };

  //      mytemplate.assemble_html_v2(html_elements, contexts).then(function(html){
  //        res.send(html);
  //      });

  //    });
  //  });

  //app.get  '/msgto/:who?' ...  changed to use msg2.js, 0710, 2015
  app.get("/msgto/:username?", cel.ensureLoggedIn('/login'), function(req, res, next){

      var msg2 = require('./msg2.js');

      msg2.get_msg2(req, res, next, function(err, html){
          res.send(html);
      });

  });

  app.post('/msgto/:who?', 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      var username = req.user.username;
      var to_in_url = req.params.who;
      //if (!to_in_url) to_in_url = username;

      var to;
      if(typeof req.body.to === 'undefined' || !req.body.to){
        to = [username, ];
      }else{
        to = JSON.parse(req.body['to']); // have to get array.
      }
      if(to_in_url) to.push(to_in_url);
      to = u.uniq(to);

      var text = req.body['text_input'];

      var msg = {
        from : username,
        to: to,
        message : text,
        text : text, // I changed to use 'text' as id, stupidly. But it not matter here.
        timestamp: Date.now(),
      };

      console.log('doing 2\n', msg);
      //res.json(msg);

      msg_module.compose_msg(msg.from, msg.to, msg.message, function(err, what){
        msg_module.to_multiple_receiver(msg.from, msg.to, msg.message, function(err, what){
          res.json({ok: true}); 
        });
      })

    });


  // This is actually doing job by jQuery ajax. 0805
  app.post('/sendmsg/', 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      var username = req.user.username;
      //var towhom = req.params.who;
      var towhom = req.body.to;

      if (!towhom) towhom = username;

      var text = req.body['text_input'];
      var size = text.length;
      //console.log(req.body);
      var storage = {type:'meta-text', s3key:'', note:'content in meta text', text: text,};

      var file_name = username + '-'+ towhom + '-' + Date.now().toString() + '.ggmsg';

      var data = {
        from: username,
        to : towhom,
        name : file_name,
        //path : path.join(username, '/goodagood/in'),
        path : path.join(username, myconfig.message_folder),
        size : size,
        storage : storage,
        filetype: 'goodagood-message-json-meta',
        timestamp : Date.now(),
        owner : { username: username, timestamp : Date.now() },
      };

      make_msg_files(data, function(){
        //log28('data to make msg files', data);
        res.json({});
      });
      //console.log(data);

      //res.redirect('/list3/' + cwd);
    });


  /* 2015 0514, to make write and save note easy */

  // copy from 'get edit-md', using bootstrap-markdown.
  // post go to edit-save ?
  app.get(/^\/md-note\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){

      //console.log(0618-1); console.log((req.params[0]));
      var cwd  = req.params[0]; // path-uuid
      var username = req.user.username;
      var userid   = req.user.id;
      if(!cwd) return res.end('/ls/'); //tmp

      var action = path.join('/md-note/', cwd);

      var send2 = path.join('/send-one/', cwd);
      var origin= path.join('/edit-md/', cwd);
      console.log('get edit-md, origin: ', origin);

      var context = {
        username : username,
        action: action,
      };

      res.render("md-note", context);
    });


  var note_file = require("../aws/note-file.js");
  app.post(/^\/md-note\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){

      var cwd  = req.params[0]; // path-uuid
      var username = req.user.username;
      var userid   = req.user.id;
      if(!cwd) return res.end('/ls/'); //tmp

      var text = req.body.text;
      var title= req.body.title;
      p(' in post md-note title text username userid: ', title, text, username, userid);

      var meta = {title: title, text: text, username: username, userid: userid, cwd:cwd};
      note_file.write_note_0514(meta, function(err, what){
        var redirect2 = path.join('/ls/', cwd);
        var redirect3 = path.join('/md-note/', cwd);
        res.redirect(redirect3);
      });


    });

}


function make_msg_files(meta, callback){

  msg_file.new_message_file_obj(meta, function(msgobj){



    msgobj.render_html_repr();
    var from_folder_name = path.join(meta.from, myconfig.message_folder);
    //log28('from folder name: ', from_folder_name);
    s3folder.retrieve_folder(from_folder_name, function(from_folder){
      from_folder.add_file(msgobj.get_meta());
      from_folder.save_meta();
      //log28('from folder get meta', from_folder.get_meta());
      deliver.send_message(meta, meta.to, callback);
    });
  });
}


function deliver_msg_files(file_meta, msg,  callback){

  msg_file.new_message_file_obj(file_meta, function(msgobj){
    msgobj.calculate_meta_defaults();
    msgobj.set_message_json(msg);
    msgobj.render_html_repr(function(){
      msgobj.save_file_to_folder();
      msgobj.send_msgs(callback);
    });
  });
}

//function make_msg_file(msg_json){
//  // note: without path
//  var from = msg_json.from;
//  var to   = msg_json.to;
//  var file_name = from + ' - '+ to + ' - ' + Date.now().toString() + '.ggmsg';
//  var serialized = JSON.stringify(msg_json);
//  var size = serialized.length;
//  var meta = {
//    name : file_name,
//    size : size,
//    storage : {type : 'meta', jstr : serialized, },
//
//    filetype: "goodagood msg file",
//    //owner : { username: username, timestamp : Date.now() },
//    permission: {
//        owner : 'rwx',
//        group : '',
//        other : '',
//    },
//
//  };
//  //meta_to_file_obj(meta, function(msg_file_obj){
//  //});
//
//  var from_folder_name = path.join(from, '/goodagood/out');
//  s3folder.retrieve_folder(from_folder_name, function(from_folder){
//    meta.path = path.join(from_folder_name, meta.name);
//    from_folder.add_file(meta);
//  });
//
//  var to_folder_name = path.join(to, '/goodagood/in');
//  s3folder.retrieve_folder(to_folder_name, function(to_folder){
//    meta.path = path.join(to_folder_name, meta.name);
//    to_folder.add_file(meta);
//  });
//
//}

function name_list_to_checkbox(names){
  var checkboxs = names.map(function(name){
    return util.format( 
      '<label> <input type="checkbox" name="users[]"  value="%s"  /> ' + 
      '<span class="username"> %s &nbsp</span></label>\n', 
      name, name) ;
  });
  var str_checkboxs = checkboxs.join(' ');
  //console.log('check boxs :\n', str_checkboxs);
  return str_checkboxs;
}


module.exports.ed = ed;


if (require.main === module){
  //test_check_out_cwd_tree();

  setTimeout(function(){ process.exit(1); }, 3000);  // close the process.
}


// vim: set et ts=2 sw=2 fdm=indent:
