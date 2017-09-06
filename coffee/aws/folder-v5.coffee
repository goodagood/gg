
# folder-v2, folder-v3 should not be used. 
# folder-v4 lost
# this folder-v5 get all js converted to coffee.
#
#
# One thing is happening: the folder get changed by others. 11 15, 2014

u       = require "underscore"
Promise = require "bluebird"
path    = require "path"
async   = require "async"
assert  = require "assert"
fs      = require "fs"

bucket  = require('./bucket.js')
s3file  = require "./simple-file-v3.js"
s3file_type = require("./s3-file-types.js")

myutil  = require "../myutils/myutil.js"

myconfig =  require("../config/config.js")
#old = require "./folder-v1.js"

p = console.log

#promised_make_s3folder   = Promise.promisify old.make_s3folder


# ------------------------------------------
# Use the plain closure and object:
make_s3folder = (folder_path) ->
    #
    # An factory to make folder object. 0626.. 11-17 2014.
    #
    # There is a callback: @pass_out_folder_obj, it is asynchronous when 
    # read folder _meta_ from s3, or save data to s3.
    #
    # Folder has _meta_ information, it's an object '_meta_', has attributes:
    #
    #  name : 
    #  path :
    #  uuid :
    #  html, renders
    #
    #  folder_meta_s3key : aws s3 key, for the object save _meta_ json.
    #  # proved to be stupid as when add folder as file, we must take care
    #  # the differencd between folder_meta_s3key and 'file _meta_ s3key'
    #  meta_s3key
    #
    #  meta_file_path  # Deprecated in favor of the above.
    #
    #
    #  files :
    #  { 
    #    file-name-1 : {file-_meta_-1},
    #    file-name-2 : {file-_meta_-2},
    #    ...
    #  } # The old way, under changing.
    #  --- --- !is going to change to: ==> ... 'files' should be keeped. 1005
    #
    #  file_uuids :
    #  { 
    #    file-uuid-1 : {short-file-_meta_-1},
    #    file-uuid-2 : {short-file-_meta_-2},
    #    ...
    #  }
    #  files_names :
    #  { 
    #    file-name-1 : [uuid-1, more-uuid, ... ],
    #    file-name-2 : [uuid-1, more-uuid-possible, ... ],
    #    ...
    #  } # file names stored in a list, it can be repeating, but UUID not repeat.
    # 


    _folder_ = {}
    _meta_   = {}
    _member_ = null

    #d
    _ready_ = 0
    _folder_css_file_name_ = ".gg.folder.css"
    _meta_css_file_name_   = ".gg.meta.css"

    _template_file_ = path.join(__dirname, 'folder-template.html')

    #members_file_name = ".gg.members.json"


    get_meta = ()->
        return _meta_


    prepare_basic_path = ->
      _meta_.path = folder_path  if not _meta_.path?
      calculate_folder_meta_s3key()

    init = (_opt) ->
        _opt = _opt || {}
        u.defaults _meta_, _opt # make defaults
        _meta_.uuid = myutil.get_uuid()  if typeof _meta_.uuid is "undefined"
        prepare_basic_path()
        _meta_.error = false
        _meta_.name = path.basename(folder_path)  if typeof _meta_.name is "undefined"
        _meta_.filetype = "goodagood-folder"
        _meta_.renders = {}  if typeof _meta_.renders is "undefined"
        _meta_.html = {}  if typeof _meta_.html is "undefined"
        
        # this got using and deleting a few times.
        _meta_.files = {}  if typeof _meta_.files is "undefined"
        
        # The next two will replace the above one. `files` => file_uuids, file_names.
        _meta_.file_uuids = {}  if typeof _meta_.file_uuids is "undefined"
        _meta_.file_names = {}  if typeof _meta_.file_names is "undefined"
        _meta_.what = myconfig.IamFolder
        return _meta_


    calculate_folder_meta_s3key = (path_) ->
        # We changed the folder _meta_
        # prefix setting, this is going to be used. 0918.

        path_ = path_ || _meta_.path

        _meta_.folder_meta_s3key = make_folder_meta_file_s3key(path_) # deprecated sometime?
        # same value:
        _meta_.meta_s3key = _meta_.folder_meta_s3key # this is going to be still used?
        
        return _meta_.folder_meta_s3key


    # to replace the next one: _is_file_exists
    file_exists = (filename) ->

        return false  if typeof _meta_ is "undefined"
        return false  if typeof _meta_.file_names is "undefined"
        #p  'in folder object "file exists" : ', _meta_.file_names[filename]?
        return true if _meta_.file_names[filename]?

        return is_name_in_meta_files(filename)


    is_name_in_meta_files = (name)->
        file_meta_list = u.values(_meta_.files)
        # find the file meta which has the name
        candidate = u.find(file_meta_list, (file_meta)->
            return file_meta.name is name
        )

        return false if not candidate
        return false if u.isEmpty(candidate)

        return candidate.name is name

    
    #d, if possible put things to s3.
    _prepare_redis_file_list_key = (callback) ->
      return  if typeof _meta_.redis_file_list is "string"
      redis_basic.serial_number (err, number) ->
        return null  if err
        key = myconfig.redis_folder_file_list_prefix + number
        _meta_.redis_file_list = key
        save_meta (err, _meta) ->
          log28 "save _meta_ ERROR in prepare redis file list key", _meta  if err
          callback()  if callback
    
    #d
    _add_file_to_redis_list = (file_meta, callback) ->
      
      # If the redis list not prepared, just do the preparation, and waste the file data.
      return _prepare_redis_file_list_key(callback)  if typeof _meta_.redis_file_list isnt "string"
      log28 "add file to redis list, redis key: ", _meta_.redis_file_list
      
      # meta_file or meta_s3key?
      simple_info = u.pick(file_meta, "name", "size", "meta_file", "meta_s3key", "filetype")
      str = JSON.stringify(simple_info)
      redis_basic.client.lpush _meta_.redis_file_list, str, callback
      return
    
    #d
    _add_file_thorough = (file_meta, callback) ->
      
      # Add file and push it to 'file list', for compatibility.
      _add_file_to_redis_list file_meta, (err, reply) ->
        log28 "failed to add file info to redis", file_meta.path  if err
        _meta_.files[file_meta.name] = file_meta
        build_file_list()
        callback()  if callback
        return
  
      return
    
    #redo
    _check_in_file = (file_meta, callback) ->
      
      # To replace old file _meta_ structure, and replace `add_file`.
      # Now, all name is going to be check in, no respect to 'duplication'.
      _meta_.file_uuids[file_meta.uuid] = file_meta
      if typeof _meta_.file_names[file_meta.name] is "undefined"
        _meta_.file_names[file_meta.name] = [file_meta] # new array
      else if u.isArray(_meta_.file_names[file_meta.name])
        _meta_.file_names[file_meta.name].push file_meta
      else
        return callback("err, it is not an array", null)
      build_file_list()
      callback null, _meta_.file_name[file_meta.name]

   
    _add_extra_0929 = (file_meta) ->
      
        # Changed the data structure, so extra info need to take care.
        repr = _get_short_json_repr(file_meta)
        _meta_.file_uuids[file_meta.uuid] = repr
        if _meta_.file_names[file_meta.name]?
            # only push in when there is none of the uuid:
            if _meta_.file_names[file_meta.name].indexOf(file_meta.uuid) < 0
                _meta_.file_names[file_meta.name].push file_meta.uuid
        else
            _meta_.file_names[file_meta.name] = [file_meta.uuid]



    add_file = (file_meta) ->
      
        # This is the old way to keep file _meta_, before 0907. 
        # It changing to redis for file list... then changed back, 0918 ...
        #
        # if the name exists, it will be replaced, this not save folder and file
        
        # NOTE: uuid is the key, not the file name:
        _meta_.files[file_meta.uuid] = file_meta  if _meta_.files? and _meta_.files
        _add_extra_0929 file_meta
        sort_files_by_date() # added 01 31, 2015
        build_file_list()


    #add_file = (file_meta) ->
    #  
    #    # This is the old way to keep file meta, before 0907. 
    #    # It changing to redis for file list... then changed back, 0918 ...
    #    #
    #    # if the name exists, it will be replaced, this not save folder and file
    #    
    #    # NOTE: uuid is the key, not the file name:
    #    _meta_.files[file_meta.uuid] = file_meta  if _meta_.files?
    #    _add_extra_0929 file_meta



    
    # build file list might costs, and it makes things complicated.
    add_file_save_folder = (file_meta, callback) ->
        add_file(file_meta)
        #p('add file save _meta_: ', file_meta);
        #build_file_list()
        save_meta(callback)
  
    promise_to_add_file_save_folder = Promise.promisify add_file_save_folder
  

    _add_file_obj_save_folder = (file_obj, callback) ->
        add_file_save_folder file_obj.get_meta(), callback


    update_sub_folder = (sub_folder_meta, callback)->
        add_file(_short_clone_of_folder_meta(sub_folder_meta))
        save_meta(callback)


    # replace 'get file objs by name'
    get_file_objs = (name, callback) ->
        # name is basename, no path included.
        #p 'in get file objs debugging: _meta_.path', _meta_.path
        #p 'in get file objs debugging 2: _meta_.files', _meta_.files
        return callback('no such file: ' + name, null)  unless file_exists(name)

        ulist = get_uuids(name)
        p('ulist 0923: ', ulist)

        if not ulist? or u.isEmpty(ulist)
            err   = "Can not get uuid in folder #{_meta_.path}, in 'get file objs'."
            return callback(err, null)

        if not u.isArray(ulist)
            err   = "uuid is not an array in folder #{_meta_.path}, in 'get file objs'."
            return callback(err, null)
      
        async.map(
            ulist,
            uuid_to_file_obj,
            callback
        )


    get_1st_file_obj = (name, callback) ->
        # name is basename, no path included.
        #p 'in get 1st file obj debugging: _meta_.path', _meta_.path
        #p 'in get 1st file obj debugging 2: _meta_.files', _meta_.files
        return callback('no such file: ' + name, null)  unless file_exists(name)

        ulist = get_uuids(name)
        p('ulist 1031: ', ulist)

        if not ulist? or u.isEmpty(ulist)
            err   = "Can not get uuid in folder #{_meta_.path}, in 'get file objs'."
            return callback(err, null)

        if not u.isArray(ulist)
            err   = "uuid is not an array in folder #{_meta_.path}, in 'get file objs'."
            return callback(err, null)
      
        uuid_to_file_obj ulist[0], callback


    retrieve_saved_meta = (callback) ->
        #
        # @callback will get _meta_
        #
        prepare_basic_path()  if not _meta_.meta_s3key?
        folder_meta_key = undefined
        folder_meta_key = _meta_.meta_s3key  if _meta_.meta_s3key?
        folder_meta_key = _meta_.folder_meta_s3key  if _meta_.folder_meta_s3key?

        #p 'folder_meta_key: ', folder_meta_key
        
        bucket.read_json(
            folder_meta_key,
            (err, meta_)->
                if err
                    _meta_.error = err
                    return callback err, null

                _meta_ = meta_
                callback null, _meta_
        )
  

    promise_to_retrieve_saved_meta = Promise.promisify retrieve_saved_meta
    

    is_owner = (username) ->
        return false if not u.isString(username)

        if _meta_.owner?
            return true   if typeof _meta_.owner is "string" and username is _meta_.owner

        if _meta_.owner.username?
            return true   if username is _meta_.owner.username

        # guess it as the root part of the folder path, 
        # this will not work when the root string is not the username
        guess_root_str = _meta_.path.split("/")[0]
        return true   if username is guess_root_str

        #return false  if typeof _meta_.owner is "undefined" 
        return false


    get_owner_name = ->
        r = /^\s*$/  # The regex means: empty from start of string
        
        # if it's string and not empty string:
        if _meta_.owner?
            return _meta_.owner  if u.isString(_meta_.owner) and not r.test(_meta_.owner)
            return _meta_.owner.name  if not u.isEmpty(_meta_.owner.name)
  
        guess = _meta_.path.split("/")[0]
        if u.isString(guess) and not r.test(guess)
          _meta_.owner = guess
          return _meta_.owner
        
        return null


    user_module = require("../users/a.js")

    # This give root id(name) anyway, by callback:
    get_root_name = (callback)->
        owner = get_owner_name()
        if owner
            return user_module.get_user_id(owner, callback)

        guess = _meta_.path.split("/")[0]
        callback(null, guess)


    # without callback, give the posible id as can
    get_owner_id = ()->
        return _meta_.owner_id if _meta_.owner_id?

        guess = _meta_.path.split("/")[0]
        return guess if u.isString(guess)
        return null



    # actually, it will return undefined, if not clearly returned.
    _get_owner_obj = (callback) ->
      name = get_owner_name()
      if name
        user = avatar.make_user_obj(name)
        avatar.make_user_obj name, (user) ->
          user.init callback
          return
  
      
      #return callback( avatar.make_user_obj(name));
      else
        callback null
      return



    # redo needed
    _new_json_file = (filename, content_json) ->
      file_name = filename
      file_path = path.join(_meta_.path, file_name)
      
      #var json_str = JSON.stringify([]);  // an empty array.
      #var storage = {type:'_meta_-text', note:'content in _meta_ serielized json', text: json_str,};
      #var members = [];
      data =
        
        #iam_meta : true,
        name: file_name
        path: file_path
        filetype: "json"
        owner:
          username: _meta_.path
          timestamp: Date.now()
  
        permission:
          owner: "rwx"
          group: ""
          other: ""
  
      json_file.new_json_file_obj data, (jobj) ->
        jobj.set_up_from_json content_json
        add_file jobj.get_meta()
        save_meta() # no callback?
  
    
    build_file_list = () ->
        _list_files_by_id()
        list_files_for_owner()
    

    
    _list_files_by_id = ->
      ul = "<ul class=\"file-list list-unstyled\">"
      u.each _meta_.files, (file) ->
        if file.name.indexOf(".gg") isnt 0 # hide file with name: .gg*
          li = "<li class=\"file\">\n"
          li += "<span class=\"filename\">" + file.name + "</span>&nbsp;\n"
          li += "<span class=\"size\">" + file.size + "</span>&nbsp;\n"  if file.size
          li += "<span class=\"size\">" + file.path + "</span>&nbsp;\n"
          li += "<span class=\"size\">" + file.uuid + "</span>&nbsp;\n"
          li += "</li>\n"
          ul += li
        return
  
      ul += "</ul>"
      _meta_.renders.simple_ul = ul
      return
    

    _dot_filter = (file_list) ->
        # filter out those names starts with dot, '.'

        p( 'fuck not array found in "dot filter"' ) if not u.isArray(file_list)
        return file_list.filter (file) ->
            #p file.name
            #p('what a dot? ', file.name) if file.name.indexOf(".") is 0
            if file.name.indexOf(".") is 0
                return false
            else
                return true
        
  


    # move to : file-set.js
    list_files = (file_list) ->
        # list files in 'file list', the name list_file was used before, 0131.
        # @file_list is array, each will be data object of file meta.
        # This is same as 'list file for owner', but file list is input argument.

        file_list = _dot_filter(file_list)
        #p 'file list after dot filter\n', file_list

        ul = "<ul class=\"folder-list list-unstyled\">"
        ulv = "<ul class=\"folder-list list-unstyled\">"
        u.each file_list, (file) ->
            # hide file with name: .gg*
            if file.html?
                if file.html.li?
                    #p 'listing file: ', file.name, file.html.li
                    if file.name.indexOf(".gg") isnt 0
                        ul  += file.html.li
                        ulv += file.html.li_viewer
  
        ul += "</ul>"
        ulv+= "</ul>"
        _meta_.renders.ul = ul
        #console.log('ul in "list files" 0207\n', ul)
        _meta_.renders.ul_for_viewer = ulv



    # moving to ../hrouters/ls3.js ? 0322
    list_files_for_owner = ->
      
        ul = '<ul class="folder-list list-unstyled" data-cwd="">'
        u.each _meta_.files, (file) ->
            # hide file with name: .gg*
            if file.html?
                if file.html.li?
                    #p 'listing file: ', file.name, file.html.li
                    ul += file.html.li  if file.name.indexOf(".gg") isnt 0
  
        ul += "</ul>"
        _meta_.renders.ul = ul


    # moving to ../hrouters/ls3.js
    list_files_for_viewer = ->
        ul = "<ul class=\"folder-list list-unstyled\">"
        u.each _meta_.files, (file) ->
            # hide file with name: .gg*
            if file.html?
                if file.html.li_viewer?
                    if file.name.indexOf(".gg") isnt 0
                        ul += file.html.li_viewer
  
        ul += "</ul>"
        _meta_.renders.ul_for_viewer = ul
    

    _render_folder = ->
        build_file_list()
  
    

    get_ul_renderring = ->
      
        # _meta_ is not defined, in stupid case, as: not/exists/path
        return "<ul> <li> ERROR, _meta_ is undefined </li></ul>"  if not _meta_?
        return "<ul> <li> ERROR, _meta_ is equal to something false? </li></ul>"  if not _meta_
        return "<ul> <li> ERROR, _meta_.renders is undefined? </li></ul>"  if not _meta_.renders?
        return "<ul> <li> ERROR, _meta_.renders.ul is undefined </li></ul>"  if not _meta_.renders.ul?

        # Then return the renders.ul, don't care what it is.
        return _meta_.renders.ul


    _get_renderring_for_viewer = ->
      _meta_.renders = {}  if typeof _meta_.renders is "undefined"
      return _meta_.renders.ul_for_viewer  if typeof _meta_.renders.ul_for_viewer isnt "undefined"
      "<ul><li>Currently not prepared ready for viewers</li></ul>"

    _get_renderring_for_public = ->
      _meta_.renders = {}  if typeof _meta_.renders is "undefined"
      return _meta_.renders.ul_for_public  if typeof _meta_.renders.ul_for_public isnt "undefined"
      "<ul><li>Currently not prepared for public viewers</li></ul>"


    _give_ul_renderring = (viewer_name, callback) ->
      
      # this will check viewer's name, 
      # whether it's owner, member, viewer or unknown.
      # The function stream-down to check and return callback when possible.
      # callback will get <ul> list.
      return callback(get_ul_renderring())  if is_owner(viewer_name)
      return callback _get_renderring_for_public() if _member_ is null

      _member_._has_member viewer_name, (is_member) ->
        
        # member = owner, currently, 0801, they get same.
        return callback(get_ul_renderring())  if is_member
        
        _member_._has_viewer viewer_name, (is_viewer) ->
          return callback(_get_renderring_for_viewer())  if is_viewer
          
          # For public any way:
          callback _get_renderring_for_public()
  
  
    members = require "./members.js"
    #member2 = require "./members-v2.js"
    get_member_manager = ()->
        # return a promise, then((manager)-> ...)
        members.retrieve_member_obj(_meta_.path).then( (obj)->
            _member_ = obj
            return _member_
        )


    #need test
    check_username = (username, callback) ->
      
        # This will check viewer's name, try to determine it's role,
        # whether it's owner, member, viewer or unknown.
        # The function stream-down to check and return when possible.
        #
        return callback(null, "owner")  if is_owner(username)

        return callback(null, "who-known") if not _member_?
        return callback(null, "who-known") if u.isNull( _member_)
        return callback(null, "who-known") if not _member_.folder_initialized()

        if _member_? and not u.isNull(_member_)
            #p 'not owner, but there is _member_ manager: ', _member_
            _member_.check_members_file_exists().then((exists)->
                if not exists
                    return callback(null, "who-known")
                else
                    return _member_.check_user_role(username, callback)
            )
        else
            err = 'has no member manager'
            p err, ' in check username, ', _meta_.path
            callback(err, 'who-known')

  
    locker = require("./folder-lock.js")
    lock = ()->
        # then(...) will get 'unlocker'
        locker.lock_path(_meta_.path)

    lock_async = (callback)->
        # callback get (err, unlocker)
        locker.lock_path_async(_meta_.path, callback)


    # not use this for root initialization
    save_meta = (callback) ->
        #p('in save meta, ', _meta_.renders.ul.substr(0, 100))
        p('in save meta, ', _meta_.meta_s3key, _meta_.path)
        lock_async((lock_err, unlocker)->
            p(lock_err, '--!!--') if lock_err
            #p('in save meta, write json ', _meta_)
            bucket.write_json _meta_.meta_s3key, _meta_, (write_err, write_reply)->
                unlocker((unlock_err, unlock_reply)->
                    callback(write_err, write_reply)
                )
        )

    promise_to_save_meta = Promise.promisify(save_meta)

    write_meta = (callback) ->
        # This will not try to lock the folder, it will be good when
        # initializing the root, or prepare folder without owner
        bucket.write_json _meta_.meta_s3key, _meta_, callback

    promise_to_write_meta = Promise.promisify(write_meta)
    
    #//d, because prefix for folder _meta_ is going change.
    #bucket.write_json(_meta_.meta_file_path, _meta_, function(err, reply){
    #  if(callback){
    #    if(err) return callback(err, null);
    #    return callback(null, _meta_);
    #  }
    #});

    #d
    _meta_smells = ->
      #
      # Tell if _meta_ data might be wrong.
      #
      return true  if u.isEmpty(_meta_)
      return true  if typeof _meta_.name is "undefined"
      return true  unless _meta_.name
      return true  if typeof _meta_.path is "undefined"
      return true  unless _meta_.path
      return true  if typeof _meta_.meta_file_path is "undefined" # for folder
      return true  unless _meta_.meta_file_path
      false


    # redo
    _render_file = (filename, callback) ->
      get_file_objs filename, (file_obj) ->
        file_obj.render_html_repr()
        file_meta = file_obj.get_meta()
        _meta_.files[filename] = file_meta
        return
  
      return
    
    # redo
    _render_all_files = ->
        keys = u.keys(_meta_.files)
        keys.forEach (filename) ->
            console.log filename
            _render_file filename, ->
  
        build_file_list()
        save_meta()
        return
    
    #redo
    _delete_file = (filename, callback) ->
      get_file_objs filename, (fobj) ->
        
        # This is trying to delete the storage
        fobj.delete_s3_storage()
        return
  
      delete _meta_.files[filename]
  
      build_file_list()
      save_meta()
      callback()  if callback
      return
    
    # need redo
    _rename_file = (filename, new_name) ->
      
        # here in function: _meta_ means folder _meta_.
        new_meta = u.omit(_meta_.files[filename], "path", "html", "local_file", "timestamp", "s3_stream_href", "delete_href")
        new_meta.name = new_name
        new_meta.path = path.join(_meta_.path, new_name)
        
        #console.log('old: ', _meta_.files[filename]);
        s3file.simple_s3_file_obj new_meta, (err, fobj) ->
          fobj.set_meta new_meta #?
          fobj.calculate_meta_defaults()
          fobj.switch_with_filetype (typed_fobj) -> #?
              typed_fobj.render_html_repr()
              
              #console.log(typed_fobj.get_meta());
              add_file typed_fobj.get_meta()
              delete _meta_.files[filename]
  
              build_file_list()
              save_meta(->)

  
    # When needed to show the folder self as a file in parent folder.
    self_render_as_a_file = ->
        li = "<li class=\"folder\">"
        
        # file selector
        li += "<span class=\"glyphicon glyphicon-folder-close\"> </span>&nbsp;"
        li += "&nbsp;<a href=\"/ls/" + _meta_.path + "\" >" + _meta_.name + "</a>"
        li += "</li>\n"
        _meta_.html = {}  if not _meta_.html?
        _meta_.html.li = li
    

    _build_blueimp_pic_gallery_list = ->
      
      # only image file gatherred, and build to list as blueimp gallery asked.
      list = []
      file_uuids = Object.keys(_meta_.files)
      p('length: ', file_uuids.length)

      file_uuids.forEach (uuid) ->
        if _meta_.files[uuid].filetype is "image"
          file_info = _meta_.files[uuid] # short name

          #src = path.join(myconfig.s3_stream_prefix, file_info.storage.key) #d?
          #href = path.join('/viewpic', file_info.path_uuid)
          #href = path.join('/ss519', file_info.path_uuid)
          #href = path.join('/direct-serve', file_info.path_uuid)
          href = path.join('/file-full-path', file_info.path)

          thumb = undefined
          if file_info.thumb.defaults.s3key?
            thumb = path.join(myconfig.s3_stream_prefix, file_info.thumb.defaults.s3key)
          else
            thumb = "" # Should prepare a default thumbnail image.

          value = 'not calculated'
          if file_info.value?
              value = file_info.value.amount


          one = """<a href="#{href}" title="#{file_info.name}" 
            data-description="Value: #{value}" >
                <img src="#{thumb}"  alt="#{file_info.name}"
                     class="folder-image" data-pu="#{file_info.path_uuid}" > 
            </a>"""

          #p('one: ', one)
          list.push one
      return list

    # still not used?
    old_build_blueimp_pic_gallery_list = ->
      
      # only image file gatherred, and build to list as blueimp gallery asked.
      list = []
      file_names = Object.keys(_meta_.files)
      file_names.forEach (name) ->
        if _meta_.files[name].filetype is "image"
          fileInfo = _meta_.files[name] # short name
          src = path.join(myconfig.s3_stream_prefix, fileInfo.storage.key)
          thumb = undefined
          if fileInfo["thumbnail-s3key"]
            thumb = path.join(myconfig.s3_stream_prefix, fileInfo["thumbnail-s3key"])
          else
            thumb = "" # Should prepare a default thumbnail image.
          one = "<a href=\"" + src + "\" title=\"" + fileInfo.name + "\" data-description=\"The value keep increasing justly\" >"
          one += "<img src=\"" + thumb + "\" alt=\"" + fileInfo.name + "\"> </a>"
          list.push one
        return list


    # move to file-set.js
    sort_files_by_date = ->
      
        files = sort_files('timestamp', true)
        list_files(files)
        return files

    

    # move to: file-set.js
    sort_files = (key, descend)->
        descend = descend || false

        files = u.values( _meta_.files )
        return null if not files.length? or files.length < 1

        sorted = u.sortBy files, (element) ->
            if element[key]?
                return element[key]
            else
                return 0

        sorted.reverse() if descend
        return sorted


    uuid_to_meta = (uuid) ->
        m = null
        if uuid?
            if _meta_.files[uuid]?
                m = _meta_.files[uuid]
        return m



    _get_files_by_name = (name, callback) ->
      
        # We allow files exist with same name, but uuid can not be duplicated.
        uuid_list = _meta_.file_names[name]
        async.parallel uuid_list, uuid_to_meta, (err, meta_list) ->
            console.log err, meta_list
            callback err, meta_list
  

    _get_short_json_repr = (_meta) ->
        _meta = _meta or _meta_
        repr = u.pick(_meta, "name", "meta_s3key", "size", "timestamp", "filetype")
        repr["short-json"] = true
        repr
  
  


    # -- new function definitions:

    # writing
    read_text = (filename, callback)->
        p 'read text'
        get_file_objs filename, (err, objs)->
            #p err, objs

            #ms = objs.map( (o)->
            #    o.get_meta()
            #)
            #p 'got meta s\n', ms

            async.map(objs
                ,(o, callback)->
                    o.read_to_string callback
                ,(err, read_results)->
                    p 'got what?\n', err, read_results
                    callback(err, read_results)
            )

            #if objs.length >= 1
            #    file = objs[0]
            #    file.read_to_string(callback)
            #else
            #    err = 'no file got in "read file 12 15", ' + filename
            #    callback(err, null)



            callback err, objs

    _d_read_file = (filename)->
        throw 'global objects must be _ready_.' if _ready_ < 1
        #p 'read file here'

        return new Promise( (resolve, reject)->
            get_file_objs(filename, (err, objs)->
                if objs.length >= 1
                    file = objs[0]
                    file.read_to_string(
                        (err, str)->
                            reject(err) if err
                            resolve(str)
                    )
                else
                    reject('no obj after read file')
            )
        )

    read_file_12_15 = (filename, callback)->
        # Read the first file content by the name.

        get_file_objs(filename, (err, objs)->
            callback(err, objs) if err
            callback(err, objs) if u.isNull(objs)

            if objs.length? and objs.length >= 1
                #p 'greater than or equals 1: ', objs.length
                file = objs[0]
                #p 'in "get file objs by name" 2, file:\n', file
                file.read_to_string(callback)
                #file.read_to_string( (err, res)->
                #    p 3, err, res
                #    callback err, res
                #)
            else
                err = 'no file got in "read file 12 15", ' + filename
                p 'got err in "read file 12 15" ', err
                callback(err, null)
        )

    read_file = Promise.promisify read_file_12_15
        

    get_recent_file_by_name = (filename, callback)->
        metas = name_to_metas(filename)
        return null if not metas?
        return null if metas.length == 0

        u.sortBy(metas, (meta)->
            return meta.timestamp
        )

        id = metas[0].uuid
        assert(u.isString(id), 'should we think uuid is a string?')

        uuid_to_file_obj(id, callback)


    read_recent_file_by_name = (filename, callback)->
        get_recent_file_by_name(filename, (err, file)->
            if err
                return callback('got err when "reading recent file by name": ' + filename + err, null)

            file.read_to_string(callback)
        )


        

    read_files = (filename)->
        throw 'global objects must be _ready_.' if _ready_ < 1
        #p 'read file here'

        return new Promise( (resolve, reject)->
            get_file_objs(filename, (err, objs)->

                # a function to read content from the file object:
                read_one = (file_obj, callback)->
                    file_obj.read_to_string (err, str)->
                        if str
                            callback(null, str)
                        else
                            callback('err happen?', null)

                async.map objs, read_one, (err, file_contents)->
                    if err
                        reject(err)
                    else
                        resolve(file_contents)

            )
        )

    read_file_by_uuid = (uuid)->
        throw 'global objects must be _ready_.' if _ready_ < 1
        #p 'read file here'

        get_file_obj_by_uuid(uuid).then( (file)->
            return new Promise( (resolve)->
                file.read_to_string( (err, str)->
                    resolve(str)
                )
            )
        )
        
    write_text_file = (filename, text)->
        #
        _owner = _meta_.owner
        if not u.isString(_owner)
            err = 'no owner information in "write text file"
                   in folder: ' + _meta_.path +
                       '. writing filename: ' + filename
            return Promise.reject(err)
        _path = _meta_.path
        if not u.isString(_path)
            err = 'no path information in "write text file"
                   in folder: ' + _meta_.path +
                       '. writing filename: ' + filename
            return Promise.reject(err)

        # this will return a promise, and job json will be past with promise.
        s3file.write_text_file(_owner, _path, filename, text)


    #?, only get simple file obj.
    get_file_obj_by_uuid = (uuid) ->
        throw 'global objects must be ready: _obj_, _meta_, _ready_' if _ready_ < 1

        throw "no such uuid in _meta_.files #{uuid}" if( not _meta_.files[uuid] )

        file_meta = _meta_.files[uuid]
        s3file.promised_simple_s3_file_obj(file_meta).then(
            (file_obj) ->
                file_obj
        )


    get_uuids = (filename)->
        if _meta_.file_names[filename]?
            return _meta_.file_names[filename]
        else
            return []

    _get_uuids = (filename)->
        # another way to get uuid list, direct from files (metas).
        metas = u.filter(_meta_.files, (id)->
            return _meta_.files[id][name] == filename
        )
        uuids = u.map(metas, (m)->
            return m.uuid
        )
        return uuids

    # give file name, get array of metas,
    # this will not look else where but 'files'
    name_to_metas = (filename)->
        meta_list = u.values(_meta_.files)
        meta_want = u.filter(meta_list, (meta)->
            return meta.name is filename
        )
        return meta_want

    name_to_uuids = (filename)->
        meta_list = name_to_metas(filename)
        uuid_list = u.map(meta_list, (meta)->
            return meta.uuid
        )
        return uuid_list


    get_number_of_name = (filename)->
        if _meta_.file_names[filename]?
            return _meta_.file_names[filename].length
        else
            return 0

    get_file_name_array = ()->
        return Object.keys(_meta_.file_names)


    # it return, no callback, no promise.
    pattern_to_uuids = (pattern)->
        pattern = /^[^.]\w.*/ if not u.isRegExp pattern
        names = get_file_name_array()
        
        got = names.filter (str)->
            place =  str.search(pattern)
            #p 'place: ', place, ' ', str
            return true if place >= 0
        
        names = got
        #p 'names: ', names

        throw 'get no names in "pattern to uuids"' if not u.isArray(names)

        uuids = names.map(get_uuids)
        #p 'could be nested: ', uuids
        flatten = u.flatten(uuids)
        return flatten


    uuid_to_file_obj = (uuid, callback) ->
        # This give object with file type.

        file_meta = _meta_.files[uuid]
        #p '-name of file meta in "uuid to file obj": ', file_meta.name
        #p 'type of file in "uuid to file obj": ', file_meta.filetype

        #meta_to_file_obj(file_meta, callback)
        # folder meta need to take care before:
        if file_meta?
            if file_meta.what is myconfig.IamFolder
                #p 'the meta:\n', file_meta
                err_msg = 'It is a folder: ' + uuid
                return callback(err_msg, null)
        else
            return callback('not such uuid as a file', null)

        p 's3file type.set file obj...'
        s3file_type.set_file_obj_from_meta(file_meta, callback)


    #meta_to_file_obj = (meta_, callback)->
    #    # @meta_ must be one of file meta in _meta_.files
    #    if meta_?
    #        if meta_.what is myconfig.IamFolder
    #            #p 'the meta:\n', meta_
    #            err_msg = 'It is a folder: ' + uuid
    #            return callback(err_msg, null)
    #    else
    #        return callback('not such uuid as a file', null)
    #    #p 's3file type, set file obj...'
    #    s3file_type.set_file_obj_from_meta(meta_, callback)


    get_file_objs_by_name = get_file_objs
    #d, duplicated, replaced by "get file objs"
    old_get_file_objs_by_name = (name, callback) ->
        # one name can give a list of file objects.

        uuid_list = get_uuids(name)
        #p 'uuid list in "get file objs by name": ', uuid_list
        async.map(uuid_list, uuid_to_file_obj, callback)


    get_one_file_obj = (name, callback)->
        get_file_objs(name, (err, obj_list)->
            return callback err, obj_list if err
            if obj_list.length < 1
                err_msg = 'no obj found in: ' + '"get one file obj"'
                return callback err_msg, null

            # return the first if still not got return err
            callback err, obj_list[0]
        )
    
    promise_to_one_file_obj = Promise.promisify get_one_file_obj


    # Delete uuid and optionally 'name' from meta data
    del_uuid_and_name = (uuid, name)->
        file_meta = _meta_.files[uuid]
        name = name || file_meta.name
        #p '-- in del uuid and ... ', name
        delete _meta_.files[uuid] if _meta_.files[uuid]?
        #delete _meta_.files[uuid]

        delete _meta_.file_uuids[uuid]

        fn  = _meta_.file_names[name]
        return if not fn
        idx = fn.indexOf(uuid)
        #p "fn, idx: ", fn, idx
        fn.splice(idx, 1) if idx?

        # Extra things, for the old errors
        delete _meta_.file_names[name] if fn.length < 1


    delete_uuid_without_save = (uuid, callback)->
        # This will build the file list and save folder meta, after deleting.

        p "delete uuid: ", uuid

        file_meta = _meta_.files[uuid]
        filename  = file_meta.name
        p "name is #{filename}"

        get_file_obj_by_uuid(uuid).then(
            (obj)->
                p 'got obj: ', obj
                obj.promise_to_delete_s3_storage()
        ).then(
            (what)->
                p 'what in "delete uuid": ', what
                del_uuid_and_name(uuid)
                callback(null, uuid)
        )


    ##? promise to save meta should get no argument, 2015, 0711
    #delete_uuid = (uuid, callback)->
    #    delete_uuid_without_save(uuid, (err, uuid)->
    #        build_file_list()
    #        promise_to_save_meta(callback)
    #    )

    # use the next instead? 2015, 0711
    delete_uuid = (uuid, callback)->
        delete_uuid_without_save(uuid, (err, uuid)->
            build_file_list()
            promise_to_save_meta().then((what)->
                callback(null, what)
            ).catch(callback)
        )


    delete_file_by_uuid = (uuid, callback)->
        # This will build the file list and save folder meta, after deleting.

        p "delete file by uuid: ", uuid

        file_meta = _meta_.files[uuid]
        assert(u.isObject(file_meta), "we can not get file meta of the uuid: " + uuid)

        filename  = file_meta.name
        assert(u.isString(filename), "we can not get file name of the uuid: " + uuid)
        p "name is #{filename}"

        uuid_to_file_obj(uuid, (err, obj)->
            obj.delete_s3_storage( (err, res)->
                del_uuid_and_name(uuid)

                build_file_list()
                #promise_to_save_meta(callback)
                save_meta(callback)
            )
        )

    promise_to_delete_file_by_uuid = Promise.promisify delete_file_by_uuid


    # remove file meta by uuid
    clear_file_meta = (uuid)->
        file_meta = _meta_.files[uuid]
        return false if u.isEmpty(file_meta)

        name = file_meta.name
        #p '-- in "clear file meta" the file name is ', name

        delete_uuid_in_hash_of_file_names(uuid, name)

        delete _meta_.files[uuid] if _meta_.files[uuid]?
        delete _meta_.file_uuids[uuid]



    delete_uuid_in_hash_of_file_names = (uuid, name)->
        # we need a parameter of name, it can be found by uuid,
        # but in case the other hash has delete the name, it can be provided here.

        name = name || _meta_.files[uuid].name
        return false if not name

        uuids_with_same_name  = _meta_.file_names[name]
        return false if not uuids_with_same_name

        idx = uuids_with_same_name.indexOf(uuid)
        #p "in 'del. uuid in file_names', uuids_with_same_name, idx: ", uuids_with_same_name, idx
        uuids_with_same_name.splice(idx, 1) if idx?

        delete _meta_.file_names[name] if uuids_with_same_name.length < 1
        return true


    _sleep = (seconds)->
        seconds = seconds || 1
        return new Promise (resolve)->
            setTimeout(resolve, seconds*1000)

    _empty_promise = new Promise( (resolve) -> ) # is this ok?


    # this causes trouble in multiple removing?
    delete_name = (name, callback)->
        uuids = _meta_.file_names[name]
        #p "del name: #{name} get uuids: ", uuids
        if not uuids? or not uuids or u.isEmpty uuids or uuids.length == 0
            #return Promise.resolve(null)
            return callback("no uuid to delete? in 'delete name', path: " + _meta_.path, null)
        
        # build function list of deleting uuid
        funs = uuids.map((id)->
            return (callback)->
                delete_file_by_uuid(id, callback)
        )

        async.series(funs, callback)

    promise_to_delete_name = Promise.promisify delete_name


    delete_folder = (uuid, callback)->
        name = _meta_.files[uuid].name

        if(not file_exists(name))
            err = 'no such folder to delete: ' + name
            return callback(err, null)

        folder_path = path.join(_meta_.path, name)
        #uuid        = _meta_.
        retrieve_folder(folder_path).then( (child_folder)->
            child_folder.delete_all_uuid_recursively( (err, del)->

                # not done?
                # start to delete the folder/uuid in parent/current folder:
                p "delete uuid: ", uuid

                file_meta = _meta_.files[uuid]
                filename  = file_meta.name
                p "name is #{filename}"

                del_uuid_and_name(uuid)
                callback(null, uuid)

                build_file_list()

                # callback get aws reply, (err, aws-reply)
                promise_to_save_meta(callback)

            )

        )
        #


    clear_empty_names = (callback)->
        p Object.keys _meta_.file_names
        for key in Object.keys _meta_.file_names
            p 'here: ', key
            uuids = _meta_.file_names[key]
            p "see if has uuids, key: #{key} get uuids: ", uuids
            if not uuids? or not uuids or u.isEmpty uuids or uuids.length == 0
                p 'try to delete: ', key
                delete _meta_.file_names[key] #if u.isEmpty uuids # useless after things right

        build_file_list()
        save_meta(callback)

    promise_to_clear_empty_names = Promise.promisify clear_empty_names


    uuid_to_delete_file_fun = (uuid)->
        fun = (callback)->
            #if not callback?
            #    callback = ()->
            p 'going to delete one file: ', uuid
            delete_file_by_uuid(uuid, callback)

        return fun


    # Give a name, this try to delete all the files with the name.
    # The name should not contain path.
    # This use callback function, it makes logic easier.
    delete_file = (name, callback)->
        #p 'delete file ... files file_names file_uuids'
        uuids = _meta_.file_names[name]
        #p 'get uuids: ', uuids
        return callback("get no uuids for #{name}", null) if not uuids
        return callback("uuids has no 'length' for #{name}", null) if not uuids.length?

        # build the functions:
        funs = uuids.map(uuid_to_delete_file_fun)
        # run it in series:
        async.series(funs, callback)


    # to test
    delete_all_uuid_recursively = (callback)->
        # callback get first err, and it's last result of deleting
        uuid_list = Object.keys(_meta_.files)
        assert(u.isArray(uuid_list))
        len = uuid_list.length
        if(len > 0)
            uuid = uuid_list[0]
            # This might be trouble for folder:
            delete_file_by_uuid(uuid, (err, result)->
                return callback(err, result) if err
                if len > 1
                    return delete_all_uuid_recursively(callback)
                else
                    return callback(err, result)

            )
        else
            err = 'empty file list? in "delete all uuid recursively": ' + _meta_.path
            callback(err, null)



    list_files_and_save = (callback)->
        build_file_list()
        save_meta((err, meta)->
            callback(err, _folder_)
        )

    promise_to_list_files_and_save = Promise.promisify list_files_and_save



    _short_clone_of_folder_meta = (input_meta) ->
        to_delete = [
          "files"
          "file_uuids"
          "file_names"
          "renders"
        ]
        out_meta = null
        try
            out_meta = JSON.parse(JSON.stringify(input_meta))
        catch err
            p '- going to use input meta'
            out_meta = input_meta

        to_delete.forEach (n) ->
            delete out_meta[n]
        return out_meta



    add_folder = (name)->
        #
        # Add folder of 'name', the folder will be created.
        #
        new_folder_path = path.join(_meta_.path, name) # The abspath
        opt_ = {
            name : name,
            path : new_folder_path,
            uuid : myutil.get_uuid(),
            'parent-dir' : _meta_.path, # meta is of who adding the folder
            timestamp  : Date.now(),
            owner      : _meta_.owner,
            permission : {owner:'rwx', group:'', other:''},
            html: {},
        }
        if _meta_['owner-undefined']? and _meta_['owner-undefined']
            opt_['owner-undefined'] = true
            opt_['inherite-owner']  = true

        # new folder's object and meta:
        Obj = null
        Meta= null
        make_promisified_s3folder(opt_.path).then( (obj)->
            #p 'a, in add folder'
            Obj = obj
            Obj.init(opt_)
            #p 'b init '
            assert u.isFunction(Obj.self_render_as_a_file_promised)
            Obj.self_render_as_a_file()
        ).then( ()->
            Obj.build_file_list()
            Meta = Obj.get_meta()
            #p '1, add folder meta: ', Meta
            #Obj.save_meta_promised()
            Obj.promise_to_write_meta()  # this do without locking
        ).then( ()->
            # parent/current folder add and save
            #p 'parent doings'

            # keep only needed data
            add_file(_short_clone_of_folder_meta(Meta))
            promise_to_save_meta()
        ).then( ()->
            return Obj # give the promisified object of the added folder
        )


    get_folder = (name)->
        if not file_exists(name)
            return Promise.reject('no such name, when "get folder" in ' + _meta_.path)

        folder_path = path.join(_meta_.path, name)
        return retrieve_folder(folder_path)

    
    # Templating and renderring, to replace the old way of string manipulating.

    list_file_tmp = ()->
        str = ''
        u.each _meta_.files, (file) ->
            # hide file with name: .gg*
            if file.html?
                if file.html.li?
                    str += file.html.li  if file.name.indexOf(".gg") isnt 0
        return str


    # read in template from the file
    read_in_template = (callback)->
        fs.readFile(_template_file_, (err, buf)->
            return callback(err, buf) if err

            str = buf.toString()
            p('folder template string: ',err, str)

            _meta_.html = {} if not _meta_.html?
            try
                _meta_.html.template = u.template(str)
            catch err
                _meta_.html.template = null
                return callback(err, null)

            callback(null, _meta_.html.template)
            return _meta_.html.template
        )

    make_template_data = ()->
        d = {}
        d.folder_path = _meta_.path
        d.file_list   = list_file_tmp()
        return d


    render_template = (callback)->
        data = make_template_data()

        if _meta_.html? and _meta_.html.template?
            template = _meta_.html.template
            return try_template(template, data, callback)

        read_in_template((err, template)->
            data = get_client_json()
            try_template(template, data, callback)
        )

    try_template = (template, data, callback)->
        try
            html = template(data)
            return callback(null, html)
        catch err
            return callback(err, null)

    is_name_unique = (name)->
        metas = u.filter(u.values(_meta_.files), (m)->
            m['name'] == name
        )
        if not metas.length? or metas.length < 1
            return false

        m0 = metas[0]
        if m0.unique? and m0.unique
            return true

        return false


    update_file = (meta, callback)->
        #
        return update_name(name, meta, callback) if(meta.name?)
        return update_uuid(uuid, meta, callback)  if(meta.uuid?)

    update_name = (name, callback)->
        #
        callback('not implemented', null)

    update_uuid_storage = (meta, callback)->
        if not meta.uuid? or not meta.uuid
            return callback('uuid should come when update uuid', null)

        uuid = meta.uuid
        old = _meta_.files[uuid]

        ##update_meta()
        #if(meta.storage? and u.isObject(meta.storage))
        #    p(meta.storage, old_meta.storage)
        #    uuid_to_file_obj(uuid, (err, file)->
        #        return callback(err, null) if(err)
        #        file.update_storage(meta)
        #    )
        #    bucket.copy_object(src.key, tgt.key, callback) #?
        #    old.timestamp = Date.now()
        #    old.lastModifiedDate = old.timestamp


    # This deprecated because it will get a dependency of owner id.
    _old_get_folder_auxiliary_path = ()->
        create_time = 'negative-one'
        if _meta_['create_time']?
            create_time = _meta_['create_time']
            if not u.isEmpty(create_time)
                create_time = 'ct-' + create_time

        oid = get_owner_id()
        if not oid? or not oid
            throw new Exception('no owner id for folder: ' + _meta_.path)
        oid = oid.toString()

        auxiliary_path = path.join(oid, _meta_.uuid, create_time)
        return auxiliary_path

    folder_uuid = ()->
        return _meta_.uuid

    folder_milli_uuid = ()->
        return _meta_.milli_uuid

    callback_milli_uuid = (callback)->
        # This not save meta to folder, it save a file meta
        return callback(null, _meta_['milli_uuid']) if _meta_['milli_uuid']?

        # The rest is to build the milli_uuid, when there is none.
        if _meta_['create_time']?
            create_time = _meta_['create_time']
        else
            create_time = Date.now()

        milli_uuid = path.join(create_time.toString(), _meta_.uuid)
        _meta_['milli_uuid'] = milli_uuid

        save_meta((err, s3rep)->
            return callback(err, null) if(err)

            callback(null, milli_uuid)
        )


    # Give the auxiliary path, it's the prefix of s3 key.
    # The method both return the value
    get_folder_auxiliary_path = ()->
        muuid = null
        if _meta_.milli_uuid?
            muuid = _meta_.milli_uuid
            key = path.join(myconfig.folder_auxiliary_prefix, muuid)
            _meta_.aux_path = key
            return key

        return null


    # Give auxiliary path by callback.
    # The method above is long term preferred, the callback would
    # be working in transferring period.
    callback_folder_auxiliary_path = (callback)->
        return callback(null, _meta_.aux_path) if _meta_.aux_path?

        return callback_milli_uuid (err, muuid)->
            return callback(err, null) if err

            key = path.join(myconfig.folder_auxiliary_prefix, muuid)
            _meta_.aux_path = key
            callback(null, key)


    set_attr = (name, value, callback)->
        _meta_[name] = value
        save_meta(callback)


    # 0925, 2015
    file_identified_by_uuid = ()->
        # _meta_['file-identified-by-uuid'] should be true/false if exists

        return _meta_['file-identified-by-uuid'] if _meta_['file-identified-by-uuid']?

        return false



    #
    # Define an object and return the object, as in factory pattern.
    # If an function is needed by this object, define it in the above and
    # refer it as needed.
    #
      
    _folder_.init = init
    
    _folder_.retrieve_saved_meta = retrieve_saved_meta
    _folder_.promise_to_retrieve_saved_meta  = promise_to_retrieve_saved_meta

    _folder_.calculate_folder_meta_s3key = calculate_folder_meta_s3key
    
    _folder_.sort_files_by_date = sort_files_by_date
    _folder_.sort_files = sort_files

    _folder_.file_exists = file_exists
    _folder_.add_file = add_file
    _folder_.save_file = add_file
    _folder_.add_file_save_folder = add_file_save_folder
    _folder_.promise_to_add_file_save_folder = promise_to_add_file_save_folder
    _folder_.update_sub_folder = update_sub_folder
    # update file can be: add_file_save_folder

    _folder_.add_file_obj_save_folder = _add_file_obj_save_folder
    _folder_.add_file_to_redis_list = _add_file_to_redis_list
    _folder_.get_meta = get_meta

    _folder_.save_meta = save_meta
    _folder_.promise_to_save_meta = promise_to_save_meta
    _folder_.write_meta = write_meta
    _folder_.promise_to_write_meta = promise_to_write_meta
    _folder_.is_owner = is_owner
    
    #_folder_.is_public  = _is_public,
    _folder_.build_file_list = build_file_list
    _folder_.list_files_and_save = list_files_and_save
    _folder_.get_ul_renderring = get_ul_renderring
    _folder_.give_ul_renderring = _give_ul_renderring
    
    #_folder_.return_ul_renderring    = _return_ul_renderring,
    _folder_.check_username = check_username
    _folder_.render_all_files = _render_all_files
    #_folder_.#delete_file = _delete_file
    _folder_.add_folder = add_folder
    _folder_.self_render_as_a_file = self_render_as_a_file
    _folder_.render_html_repr = self_render_as_a_file

    _folder_.rename_file = _rename_file
    _folder_.new_json_file = _new_json_file
    _folder_.build_blueimp_pic_gallery_list = _build_blueimp_pic_gallery_list
    _folder_.get_owner_name = get_owner_name
    _folder_.get_owner_obj = _get_owner_obj
    _folder_.get_short_json_repr = _get_short_json_repr
    _folder_.uuid_to_meta = uuid_to_meta
    _folder_.get_files_by_name = _get_files_by_name

    # end of the old

    # this get the simple file:
    _folder_.get_file_obj_by_uuid   = get_file_obj_by_uuid
    # this has file type:
    _folder_.uuid_to_file_obj       = uuid_to_file_obj

    _folder_.get_file_objs          = get_file_objs
    _folder_.get_file_objs_by_name  = get_file_objs
    _folder_.get_1st_file_obj       = get_1st_file_obj
    _folder_.get_one_file_obj       = get_one_file_obj
    _folder_.promise_to_one_file_obj= promise_to_one_file_obj
    _folder_.get_uuids              = get_uuids
    _folder_.pattern_to_uuids       = pattern_to_uuids
    _folder_.name_to_metas          = name_to_metas
    _folder_.name_to_uuids          = name_to_uuids

    _folder_.read_file_by_name      = read_file
    _folder_.read_files_by_name     = read_files
    _folder_.read_file_by_uuid      = read_file_by_uuid

    _folder_.delete_file            = delete_file
    _folder_.delete_name            = delete_name
    _folder_.promise_to_delete_name = promise_to_delete_name
    _folder_.delete_file_by_uuid    = delete_file_by_uuid
    _folder_.promise_to_delete_file_by_uuid = promise_to_delete_file_by_uuid
    # split into 2:
    _folder_.delete_uuid_without_save = delete_uuid_without_save
    _folder_.delete_uuid              = delete_uuid


    _folder_.read_text_file         = read_file
    _folder_.read_text              = read_text
    _folder_.write_text_file        = write_text_file

    _folder_.clear_empty_names      = clear_empty_names
    _folder_.promise_to_clear_empty_names  = promise_to_clear_empty_names
    _folder_.promise_to_list_files_and_save  = promise_to_list_files_and_save

    _folder_.delete_all_uuid_recursively  = delete_all_uuid_recursively
    _folder_.delete_folder  = delete_folder
    _folder_.get_member_manager  = get_member_manager

    _folder_.get_number_of_name = get_number_of_name
    _folder_.get_folder = get_folder

    # 0225
    _folder_.get_recent_file_by_name  = get_recent_file_by_name
    _folder_.read_recent_file_by_name = read_recent_file_by_name

    # expose for testing
    _folder_.del_uuid_and_name = del_uuid_and_name
    _folder_.clear_file_meta   = clear_file_meta # replace the above?
    _folder_.list_files = list_files

    _folder_.read_in_template = read_in_template
    _folder_.render_template  = render_template
    _folder_.is_name_unique   = is_name_unique

    _folder_.get_root_name    = get_root_name
    _folder_.get_owner_id     = get_owner_id
    _folder_.get_folder_auxiliary_path = get_folder_auxiliary_path
    _folder_.callback_folder_auxiliary_path = callback_folder_auxiliary_path

    _folder_.callback_milli_uuid = callback_milli_uuid
    _folder_.folder_uuid         = folder_uuid
    _folder_.folder_milli_uuid   = folder_milli_uuid

    _folder_.set_attr = set_attr
    _folder_.is_name_in_meta_files = is_name_in_meta_files

    _folder_.file_identified_by_uuid = file_identified_by_uuid #2015 0926



    # -- end of definition ---

    promise_to_give_obj = ()->
        _ready_ = 1
        Promise.resolve(_folder_)

    # return a promise:
    return promise_to_give_obj()
# --- end of make_s3folder ---



make_promisified_s3folder = (folder_path)->
    make_s3folder(folder_path).then(
        (obj)->
            Promise.promisifyAll(obj, {suffix:"_promised"})
    )

retrieve_promisified_folder = (folder_path)->
    # all function get "_promised" surffix.
    Obj = null
    make_promisified_s3folder(folder_path).then(
        (obj)->
            Obj = obj
            obj.retrieve_saved_meta_promised()
    ).then(
        (o)->
            Obj
    )

retrieve_folder = (folder_path) ->

    Obj = null
    make_s3folder(folder_path).then(
        (obj_)->
            Obj = obj_
            Obj.promise_to_retrieve_saved_meta()
    ).then(
        (meta_)->
            Obj
    )




retrieve_folder_meta = (folder_path) ->
    
    #
    # Retrieve meta data of an exists folder.
    #
    make_s3folder(folder_path).then(
        (folder)->
            folder.promise_to_retrieve_saved_meta()
    )




#doing
build_root_folder_and_save = (opt)->
    make_s3folder(opt.path).then(
        (folder)->
            folder.init(opt)
            return folder
    ).then(
        (folder)->
            p "after init? 1128 1:53pm"
            return folder
            #folder.self_render_as_a_file()
            #folder.save_meta(callback)
            #folder.promise_to_list_files_and_save()
            # Comment out all above it becomes same the 'build new folder'
    )


build_new_folder = (opt, callback)->
    # This init folder according opt, opt.path, the folder not saved.
    # The folder can adding sub-folders then.
    make_s3folder(opt.path).then(
        (folder)->
            folder.init(opt)
            return folder
    )


get_file_meta_by_uuid = (dirname, uuid, callback) ->
    retrieve_folder_meta(dirname).then(  (folder_meta) ->
        return folder_meta.files[uuid]
    )


retrieve_file_by_path_uuid = (path_uuid, callback) ->
    # This use callback
    folder_path = path.dirname (path_uuid)
    uuid        = path.basename(path_uuid)
    
    #console.log(folder_path, filename)
    retrieve_folder(folder_path).then( (folder_obj) ->
        
        #console.log(1, folder_obj)
        #console.log(2, folder_obj.get_meta())
        # this return a promise
        folder_obj.uuid_to_file_obj uuid, callback
    )


retrieve_file_objs = (file_path, callback) ->
    # Retrieve 
    folder_path = path.dirname(file_path)
    filename = path.basename(file_path)
    
    #console.log(folder_path, filename)
    retrieve_folder(folder_path).then( (folder_obj) ->
        
        #console.log(1, folder_obj)
        #console.log(2, folder_obj.get_meta())
        # this return a promise
        folder_obj.get_file_objs(filename, callback)
    )


retrieve_first_file_obj = (file_path, callback) ->
    retrieve_file_objs(file_path, (err, objs)->
        return callback(err) if err
        return callback('no file found') if not objs.length?
        return callback('no file found') if objs.length <= 0

        callback(err, objs[0])
    )



delete_file = (file_path, callback) ->
    
    # callback not called
    folder_path = path.dirname(file_path)
    filename = path.basename(file_path)
    
    #console.log(folder_path, filename);
    retrieve_folder folder_path, (folder_obj) ->
        folder_meta = folder_obj.get_meta()
        file_meta = folder_meta.files[filename]
        
        #console.log(file_meta);
        return    unless file_meta #?
        folder_obj.delete_file filename
        callback folder_obj    if callback


delete_path_uuid = (path_uuid, callback) ->

    folder_path = path.dirname(path_uuid)
    uuid = path.basename(path_uuid)
    
    #console.log(folder_path, uuid);
    retrieve_folder(folder_path).then( (folder_obj) ->
        #folder_meta = folder_obj.get_meta()
        #file_meta = folder_meta.files[uuid]
        #
        ##console.log(file_meta);
        #return    unless file_meta #?
        folder_obj.delete_file_by_uuid  uuid, callback
    )





get_file_uuid = (file_path) ->
    folder_path = path.dirname(file_path)
    filename = path.basename(file_path)
    #p 'folder path, file name: ', folder_path, filename

    retrieve_folder_meta(folder_path).then(
        (meta)->
            #p 'meta in get file uuid: ', meta
            #p 'meta.file_names.filename in get file uuid: ', meta.file_names[filename]
            if meta.file_names[filename]?
                #p 'should return an arry'
                return meta.file_names[filename]
            else
                #p 'should return empty'
                return []

    )


get_file_meta_by_path = (file_path, callback) ->
    # it's list of meta, it's array, returned by promise
    dirname = path.dirname file_path
    basename= path.basename file_path
    Folder  = null

    retrieve_folder dirname
        .then(
            (folder)->
                Folder = folder
                folder.get_uuids basename
        ).then(
            (uuid_list)->
                #p 'uuid list in get file meta by path: ', uuid_list
                meta_list = []
                u.each uuid_list, (uuid)->
                    m = Folder.uuid_to_meta  uuid
                    meta_list.splice(0,1,m)
                #p 'we get meat list: ', meta_list
                meta_list
        )





# -- doing some upgrading of old things: 1203a



new_folder = (opt_, callback) ->
    make_s3folder opt_.path, (err, folder) -> # empty path also enough.
        folder.init opt_
        callback null, folder


make_folder_meta_file_s3key = (folder_path) ->
    #
    # ... but we changed the folder meta # prefix setting,
    # this gives the new key. 0918.
    # Give a folder path, calculate it's s3key of meta data file.
    #
    # Am I reading this over 12 monthes? 2015 1107
    #
    s3key = path.join(myconfig.folder_meta_prefix, folder_path)
    return s3key


retrieve_file_meta = (file_path, callback) ->
    folder_path = path.dirname(file_path)
    filename = path.basename(file_path)

    #p("path, name: ", folder_path, filename)
    retrieve_folder(folder_path).then((folder) ->
        uuid_list = folder.get_uuids(filename)

        meta_list = uuid_list.map(folder.uuid_to_meta)
        
        #p('file meta list\n', meta_list)
        callback null, meta_list
    )


retrieve_file_meta_pu = (path_uuid, callback) ->
    folder_path = path.dirname(path_uuid)
    uuid = path.basename(path_uuid)

    #p("retrieve file meta pu, path uuid: ", folder_path, uuid)
    retrieve_folder(folder_path).then((folder) ->
        folder_meta = folder.get_meta()
        file_metas  = folder_meta['files']
        #p 'typeof file_metas:', typeof file_metas
        callback(null, file_metas[uuid])
    ).catch((err)->
        callback(err, null)
    )




# todo
get_file_meta = (opt, callback) ->
    
    # @opt: 
    #        name, path, dir, uuid
    #        where: 'path' should be abs path, 'dir' should = dirname(path)
    #
    #var keys = Object.keys(opt);
    dirname = path.dirname(opt.path)
    filename = path.basename(opt.path)
    
    #console.log(dirname , filename);
    retrieve_folder dirname, (folder_obj) ->

    get_file_meta_by_uuid dirname, opt.uuid, callback    if u.has(opt, "uuid")


# todo
delete_all_file = (folder_path)->
    retrieve_promisified_folder(folder_path).then(
        (folder)->
    )






test_read_folder_meta = ->
    folder_path = "muji"
    make_s3folder folder_path,
        flag_to_read_in_meta: true
    , (folder) ->
        m = folder.get_meta()
        console.log m



test_init_home_folder_many = ->
    names = [
        "muji"
        "andrew"
        "dirty-show"
        "test"
    ]
    names.forEach (name) ->
        console.log name
        init_home_folder name, ->




test_add_folder = ->
    
    # add default folders for username
    #
    username = "abc"
    retrieve_folder username, (abc) ->
        add_default_home_folders abc



get_sorted_message_list_as_ul = (username, callback) ->
    
    #
    # The message folder is set in config-mj.js
    # message is sorted by new coming.
    #
    message_folder_path = path.join(username, myconfig.message_folder)
    retrieve_folder message_folder_path, (folder) ->
        files = folder.get_meta().files
        
        #console.log(files);
        names = Object.keys(files)
        sorted_names = u.sortBy(names, (name) ->
            negative_timestamp = 0 - parseInt(files[name].timestamp, 10)
            negative_timestamp
        )
        
        #console.log(names, sorted_names);
        ul = "<ul class=\"folder-list list-unstyled\">"
        sorted_names.forEach (name) ->
            file = files[name]
            ul += file.html.li    if typeof file.html isnt "undefined"


        ul += "</ul>"
        
        #console.log(ul);
        #return ul;
        callback ul



retrieve_files_by_pattern = (folder_path, pattern, callback)->
    #Get file by pattern.

    assert(u.isString(folder_path))
    assert(u.isRegExp(pattern))

    Folder = null
    retrieve_promisified_folder(folder_path).then((folder)->
        Folder = folder
        return Folder.pattern_to_uuids(pattern)
    ).then((list)->
        async.map(list, Folder.uuid_to_file_obj, callback)
    )


retrieve_metas_by_pattern = (folder_path, pattern, callback)->
    #Get file by pattern.

    retrieve_files_by_pattern(folder_path, pattern, (err, file_list)->
        async.map(
            file_list
            ,(file_obj, callback)->
                m = file_obj.get_meta()
                callback(null, m)
            ,callback
        )
    )

    #assert(u.isString(folder_path))
    #assert(u.isRegExp(pattern))

    #Folder = null
    #retrieve_promisified_folder(folder_path).then((folder)->
    #    Folder = folder
    #    return Folder.pattern_to_uuids(pattern)
    #).then((list)->
    #    async.map(list, Folder.uuid_to_file_obj, callback)
    #)


get_folder_uuid = (path_)->
    retrieve_folder(path_).then((folder)->
        meta   = folder.get_meta()
        uuid   = meta.uuid
        return uuid
    )


is_folder_exists = (path_, callback) ->
    #
    # @callback will get (err, true/other), if exists, it's true
    #
    Folder = null
    Meta   = null

    make_s3folder(path_).then((folder)->
        Folder = folder
        folder.calculate_folder_meta_s3key(path_)
        Meta = folder.get_meta()
    ).then( ()->
        #console.log("Meta: ", Meta)
        #callback(null, null)
        bucket.s3_object_exists(Meta.folder_meta_s3key, (err, aws_reply)->
            #p('the reply:\n', err, aws_reply)
            return callback(err, null) if(err)
            # A temperory solution, check it has ContentLength
            return callback(null, true) if(aws_reply.ContentLength.length > 0)
            return callback(err, aws_reply)
        )
    )
    

# The above is over kill? 2015 0725
# The callback is from aws reply, if err, the err is an object show what's
# wrong. If the key exists, the err is null, but the 2nd will be object, show
# some info.
folder_exists = (dir, callback)->
    folder_meta_s3key = make_folder_meta_file_s3key(dir)
    bucket.s3_object_exists folder_meta_s3key, callback



# duplicated?
peek_possible_exist_folder = (folder_path, callback) ->
    
    # 
    # callback is directly passed from s3
    #
    folder_meta_key = make_folder_meta_file_s3key(folder_path)
    bucket.s3_object_exists folder_meta_key, callback


# -- exports -- #


#module.exports.old = old

module.exports.make_s3key_for_folder_meta_file = make_folder_meta_file_s3key


module.exports.make_s3folder = make_s3folder
module.exports.make_promisified_s3folder = make_promisified_s3folder
module.exports.retrieve_promisified_folder = retrieve_promisified_folder
module.exports.retrieve_folder = retrieve_folder

module.exports.build_new_folder = build_new_folder

module.exports.retrieve_file_objs = retrieve_file_objs
module.exports.retrieve_first_file_obj = retrieve_first_file_obj
module.exports.build_root_folder_and_save  = build_root_folder_and_save #?


module.exports.get_file_uuid         = get_file_uuid
module.exports.get_file_meta_by_path = get_file_meta_by_path

module.exports.retrieve_folder_meta = retrieve_folder_meta
module.exports.get_file_meta_by_uuid = get_file_meta_by_uuid

module.exports.retrieve_file_meta = retrieve_file_meta
module.exports.retrieve_file_meta_pu = retrieve_file_meta_pu

module.exports.retrieve_files_by_pattern = retrieve_files_by_pattern
module.exports.retrieve_metas_by_pattern = retrieve_metas_by_pattern

module.exports.delete_path_uuid = delete_path_uuid
module.exports.retrieve_file_by_path_uuid = retrieve_file_by_path_uuid

module.exports.get_folder_uuid = get_folder_uuid
module.exports.is_folder_exists = is_folder_exists
module.exports.folder_exists = folder_exists

##
#- Keep the old things:
##



##module.exports.retrieve_file_obj    = old.retrieve_file_obj #
#module.exports.delete_file        = old.delete_file
#module.exports.get_sorted_message_list_as_ul = old.get_sorted_message_list_as_ul
#module.exports.init_home_folder              = old.init_home_folder
#module.exports.init_home_folder_0927 = old.init_home_folder_0927
    


# -- checkings -- #

_test_folder_path = 'abc'
_file_name_to_delete_ = 'txt22'


stop = (period) ->
    period = period || 1
    period = 1 if not u.isNumber period
    milli_seconds = period * 1000
    setTimeout process.exit, milli_seconds


test_get_file_meta_by_path = ->
    file_path = "abc/goodagood"
    p '1, get meta by path'
    get_file_meta_by_path file_path
        .then( (metas) ->
            p 'in 1209a, get meta by path'
            console.log metas
            stop()
        )


test_get_file_meta_by_uuid = ->
    file_path = "abc/goodagood"
    dirname = "abc"
    get_file_uuid file_path
    .then (uuid) ->
        console.log 'test get file meta by uuid: ',  file_path, uuid
        get_file_meta_by_uuid dirname, uuid
            .then(
                (_meta) ->
                    console.log 'get the meta in test get file meta by uuid: ', _meta
                    stop()
            )

check_delete_file = ()->
    retrieve_promisified_folder(_test_folder_path).then(
        (folder)->
            folder.promise_to_delete_name(_file_name_to_delete_)
    ).then(
        (what)->
            p 'check delete file .. by name ', what
            stop()
    )



# -- This works, but mocha testing case failed in same condition -- #
# -- We think wether 'mocha' is fucking stupid, coffee script is brain fucker,
# -- or js is the asshole, as I am the brain fucker. 
test_retrieve_a_css = ()->
    folder_path = 'abc'
    file_name = 'folder.css'

    retrieve_promisified_folder(folder_path).then(
        (folder)->
            folder.get_file_objs(file_name, (e, objs)->
                p '1, e, objs', e, objs
                ob0 = objs[0]
                meta0 = ob0.get_meta()
                ob0.read_to_string(
                    (err, str)->
                        p 'file name: ', meta0.name
                        p 'file text: ', str
                        stop()
                )


            )
    )

_test_delete_member_file = ()->
    Folder = null
    retrieve_promisified_folder('abc').then(
        (folder)->
            Folder = folder
            #p 'test delete member file: ', folder
            folder.get_file_objs_by_name_promised('.gg.members.json')
    ).then(
        (file_obj_list)->
            #p 'this is member file list: ', file_obj_list
            if file_obj_list.length?
                async.map(
                    file_obj_list,
                    (obj, callback)->
                        m = obj.get_meta()
                        uuid = m.uuid
                        Folder.delete_file_by_uuid uuid, callback

                    ,(err, results)->
                        p 't 1 :', err, results
                
                )# end of async.map function call
    ).then(
        (what)->
            stop(30) # stop in 30 secs.
    )

check_pattern = (pat)->
    pat = pat || /t.*/

    retrieve_promisified_folder('abc').then( (folder)->
        return folder.pattern_to_uuids(pat)
    ).then( (list)->
        p 'get the list: \n', list
    ).then( (whatever)->
        stop()
    )




if require.main is module

    #test_s3_folder();
    #test_read_in_meta();
    #test_init_home_folder();
    #test_init_home_folder_many();

    #test_read_folder_meta();

    #test_retrieve_folder();
    #test_retrieve_folder_meta();

    #_test_retrieve_file_meta();

    #_test_delete_member_file()

    #test_get_file_uuid('abc/env-55');
    #test_get_file_meta_by_uuid('abc/goodagood')

    #test_get_file_meta_by_path "abc/goodagood"
    #test_get_file_meta_by_path "abc/.gg.members.json"
    #test_retrieve_a_css()

    #check_delete_file()
    check_pattern()


