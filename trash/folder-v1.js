//
// Start to change folder object based on 'folder.js', 0912.
// Folder at least contains files.
//

var u    = require('underscore');
var path = require('path');

var Promise = require('bluebird');
var async   = require('async');

var bucket = require('./bucket.js');
var s3file = require('./file.js');
var image_file = require('./image-file.js');
var json_file  = require('./json-file.js');

var myconfig   =   require("../config/config.js");
var myutil     = require('../myutils/myutil.js');

var log28 = require('../myutils/mylogb.js').double_log('/tmp/log28');
var tools = require('./tools-cof.js');

var p     = console.log;

//var test = require('nodeunit');


function make_s3folder(folder_path, pass_out_folder_obj){
  //
  // An factory to make folder object. 0626
  //
  // There is a callback: @pass_out_folder_obj, it is asynchronous when 
  // read folder meta from s3, or save data to s3.
  //
  // Folder has meta information, it's an object 'meta', has attributes:
  //
  //  name : 
  //  path :
  //  uuid :
  //  html, renders
  //
  //  folder_meta_s3key : aws s3 key, for the object save meta json.
  //  # proved to be stupid as when add folder as file, we must take care
  //  # the differencd between folder_meta_s3key and 'file meta s3key'
  //  meta_s3key
  //
  //  meta_file_path  # Deprecated in favor of the above.
  //
  //
  //  files :
  //  { 
  //    file-name-1 : {file-meta-1},
  //    file-name-2 : {file-meta-2},
  //    ...
  //  } # The old way, under changing.
  //  --- --- !is going to change to: ==> ... 'files' should be keeped. 1005
  //
  //  file_uuids :
  //  { 
  //    file-uuid-1 : {short-file-meta-1},
  //    file-uuid-2 : {short-file-meta-2},
  //    ...
  //  }
  //  files_names :
  //  { 
  //    file-name-1 : [uuid-1, more-uuid, ... ],
  //    file-name-2 : [uuid-1, more-uuid-possible, ... ],
  //    ...
  //  } # file names stored in a list, it can be repeating, but UUID not repeat.
  // 
  
  var meta = {};
  var members_file_name = '.gg.members.json';
  var viewers_file_name = '.gg.viewers.json';


  function _build_new_folder (_opt){
    _init(_opt);
  }


  function _prepare_basic_path(){
    if(typeof meta.path === 'undefined') meta.path = folder_path; 
    _calculate_s3_meta_file_path(); 
  }

  function _init(_opt){

    u.defaults(meta, _opt); // make defaults

    if(typeof meta.uuid === 'undefined') meta.uuid = myutil.get_uuid();

    _prepare_basic_path();

    meta.error   = false;
    if(typeof meta.name === 'undefined') meta.name = path.basename(folder_path);
    meta.filetype= 'goodagood-folder';
    
    if(typeof meta.renders === 'undefined') meta.renders = {};
    if(typeof meta.html === 'undefined') meta.html = {};

    // this got using and deleting a few times.
    if(typeof meta.files === 'undefined') meta.files = {};

    // The next two will replace the above one. `files` => file_uuids, file_names.
    if(typeof meta.file_uuids === 'undefined') meta.file_uuids = {};
    if(typeof meta.file_names === 'undefined') meta.file_names = {};

    meta.what    = myconfig.IamFolder;
  }

  function _calculate_s3_meta_file_path(){

    // We changed the folder meta
    // prefix setting, this is going to be used. 0918.
    meta.folder_meta_s3key = path.join(myconfig.folder_meta_prefix, folder_path); //d

    meta.meta_s3key = meta.folder_meta_s3key;  // this is going to be used

    //d `meta_file_path` is going to be deprecated. this is the old way:
    meta.meta_file_path = calculate_folder_meta_file_s3key(meta.path);  ///d
    return meta.meta_file_path; //d
  }

  // to replace the next one: _is_file_exists
  function _file_exists(filename){
    if( typeof meta === 'undefined' ) return false;
    if( typeof meta.file_names === 'undefined' ) return false;
    return !!meta.file_names[filename];
  }

  //d
  function _is_file_exists(filename){
    if( typeof meta === 'undefined' ) return false;
    if( typeof meta.files === 'undefined' ) return false;
    return !!meta.files[filename];
  }

  //d, if possible put things to s3.
  var redis_basic = require("../myutils/redis-basic.js");
  function _prepare_redis_file_list_key(callback){
    if(typeof meta.redis_file_list === 'string') return;
    redis_basic.serial_number(function(err, number){
      if(err) return null;
      var key = myconfig.redis_folder_file_list_prefix + number;
      meta.redis_file_list = key;
      _save_meta(function(err, _meta){
        if(err) log28('save meta ERROR in prepare redis file list key',
          _meta);

        if(callback) callback();
      });
    });
  }

  //d
  function _add_file_to_redis_list(file_meta, callback){
    // If the redis list not prepared, just do the preparation, and waste the file data.
    if(typeof meta.redis_file_list !== 'string') return _prepare_redis_file_list_key(callback);
    log28('add file to redis list, redis key: ', meta.redis_file_list);
    // meta_file or meta_s3key?
    var simple_info = u.pick(file_meta, 'name', 'size', 'meta_file', 'meta_s3key', 'filetype');
    var str = JSON.stringify(simple_info);
    redis_basic.client.lpush(meta.redis_file_list, str, callback);
  }

  //d
  function _add_file_thorough(file_meta, callback){
    // Add file and push it to 'file list', for compatibility.
    _add_file_to_redis_list(file_meta, function(err, reply){
      if(err) log28('failed to add file info to redis', file_meta.path);
      meta.files[file_meta.name] = file_meta;
      _build_file_list();
      if(callback) callback();
    });
  }

  //redo
  function _check_in_file(file_meta, callback){
    // To replace old file meta structure, and replace `_add_file`.
    // Now, all name is going to be check in, no respect to 'duplication'.

    meta.file_uuids[file_meta.uuid] = file_meta;
    if(typeof meta.file_names[file_meta.name] === 'undefined'){
      meta.file_names[file_meta.name] = [file_meta, ]; // new array
    }
    else if(u.isArray(meta.file_names[file_meta.name])){
      meta.file_names[file_meta.name].push(file_meta);
    }
    else{
      return callback('err, it is not an array', null);
    }

    _build_file_list();
    callback(null, meta.file_name[file_meta.name]);
  }

  function _add_extra_0929(file_meta){
    // Changed the data structure, so extra info need to take care.

    var repr = _get_short_json_repr(file_meta);

    meta.file_uuids[file_meta.uuid] = repr;

    if(typeof meta.file_names[file_meta.name] === 'undefined' || 
        ! meta.file_names[file_meta.name]){ 
          meta.file_names[file_meta.name] = [file_meta.uuid];
    }
    else{
          meta.file_names[file_meta.name].push(file_meta.uuid);
    }
  }

  function _add_file(file_meta, callback){
    // This is the old way to keep file meta, before 0907. 
    // It changing to redis for file list... then changed back, 0918 ...
    //
    // if the name exists, it will be replaced, this not save folder and file

    if(typeof meta.files !== 'undefined' && meta.files){
      // NOTE: uuid is the key, not the file name:
      meta.files[file_meta.uuid] = file_meta;
    }

    _add_extra_0929(file_meta);
    callback(null, meta);

    // build file list might costs, and it makes things complicated.
    //_build_file_list(callback);
    //if(callback) callback();
  }
  
  function _add_file_save_folder(file_meta, callback){
    _add_file(file_meta, function(err, _meta){
      //p('add file save meta: ', file_meta);
      _build_file_list(function(err, what){
        if(err) return callback(err, what);
        _save_meta(callback);
      });
    });
  }

  function _add_file_obj_save_folder(file_obj, callback){
    _add_file_save_folder(file_obj.get_meta(), callback);
  }


  function _get_file_obj(name, callback){
    // name is basename, no path included.
    if( ! _is_file_exists(name) ) return callback(null);
    var file_meta = meta.files[name];
    //console.log(file_meta);

    s3file.new_s3_file_obj(file_meta, function(base){
      //console.log(base);
      base.set_meta(file_meta);
      // When getting a file object, we use 'switch' for file type
      base.switch_with_filetype(callback);
    });
  }

  function _retrieve_old_folder_meta(callback){
    //
    // @callback will get meta
    //
    //if( typeof meta.folder_meta_s3key === 'undefined' ) _prepare_basic_path();
    if( typeof meta.meta_s3key === 'undefined' ) _prepare_basic_path();

    var folder_meta_key;
    if( typeof meta.folder_meta_s3key !== 'undefined' ) folder_meta_key = meta.folder_meta_s3key;
    if( typeof meta.meta_s3key !== 'undefined' )        folder_meta_key = meta.meta_s3key;
    //console.log(folder_meta_key);

    bucket.read_json(folder_meta_key, function(err, _meta_){
      if(err) {meta.error = err; if(callback) callback(err, null); return;}
      meta = _meta_;
      if(callback) callback(null, _meta_);
    });
  }

  //d
  function _retrieve_old_folder_meta_0921(callback){
    //
    // @callback will get meta
    //
    if( typeof meta.meta_file_path === 'undefined' ) _prepare_basic_path();

    bucket.read_json(meta.meta_file_path, function(err, _meta_){
      if(err) {meta.error = err; if(callback) callback(null); return;}
      meta = _meta_;
      if(callback) callback(meta);
    });
  }

  function _is_owner(username){
    var guess_owner = meta.path.split('/')[0];

    //log28('user name is owner?', username);
    //log28('guess owner       ?', guess_owner);

    if(username === guess_owner) return true;

    if(typeof meta.owner === 'undefined') return false; //?
    if(typeof meta.owner === 'string' && username === meta.owner) return true;
    if(username === meta.owner.username) return true;
    return false;
  }

  function _get_owner_name(){
    var r = /^\s*$/;
    // if it's string and not empty string:
    if (typeof meta.owner === 'string' && ! r.test(meta.owner) ) return meta.owner;

    var guess = meta.path.split('/')[0];
    if (typeof guess === 'string' && ! r.test(guess)){
      meta.owner = guess;
      return meta.owner;
    }

    // return something to be clear.
    return null;
    // actually, it will return undefined, if not clearly returned.
  }

  var avatar = require('../users/avatar.js');
  function _get_owner_obj(callback){
    var name = _get_owner_name();
    if(name){
      var user = avatar.make_user_obj(name);
      avatar.make_user_obj(name, function(user){
        user.init(callback);
      });
      //return callback( avatar.make_user_obj(name));
    }else{
      return callback(null);
    }
  }

  function _new_json_file(filename, content_json){
    var file_name = filename;
    var file_path = path.join(meta.path, file_name);

    //var json_str = JSON.stringify([]);  // an empty array.
    //var storage = {type:'meta-text', note:'content in meta serielized json', text: json_str,};
    //var members = [];

    var data = {
      //iam_meta : true,
      name : file_name,
      path : file_path,
      filetype: "json",
      owner : { username: meta.path, timestamp : Date.now() },
      permission: {
        owner : 'rwx',
        group : '',
        other : '',
      },
    };
    json_file.new_json_file_obj(data, function(jobj){
      jobj.set_up_from_json(content_json);
      _add_file(jobj.get_meta(), _save_meta);
      //_save_meta();
    });
  }


  function _build_file_list(callback){
    // @callback get (err, [ul, ulv]), meta elements will already been set.
    _list_files_by_id();
    _list_files_for_owner();
    callback(null, null)

    //_list_files(callback);

    //_list_files_for_viewer();

  }


  function _list_files_by_id(){
    var ul = '<ul class="file-list list-unstyled">';
    u.each(meta.files, function(file){

      if(file.name.indexOf('.gg') !== 0){  // hide file with name: .gg*
        var li = '<li class="file">\n';

        li    += '<span class="filename">' + file.name + '</span>&nbsp;\n' ;
        if(file.size) li    += '<span class="size">' + file.size + '</span>&nbsp;\n' ;
        li    += '<span class="size">' + file.path + '</span>&nbsp;\n' ;
        li    += '<span class="size">' + file.uuid + '</span>&nbsp;\n' ;
        li    += '</li>\n';
        ul += li;
      }
    })
    ul += '</ul>';
    meta.renders.simple_ul = ul;
    //meta.renders.ul = ul; // this make the <ul> actually the simple one.
  }

  function _dot_filter(uuid_list){
    return uuid_list.filter(function(uuid){
      if(meta.file_uuids[uuid].name.indexOf('.') === 0) return false
      //if(file.name.indexOf('.gg') == 0) return false
      return true;
    });
  }

  function _list_files(callback){
    // the old '_render_folder_as_ul', 0817
    var uuid_list = _dot_filter(Object.keys(meta.file_uuids));
    // <ul> for owner and viewer
    var ul  = '<ul class="folder-list list-unstyled">'; 
    var ulv = '<ul class="folder-list list-unstyled">'; 
    async.map(uuid_list, 
        _get_file_meta_by_uuid,
        function(err, results){
          if(err) return callback(err, results);

          results.forEach(function(_meta){
            ul  += _meta.html.li;
            ulv += _meta.html.li_viewer;
          });
          ul  += '</ul>';
          ulv += '</ul>';
          meta.renders.ul_for_viewer = ulv;
          meta.renders.ul = ul;
          callback(null, [ul, ulv]);
        }
    ); // end of map
  }


  function _list_files_for_owner(){
    // the old '_render_folder_as_ul', 0817
    var ul = '<ul class="folder-list list-unstyled">';
    u.each(meta.files, function(file){
      if(typeof file.html !== 'undefined'){
        if(file.name.indexOf('.gg') !== 0){  // hide file with name: .gg*
          ul += file.html.li;
        }
      }
    });
    ul += '</ul>';
    meta.renders.ul = ul;
  }

  function _list_files_for_viewer(){
    var ul = '<ul class="folder-list list-unstyled">';
    u.each(meta.files, function(file){
      if(typeof file.html !== 'undefined'){
        if(file.name.indexOf('.gg') !== 0){  // hide file with name: .gg*
          if(typeof file.html.li_viewer !== 'undefined'){
            ul += file.html.li_viewer;
          }
        }
      }
    });
    ul += '</ul>';
    meta.renders.ul_for_viewer = ul;
  }

  //?
  function _render_folder(){
    _build_file_list(function(){});
    //_list_files_for_viewer();
  }

  function _get_ul_renderring(){
    // meta is not defined, in stupid case, as: not/exists/path

    if(typeof meta === 'undefined') return '<ul> <li> ERROR, meta is undefined </li></ul>';
    if(! meta) return '<ul> <li> ERROR, meta is equal to false? </li></ul>';
    if(typeof meta.renders === 'undefined') meta.renders = {};

    if(typeof meta.renders.ul !== 'undefined') return meta.renders.ul;

    if(typeof meta.renders.ul === 'undefined') return '<ul> <li> ERROR, meta.renders.ul is undefined </li></ul>' ; //?
    //_build_file_list();
    return meta.renders.ul;
  }

  function _get_renderring_for_viewer(){
    if(typeof meta.renders === 'undefined') meta.renders = {};
    if(typeof meta.renders.ul_for_viewer !== 'undefined') return meta.renders.ul_for_viewer;
    return "<ul><li>Currently not prepared ready for viewers</li></ul>";
  }

  function _get_renderring_for_public(){
    if(typeof meta.renders === 'undefined') meta.renders = {};
    if(typeof meta.renders.ul_for_public !== 'undefined') return meta.renders.ul_for_public;
    return "<ul><li>Currently not prepared for public viewers</li></ul>";
  }

  function _give_ul_renderring(viewer_name, callback){
    // this will check viewer's name, 
    // whether it's owner, member, viewer or unknown.
    // The function stream-down to check and return callback when possible.
    // callback will get <ul> list.

    if(_is_owner(viewer_name)) return callback(_get_ul_renderring());
    //log28('viewer go to member check', viewer_name);

    _has_member(viewer_name, function(is_member){
      // member = owner, currently, 0801, they get same.
      if(is_member)  return callback(_get_ul_renderring());
      //log28('viewer go to viewer check', viewer_name);

      _has_viewer(viewer_name, function(is_viewer){
        if(is_viewer){
          return callback(_get_renderring_for_viewer());
        }
        //log28('viewer check public page', viewer_name);
        return callback(_get_renderring_for_public());
      });
    });
  }

  function _check_username(username, callback){
    // This will check viewer's name, try to determine it's role,
    // whether it's owner, member, viewer or unknown.
    // The function stream-down to check and return when possible.
    //

    if(_is_owner(username)) return callback('owner');

    _has_member(username, function(is_member){
      // member = owner, currently, 0801, they get the same.
      if(is_member)  return callback('member');

      //console.log('oh, not member');

      _has_viewer(username, function(is_viewer){
        if(is_viewer){
          return callback('viewer');
        }
        return callback('who-known');
      });
    });
  }

  function _save_meta(callback){
    // Is it good to set/get lock before saving?  It obviously will bring
    // troubles to cope with conditions like 'unable' to lock.

    //bucket.write_json(meta.folder_meta_s3key, meta, function(err, reply)
    bucket.write_json(meta.meta_s3key, meta, function(err, reply){
      //console.log("save meta :", err, reply);
      if(callback){
        if(err) return callback(err, null);
        return callback(null, meta);
      }
    });

    ////d, because prefix for folder meta is going change.
    //bucket.write_json(meta.meta_file_path, meta, function(err, reply){
    //  if(callback){
    //    if(err) return callback(err, null);
    //    return callback(null, meta);
    //  }
    //});
  }

  //d
  function _meta_smells(){
    //
    // Tell if meta data might be wrong.
    //
    if( u.isEmpty(meta) )                return true;
    if(typeof meta.name === 'undefined') return true;
    if(! meta.name)                      return true;
    if(typeof meta.path === 'undefined') return true;
    if(! meta.path)                      return true;
    if(typeof meta.meta_file_path === 'undefined') return true; // for folder
    if(! meta.meta_file_path)            return true;

    return false;
  }

  function _render_file(filename, callback){
    _get_file_obj(filename, function(file_obj){
      file_obj.render_html_repr();
      var file_meta = file_obj.get_meta();
      meta.files[filename] = file_meta;
    });
  }

  // redo
  function _render_all_files(){
    var keys = u.keys(meta.files);
    keys.forEach(function(filename){
      console.log(filename);
      _render_file(filename, function(){});
    });
    _build_file_list();
    _save_meta();
  }

  //redo
  function _delete_file(filename, callback){
    _get_file_obj(filename, function(fobj){
      // This is trying to delete the storage
      fobj.delete_s3_storage();
    });
    delete meta.files[filename];
    _build_file_list();
    _save_meta();
    if(callback) callback();
  }

  // need redo
  function _rename_file(filename, new_name){
    // here in function: meta means folder meta.
    var new_meta = u.omit(meta.files[filename], 'path', 'html', 
        'local_file', 'timestamp', 's3_stream_href', 'delete_href');
    new_meta.name = new_name;
    new_meta.path = path.join(meta.path ,new_name);

    //console.log('old: ', meta.files[filename]);
    s3file.new_s3_file_obj(new_meta, function(fobj){
      fobj.set_meta(new_meta);
      fobj.calculate_meta_defaults();
      fobj.switch_with_filetype(function(typed_fobj){
        typed_fobj.render_html_repr();
        //console.log(typed_fobj.get_meta());
        _add_file(typed_fobj.get_meta());
        delete meta.files[filename];
        _build_file_list();
        _save_meta();
      });
    });
  }

  function _short_clone_of_folder_meta(input_meta){
    var to_delete = ['files', 'file_uuids', 'file_names', 'renders'];
    var out_meta = JSON.parse(JSON.stringify(input_meta));
    to_delete.forEach(function(n){
      delete  out_meta[n];
    });
    return out_meta;
  }

  function _add_folder(name, callback){
    //
    // Add folder of 'name', the folder will be created.
    // Do give a callback, callback(err, the-new-folder).
    //
    var folder_path = path.join(meta.path, name); // The abspath
    var opt_ = {
      name : name,
      path : folder_path,
      uuid : myutil.get_uuid(),
      'parent-dir' : meta.path, // meta is of who adding the folder
      timestamp  : Date.now(),
      owner      : meta.owner,
      permission : {owner:'rwx', group:'', other:''},
      html: {},
    };
    if(typeof opt_.uuid === 'undefined') opt_.uuid = myutil.get_uuid();

    new_folder(opt_, function(err, new_folder_obj){
      if(err) return callback(err, null);

      new_folder_obj.self_render_as_a_file();
      new_folder_obj.save_meta(function(err, the_meta){
        if(err) return callback(err, null);

        // The new folder saved, now add the new folder to the CURRENT folder:
        var new_meta = _short_clone_of_folder_meta(new_folder_obj.get_meta());
        _add_file(new_meta, function(){

          _save_meta(function(err, what){
            callback(err, new_folder_obj);
          });

        }); 
      });

    });
  }

  var _promised_add_folder = Promise.promisify(_add_folder);

  function _self_render_as_a_file(){

    var li = '<li class="folder">';

    // file selector
    //li += '<input type="checkbox" name="filepath[]" value="' + meta['path'] + '" />' ;

    li += '<span class="glyphicon glyphicon-folder-close"> </span>&nbsp;';
    li += '&nbsp;<a href="/ls/' + meta.path  + '" >' + meta.name + '</a>' ;
    li += '</li>\n';
    if (!meta.html)  meta.html = {};
    if (typeof meta.html === 'undefined')  meta.html = {};

    meta.html.li = li;
  }

  // still not used?
  function _build_blueimp_pic_gallery_list(){
    // only image file gatherred, and build to list as blueimp gallery asked.
    var list = [];
    var file_names = Object.keys(meta.files);
    file_names.forEach(function(name){
      if(meta.files[name].filetype === 'image'){
        var fileInfo = meta.files[name];  // short name
        var src = path.join(myconfig.s3_stream_prefix, fileInfo.storage.key);
        var thumb;
        if (fileInfo['thumbnail-s3key']){
          thumb = path.join(myconfig.s3_stream_prefix, fileInfo['thumbnail-s3key']);
        }else{
          thumb = ''; // Should prepare a default thumbnail image.
        }
        
        var one = '<a href="' + src +'" title="' + fileInfo.name + '" data-description="The value keep increasing justly" >';
        one    += '<img src="' + thumb + '" alt="' + fileInfo.name + '"> </a>';

        list.push(one);
      }
    });
    return list;
  }

  function _sort_files_by_date(){

    // sort the file by negative epoc seconds
    var sorted = u.sortBy(meta.files, function(e){
      // change the date string from aws to epoc mili-seconds
      var date = new Date(e['lastModifiedDate']);
      var epoc = date.getTime();
      return 1 - epoc;
    });

    meta.files = sorted;
  }

  //function _add_team_member(members){
  //}


  // added from 'team-folder', all folders need these functionalities
  // question this is necessary for all folder? 0920

  function _init_members_file(){
    meta.is_team_folder = true;
    //var file_name = '.members.json';
    var content = [];
    //if(meta.owner && meta.owner.username) owner_name = meta.owner.username;
    if(meta.owner && meta.owner.username) content.push(meta.owner.username);
    _new_json_file(members_file_name, content);
  }

  function _add_members(name_list, callback){
    if( ! _is_file_exists(members_file_name)) _init_members_file();
    if( !u.isArray(name_list) ) return callback(null);

    _get_file_obj(members_file_name, function(member_file_obj){
      member_file_obj.get_json(function(j){
        j = u.union(j, name_list);
        //if(j.indexOf(member_name) < 0) j.push(member_name);
        console.log(j);
        member_file_obj.write_json(j);
        _add_file_obj_save_folder(member_file_obj, function(){
          if(callback) callback();
        });
        //_add_file(member_file_obj.get_meta());
        //_save_meta();
      });
    });
  }


  function _delete_members(name_list, callback){
    _get_file_obj(members_file_name, function(member_file_obj){
      member_file_obj.get_json(function(j){
        j = u.difference(j, name_list);
        //console.log('_delete members', j);
        member_file_obj.write_json(j);
        _add_file_obj_save_folder(member_file_obj, function(){
          if(callback) callback(j);
        });
      });
    });
  }

  

  function _get_all_members(callback){
    //if( ! _is_file_exists(members_file_name)) _init_members_file();
    if( ! _is_file_exists(members_file_name)) return callback(null);

    _get_file_obj(members_file_name, function(member_file_obj){
      member_file_obj.get_json(callback);
    });
  }

  function _has_member(username, callback){
    if(typeof meta.is_team_folder === 'undefined') return callback(false);
    if(!meta.is_team_folder)                       return callback(false);
    if( ! _is_file_exists(members_file_name))      return callback(false);

    _get_file_obj(members_file_name, function(member_file_obj){
      if(!member_file_obj) return callback(false);
      member_file_obj.get_json(function(j){
        //log28('member file get json', j);
        //log28('j is arry', u.isArray(j));
        if(!u.isArray(j)) return callback(false);
        if(j.indexOf(username) >=0) return callback(true);
        if(j.indexOf('*') >= 0) return callback(true);
        return callback(false);
      });
    });
  }

  function _init_viewers_file(){
    meta.is_open_folder = true;
    var content = [];
    _new_json_file(viewers_file_name, content);
    //meta.
  }

  function _add_viewers(name_list, callback){
    if( ! _is_file_exists(viewers_file_name)) _init_viewers_file();
    if( !u.isArray(name_list) ) return callback(null);

    _get_file_obj(viewers_file_name, function(viewer_file_obj){
      viewer_file_obj.get_json(function(j){
        j = u.union(j, name_list);
        //console.log(j);
        viewer_file_obj.write_json(j);
        _add_file_obj_save_folder(viewer_file_obj, function(){
          if(callback) callback(j);
        });
      });
    });
  }

  function _delete_viewers(name_list, callback){
    if( ! _is_file_exists(viewers_file_name)) _init_viewers_file();

    _get_file_obj(viewers_file_name, function(viewer_file_obj){
      viewer_file_obj.get_json(function(j){
        j = u.difference(j, name_list);
        //console.log('_delete viewers', j);
        viewer_file_obj.write_json(j); //?
        _add_file_obj_save_folder(viewer_file_obj, function(){
          if(callback) callback();
        });
      });
    });
  }


  function _get_all_viewers(callback){
    if( ! _is_file_exists(viewers_file_name)) _init_viewers_file();

    _get_file_obj(viewers_file_name, function(viewer_file_obj){
      viewer_file_obj.get_json(callback);
    });
  }

  function _has_viewer(username, callback){
    if(typeof meta.is_open_folder === 'undefined') return callback(false);
    if(!meta.is_open_folder)                       return callback(false);
    if( ! _is_file_exists(viewers_file_name))      return callback(false);

    _get_file_obj(viewers_file_name, function(viewer_file_obj){
      viewer_file_obj.get_json(function(j){
        if(!u.isArray(j))           return callback(false);
        if(j.indexOf(username) >=0) return callback(true);
        if(j.indexOf('*') >= 0)     return callback(true);

        return callback(false);
      });
    });
  }

  function _get_file_meta_by_uuid(uuid, callback){
    var _meta = meta.file_uuids[uuid];
    if(_meta['short-json']){
      bucket.read_json(_meta['meta_s3key'], callback);
    }else{
      callback(null, _meta);
    }
  }

  function _get_files_by_name(name, callback){
    // We allow files exist with same name, but uuid can not be duplicated.
    var uuid_list = meta.file_names[name];
    async.parallel(uuid_list,
        _get_file_meta_by_uuid,
        function(err, meta_list){
          console.log(err, meta_list);
          callback(err, meta_list);
        }
        );

  }

  function _get_short_json_repr(_meta){
    _meta = _meta || meta;
    var repr = u.pick(_meta, 'name', 'meta_s3key', 'size', 'timestamp', 'filetype');
    repr['short-json'] = true;
    return repr;
  }


  var folder_obj = {
    //
    // Define an object and return the object, as in factory pattern.
    // If an function is needed by this object, define it in the above and
    // refer it as needed.
    //

    init                : _init,
    build_new_folder    : _build_new_folder,

    //read_replace_meta : _read_replace_meta,
    // same as the above
    retrieve_old_folder_meta : _retrieve_old_folder_meta,

    calculate_s3_meta_file_path : _calculate_s3_meta_file_path,

    //update_file_list : update_file_list,

    sort_files_by_date : _sort_files_by_date,

    is_file_exists : _is_file_exists, //d
    file_exists : _file_exists,
    add_file : _add_file,
    save_file : _add_file,
    add_file_save_folder  : _add_file_save_folder,
    add_file_obj_save_folder  : _add_file_obj_save_folder,

    add_file_to_redis_list : _add_file_to_redis_list,

    get_meta : function(){ return meta; },

    save_meta : _save_meta,

    is_owner  : _is_owner,
    //is_public : _is_public,
    init_members_file : _init_members_file,
    init_viewers_file : _init_viewers_file,
    has_member : _has_member,
    add_members : _add_members,
    delete_members : _delete_members,
    get_all_members : _get_all_members,
    has_viewer : _has_viewer,
    add_viewers : _add_viewers,
    delete_viewers : _delete_viewers,
    get_all_viewers : _get_all_viewers,

    build_file_list : _build_file_list,
    get_ul_renderring   : _get_ul_renderring,
    give_ul_renderring  : _give_ul_renderring,
    //return_ul_renderring   : _return_ul_renderring,
    check_username      : _check_username,

    render_all_files    : _render_all_files,
    delete_file         : _delete_file,
    add_folder          : _add_folder,
    promised_add_folder : _promised_add_folder,

    self_render_as_a_file : _self_render_as_a_file,
    render_html_repr : _self_render_as_a_file,
    get_file_obj : _get_file_obj,
    rename_file : _rename_file,

    new_json_file : _new_json_file,

    build_blueimp_pic_gallery_list : _build_blueimp_pic_gallery_list,

    get_owner_name : _get_owner_name,
    get_owner_obj  : _get_owner_obj,

    get_short_json_repr : _get_short_json_repr,

    get_file_meta_by_uuid : _get_file_meta_by_uuid,
    get_files_by_name : _get_files_by_name,

  }; // end of the object


  pass_out_folder_obj(null, folder_obj);
  //return folder_obj;
}

function peek_possible_exist_folder(folder_path, callback){
  // 
  // callback is directly passed from s3
  //
  var folder_meta_key = calculate_folder_meta_file_s3key(folder_path);
  bucket.s3_object_exists(folder_meta_key, callback);
}

function new_folder(opt_, callback){
  make_s3folder( opt_.path, function(err, folder){  // empty path also enough.
    folder.build_new_folder(opt_);
    callback(null, folder);
  });
}

function retrieve_folder(folder_path, callback){
  //
  // Retrieve an exists folder.
  //
  make_s3folder( folder_path, function(err, folder){
    if(err) return callback(err, folder_path);
    folder.retrieve_old_folder_meta(function(meta){
      callback(null, folder);
    });
  });
}

function test_retrieve_folder(){
  retrieve_folder('abc', function(folder){
    if(!folder){
      console.log('not a folder?');
      return;
    }
    console.log(folder.get_meta());
    //console.log(folder);
  });
}

function retrieve_folder_meta(folder_path, callback){
  //
  // Retrieve meta data of an exists folder.
  //

  make_s3folder( folder_path, function(err, folder){
    folder.retrieve_old_folder_meta(callback);
  });
}

function test_retrieve_folder_meta(){
  retrieve_folder_meta('abc', function(meta){
    if(!meta){
      console.log('not a meta?');
      console.log(typeof meta);
      console.log('is null?:');
      console.log(u.isNull(meta));
      //return;
    }

    console.log(meta);
  });
}

//d
function calculate_folder_meta_file_s3key(folder_path){
  //
  // Give a folder path, calculate it's s3key of meta data file.
  //
  var s3key = path.join(myconfig.meta_file_prefix, folder_path);
  return s3key;
}


function make_folder_meta_file_s3key(folder_path){
  //
  // Same as calculate_folder_meta_file_s3key, but we changed the folder meta
  // prefix setting, this gives the new key. 0918.
  // Give a folder path, calculate it's s3key of meta data file.
  //
  var s3key = path.join(myconfig.folder_meta_prefix, folder_path);
  return s3key;
}

function retrieve_file_meta(file_path, callback){
    var folder_path = path.dirname(file_path);
    var filename    = path.basename(file_path);

    retrieve_folder_meta(folder_path, function(meta){
        //console.log(meta);
        //log78('folder meta', meta);
        var file_meta = meta.files[filename];
        callback(file_meta);
    });
}

// todo
function get_file_meta(opt, callback){
  // @opt: 
  //    name, path, dir, uuid
  //    where: 'path' should be abs path, 'dir' should = dirname(path)
  //
  //var keys = Object.keys(opt);

  var dirname  = path.dirname(opt.path);
  var filename = path.basename(opt.path);
  //console.log(dirname , filename);

  retrieve_folder(dirname , function(folder_obj){
  });

  if( u.has(opt, 'uuid') ) return get_file_meta_by_uuid(dirname, opt.uuid, callback);
}

function get_file_meta_by_path(file_path, callback){
  get_file_uuid(file_path, function(err, uuid_list){
    if(err || u.isEmpty(uuid_list) ) return callback(err, null);
    var dirname = path.dirname(file_path);

    function _uuid_to_meta(uuid, _cb){
      get_file_meta_by_uuid(dirname, uuid, _cb);
    }

    // callback will get: (err, [file-meta-1, ...])
    async.map(uuid_list, _uuid_to_meta, callback);
  });
}

function test_get_file_meta_by_path(){
  var file_path = 'abc/goodagood';
  get_file_meta_by_path(file_path, function(err, metas){
    console.log(err, metas);
  });
}

function get_file_uuid(file_path, callback){
    var folder_path = path.dirname(file_path);
    var filename    = path.basename(file_path);

    retrieve_folder_meta(folder_path, function(err, folder_meta){

      callback(err, folder_meta.file_names[filename]);
    });
}

function test_get_file_uuid(f_path){
  get_file_uuid(f_path, function(err, id){
    console.log(err, id);
    tools.exit();
  });
}

function get_file_meta_by_uuid(dirname, uuid, callback){
    retrieve_folder_meta(dirname, function(err, folder_meta){
      if(err) return callback(err, folder_meta);
      if(!folder_meta) return callback(err, folder_meta);

      callback(err, folder_meta.files[uuid]);
    });
}

function test_get_file_meta_by_uuid(){
  var file_path = 'abc/goodagood';
  var dirname   = 'abc';

  get_file_uuid(file_path, function(err, uuid){
    console.log(file_path, uuid);
    get_file_meta_by_uuid(dirname, uuid, function(err, _meta){
      console.log(err, _meta);
      tools.exit();
    });
  });
}

function retrieve_file_obj(file_path, callback){
    var folder_path = path.dirname(file_path);
    var filename    = path.basename(file_path);
    //console.log(folder_path, filename);

    retrieve_folder(folder_path, function(folder_obj){
      //console.log(folder_obj); console.log(folder_obj.get_meta());
      folder_obj.get_file_obj(filename, callback);
    });
}

function test_retrieve_file_obj(){
    var path = 'abc/Png.png';
    retrieve_file_obj(path, function(fobj){
        console.log(fobj.get_meta());
    });
}

function delete_file(file_path, callback){
  // callback not called
  var folder_path = path.dirname(file_path);
  var filename    = path.basename(file_path);

  //console.log(folder_path, filename);

  retrieve_folder(folder_path, function(folder_obj){
    var folder_meta = folder_obj.get_meta();
    var file_meta   = folder_meta.files[filename];

    //console.log(file_meta);
    if (!file_meta) return; //?

    folder_obj.delete_file(filename);
    if (callback) callback(folder_obj);
  });
}



// Going to used promisified version 'promised_add_folder' to build home folder.
function init_home_folder_0927(username, callback){
  // 
  // the file will be put to: s3://ggfsb/.gg.folder.meta/username
  // @callback get (err, home_folder_obj)

  //console.log("--- --- I AM IN init home folder");
  var s3key = path.join(myconfig.meta_file_prefix, username);

  var folder_opt = {}; 
  folder_opt['path'] = username;
  folder_opt['name'] = username; // Don't forget these two.
  folder_opt['parent-dir'] = '';
  folder_opt.owner = username;
  folder_opt.permission = {owner: 'rwx', other:'', group:''};
  folder_opt['create-timestamp'] = Date.now();  //mili-seconds
  folder_opt['timestamp'] = Date.now();  //stamp when modified

  new_folder(folder_opt, function(err, home_folder){
    //console.log(111, home_folder);
    //console.log(112, 'meta ',  home_folder.get_meta());
    home_folder.promised_add_folder('goodagood').then(
      function(goodagood_folder_obj){
        //console.log(goodagood_folder_obj.get_meta());
        return new Promise(function(resolve, reject){
          goodagood_folder_obj.add_folder('message', function(err, tmp_new_folder_obj){
            if(err) reject (goodagood_folder_obj);
            goodagood_folder_obj.add_folder('etc', function(err, tmp_new_folder_obj){
              goodagood_folder_obj.build_file_list(function(){
                goodagood_folder_obj.save_meta(function(){
                  if(err) reject (goodagood_folder_obj);
                  resolve(goodagood_folder_obj);
                });
              });
            });
          });

        });

        //return goodagood_folder_obj.promised_add_folder('message')
      }
    ).then(
      function (what){
        //console.log('got ', what);
        return home_folder.promised_add_folder('public');
        //callback(null, home_folder);
      }
    ).then(
      function (what){
        //console.log('finally got ', what);
        //console.log('get meta before callback ', home_folder.get_meta());
        //callback(null, home_folder);
        home_folder.build_file_list(function(){});
        home_folder.save_meta(function(err, meta){
          callback(err, home_folder);
        });  // home folder already get saved.
        //callback(null, home_folder);
      }
    ).catch(function(e){
      console.log('E: ', e);
      callback(e, null);
    }); 

  });
}


// cloned from ./bucket.js
// It's going to change according to new folder, 0716
function init_home_folder(username, callback){
  // 
  // The s3key for folder meta file, .meta/username
  // the file will be put to: s3://ggfsa/.meta/username
  // The s3 storage is used as key-value storage for 
  // goodagood file system data structure.

  //console.log("--- --- I AM IN init home folder");
  var s3key = path.join(myconfig.meta_file_prefix, username);

  var folder_opt = {}; 
  folder_opt['path'] = username;
  folder_opt['name'] = username; // Don't forget these two.
  folder_opt['parent-dir'] = '';
  folder_opt.owner = username;
  folder_opt.permission = {owner: 'rwx', other:'', group:''};
  folder_opt['create-timestamp'] = Date.now();  //mili-seconds
  folder_opt['timestamp'] = Date.now();  //stamp when modified

  new_folder(folder_opt, function(home_folder){
    home_folder.add_folder('goodagood', function(goodagood){
      //goodagood.add_folder('in');
      //goodagood.add_folder('out');
      goodagood.add_folder('message');
      goodagood.add_folder('etc', function(etc){});
      //goodagood.add_folder('etc');
      //goodagood.add_folder('backup');
    });
    home_folder.add_folder('public', function(etc){});
    home_folder.build_file_list();
    home_folder.save_meta(callback);
  });
}


function test_init_home_folder(){
  var name = 'tmp';
  init_home_folder(name, function(){});
}


function add_default_home_folders(home_folder, callback){
    home_folder.add_folder('goodagood', function(goodagood){
      goodagood.add_folder('in');
      goodagood.add_folder('out');
      //goodagood.add_folder('etc');
      //goodagood.add_folder('backup');
    });
    home_folder.add_folder('etc', function(etc){});
    home_folder.add_folder('public', function(etc){});
    home_folder.build_file_list();
    home_folder.save_meta(callback);
}


function test_read_folder_meta(){

  var folder_path = 'muji';
  make_s3folder(folder_path, {flag_to_read_in_meta:true,}, function(folder){
    var m = folder.get_meta();
    console.log(m);
  });

}

function test_init_home_folder_many(){
  var names = ['muji', 'andrew',  'dirty-show', 'test'];
  names.forEach(function(name){
    console.log(name);
    init_home_folder(name, function(){});
  });
}



function test_add_folder(){
  // add default folders for username
  //
  var username = 'abc';
  retrieve_folder(username, function(abc){
    add_default_home_folders(abc);
  });
}

function get_sorted_message_list_as_ul(username, callback){
  //
  // The message folder is set in config-mj.js
  // message is sorted by new coming.
  //
  var message_folder_path = path.join(username, myconfig.message_folder);
  retrieve_folder(message_folder_path, function(folder){
    var files = folder.get_meta().files;
    //console.log(files);
    var names = Object.keys(files);
    var sorted_names = u.sortBy(names, function(name){
      var negative_timestamp = 0 - parseInt(files[name].timestamp, 10);
      return negative_timestamp;
    });
    //console.log(names, sorted_names);

    var ul = '<ul class="folder-list list-unstyled">';
    sorted_names.forEach(function(name){
      var file = files[name];
      if(typeof file.html !== 'undefined') ul += file.html.li;
    });
    ul += '</ul>';
    
    //console.log(ul);
    //return ul;
    callback(ul);
  });
}


if (require.main === module){
  //test_s3_folder();
  //test_read_in_meta();
  //test_init_home_folder();
  //test_init_home_folder_many();

  //test_read_folder_meta();

  //test_retrieve_folder();
  //test_retrieve_folder_meta();

  //test_retrieve_file_obj();
  //_test_retrieve_file_meta();
  //_test_delete_file();

  //test_get_file_uuid('abc/env-55');
  //test_get_file_meta_by_uuid('abc/goodagood');
  test_get_file_meta_by_path('abc/goodagood');

}

module.exports.make_s3folder   = make_s3folder;
module.exports.retrieve_folder = retrieve_folder;
module.exports.retrieve_folder_meta = retrieve_folder_meta;
module.exports.retrieve_file_obj = retrieve_file_obj;
module.exports.retrieve_file_meta = retrieve_file_meta;
module.exports.delete_file = delete_file;
module.exports.get_sorted_message_list_as_ul = get_sorted_message_list_as_ul;
module.exports.init_home_folder = init_home_folder;
module.exports.init_home_folder_0927 = init_home_folder_0927;
module.exports.get_file_uuid = get_file_uuid;
module.exports.get_file_meta_by_uuid = get_file_meta_by_uuid;

module.exports.get_file_meta_by_path = get_file_meta_by_path;
// vim: set et ts=2 sw=2 fdm=indent:
