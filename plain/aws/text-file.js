var u      = require('underscore');
var path   = require('path');
var stream = require('stream');
var fs     = require('fs');

var bucket = require('./bucket.js');
//var ft     = require('../myutils/filetype.js');
var myutil = require('../myutils/myutil.js');

//var myconfig =   require("../config/config.js");
var s3folder = require("./folder.js");
var s3file   = require("./file.js");

var log28  = require('../myutils/mylogb.js').double_log('/tmp/log28');

function new_text_file_obj(file_meta, pass_file_obj){
  //
  // This would be simple plain text file, the file is saved to s3.
  //
  // Internally:
  //  If the length of text < 1000 bytes, 
  //     it will be in string: meta.storage.text, 
  //     while meta.storage.type : 's3'
  //  Else: there will be an s3 object, the key is: meta.storage.key
  //    while meta.storage.type : 'meta-text'
  //
  
  var meta = file_meta;

  s3file.new_s3_file_obj(meta, function(file_obj){
    //
    // It going to be wrapped here, in a callback where we have parent obj
    // and data.
    //

    //file_obj.set_meta(meta);
    // Now, we have file object and it's meta data. 

    function _feed_in_text(text_string, callback){
      // This will save it to s3 if needed.

      //log28('feed in text', text_string);
      var storage;
      if(!text_string) text_string = ''; //?
      if(text_string.length < 1001){
        storage = {
          type:'meta-text', 
          note:'content in meta text',
          text: text_string
        };
        //log28('if(text_string.length < 1001)', storage);
        meta.storage = storage;
        
        if(callback) callback(storage);
        return ;
      }

      // length > 1k
      //var file_id = myutil.get_uuid() + '.txt';
      //var file_id = myutil.get_uuid();
      //var s3key = path.join(meta.owner.username, '.files', file_id);
      //log28('weird wired wried', storage);

      var s3key = s3file.uuid_file_name_for_username(meta.name, meta.owner.username);
      storage = {
        type:'s3',
        key: s3key,
      };
      meta.storage = storage;
      _write_to_s3(text_string, function(){
        if(callback) callback(meta.storage);
      });
      return ;
    }

    function _set_file_name(name){
      meta.name = name;
    }

    function _render_html_repr(){
      //
      // Results will be saved to meta.html.li, it represent the file in 
      // web page
      //

      var li = '<li class="file">\n';
      // file selector
      li += '<input type="checkbox" name="filepath[]" value="' + meta['path'] + '" />&nbsp;' ;
      // a poor icon representing text file, glyphicon
      li += '<span class="glyphicon glyphicon-list-alt"> </span>&nbsp;\n';

      li    +=  meta.name + '&nbsp;\n' ;

      // After file name, put the rest to sub list
      li    +=  '<ul class="file-sub-ul list-unstyled">\n' ;
      li    +=  '<li class="file-list-function">\n' ;
      // hardwired view path
      var view = '<a href="/viewtxt/' + meta.path + '"> <span class="glyphicon glyphicon-zoom-in"> </span>read</a>&nbsp;'; 
      li    += view;

      var remove = [' <a href="', meta['delete_href'], 
        '"> <span class="glyphicon glyphicon-trash"> </span>delete</a>'].join('');
      li    += remove + '</li>\n';

      li    +=  '<li>' + myutil.all_date_parts_from_milli(meta.timestamp) + '</li></ul>\n' ;
      li    += '</li>\n';

      if( !meta.html ) meta.html = {};
      meta.html.li = li;
      return li;
    }

    function _read_text_or_null(callback){
      if(meta.storage.type === 'meta-text') return callback(meta.storage.text);

      if(meta.storage.type === 's3') {
        bucket.read_file(meta.storage.key, function(err, str){
          if(err) return callback(null);
          callback(str);
        });
        return;
      }
      callback(null);
    }

    function _write_to_s3(text_string, callback){
      // assume the s3 key is prepared.
      // callback is from aws-sdk, callback(err, reply)
      //
      bucket.write_text_file(meta.storage.key, text_string, callback);
    }

    function _put_to_s3(callback){ //?
      // To replace the 'file' object's method, with same name.
      //
      // assume the s3 key is prepared.
      // callback is from aws-sdk, callback(err, reply)
      //
      if(typeof meta.local_file !== 'undefined' && meta.local_file.path !== 'undefined'){

        fs.readFile(meta.local_file.path, {encoding:'utf8'}, function(err, text){
          if(err) return callback(null);
          log28('put to s3, text file', text);
          _feed_in_text(text, callback);
        });
      }
    }

    function _delete_s3_storage(callback){
      if(meta.storage.type !== 's3') return;

      if(typeof callback === 'undefined' || !callback) callback = function(){};
      bucket.delete_object(meta.storage.key, callback);
    }

    function _clone_content_to_user(user_name, callback){
      //
      var tgt_meta  = {};

      tgt_meta.storage = meta.storage;
      if(meta.storage.type === 's3'){

        var fid  = myutil.get_uuid();
        var new_name = fid + path.extname(meta.name); 

        var tgt_s3key = path.join(user_name, '.files', new_name );

        var tgt_storage = {type:'s3', key: tgt_s3key};
        tgt_meta.storage   = tgt_storage; // changed if it's s3 storage

        bucket.copy_file(meta.storage.key, tgt_s3key); //This has no callback
      }

      callback(tgt_meta);
    }

    function _convert_text_content_to_readable_stream(callback){
      var s = new stream.Readable();
      s._read = function noop(){};
      _read_text_or_null(function(str){
        if(str){
          s.push();
        }else{
          s.push('');
        }
        s.push(null);
        callback(s);
      });
    }

    // Object with new functionalities
    var new_obj = {
      feed_in_text : _feed_in_text,
      set_file_name : _set_file_name,
      put_to_s3 : _put_to_s3,

      read_text_or_null : _read_text_or_null,
      // shadow the 'parent' method:
      read_file_to_string : _read_text_or_null,

      delete_s3_storage : _delete_s3_storage,
      render_html_repr : _render_html_repr,
      clone_content_to_user : _clone_content_to_user,
    };

    u.defaults(new_obj, file_obj);
    new_obj.calculate_meta_defaults();
    if(typeof meta.html.li === 'undefined') new_obj.render_html_repr();
    pass_file_obj(new_obj); // This callback pass out the text file object.
  });

}


if (require.main === module){
}

module.exports.new_text_file_obj  = new_text_file_obj;

// vim: set et ts=2 sw=2 fdm=indent:
