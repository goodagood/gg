// this file got spoiled, when I wrongly edited it instead of 'message-file-2.js'
//
var u      = require('underscore');
var path   = require('path');
var util   = require('util');

var bucket = require('./bucket.js');
var ft     = require('../myutils/filetype.js');
var myutil = require('../myutils/myutil.js');

var myconfig =   require("../config/config.js");
var render   = require("./render-b.js");
var image    = require("./image.js");
var s3folder = require("./folder.js");
var s3file   = require("./file.js");


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

  s3file.new_s3_file_obj(meta, function(fobj){
    //
    // It going to be wrapped here, in a callback where we have parent obj
    // and data.
    //

    //fobj.set_meta(meta);
 
    // Now, we have file object and it's meta data.  Here it get modified
    // for markdown files:

    function _set_message(msg_json, callback){
      meta.filetype = 'goodagood-message-json';
      fobj.write_json(msg_json, callback);
    }

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
        text = msg_json.message;
        if(!text) text = "WoW! Message Contents get to another file.";

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
            '&nbsp; delete</a></li>' , meta['delete_href'] );

        //var remove = ['<li> <a href="', meta['delete_href'], '"> <span class="glyphicon glyphicon-trash"> </span> &nbsp; delete</a>'].join('');
        li    += remove + '&nbsp;\n';
        li    +=  '<li>' + new Date(parseInt(msg_json.timestamp)) + '</li>\n' ;
        li    += '</ul></li>\n';

        if( !meta.html ) meta.html = {};
        meta.html.li = li;
        return li;
        callback(li);
      });
    }

    function _get_file_content(){
      return meta.storage.text;
    }

    function _put_to_s3(callback){
      // empty is enough.
    }

    function _delete_s3_storage(){
      //
      // nothing need to delete for filetype: goodagood-markdown-text-meta
    }

    function _send_to_user(user_name, callback){
      var tgt_meta  = {};

      var new_name = fid + path.extname(meta.name); 

      tgt_meta.storage   = tgt_storage;
      bucket.copy_file(meta.storage.key, tgt_s3key); //This has no callback

      // For thumbnail, only default thumbnail
      tgt_meta['thumbnail-s3key'] = image.make_thumb_key_from_file_key(tgt_meta.storage.key);
      bucket.copy_file(meta['thumbnail-s3key'], tgt_meta['thumbnail-s3key']); //This has no callback

      callback(tgt_meta);
    }

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
      put_to_s3 : _put_to_s3,
      delete_s3_storage : _delete_s3_storage,
      render_html_repr : _render_html_repr,
      clone_content_to_user : _clone_content_to_user,
    };

    u.extend(fobj, new_functions);
    pass_file_obj(fobj); // This callback pass out the image file object.
  });

}


if (require.main === module){
}

module.exports.new_message_file_obj  = new_message_file_obj;

// vim: set et ts=2 sw=2 fdm=indent:
