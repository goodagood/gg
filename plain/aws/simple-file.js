
//
// 0908
// 
// Start to refactor 'file.js', it keeps growing.
// This is try to give better file object.
// 
// What's file object does:
//   keep contents: s3 key of file content, 
//                  s3 key for meta info is also kept as an convenience.
//   Informations: name, path, size, date, owner, permission, 
//                 license, file value,
//                 filetype, representation of html elements
//                 uuid, uuid_path
//   Actions: delete contents
//            render as html elements
//            offer information to folder

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


function simple_s3_file_obj(meta_src, pass_file_obj){
  //
  // @pass_file_obj, a callback is needed because meta need to be read from s3,
  // it takes time, pass_file_obj(err, obj_with_closure).
  //   We also pass `err` to the callback, show respects to traditions.
  //
  // file meta data:
  //    {
  //      name : file name
  //      uuid : required
  //      path : full path such: user-name/path/to/file-name.ext
  //
  //      meta_s3key : s3 key for string of json of meta, JSON.stringify.
  //      dirname    : path of the folder, to easy the file moving.
  //
  //      storage  : {...}  // Deprecated
  //      storages : [ storage-obj, ,,, ]  // changed to list, 0908.
  //
  //      owner: required
  //      size : 
  //      filetype :
  //      type     : the type set during uploading.
  //      lastModifiedDate : get from uploading
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
  
  var meta;
  if(meta_src) meta = meta_src;


  /* Start function and object defines. */

  function _set_meta(_meta){
    meta = _meta;
  }

  function _guess_owner(){
    // guess owner from file path, because the path is: 
    //     user-name(id)/folder/path/to/file-name.ext

    if(typeof meta.owner === 'string'){
      // if not empty string, think it's owner's name, nothing need to do.
      if( ! /^\s*$/.test(meta.owner) ) return meta.owner;
    }

    // guess it from file path:
    if(meta.path){
      var guess = meta.path.split('/')[0];
      if( typeof guess === 'string' ){
        if( ! /^\s*$/.test(guess) ){
          meta.owner = guess;
          return meta.owner;
        }
      }
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

    //suppose name is already set
    if(typeof meta.filetype !== 'string'){
      meta.filetype = ft.check_file_type_by_name(meta.name);
    }

    if(typeof meta.s3_stream_href !== 'string'){
      meta.s3_stream_href = _calculate_s3_stream_href();
    }

    if(typeof meta.delete_href !== 'string'){
      meta.delete_href = _calculate_delete_href();
    }

    if(typeof meta.view_href !== 'string'){
      meta.view_href = _calculate_view_href();
    }

    if(typeof meta.owner !== 'string') _guess_owner();

    if(typeof meta.uuid_path === 'undefined'){
      if(!meta.uuid) meta.uuid = myutil.get_uuid();
      var uuid_name = meta.uuid + path.extname(meta.name); 
      var parent_dir= path.dirname(meta.path);
      meta.uuid_path= path.join(parent_dir, uuid_name); // path_uuid?
    }

    var necessaries = {
      what : myconfig.IamFile,
      timestamp : Date.now(),

      permission : { owner : 'rwx', group : '', other : '' },
      "file-types" : [],

      storage   : {}, // deprecate soon, 0908.
      storages  : [],
      html : {},
      value : {amount : 0, unit : 'GG'},
    };

    u.defaults(meta, necessaries); // make sure we have defaults
  }

  var s3storage = require('./s3storage.js');
  function _upgrade_to_s3storage_collection(){
    // Use the old meta.storage (without 's' suffix):
    var store = s3storage.make_s3storage(meta.storage);
    if(store.meta_ok()) meta.storages.file = store.get_meta();
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


  function _delete_s3_storage(){
    // assume it's s3 object:
    bucket.delete_object(meta.storage.key, function(){});
    bucket.delete_object(meta.meta_s3key);
  }

  function _read_file_to_buffer(callback){
    if(meta.storage.type !== 's3') return callback(null);
    // assume it's s3 object
    bucket.read_data(meta.storage.key, function(err, buf){
      callback(buf);
    });
  }

  function _read_to_string(callback){
    bucket.read_to_string(meta.storage.key, function(err, string){
      if(!err) return callback(string);
      return callback(null);
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
    li += meta.html.elements['path-uuid'] + '&nbsp;\n';
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

    var dir   = path.dirname(meta.path);
    var puuid = path.join('/fileinfo-pathuuid/', dir, meta.uuid);
    ele['path-uuid'] = util.format(
        ' <a href="%s"> <span class="glyphicon glyphicon-info-sign"></span>Info.</a>', 
        puuid);

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

  function _send_to(acceptor, callback){ //?
    //
    // @acceptor is the username to accept the file.
    //

    var tgt_folder = path.join(acceptor, myconfig.message_folder);
    var tgt_meta   = u.defaults({}, meta);

    tgt_meta.original_name = meta.name;
    tgt_meta.uuid          = myutil.get_uuid();
    tgt_meta.name          = tgt_meta.uuid + path.extname(tgt_meta.original_name);  
    tgt_meta.path          = path.join(tgt_folder, tgt_meta.name);
    tgt_meta.from          = meta.owner;
    tgt_meta.owner         = acceptor;
    tgt_meta.send_date     = Date.now();

    //var fid  = myutil.get_uuid();
    //var new_name = fid + path.extname(meta.name); 
    //var tgt_s3key = path.join(user_name, '.files', new_name );

    //var tgt_s3key = uuid_file_name_for_username(meta.name, user_name);
    var tgt_s3key = path.join(myconfig.raw_files_folder, tgt_meta.path);

    var tgt_storage = {type:'s3', key: tgt_s3key};

    bucket.copy_object(meta.storage.key, tgt_s3key, function(err, s3reply){
      if(err) return callback(err, null);
      tgt_meta.storage   = tgt_storage;
      callback(null, tgt_meta);
    });
  }


  //d, this is for old data structure, when file in: username/.files/uuid.ext
  function _clone_content_to_user(user_name, callback){ //?
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

  // todo?
  function _save_meta_file(callback){
    // Save the file meta (json) to an file.  For s3, with prefix:
    //   file_meta_prefix/user-name//uuid   # it's:
    //      .gg.file.meta/user-name//uuid

    var  meta_s3key = path.join(myconfig.file_meta_prefix, meta.owner, meta.uuid);

    meta.meta_s3key = meta_s3key;
    return bucket.write_json(meta_s3key, meta, callback);

  }

  function _get_short_json_repr(){
    var repr = u.pick(meta, 'name', 'size', 'timestamp', 'filetype');
    return repr;
  }

  // 
  // This will be the object returned.  It uses closure for data accesses.
  //
  var obj_with_closure = {

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

    //put_to_s3 : _put_to_s3,
    delete_s3_storage: _delete_s3_storage,

    //upgrade_with_filetype : _upgrade_with_filetype,
    //switch_with_filetype  : _switch_with_filetype,

    clone_content_to_user : _clone_content_to_user,

    increase_value : _increase_value,
    save_file_to_folder : _save_file_to_folder,

    upgrade_to_s3storage_collection : _upgrade_to_s3storage_collection,

    get_short_json_repr : _get_short_json_repr

  }; // end of the object obj_with_closure.


  // pass out the file object to callback function, return of this function:
  return pass_file_obj(null, obj_with_closure);
}


// the "upgrade to s3 storage collection" in use?
function new_file_obj_from_meta(_meta, callback){
  //
  // make a new s3 file object, this means no old data need to read in.
  //
  // meta data of file saved in folder. ?
  //
  simple_s3_file_obj(_meta, function(err, file_obj){
    //log28('_meta', _meta);
    file_obj.calculate_meta_defaults();
    file_obj.upgrade_to_s3storage_collection();

    file_obj.render_html_repr();
    file_obj.save_meta_file(function(err, reply){
      callback(err, file_obj);
    });
  });
}

function make_uuid_file_name(filename){
    // make a name contains uuid and file extension, such as uuid-string.jpg 

    var uuid  = myutil.get_uuid();

    // path.extname has the '.', such as '.jpg'
    var uuid_ext = uuid + path.extname(filename);  
    return uuid_ext;
}





if (require.main === module){
  //test_...
}

module.exports.simple_s3_file_obj  = simple_s3_file_obj;
module.exports.new_file_obj_from_meta  = new_file_obj_from_meta;
//module.exports.uuid_file_name_for_username = uuid_file_name_for_username;

// vim: set et ts=2 sw=2 fdm=indent:
