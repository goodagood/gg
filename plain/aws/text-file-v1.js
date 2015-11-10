// doing, 12 25, heavy refactoring

var u      = require('underscore');
var path   = require('path');
var stream = require('stream');
var fs     = require('fs');

var bucket = require('./bucket.js');
//var ft     = require('../myutils/filetype.js');
var myutil = require('../myutils/myutil.js');

var myconfig =   require("../config/config.js");
var s3folder = require("./folder-v5.js");

var simple_file = require("./simple-file-v3.js");

//var log28  = require('../myutils/mylogb.js').double_log('/tmp/log28');
var p = console.log;


function new_text_file_obj(file_meta, pass_file_obj){
  //
  // This would be simple plain text file.
  // After "simple-file-v3", it not needed to get text file type, 
  // This can be used for historr compatibilities and testing folder/file obj.
  //
  // The old intention is to save small text into meta:
  //  If the length of text < small_size, 
  //     it will be in string:     Meta.storage.text, 
  //     while Meta.storage.type : 'meta-text'
  //  Else: there will be an s3 object for text, the key is: Meta.storage.key
  //     while Meta.storage.type : 's3'
  //
  
  var Meta = file_meta;
  var small_size = 50000; // 50k, less than 50k will be take as string.


  simple_file.simple_s3_file_obj(Meta, function(err, simple){
    //
    // Put text object specific things in this callback function,
    // where we have parent obj and data.  The `simple` is actually the
    // simple file object, and get it's functionalities and data (in closure)
    //

    // Meta and file_meta should be same, but we keep using `Meta` in the 
    // following.

    function write_text_and_save(text, callback){
      if(typeof Meta.storage.key === 'undefined'){
        var err = "has no Meta.storage.key in: overwrite and save, " + Meta.name;
        return callback(err, null);
      }
      bucket.write_text_file(Meta.storage.key, text, function(err, aws_result){
        Meta.lastModifiedDate = Date.now();
        simple.save_meta_file(callback); //?
      });
    }

    //d
    function _feed_in_text(text_string, callback){
      // Note: we delete old storage anyway.
      // This will save it to s3 if needed.

      if(typeof text_string !== 'string') return callback('not string input');
      var storage;
      _delete_s3_storage(function(err){
        _build_storage_from_string(text_string, callback);
      });
    }

    function _build_storage_from_string(str, callback){
      if(str.length < small_size){
        storage = {
          type:'meta-text', 
          note:'content in Meta text',
          text: str
        };
        Meta.storage = storage;
        
        if(callback) callback(storage);
        return ;
      }

      // Can we get Meta.path now? it should be: user-name/path/to/filename
      var s3key = path.join(myconfig.raw_file_prefix, Meta.path);
      storage = {
        type:'s3',
        key: s3key,
      };
      Meta.storage = storage;
      _write_to_s3(str, function(){
        if(callback) callback(Meta.storage);
      });
    }

    function _set_file_name(name){
      Meta.name = name;
    }

    function _render_html_repr(){
      //
      // Results will be saved to Meta.html.li, it represent the file in 
      // web page
      //

      var li = '<li class="file">\n';
      // file selector
      li += '<input type="checkbox" name="filepath[]" value="' + Meta['path'] + '" />&nbsp;' ;
      // a poor icon representing text file, glyphicon
      li += '<span class="glyphicon glyphicon-list-alt"> </span>&nbsp;\n';

      li    +=  Meta.name + '&nbsp;\n' ;

      // After file name, put the rest to sub list
      li    +=  '<ul class="file-sub-ul list-unstyled">\n' ;
      li    +=  '<li class="file-list-function">\n' ;
      // hardwired view path
      var view = '<a href="/viewtxt/' + Meta.path + '"> <span class="glyphicon glyphicon-zoom-in"> </span>read</a>&nbsp;'; 
      li    += view;

      var remove = [' <a href="', Meta['delete_href'], 
        '"> <span class="glyphicon glyphicon-trash"> </span>delete</a>'].join('');
      li    += remove + '</li>\n';

      li    +=  '<li>' + myutil.all_date_parts_from_milli(Meta.timestamp) + '</li></ul>\n' ;
      li    += '</li>\n';

      if( !Meta.html ) Meta.html = {};
      Meta.html.li = li;
      return li;
    }

    function _read_text_or_null(callback){
      if(Meta.storage.type === 'meta-text') return callback(Meta.storage.text);

      if(Meta.storage.type === 's3') {
        bucket.read_file(Meta.storage.key, function(err, str){
          if(err) return callback(null);
          callback(str);
        });
        return;
      }
      callback(null);
    }

    // This is in conflict with _feed_in_text ? But it will replace the 
    // text anyway.
    function write_to_s3(text_string, callback){
      // assume the s3 key is prepared.
      // callback is from aws-sdk, callback(err, reply)
      //
      bucket.write_text_file(Meta.storage.key, text_string, callback);
    }

    // rewrite to put local file as content.
    function put_local_file_to_s3(local_file_path, callback){ //?
      // To replace the 'file' object's method, with same name.
      //
      // assume the s3 key is prepared.
      // callback is from aws-sdk, callback(err, reply)
      //
      if(typeof local_file_path === 'string'){

        fs.readFile(local_file_path, {encoding:'utf-8'}, function(err, text){
          // Because encoding is specified as utf-8, it should be utf-8 string.
          if(err) return callback(null);
          //log28('put to s3, text file', text);
          write_text_and_save(text, callback);
          //_feed_in_text(text, callback);
        });
      }
    }

    function _delete_s3_storage(callback){
      if(typeof callback === 'undefined' || !callback) callback = function(){};

      if(Meta.storage.type !== 's3') return callback(null);

      bucket.delete_object(Meta.storage.key, callback);
    }

    // to do, 0916
    function _clone_content_to_user(user_name, callback){
      //
      var tgt_meta  = {};

      tgt_meta.storage = Meta.storage;
      if(Meta.storage.type === 's3'){

        var fid  = myutil.get_uuid();
        var new_name = fid + path.extname(Meta.name); 

        var tgt_s3key = path.join(user_name, '.files', new_name );

        var tgt_storage = {type:'s3', key: tgt_s3key};
        tgt_meta.storage   = tgt_storage; // changed if it's s3 storage

        bucket.copy_file(Meta.storage.key, tgt_s3key); //This has no callback
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
      //feed_in_text : _feed_in_text,
      //set_file_name : _set_file_name,

      //read_text_or_null : _read_text_or_null,
      //// shadow the 'parent' method:
      //read_file_to_string : _read_text_or_null,

      //delete_s3_storage : _delete_s3_storage,
      //render_html_repr : _render_html_repr,
      //clone_content_to_user : _clone_content_to_user,

      //write_to_s3 : write_to_s3,
      put_local_file_to_s3 : put_local_file_to_s3,
      write_text_and_save : write_text_and_save,

      version : 'text file object version 1'
    };

    //u.extend(simple, new_obj);
    u.defaults(new_obj, simple); // this gives new_obj only it has not.
    new_obj.calculate_meta_defaults();
    if(typeof Meta.html.li === 'undefined') new_obj.render_html_repr();
    
    p('text file v1.js going to pass file obj, 2015 1016');
    pass_file_obj(null, new_obj); // This callback pass out the text file object.
  });
}



if (require.main === module){
  // p();
}

module.exports.new_text_file_obj  = new_text_file_obj;

// vim: set et ts=2 sw=2 fdm=indent:
