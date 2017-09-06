
//
// 0720
//
// Not going to use file_path as parameter when creating file object.
//
// file_path parameter brings many conditions:
//   old file
//   new file
//   folder not exists
// each need coding.  So it better to limit to ONLY get file from folder
// object.
//
//
// thing like : make_file_obj(the_file_path, callback) would give a normal 
// sense, we tender to think file always has file path.
//
// But, actually, when we want to get a file, we get it from folder.  When we
// newly set up a file object , it can start from empty.
//
// File object can have empty meta data, and get it's data
// later.  
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
var img_file_obj = require("./image-file.js");

var log28  = require('../myutils/mylogb.js').double_log('/tmp/log28');

function new_s3_file_obj(meta_src, pass_file_obj){
  //
  // @pass_file_obj, a callback is needed because meta need to be read from s3,
  // it takes time, pass_file_obj(S3file_obj_with_closure).
  //
  // file meta data:
  //    {
  //      name : file name
  //      path : full path such: user-name/path/to/file-name.ext
  //      folder_path : path of the folder, this should replace path.
  //                    to easy the file moving.
  //
  //      storage : {...}
  //
  //      owner: //?
  //      size : 
  //      filetype :
  //      lastModifiedDate : 
  //      timestamp :
  //
  //      html : { li: represent-file-as-li in web page, ...}
  //
  //      s3_stream_href :
  //      delete_href    :
  //      view_href      :
  //
  //      value : {amount : 0, unit : 'GG'},
  //
  //    }
  //
  // Who use file object:
  //   folder : read in meta
  //            add new file meta
  //            update fiel meat
  //   upload : create new meta
  //
  
  var meta = meta_src;


  /* Start function and object defines. */

  function _set_meta(_meta){
    meta = _meta;
  }

  function _guess_owner(){

    if(typeof meta.owner === 'string'){
      // if not empty string, think it's owner's name, nothing need to do.
      if( ! /^\s*$/.test(meta.owner) ) return meta.owner;
    }

    // guess it from file path:
    if(meta.path){
      meta.owner = meta.path.split('/')[0];
      return meta.owner;
    }
    else{
      return null;
    }
  }

  function _calculate_meta_defaults(){
    //
    // meta.name, meta.path is required, offer them elsewhere.
    // All the defaults calculated here will NOT over-ride  existed ones.
    //

    var what    = myconfig.IamFile;
    var timestamp = Date.now();

    //suppose name is already set
    var filetype = ft.check_file_type_by_name(meta.name);

    var permission = {
        owner : 'rwx',
        group : '',
        other : '',
    };

    var storage  = {};

    var html = {}; // put html renderring here, <li> <p> <div> etc.

    var s3_stream_href = _calculate_s3_stream_href();
    var delete_href    = _calculate_delete_href();
    var view_href      = _calculate_view_href();

    var necessaries = {
      what : what,
      timestamp : timestamp,
      filetype : filetype,
      permission : permission,
      storage : storage,
      html : html,
      s3_stream_href : s3_stream_href,
      delete_href : delete_href,
      view_href : view_href,

      permission : {owner:'rwx', group:'', other:''},
      value : {amount : 0, unit : 'GG'},

    };
    u.defaults(meta, necessaries); // make sure we have defaults
    if(typeof meta.owner !== 'string') _guess_owner();

  }

  function _calculate_s3_stream_href(){
    if(!meta.storage) return '';
    if(!meta.storage.key) return '';
    var s3_stream_href = path.join(myconfig.s3_stream_prefix, meta.storage.key);
    return s3_stream_href;
  }

  function _calculate_delete_href(){
    if(!meta.path) return;
    var delete_href = path.join('/del/', meta.path);
    return delete_href;
  }

  function _calculate_view_href(){
    // the link (href) to view the file
    if(!meta.path) return;
    var view_href = path.join('/viewtxt/', meta.path);
    return view_href;
  }

  function _increase_value(amount){
    if(!amount) amount = 1;
    meta.value.amount += amount;
  }

  function _upgrade_to_image_file_obj(callback){
    img_file_obj.new_image_file_obj(meta, function(if_obj){
      if_obj.prepare_default_thumbnail(function(){
        //log28('image file obj ', if_obj);
        //log28('image file obj meta ', if_obj.get_meta());
        callback(if_obj);
      });
    });
  }

  var markdown_file = require('./markdown-file.js');
  var message_file  = require('./message-file-2.js');
  var video_file    = require('./video-file.js');
  var audio_file    = require('./audio-file.js');
  var text_file     = require('./text-file.js');
  var json_file     = require('./json-file.js');
  function _upgrade_with_filetype(callback){
    switch (meta.filetype){
      case 'image':
        return _upgrade_to_image_file_obj(callback);
        break;
      //case 'goodagood-folder':  // currently not need to upgrade file to folder, 0724
      //  return s3folder.retrieve_folder(meta.path, callback);
      //  break;

      //case 'goodagood file link':
      //  ;
      //case 'markdown':
      //  meta.html['li'] = render.render_msg_as_li_note(meta);
      //  break;
      case 'goodagood-markdown-text-meta':
        return markdown_file.new_markdown_file_obj(meta, function(mdobj){
          mdobj.render_html_repr();
          callback(mdobj);
        });
        break;
      case 'goodagood-message-json-meta':
        return message_file.new_message_file_obj(meta, function(msgobj){
          msgobj.render_html_repr();
          callback(msgobj);
        });
        break;
      case 'goodagood-message-json':
        return message_file.new_message_file_obj(meta, function(msgobj){
          msgobj.render_html_repr();
          callback(msgobj);
        });
        break;
      case 'text':
        return text_file.new_text_file_obj(meta, function(text_file_obj){
          //text_file_obj.render_html_repr();
          callback(text_file_obj);
        });
        break;
      case 'json':
        return json_file.new_json_file_obj(meta, function(json_file_obj){
          // json_file_obj.render_html_repr();  // rendered in building.
          callback(json_file_obj);
        });
        break;
      case 'video':
        return video_file.new_video_file_obj(meta, function(vidobj){
          vidobj.render_html_repr();
          callback(vidobj);
        });
        break;
      case 'audio':
        return audio_file.new_audio_file_obj(meta, function(audioobj){
          audioobj.render_html_repr();
          callback(audioobj);
        });
        break;
      default:
        meta.html['li'] = render.make_simple_li(meta);
    }
    callback(this); //?
  }

  function _switch_with_filetype(callback){
    // This function should not have side effects on file meta
    switch (meta.filetype){
      case 'image':
        // callback would get the image file object, NOTE must return:
        return img_file_obj.new_image_file_obj(meta, callback);
        break;
      case 'goodagood-folder':
        return s3folder.retrieve_folder(meta.path, callback);
        break;
      //case 'folder':
      //  //file_info['file-selector'] = '';
      //  render_folder_file_as_li(file_info);
      //  //prepare_folder_list(file_info['file-s3key']);
      //  break;
      //case 'goodagood file link':
      //  ;
      case 'goodagood-markdown-text-meta':
        return markdown_file.new_markdown_file_obj(meta, callback );
        break;
      case 'goodagood-message-json-meta':
        return message_file.new_message_file_obj(meta, callback);
        break;
      case 'text':
        return text_file.new_text_file_obj(meta, callback);
        break;
      case 'json':
        return json_file.new_json_file_obj(meta, callback);
        break;
      case 'video':
        return video_file.new_video_file_obj(meta, callback);
        break;
      case 'audio':
        return audio_file.new_audio_file_obj(meta, callback);
        break;
      default:
        meta.html['li'] = render.make_simple_li(meta);
    }
    callback(this); //?
  }

  function _delete_s3_storage(){
    // assume it's s3 object:
    bucket.delete_object(meta.storage.key, function(){});
  }

  function _read_file_to_buffer(callback){
    if(meta.storage.type !== 's3') return callback(null);
    // assume it's s3 object
    bucket.read_data(meta.storage.key, function(err, buf){
      callback(buf);
    });
  }

  //function _read_file_to_string(callback){
  //  // only for utf8 encoding
  //  _read_file_to_buffer(function(buf){
  //    //log28('--buf', buf);
  //    if(!buf) return callback(null);
  //    var str = buf.toString();
  //    callback(str);
  //  });
  //}

  ////d
  //// This will not be used, because file meta put in folder,
  //// for most file, no seperate meta file.
  //function _read_meta_from_s3_obj(callback){
  //  //
  //  // read in meta, and pass it to callback. 
  //  // need the prepared meta.meta_file_path before using.
  //  //
  //  // This will not replace the current meta, data past only.
  //  //
  //  // error state will be set in cases.
  //  //
  //  if(!meta.meta_file_path) {
  //    //console.log('no meta.meta_file_path'); //testing
  //    meta.error = true;
  //    if(callback) return callback(Error('no meta file found'), null);
  //    return;
  //  }
  //  bucket.read_json(meta.meta_file_path, function(err, _meta_){
  //    if(err) {
  //      meta.error = err;
  //      if(callback) return callback(err, null);
  //    }else{
  //      if(callback) callback(null, _meta_);
  //    }
  //  });
  //}


  ////d
  //function _read_replace_meta(callback){
  //  _read_meta_from_s3_obj(function(err, _meta_){
  //    if(err) return callback(null); // return (meta.error = err);
  //    meta = _meta_;
  //    if(callback) callback(meta);
  //  });
  //}

  ////d
  //function _backup_meta(back_name, callback){
  //  _read_meta_from_s3_obj(function(err, _meta_){
  //    if(!err){
  //      meta[back_name] = _meta_;
  //      if(callback) return callback(null, meta);
  //    }else{
  //      if(callback) return callback(err, null);
  //    }
  //  });
  //}

  ////d
  //function  _calculate_s3_meta_file_path(){
  //  //
  //  // deprecated, 0629
  //  //
  //  if( !meta.path) {
  //    //meta.error = true;
  //    return;
  //  }

  //  meta.meta_file_path = path.join(myconfig.meta_file_prefix, meta.path);
  //  return meta.meta_file_path;
  //}


  function _render_html_repr(){
    _prepare_html_elements();
    _render_html_for_owner();
    _render_html_for_viewer();
  }

  function _render_html_for_owner(){

    var li = '<li class="file">';

    // file selector
    li += meta.html.elements['file-selector'] + '&nbsp;\n';
    li += meta.html.elements['anchor'] + '&nbsp;\n';
    li += '<ul class="list-unstyled file-info"><li>\n';
    li += meta.html.elements['text-view'] + '&nbsp;\n';
    li += meta.html.elements['remove'] + '&nbsp;\n';

    li += '</li></ul></li>';

    meta.html['li'] = li;
  }


  function _render_html_for_viewer(){

    var li = '<li class="file">';

    // file selector
    li += meta.html.elements['file-selector'] + '&nbsp;\n';
    li += meta.html.elements['anchor'] + '&nbsp;\n';
    li += '<ul class="list-unstyled file-info"><li>\n';
    li += meta.html.elements['text-view'] + '&nbsp;\n';
    //li += meta.html.elements['remove'] + '&nbsp;\n';

    li += '</li></ul></li>';

    meta.html['li_viewer'] = li;
  }


  function _prepare_html_elements(){
    if (typeof meta.html === 'undefined')          meta.html = {};
    if (typeof meta.html.elements === 'undefined') meta.html.elements = {};
    var ele = meta.html.elements;

    ele['file-selector'] = '<input type="checkbox" name="filepath[]" value="'+
                           meta['path'] +
                           '" />' ;

    ele['anchor'] = '<a href="' +
                    meta.s3_stream_href +
                    '" >' +
                    meta['name'] +
                    '</a>' ;

    ele['text-view'] = '<a href="/viewtxt/' + 
                      meta.path +
                      '"> <span class="glyphicon glyphicon-zoom-in"> </span>Read</a>'; 

    ele['remove'] = util.format(
        ' <a href="%s"> <span class="glyphicon glyphicon-remove"></span>Delete</a>', 
        meta['delete_href']);

  }


  function _meta_smells(){
    //
    // Tell if meta data might be wrong.
    //
    if( u.isEmpty(meta) )                return true;
    if(typeof meta.name === 'undefined') return true;
    if(! meta.name)                      return true;
    if(typeof meta.path === 'undefined') return true;
    if(! meta.path)                      return true;
    //if(typeof meta.meta_file_path === 'undefined') return true;
    //if(! meta.path)                      return true;

    return false;
  }

  function _put_to_s3(callback){
    // put the local file up to s3.
    // Assume local file path: meta.local_file.path
    // and s3 storage key is prepared.
    //

    //if( typeof local_file !== 'undefined'){
    //  return bucket.put_one_file(local_file.path, meta.storage.key, function(err,data){
    //    if(callback) callback(err,data);
    //  });
    //}

    bucket.put_one_file(meta.local_file.path, meta.storage.key, function(err,data){
      if(callback) callback(err,data);
    });
  }

  function _save_file_to_folder(callback){
    var dirname = path.dirname(meta.path);

    s3folder.retrieve_folder(dirname, function(folder){
      if(!folder) return callback( new Error('not initialize folder'), null); 
      log28('saving file to', folder.get_meta().path);
      folder.add_file_save_folder(meta, callback);
    });
  }


  function _clone_content_to_user(user_name, callback){
    //
    // This behavior depends on current file system structure, all contents
    // are located in username/.files/uuid.ext
    // so, we can clone contents to there.
    //
    // The clone contents is storage in an object, 'tgt_meta', with only file
    // storage, and keep same structure as file meta. 0722
    //
    var tgt_meta  = {};

    //var fid  = myutil.get_uuid();
    //var new_name = fid + path.extname(meta.name); 
    //var tgt_s3key = path.join(user_name, '.files', new_name );

    var tgt_s3key = uuid_file_name_for_username(meta.name, user_name);
    var tgt_storage = {type:'s3', key: tgt_s3key};

    tgt_meta.storage   = tgt_storage;
    bucket.copy_file(meta.storage.key, tgt_s3key); //This has no callback
    callback(tgt_meta);
  }

  function _read_to_string(callback){
    bucket.read_to_string(meta.storage.key, function(err, string){
      if(!err) return callback(string);
      return callback(null);
    });
  }

  function _save_meta_file(callback){
    // Save the file meta (json) to an file.  For s3, with prefix:
    //   user-name/.metas/file-dirname/uuid
    var dirname = path.dirname(meta.path);
    var uniq  = myutil.get_uuid();

    var username;
    if(meta.owner) username = meta.owner;
    if(username){
      var s3key = path.join(username, myconfig.meta_folder, dirname, uniq);
      meta['meta_file'] = s3key;
      return bucket.write_json(s3key, meta, callback);
    }
    return callback('err', null);
  }

  var S3file_obj_with_closure = {
    // 
    // This will be the object returned.  It get closure of the function.
    //

    isError : function(){ return meta.error; },

    set_meta : _set_meta,
    calculate_meta_defaults : _calculate_meta_defaults,

    //calculate_s3_meta_file_path : _calculate_s3_meta_file_path,
    //read_meta_from_s3_obj : _read_meta_from_s3_obj,

    //read_replace_meta : _read_replace_meta,

    //backup_meta : _backup_meta,

    extend_meta : function(newOpt, callback){
      // extend the meta.
      u.extend(meta, newOpt);
      if(callback) callback(meta);
    },

    save_meta_file : _save_meta_file, //?

    get_meta : function(){ return meta; },
    read_file_to_buffer : _read_file_to_buffer,
    read_file_to_string : _read_to_string,
    read_to_string : _read_to_string,

    //save_meta : _save_meta,

    render_html_repr : _render_html_repr,

    put_to_s3 : _put_to_s3,
    delete_s3_storage: _delete_s3_storage,

    upgrade_with_filetype : _upgrade_with_filetype,
    switch_with_filetype  : _switch_with_filetype,

    clone_content_to_user : _clone_content_to_user,

    increase_value : _increase_value,
    save_file_to_folder : _save_file_to_folder,

  }; // end of the object S3file_obj_with_closure.

  function _return_call(){
    //
    // in case we need check meta data is good enough before we pass the 
    // object and return.
    //
    if(! _meta_smells()) return pass_file_obj(S3file_obj_with_closure); //meta?
    return pass_file_obj(null);
  }

  // pass out the file object to callback function, return of this function:
  return pass_file_obj(S3file_obj_with_closure);
}


function meta_to_file_obj(_meta, callback){
  //
  // make a new s3 file object, this means no old data need to read in.
  //
  // meta data of file saved in folder. ?
  //
  new_s3_file_obj(_meta, function(file_obj){
    //log28('_meta', _meta);
    file_obj.calculate_meta_defaults();
    //log28('meta to file obj file obj get _meta', file_obj.get_meta());

    // callback will get upgraded file object:
    file_obj.upgrade_with_filetype(callback);
    //callback(file_obj);
  });
}


function uuid_file_name_for_username(filename, username){
    // make a name contains uuid, for user. 
    // This is according to how goodagood save file contents, 
    // it been put under: username/.files/uuid.file_extension
    var uuid  = myutil.get_uuid();
    var uuid_ext = uuid + path.extname(filename); 
    var key = path.join(username, '.files', uuid_ext);
    return key;
}


if (require.main === module){
  //test_...
}

module.exports.new_s3_file_obj  = new_s3_file_obj;
module.exports.meta_to_file_obj  = meta_to_file_obj;
module.exports.uuid_file_name_for_username = uuid_file_name_for_username;

// vim: set et ts=2 sw=2 fdm=indent:
