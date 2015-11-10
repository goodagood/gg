// new message file, to replace 'message-file.js'
// it's an json file. But it render the message.
//
var u      = require('underscore');
var path   = require('path');
var util   = require('util');

var bucket = require('./bucket.js');
var ft     = require('../myutils/filetype.js');
var myutil = require('../myutils/myutil.js');

var myconfig =   require("../config/config.js");
var image    = require("./image.js");
var s3folder = require("./folder.js");
var s3file   = require("./file.js");

var json_file= require("./json-file.js");

var log28  = require('../myutils/mylogb.js').double_log('/tmp/log28');


function new_message_file_obj(file_meta, pass_file_obj){
  //
  // For message file object. 0814
  // message file is json file, it has specific contents:
  // {
  //  from : username,
  //  to   : [ list of usernames ],
  //  message : string of text,
  //  timestamp : milli-seconds,
  // }
  //
  // filetype would be : "goodagood-message-json"
  //
  
  var meta = file_meta;
  meta.filetype = 'goodagood-message-json';

  json_file.new_json_file_obj(meta, function(fobj){

    // Now, we have file object and meta data.  Here it get modified
    // for message files:

    function _set_message_json(msg_json, callback){
      // no need to send to self.
      var to = u.difference(msg_json.to, msg_json.from);
      msg_json.to = to;
      fobj.write_json(msg_json, callback);
    }

    //d , use json-file's function
    function _get_message_json(callback){
      fobj.get_json(callback); // callback will get the json.
    }

    function _get_message_text(callback){
      fobj.get_json(function(j){
        callback(j.message);
      });
    }


    function _render_html_repr(callback){

      // Note: it past by callback
      //
      // Results will be saved to meta.html.li, it represent the file in 
      // web page
      //

      _get_message_json(function(msg_json){
        var text = msg_json.message;
        if(!text) text = "WoW! Message Contents must go to no-where.";
        //console.log(msg_json); console.log(text);

        // first, from whom:
        var li = '<li><span class="glyphicon glyphicon-leaf"></span> &nbsp;\n';
        if ( msg_json.from ) li    += util.format('<span class="username"> %s </span>:\n', msg_json.from);
        li    += '<ul class="file-info list-unstyled">';

        // sub list: the content:
        li    +=  '<li><div class="well message ">\n' ;
        li    +=  text;
        li    +=  '</div></li>\n';

        // reply to:
        li    += '<li><span class="glyphicon glyphicon-share"></span> &nbsp;';
        li    += '<a class="reply-to" data-i18n="reply-to" href="/msgto/' + msg_json.from + '">';
        li    += 'Reply to &nbsp; <span class="username badge">' + msg_json.from + '</span></a></li>\n';


        // filename
        li    += '<li>';
        li += '<input type="checkbox" name="filepath[]" value="' + meta['path'] + '" />&nbsp;' ;
        li    +=  meta.name + '&nbsp;</li>\n' ;

        // and more:
        var remove = util.format('<li> <a href="%s">' +
            '<span class="glyphicon glyphicon-trash"> </span>' +
            '&nbsp; delete &nbsp;</a></li>\n' , meta['delete_href'] );

        li    += remove ;
        li    +=  '<li>' + new Date(parseInt(msg_json.timestamp)) + '</li>\n' ;
        li    += '</ul></li>\n';

        if( !meta.html ) meta.html = {};
        meta.html.li = li;
        callback(li);
        return li;
      });
    }

    function _send_msgs(callback){
      fobj.get_json(function (msg_json){
        var acceptors = msg_json.to;
        var how_many = acceptors.length;

        //console.log(how_many);
        //log28('msg-json to', msg_json.to);

        var callback_after = u.after(how_many, callback);
        acceptors.forEach(function(whom){
          //log28(' _send_msg(whom, callback_after) to : ', whom);
          send_msg(whom, msg_json, callback_after);
        });

      });
    }
    



    ///todo
    function _clone_content_to_user(user_name, callback){
      // Can we use the parent method, 
      // when the method will be over-rided after a while?
      // Can we do it this way:
      // fobj._clone_content_to_user(....)
      //
      var tgt_meta  = {};

      var fid  = myutil.get_uuid();
      var new_name = fid + path.extname(meta.name); 

      var tgt_s3key = path.join(user_name, '.files', new_name );

      var tgt_storage = {type:'s3', key: tgt_s3key};

      tgt_meta.storage   = tgt_storage;
      bucket.copy_file(meta.storage.key, tgt_s3key); //This has no callback

      // For thumbnail, only default thumbnail
      tgt_meta['thumbnail-s3key'] = image.make_thumb_key_from_file_key(tgt_meta.storage.key);
      bucket.copy_file(meta['thumbnail-s3key'], tgt_meta['thumbnail-s3key']); //This has no callback

      callback(tgt_meta);
    }

    // Object with new functionalities
    var new_functions = {
      set_message_json : _set_message_json,
      get_message_json : _get_message_json,
      get_message_text : _get_message_text,

      render_html_repr : _render_html_repr,
      send_msgs        : _send_msgs,
      //clone_content_to_user : _clone_content_to_user,
    };

    u.extend(fobj, new_functions);
    if(typeof meta.html.li === 'undefined')  _render_html_repr();
    pass_file_obj(fobj); // This callback pass out the image file object.
  });

}



function test_a(){
  // make a message object, note it get saved.
  
  var msg = {
    from : 'tmpd',
    to: [ 'abc', 'tmp' ],
    message : '-15, test the 2nd message file, it...',
    timestamp: Date.now(),
  };

  prepare_msg_obj(msg,  function(mobj){
    //console.log(mobj);
    //mobj.save_file_to_folder();
    console.log(mobj.get_meta());
  });

}

function prepare_msg_obj(msg, callback){
  // make a message object, and pass it to callback,  note it get saved.
  
  //log28('msg', msg);

  var data = { 
    from: msg.from,
    to: msg.to,
    filetype: 'goodagood-message-json',
    timestamp: Date.now(),
  };

  var username = msg.from;

  data.name = make_msg_file_name(username);
  //log28('username', username);
  //log28('myconfig.message_folder', myconfig.message_folder);
  //log28('data name', data.name);
  data.path = path.join(username, myconfig.message_folder, data.name);
  data.size = msg.message.length;
  data.owner= { username: username, timestamp: Date.now() };


  new_message_file_obj(data, function(mobj){
    mobj.calculate_meta_defaults();
    mobj.set_message_json(msg);

    //console.log(mobj.get_meta());

    mobj.render_html_repr(function(html){
      mobj.save_file_to_folder(function(){
        callback(mobj);
      });
    });
  });
}


function send_msg(towhom, msg, callback){
  // msg is message json
  //
  //{
  //  from      : 'name of user sending the message',
  //  to        : [ 'name-1', 'name-2', ... ],
  //  message   : 'text message',
  //  timestamp : Date.now(),
  //}
  //
  //log28('msg', msg);

  var data = { 
    from: msg.from,
    to: msg.to,
    filetype: 'goodagood-message-json',
    timestamp: Date.now(),
  };

  // make a file name:
  data.name = util.format("from-%s-%s.ggmsg", msg.from, Date.now().toString());
  //log28('towhom', towhom);
  //log28('myconfig.message_folder', myconfig.message_folder);
  //log28('data name', data.name);
  data.path = path.join(towhom, myconfig.message_folder, data.name);
  data.size = msg.message.length;
  data.owner= { username: towhom, timestamp: Date.now() };

  new_message_file_obj(data, function(mobj){
    mobj.calculate_meta_defaults();
    mobj.set_message_json(msg);

    //console.log(mobj.get_meta());
    //console.log(mobj.get_message_text(function(text){
    //  console.log(text);
    //}));

    mobj.render_html_repr(function(html){
      mobj.save_file_to_folder(function(){
        callback(mobj);
      });
    });
  });
}

function test_send_msg(){
  var msg = {
    from : 'abc',
    to: [ 'tmpd', 'tmp' ],
    message : '-17, test the 2nd message file, it...',
    timestamp: Date.now(),
  };
  send_msg('tmpd', msg, function(){
    console.log('did it send?');
  });

}

function one_msg_send_many(){
  var msg = {
    from : 'tmpd',
    to: [ 'abc', 'tmp' ],
    message : '-15, test the 2nd message file, it...',
    timestamp: Date.now(),
  };

  prepare_msg_obj(msg, function(mobj){
    mobj.save_file_to_folder();
    mobj.send_msgs(function(){
      console.log('finished');
    });
    //console.log(mobj.get_meta());
  });
}

function make_msg_file_name(from){
  return util.format("msg-%s-%s.ggmsg", from, Date.now().toString());
}

if (require.main === module){
  //test_a();
  //test_send_msg();

  one_msg_send_many();
}

module.exports.new_message_file_obj  = new_message_file_obj;
module.exports.prepare_msg_obj  = prepare_msg_obj;

// vim: set et ts=2 sw=2 fdm=indent:
