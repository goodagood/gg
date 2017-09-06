#
# FAILED, 'this' get changed in method callback
#
# 'folder' object, write in coffee
#

u    = require('underscore')
path = require('path')

Promise = require('bluebird')
async   = require('async')

bucket = require('./bucket.js')
s3file = require('./file.js')
image_file = require('./image-file.js')
json_file  = require('./json-file.js')

myconfig   =  require("gg-credentials").config
myutil     = require('../myutils/myutil.js')

log28 = require('../myutils/mylogb.js').double_log('/tmp/log28')
tools = require('./tools-cof.js')

#test = require('nodeunit')
p = console.log


class S3Folder
    constructor : (@folder_path) ->
        @meta = {}
        @members_file_name = '.gg.members.json'
        @viewers_file_name = '.gg.viewers.json'

        #
        # An factory to make folder object. 0626
        #
        # There is a callback: @pass_out_folder_obj, it is asynchronous when 
        # read folder meta from s3, or save data to s3.
        #
        # Folder has meta information, it's an object 'meta', has attributes:
        #
        #  name : 
        #  path :
        #  uuid :
        #  html, renders
        #
        #  folder_meta_s3key : aws s3 key, for the object save meta json.
        #  # proved to be stupid as when add folder as file, we must take care
        #  # the differencd between folder_meta_s3key and 'file meta s3key'
        #  meta_s3key
        #
        #  meta_file_path  # Deprecated in favor of the above.
        #
        #
        #  files :
        #  { 
        #    file-name-1 : {file-meta-1},
        #    file-name-2 : {file-meta-2},
        #    ...
        #  } # The old way, under changing.
        #  --- --- !is going to change to: ==> ... 'files' should be keeped. 1005
        #
        #  file_uuids :
        #  { 
        #    file-uuid-1 : {short-file-meta-1},
        #    file-uuid-2 : {short-file-meta-2},
        #    ...
        #  }
        #  files_names :
        #  { 
        #    file-name-1 : [uuid-1, more-uuid, ... ],
        #    file-name-2 : [uuid-1, more-uuid-possible, ... ],
        #    ...
        #  } # file names stored in a list, it can be repeating, but UUID not repeat.
        # 
  

      
    get_meta : () ->
        @meta

    fuck : ->
        p 'fucking'

    show_meta : () ->
        p @meta
        @meta

    prepare_basic_path : () ->
        if(typeof @meta.path == 'undefined')
            @meta.path = @folder_path
        #@calculate_s3_meta_file_path()
        @calculate_folder_meta_s3key()
  
    init : (_opt) ->
  
        u.defaults(@meta, _opt) # make defaults
  
        if(typeof @meta.uuid == 'undefined')
            @meta.uuid = myutil.get_uuid()
  
        @prepare_basic_path()
  
        @meta.error   = false
        if(typeof @meta.name == 'undefined')
            @meta.name = path.basename(@folder_path)
        @meta.filetype= 'goodagood-folder'
        
        if(typeof @meta.renders == 'undefined')
            @meta.renders = {}
        if(typeof @meta.html == 'undefined')
            @meta.html = {}
  
        # this got using and deleting a few times.
        if(typeof @meta.files == 'undefined')
            @meta.files = {}
  
        # The next two will replace the above one. `files` => file_uuids, file_names.
        if(typeof @meta.file_uuids == 'undefined')
            @meta.file_uuids = {}
        if(typeof @meta.file_names == 'undefined')
            @meta.file_names = {}
  
        @meta.what    = myconfig.IamFolder
  
  
    calculate_folder_meta_s3key : () ->
        @meta.folder_meta_s3key = path.join(myconfig.folder_meta_prefix, @folder_path)
        @meta.meta_s3key = @meta.folder_meta_s3key
        return @meta.meta_file_path
  
    calculate_s3_meta_file_path : () ->
    
        # We changed the folder meta
        # prefix setting, this is going to be used. 0918.
        @meta.folder_meta_s3key = path.join(myconfig.folder_meta_prefix, @folder_path) #d
    
        @meta.meta_s3key = @meta.folder_meta_s3key  # this is going to be used
    
        #d `meta_file_path` is going to be deprecated. this is the old way:
        @meta.meta_file_path = calculate_folder_meta_file_s3key(@meta.path)  #/d
        return @meta.meta_file_path #d
  
  
    # to replace the next one: @is_file_exists
    is_file_exists : (filename) ->
      if( typeof meta == 'undefined' )
          return false
      if( typeof @meta.file_names == 'undefined' )
          return false
      return !! @meta.file_names[filename]
  
    #d
    is_file_exists_old : (filename) ->
      if( typeof meta == 'undefined' )
          return false
      if( typeof @meta.files == 'undefined' )
          return false
      return !! @meta.files[filename]
  
  
    #d
    add_file_thorough : (file_meta, callback) ->
        # Add file and push it to 'file list', for compatibility.
        _add_file_to_redis_list(file_meta, (err, reply) ->
          if(err)
              log28('failed to add file info to redis', file_meta.path)
          @meta.files[file_meta.name] = file_meta
          @build_file_list()

          if(callback)
              callback()
        )
  
    #redo
    check_in_file : (file_meta, callback) ->
        # To replace old file meta structure, and replace `@add_file`.
        # Now, all name is going to be check in, no respect to 'duplication'.
    
        @meta.file_uuids[file_meta.uuid] = file_meta
        if(typeof @meta.file_names[file_meta.name] == 'undefined')
          @meta.file_names[file_meta.name] = [file_meta, ] # new array
        else
          if(u.isArray(@meta.file_names[file_meta.name]))
            @meta.file_names[file_meta.name].push(file_meta)
          else
            return callback('err, it is not an array', null)
    
    
        @build_file_list()
        callback(null, @meta.file_name[file_meta.name])
  
    add_extra_0929 : (file_meta) ->
        # Changed the data structure, so extra info need to take care.
    
        repr = @get_short_json_repr(file_meta)
    
        @meta.file_uuids[file_meta.uuid] = repr
    
        if(typeof @meta.file_names[file_meta.name] == 'undefined' ||
            ! @meta.file_names[file_meta.name])
                @meta.file_names[file_meta.name] = [file_meta.uuid]
        else
                @meta.file_names[file_meta.name].push(file_meta.uuid)
        
  
    add_file : (file_meta, callback) ->
        # This is the old way to keep file meta, before 0907. 
        # It changing to redis for file list... then changed back, 0918 ...
        #
        # if the name exists, it will be replaced, this not save folder and file
    
        if(typeof @meta.files != 'undefined' && @meta.files)
            # NOTE: uuid is the key, not the file name:
            @meta.files[file_meta.uuid] = file_meta
    
        @add_extra_0929(file_meta)
        callback(null, meta)
    
  
    
    add_file_save_folder : (file_meta, callback) ->
      @add_file(file_meta)
      @save_meta(callback)
  
    add_file_obj_save_folder : (file_obj, callback) ->
        @add_file_save_folder(file_obj.get_meta(), callback)
  
  
    #todo
    get_file_obj : (name, callback) ->
        # name is basename, no path included.
        if( ! @is_file_exists(name) )
            return callback(null)
        file_meta = @meta.files[name]
        #console.log(file_meta)
    
        s3file.new_s3_file_obj(file_meta, (base) ->
          #console.log(base)
          base.set_meta(file_meta)
          # When getting a file object, we use 'switch' for file type
          base.switch_with_filetype(callback)
        )
    
  
    retrieve_old_folder_meta : (callback) ->
        #
        # @callback will get meta
        #
        @prepare_basic_path() if( typeof @meta.meta_s3key == 'undefined' )
    
        folder_meta_key
        if( typeof @meta.folder_meta_s3key != 'undefined' )
            folder_meta_key = @meta.folder_meta_s3key
        if( typeof @meta.meta_s3key != 'undefined' )
            folder_meta_key = @meta.meta_s3key
    
        self = this
        bucket.read_json(folder_meta_key, (err, _meta_) ->
          if(err)
              @meta.error = err
              callback(err, null)
              return
          self.meta = _meta_
          p 'fuck'
          self.fuck()
          @show_meta()
          #p(111, _meta_)
          #p(112, @meta)
          callback(null, @meta)
        )
    
  
    # _is_owner : (username) ->
    #  guess_owner = @meta.path.split('/')[0]
  
    #  #log28('user name is owner?', username)
    #  #log28('guess owner       ?', guess_owner)
  
    #  if(username == guess_owner) return true
  
    #  if(typeof @meta.owner == 'undefined') return false #?
    #  if(typeof @meta.owner == 'string' && username == @meta.owner) return true
    #  if(username == @meta.owner.username) return true
    #  return false
    #}
  
    # _get_owner_name : () ->
    #  r = /^\s*$/
    #  # if it's string and not empty string:
    #  if (typeof @meta.owner == 'string' && ! r.test(@meta.owner) ) return @meta.owner
  
    #  guess = @meta.path.split('/')[0]
    #  if (typeof guess == 'string' && ! r.test(guess)){
    #    @meta.owner = guess
    #    return @meta.owner
    #  }
  
    #  # return something to be clear.
    #  return null
    #  # actually, it will return undefined, if not clearly returned.
    #}
  
    #avatar = require('../users/avatar.js')
    # _get_owner_obj : (callback) ->
    #  name = _get_owner_name()
    #  if(name){
    #    user = avatar.make_user_obj(name)
    #    user.init(callback)
    #    #return callback( avatar.make_user_obj(name))
    #  }
    #  return callback(null)
    #}
  
    new_json_file : (filename, content_json) ->
      file_name = filename
      file_path = path.join(@meta.path, file_name)
  
      #json_str = JSON.stringify([])  # an empty array.
      #storage = {type:'meta-text', note:'content in meta serielized json', text: json_str,}
      #members = []
  
      data = {
        #iam_meta : true,
        name : file_name,
        path : file_path,
        filetype: "json",
        owner : { username: @meta.path, timestamp : Date.now() },
        permission: {
          owner : 'rwx',
          group : '',
          other : '',
        },
      }
      json_file.new_json_file_obj(data, (jobj) ->
        jobj.set_up_from_json(content_json)
        @add_file(jobj.get_meta(), @save_meta)
        #@save_meta()
      )
  
  
    build_file_list : (callback) ->
      # @callback get (err, [ul, ulv]), meta elements will already been set.
      @list_files_by_id()
      callback(null, null)
  
  
    list_files_by_id : () ->
        ul = '<ul class="file-list list-unstyled">'
        u.each(@meta.files, (file) ->
  
            if(file.name.indexOf('.gg') != 0)  # hide file with name: .gg*
                li = '<li class="file">\n'
  
                li    += '<span class="filename">' + file.name + '</span>&nbsp\n' 
                li    += '<span class="size">' + file.size + '</span>&nbsp\n' 
                li    += '<span class="size">' + file.path + '</span>&nbsp\n' 
                li    += '<span class="size">' + file.uuid + '</span>&nbsp\n' 
                li    += '</li>\n'
                ul += li
      
        )
        ul += '</ul>'
        @meta.renders.simple_ul = ul
        @meta.renders.ul = ul # this make the <ul> actually the simple one.
  

    dot_filter : (uuid_list) ->
      return uuid_list.filter(
        (uuid) ->
          if(@meta.file_uuids[uuid].name.indexOf('.') == 0)
              return false
          return true
      )
  
    list_files : (callback) ->
      # the old '_render_folder_as_ul', 0817
      uuid_list = @dot_filter(Object.keys(@meta.file_uuids))
      # <ul> for owner and viewer
      ul = ulv = '<ul class="folder-list list-unstyled">'
      async.map(uuid_list,
          @get_file_meta_by_uuid,
          (err, results) ->
            if(err)
                return callback(err, results)
  
            results.forEach( (_meta) ->
              ul  += _meta.html.li
              ulv += _meta.html.li_viewer
            )
  
            ul  += '</ul>'
            ulv += '</ul>'
            @meta.renders.ul_for_viewer = ulv
            @meta.renders.ul = ul
            callback(null, [ul, ulv])
      ) # end of map
  
  
    list_files_for_owner : () ->
      # the old '_render_folder_as_ul', 0817
      ul = '<ul class="folder-list list-unstyled">'
      u.each(@meta.files, (file) ->
          if(typeof file.html != 'undefined')
              if(file.name.indexOf('.gg') != 0)  # hide file with name: .gg*
                  ul += file.html.li
        
      )
      ul += '</ul>'
      @meta.renders.ul = ul
  
    list_files_for_viewer : () ->
        ul = '<ul class="folder-list list-unstyled">'
        u.each(@meta.files, (file) ->
            if(typeof file.html != 'undefined')
                if(file.name.indexOf('.gg') != 0)  # hide file with name: .gg*
                    if(typeof file.html.li_viewer != 'undefined')
                          ul += file.html.li_viewer
        )
        ul += '</ul>'
        @meta.renders.ul_for_viewer = ul
  
    #?
    render_folder : () ->
      @build_file_list(() ->)
      #@list_files_for_viewer()
  
    get_ul_renderring : () ->
      # meta is not defined, in stupid case, as: not/exists/path
  
      if(typeof meta == 'undefined')
          return '<ul> <li> ERROR, meta is undefined </li></ul>'
      if(! meta)
          return '<ul> <li> ERROR, meta is equal to false? </li></ul>'
      if(typeof @meta.renders == 'undefined')
          @meta.renders = {}
  
      if(typeof @meta.renders.ul != 'undefined')
          return @meta.renders.ul
  
      if(typeof @meta.renders.ul == 'undefined')
          return '<ul> <li> ERROR, @meta.renders.ul is undefined </li></ul>'  #?
      #@build_file_list()
      return @meta.renders.ul
  
  
    get_renderring_for_viewer : () ->
      if(typeof @meta.renders == 'undefined')
          @meta.renders = {}
      if(typeof @meta.renders.ul_for_viewer != 'undefined')
          return @meta.renders.ul_for_viewer
      return "<ul><li>Currently not prepared ready for viewers</li></ul>"
  
  
    get_renderring_for_public : () ->
      if(typeof @meta.renders == 'undefined')
          @meta.renders = {}
      if(typeof @meta.renders.ul_for_public != 'undefined')
          return @meta.renders.ul_for_public
      return "<ul><li>Currently not prepared for public viewers</li></ul>"
  
  
    give_ul_renderring : (viewer_name, callback) ->
      # this will check viewer's name, 
      # whether it's owner, member, viewer or unknown.
      # The function stream-down to check and return callback when possible.
      # callback will get <ul> list.
  
      if(_is_owner(viewer_name))
          return callback(@get_ul_renderring())
      #log28('viewer go to member check', viewer_name)
  
      @has_member(viewer_name, (is_member) ->
        # member = owner, currently, 0801, they get same.
        if(is_member)
            return callback(@get_ul_renderring())
        #log28('viewer go to viewer check', viewer_name)
  
        @has_viewer(viewer_name, (is_viewer) ->
          if(is_viewer)
            return callback(@get_renderring_for_viewer())
          
          #log28('viewer check public page', viewer_name)
          return callback(@get_renderring_for_public())
        )
      )
    
  
    check_username : (username, callback) ->
      # This will check viewer's name, try to determine it's role,
      # whether it's owner, member, viewer or unknown.
      # The function stream-down to check and return when possible.
      #
  
      if(_is_owner(username))
          return callback('owner')
  
      @has_member(username, (is_member) ->
        # member = owner, currently, 0801, they get the same.
        if(is_member)
            return callback('member')
  
        #console.log('oh, not member')
  
        @has_viewer(username, (is_viewer) ->
          if(is_viewer)
            return callback('viewer')
          
          return callback('who-known')
        )
      )
    
  
    save_meta : (callback) ->
      # Is it good to set/get lock before saving?  It obviously will bring
      # troubles to cope with conditions like 'unable' to lock.
  
      #bucket.write_json(@meta.folder_meta_s3key, meta, function(err, reply)
      bucket.write_json(@meta.meta_s3key, meta, (err, reply) ->
        #console.log("save meta :", err, reply)
        if(callback)
          return callback(err, null) if(err)
          return callback(null, meta)
        
      )
  
      ##d, because prefix for folder meta is going change.
      #bucket.write_json(@meta.meta_file_path, meta, (err, reply) ->
      #  if(callback){
      #    if(err) return callback(err, null)
      #    return callback(null, meta)
      #  }
      #})
    
  
    #d
    meta_smells : () ->
      #
      # Tell if meta data might be wrong.
      #
      return true if( u.isEmpty(@meta) )
      return true if(typeof @meta.name == 'undefined')
      return true if(! @meta.name)
      return true if(typeof @meta.path == 'undefined')
      return true if(! @meta.path)
      return true if(typeof @meta.meta_file_path == 'undefined') # for folder
      return true if(! @meta.meta_file_path)
  
      return false
    
  
    render_file : (filename, callback) ->
      @get_file_obj(filename, (file_obj) ->
        file_obj.render_html_repr()
        file_meta = file_obj.get_meta()
        @meta.files[filename] = file_meta
      )
    
  
    # redo
    render_all_files : () ->
      keys = u.keys(@meta.files)
      keys.forEach((filename) ->
        console.log(filename)
        @render_file(filename, () ->)
      )
      @build_file_list()
      @save_meta()
    
  
    #redo
    delete_file : (filename, callback) ->
      @get_file_obj(filename, (fobj) ->
        # This is trying to delete the storage
        fobj.delete_s3_storage()
      )
      delete @meta.files[filename]
      @build_file_list()
      @save_meta()
      callback() if(callback)
    
  
    # need redo
    rename_file : (filename, new_name) ->
      # here in function: meta means folder @meta.
      new_meta = u.omit(@meta.files[filename], 'path', 'html',
          'local_file', 'timestamp', 's3_stream_href', 'delete_href')
      new_meta.name = new_name
      new_meta.path = path.join(@meta.path ,new_name)
  
      #console.log('old: ', @meta.files[filename])
      s3file.new_s3_file_obj(new_meta, (fobj) ->
        fobj.set_meta(new_meta)
        fobj.calculate_meta_defaults()
        fobj.switch_with_filetype((typed_fobj) ->
          typed_fobj.render_html_repr()
          #console.log(typed_fobj.get_meta())
          @add_file(typed_fobj.get_meta())
          delete @meta.files[filename]
          @build_file_list()
          @save_meta()
        )
      )
    
  
    add_folder : (name, callback) ->
      #
      # Add folder of 'name', the folder will be created.
      # Do give a callback, callback(err, the-new-folder).
      #
      folder_path = path.join(@meta.path, name) # The abspath
      opt_ = {
        name : name,
        path : folder_path,
        uuid : myutil.get_uuid(),
        'parent-dir' : @meta.path, # meta is of who adding the folder
        timestamp  : Date.now(),
        owner      : @meta.owner,
        permission : {owner:'rwx', group:'', other:''},
        html: {},
      }
      if(typeof opt_.uuid == 'undefined')
          opt_.uuid = myutil.get_uuid()
  
      new_folder opt_, (err, new_folder_obj) ->
          if(err)
              return callback(err, null)
  
          new_folder_obj.self_render_as_a_file()
          new_folder_obj.save_meta(  (err, the_meta) ->
              if(err)
                  return callback(err, null)
  
              # The new folder saved, now add the new folder to the CURRENT folder:
              @add_file new_folder_obj.get_meta(), () ->
                  @save_meta((err, what) ->
                        callback(err, new_folder_obj)
                  )
          )
  
          
  
    #promised_add_folder : Promise.promisify(@add_folder)
    promised_add_folder : (name) ->
        return new Promise( (resolve, reject) ->
            @add_folder(name, (err, new_folder_obj) ->
                return reject(err) if (err)
                resolve(new_folder_obj)
            )
        )


  
    self_render_as_a_file : () ->
  
      li = '<li class="folder">'
  
      # file selector
      #li += '<input type="checkbox" name="filepath[]" value="' + meta['path'] + '" />' 
  
      li += '<span class="glyphicon glyphicon-folder-close"> </span>&nbsp'
      li += '&nbsp<a href="/ls/' + @meta.path  + '" >' + meta['name'] + '</a>' 
      li += '</li>\n'
      if (!@meta.html)
          @meta.html = {}
      if (typeof @meta.html == 'undefined')
          @meta.html = {}
  
      @meta.html.li = li
    
  
    # still not used?
    build_blueimp_pic_gallery_list : () ->
      # only image file gatherred, and build to list as blueimp gallery asked.
      list = []
      file_names = Object.keys(@meta.files)
      file_names.forEach((name) ->
        if(@meta.files[name].filetype == 'image')
          fileInfo = @meta.files[name]  # short name
          src = path.join(myconfig.s3_stream_prefix, fileInfo.storage.key)
          thumb
          if (fileInfo['thumbnail-s3key'])
            thumb = path.join(myconfig.s3_stream_prefix, fileInfo['thumbnail-s3key'])
          else
            thumb = '' # Should prepare a default thumbnail image.
          
          
          one = '<a href="' + src +'" title="' + fileInfo.name + '" data-description="The value keep increasing justly" >'
          one    += '<img src="' + thumb + '" alt="' + fileInfo.name + '"> </a>'
  
          list.push(one)
        
      )
      return list
    
  
    sort_files_by_date : () ->
  
      # sort the file by negative epoc seconds
      sorted = u.sortBy(@meta.files, (e) ->
        # change the date string from aws to epoc mili-seconds
        date = new Date(e['lastModifiedDate'])
        epoc = date.getTime()
        return 1 - epoc
      )
  
      @meta.files = sorted
  
  
    # added from 'team-folder', all folders need these functionalities
    # question this is necessary for all folder? 0920
  
    init_members_file : () ->
      @meta.is_team_folder = true
      #file_name = '.members.json'
      content = []
      if(@meta.owner && @meta.owner.username)
          content.push(@meta.owner.username)
      @new_json_file(members_file_name, content)
  
  
     _add_members : (name_list, callback) ->
      if( ! @is_file_exists(members_file_name))
          @init_members_file()
      if( !u.isArray(name_list) )
          return callback(null)
  
      @get_file_obj(members_file_name, (member_file_obj) ->
        member_file_obj.get_json((j) ->
          j = u.union(j, name_list)
          console.log(j)
          member_file_obj.write_json(j)
          @add_file_obj_save_folder(member_file_obj, () ->
            if(callback)
                callback()
          )
          #@add_file(member_file_obj.get_meta())
          #@save_meta()
        )
      )
  
  
  
    delete_members : (name_list, callback) ->
      @get_file_obj(members_file_name, (member_file_obj) ->
        member_file_obj.get_json((j) ->
          j = u.difference(j, name_list)
          #console.log('_delete members', j)
          member_file_obj.write_json(j)
          @add_file_obj_save_folder(member_file_obj, () ->
            if(callback)
                callback(j)
          )
        )
      )
  
  
    
  
    get_all_members : (callback) ->
      #if( ! @is_file_exists(members_file_name)) @init_members_file()
      if( ! @is_file_exists(members_file_name))
          return callback(null)
  
      @get_file_obj(members_file_name, (member_file_obj) ->
        member_file_obj.get_json(callback)
      )
  
  
    has_member : (username, callback) ->
      if(typeof @meta.is_team_folder == 'undefined')
          return callback(false)
      if(!@meta.is_team_folder)
          return callback(false)
      if( ! @is_file_exists(members_file_name))
          return callback(false)
  
      @get_file_obj(members_file_name, (member_file_obj) ->
        if(!member_file_obj)
            return callback(false)
        member_file_obj.get_json((j) ->
          #log28('member file get json', j)
          #log28('j is arry', u.isArray(j))
          if(!u.isArray(j))
              return callback(false)
          if(j.indexOf(username) >=0)
              return callback(true)
          if(j.indexOf('*') >= 0)
              return callback(true)
          return callback(false)
        )
      )
  
  
    init_viewers_file : () ->
      @meta.is_open_folder = true
      content = []
      @new_json_file(viewers_file_name, content)
      #@meta.
  
  
    add_viewers : (name_list, callback) ->
      if( ! @is_file_exists(viewers_file_name))
          @init_viewers_file()
      if( !u.isArray(name_list) )
          return callback(null)
  
      @get_file_obj(viewers_file_name, (viewer_file_obj) ->
        viewer_file_obj.get_json((j) ->
          j = u.union(j, name_list)
          #console.log(j)
          viewer_file_obj.write_json(j)
          @add_file_obj_save_folder(viewer_file_obj, () ->
            if(callback)
                callback(j)
          )
        )
      )
  
  
    delete_viewers : (name_list, callback) ->
      if( ! @is_file_exists(viewers_file_name))
          @init_viewers_file()
  
      @get_file_obj(viewers_file_name, (viewer_file_obj) ->
        viewer_file_obj.get_json((j) ->
          j = u.difference(j, name_list)
          #console.log('_delete viewers', j)
          viewer_file_obj.write_json(j) #?
          @add_file_obj_save_folder(viewer_file_obj, () ->
            if(callback)
                callback()
          )
        )
      )
  
  
  
    get_all_viewers : (callback) ->
      if( ! @is_file_exists(viewers_file_name))
          @init_viewers_file()
  
      @get_file_obj(viewers_file_name, (viewer_file_obj) ->
        viewer_file_obj.get_json(callback)
      )
  
  
    has_viewer : (username, callback) ->
      if(typeof @meta.is_open_folder == 'undefined')
          return callback(false)
      if(!@meta.is_open_folder)
          return callback(false)
      if( ! @is_file_exists(viewers_file_name))
          return callback(false)
  
      @get_file_obj(viewers_file_name, (viewer_file_obj) ->
        viewer_file_obj.get_json((j) ->
          if(!u.isArray(j))
              return callback(false)
          if(j.indexOf(username) >=0)
              return callback(true)
          if(j.indexOf('*') >= 0)
              return callback(true)
  
          return callback(false)
        )
      )
  
  
    get_file_meta_by_uuid : (uuid, callback) ->
      _meta = @meta.file_uuids[uuid]
      if(_meta['short-json'])
        bucket.read_json(_meta['meta_s3key'], callback)
      else
        callback(null, _meta)
  
  
  
    get_files_by_name : (name, callback) ->
      # We allow files exist with same name, but uuid can not be duplicated.
      uuid_list = @meta.file_names[name]
      async.parallel(
          uuid_list,
          @get_file_meta_by_uuid,
          (err, meta_list) ->
            console.log(err, meta_list)
            callback(err, meta_list)
      )
  
  
  
    get_short_json_repr : (_meta) ->
      _meta = _meta || meta
      repr = u.pick(_meta, 'name', 'meta_s3key', 'size', 'timestamp', 'filetype')
      repr['short-json'] = true
      return repr
  
  
  
    #pass_out_folder_obj(null, folder_obj)
    #return folder_obj
  
# end of class definition

basic_test = () ->
    f = new S3Folder('kkk')
    p 'folder get create, very basicly it got through.'
    u.isEmpty(f)

peek_possible_exist_folder = (folder_path, callback) ->
    # 
    # callback is directly passed from s3
    #
    folder_meta_key = calculate_folder_meta_file_s3key(folder_path)
    bucket.s3_object_exists(folder_meta_key, callback)


new_folder = (opt_, callback) ->
    folder = new S3Folder( opt_.path)
    folder.init(opt_)
    callback(null, folder)


retrieve_folder = (folder_path, callback) ->
    #
    # Retrieve an exists folder.
    #
    folder = new S3Folder( folder_path)
    folder.retrieve_old_folder_meta  (err, meta) ->
        #p(222, meta)
        #p(223, folder.get_meta())
        callback(null, folder)



test_retrieve_folder = () ->
  retrieve_folder('abc', (folder) ->
    if(!folder)
      console.log('not a folder?')
      return
    
    console.log(folder.get_meta())
    #console.log(folder)
  )


retrieve_folder_meta = (folder_path, callback) ->
  #
  # Retrieve meta data of an exists folder.
  #

  make_s3folder( folder_path, (err, folder) ->
    folder.retrieve_old_folder_meta(callback)
  )


test_retrieve_folder_meta = () ->
  retrieve_folder_meta('abc', (meta) ->
    if(!meta)
      console.log('not a meta?')
      console.log(typeof meta)
      console.log('is null?:')
      console.log(u.isNull(meta))
      #return


    console.log(meta)
  )


#d
calculate_folder_meta_file_s3key = (folder_path) ->
  #
  # Give a folder path, calculate it's s3key of meta data file.
  #
  s3key = path.join(myconfig.meta_file_prefix, folder_path)
  return s3key



make_folder_meta_file_s3key = (folder_path) ->
  #
  # Same as calculate_folder_meta_file_s3key, but we changed the folder meta
  # prefix setting, this gives the new key. 0918.
  # Give a folder path, calculate it's s3key of meta data file.
  #
  s3key = path.join(myconfig.folder_meta_prefix, folder_path)
  return s3key


retrieve_file_meta = (file_path, callback) ->
    folder_path = path.dirname(file_path)
    filename    = path.basename(file_path)

    retrieve_folder_meta(folder_path, (meta) ->
        #console.log(meta)
        #log78('folder meta', meta)
        file_meta = @meta.files[filename]
        callback(file_meta)
    )


# todo
get_file_meta = (opt, callback) ->
  # @opt: 
  #    name, path, dir, uuid
  #    where: 'path' should be abs path, 'dir' should = dirname(path)
  #
  #keys = Object.keys(opt)

  dirname  = path.dirname(opt.path)
  filename = path.basename(opt.path)
  #console.log(dirname , filename)

  retrieve_folder(dirname , (folder_obj) ->
      #
  )

  if( u.has(opt, 'uuid') )
      return get_file_meta_by_uuid(dirname, opt.uuid, callback)


get_file_meta_by_path = (file_path, callback) ->
  get_file_uuid(file_path, (err, uuid_list) ->
    dirname = path.dirname(file_path)

    _uuid_to_meta(uuid, _cb) ->
      get_file_meta_by_uuid(dirname, uuid, _cb)


    # callback will get: (err, [file-meta-1, ...])
    async.map(uuid_list, _uuid_to_meta, callback)
  )


test_get_file_meta_by_path = () ->
  file_path = 'abc/goodagood'
  get_file_meta_by_path(file_path, (err, metas) ->
    console.log(err, metas)
  )


get_file_uuid = (file_path, callback) ->
    folder_path = path.dirname(file_path)
    filename    = path.basename(file_path)

    retrieve_folder_meta(folder_path, (err, folder_meta) ->

      callback(err, folder_meta.file_names[filename])
    )


test_get_file_uuid = (f_path) ->
  get_file_uuid(f_path, (err, id) ->
    console.log(err, id)
    tools.exit()
  )


get_file_meta_by_uuid = (dirname, uuid, callback) ->
    retrieve_folder_meta(dirname, (err, folder_meta) ->
      callback(err, folder_meta.files[uuid])
    )


test_get_file_meta_by_uuid = () ->
  file_path = 'abc/goodagood'
  dirname   = 'abc'

  get_file_uuid(file_path, (err, uuid) ->
    console.log(file_path, uuid)
    get_file_meta_by_uuid(dirname, uuid, (err, _meta) ->
      console.log(err, _meta)
      tools.exit()
    )
  )


retrieve_file_obj = (file_path, callback) ->
    folder_path = path.dirname(file_path)
    filename    = path.basename(file_path)
    #console.log(folder_path, filename)

    retrieve_folder(folder_path, (folder_obj) ->
      #console.log(folder_obj) console.log(folder_obj.get_meta())
      folder_obj.get_file_obj(filename, callback)
    )


test_retrieve_file_obj = () ->
    path = 'abc/Png.png'
    retrieve_file_obj(path, (fobj) ->
        console.log(fobj.get_meta())
    )


delete_file = (file_path, callback) ->
  # callback not called
  folder_path = path.dirname(file_path)
  filename    = path.basename(file_path)

  #console.log(folder_path, filename)

  retrieve_folder(folder_path, (folder_obj) ->
    folder_meta = folder_obj.get_meta()
    file_meta   = folder_meta.files[filename]

    #console.log(file_meta)
    if (!file_meta)
        return #?

    folder_obj.delete_file(filename)
    if (callback)
        callback(folder_obj)
  )




# Going to used promisified version 'promised_add_folder' to build home folder.
init_home_folder_0927 = (username, callback) ->
  # 
  # the file will be put to: s3:#ggfsb/.gg.folder.meta/username
  # @callback get (err, home_folder_obj)

  #console.log("--- --- I AM IN init home folder")
  s3key = path.join(myconfig.meta_file_prefix, username)

  folder_opt = {}
  folder_opt['path'] = username
  folder_opt['name'] = username # Don't forget these two.
  folder_opt['parent-dir'] = ''
  folder_opt.owner = username
  folder_opt.permission = {owner: 'rwx', other:'', group:''}
  folder_opt['create-timestamp'] = Date.now()  #mili-seconds
  folder_opt['timestamp'] = Date.now()  #stamp when modified

  new_folder(folder_opt, (err, home_folder) ->
    #console.log(111, home_folder)
    #console.log(112, 'meta ',  home_folder.get_meta())
    home_folder.promised_add_folder('goodagood').then(
      (goodagood_folder_obj) ->
        #console.log(goodagood_folder_obj.get_meta())
        return new Promise((resolve, reject) ->
          goodagood_folder_obj.add_folder('message', (err, tmp_new_folder_obj) ->
            reject (goodagood_folder_obj) if(err)
            goodagood_folder_obj.add_folder('etc', (err, tmp_new_folder_obj) ->
              goodagood_folder_obj.build_file_list(() ->
                goodagood_folder_obj.save_meta(() ->
                  reject (goodagood_folder_obj) if(err)
                  resolve(goodagood_folder_obj)
                )
              )
            )
          )

        )

        #return goodagood_folder_obj.promised_add_folder('message')
      
    ).then(
       (what) ->
        #console.log('got ', what)
        return home_folder.promised_add_folder('public')
        #callback(null, home_folder)
     
    ).then(
       (what) ->
        #console.log('finally got ', what)
        #console.log('get meta before callback ', home_folder.get_meta())
        #callback(null, home_folder)
        home_folder.build_file_list(() ->)
        home_folder.save_meta((err, meta) ->
          callback(err, home_folder)
        )  # home folder already get saved.
        #callback(null, home_folder)
    
    ).catch((e) ->
      console.log('E: ', e)
      callback(e, null)
    )

  )



# cloned from ./bucket.js
# It's going to change according to new folder, 0716
init_home_folder = (username, callback) ->
  # 
  # The s3key for folder meta file, .meta/username
  # the file will be put to: s3:#ggfsa/.meta/username
  # The s3 storage is used as key-value storage for 
  # goodagood file system data structure.

  #console.log("--- --- I AM IN init home folder")
  s3key = path.join(myconfig.meta_file_prefix, username)

  folder_opt = {}
  folder_opt['path'] = username
  folder_opt['name'] = username # Don't forget these two.
  folder_opt['parent-dir'] = ''
  folder_opt.owner = username
  folder_opt.permission = {owner: 'rwx', other:'', group:''}
  folder_opt['create-timestamp'] = Date.now()  #mili-seconds
  folder_opt['timestamp'] = Date.now()  #stamp when modified

  new_folder(folder_opt, (home_folder) ->
    home_folder.add_folder('goodagood', (goodagood) ->
      #goodagood.add_folder('in')
      #goodagood.add_folder('out')
      goodagood.add_folder('message')
      goodagood.add_folder('etc', (etc) ->)
      #goodagood.add_folder('etc')
      #goodagood.add_folder('backup')
    )
    home_folder.add_folder('public', (etc) ->)
    home_folder.build_file_list()
    home_folder.save_meta(callback)
  )



test_init_home_folder = () ->
  name = 'tmp'
  init_home_folder(name, () ->)



add_default_home_folders = (home_folder, callback) ->
    home_folder.add_folder('goodagood', (goodagood) ->
      goodagood.add_folder('in')
      goodagood.add_folder('out')
      #goodagood.add_folder('etc')
      #goodagood.add_folder('backup')
    )
    home_folder.add_folder('etc', (etc) ->)
    home_folder.add_folder('public', (etc) ->)
    home_folder.build_file_list()
    home_folder.save_meta(callback)



test_read_folder_meta = () ->

  folder_path = 'muji'
  make_s3folder(folder_path, {flag_to_read_in_meta:true,}, (folder) ->
    m = folder.get_meta()
    console.log(m)
  )



test_init_home_folder_many = () ->
  names = ['muji', 'andrew',  'dirty-show', 'test']
  names.forEach((name) ->
    console.log(name)
    init_home_folder(name, () ->)
  )




test_add_folder = () ->
  # add default folders for username
  #
  username = 'abc'
  retrieve_folder(username, (abc) ->
    add_default_home_folders(abc)
  )


get_sorted_message_list_as_ul = (username, callback) ->
  #
  # The message folder is set in config-mj.js
  # message is sorted by new coming.
  #
  message_folder_path = path.join(username, myconfig.message_folder)
  retrieve_folder(message_folder_path, (folder) ->
    files = folder.get_meta().files
    #console.log(files)
    names = Object.keys(files)
    sorted_names = u.sortBy(names, (name) ->
      negative_timestamp = 0 - parseInt(files[name].timestamp)
      return negative_timestamp
    )
    #console.log(names, sorted_names)

    ul = '<ul class="folder-list list-unstyled">'
    sorted_names.forEach((name) ->
      file = files[name]
      if(typeof file.html != 'undefined')
          ul += file.html.li
    )
    ul += '</ul>'
    
    #console.log(ul)
    #return ul
    callback(ul)
  )

checking_1 = (folder_name) ->
    folder_name = folder_name || 'abc'


    folder      = new S3Folder(folder_name)
    folder.init()
    meta = folder.get_meta()
    #p folder
    p meta

    
checking = (folder_name) ->
    folder_name = folder_name || 'abc'

    retrieve_folder(folder_name, (err, folder) ->
        meta = folder.get_meta()
        #p meta
    )




if (require.main == module)

    #basic_test()
    checking('abc')

    #test_s3_folder()
    #test_read_in_meta()
    #test_init_home_folder()
    #test_init_home_folder_many()

    #test_read_folder_meta()
    
    #test_render_all_files()

    #test_retrieve_folder()
    #test_retrieve_folder_meta()

    #test_retrieve_file_obj()
    #_test_retrieve_file_meta()
    #_test_delete_file()

    #test_get_file_uuid('abc/goodagood/ooo')
    #test_get_file_meta_by_uuid('abc/goodagood')
    #test_get_file_meta_by_path('abc/goodagood')



#module.exports.make_s3folder   = make_s3folder
module.exports.S3Folder   = S3Folder
module.exports.retrieve_folder = retrieve_folder
module.exports.retrieve_folder_meta = retrieve_folder_meta
module.exports.retrieve_file_obj = retrieve_file_obj
module.exports.retrieve_file_meta = retrieve_file_meta
module.exports.delete_file = delete_file
module.exports.get_sorted_message_list_as_ul = get_sorted_message_list_as_ul
module.exports.init_home_folder = init_home_folder
module.exports.init_home_folder_0927 = init_home_folder_0927
module.exports.get_file_uuid = get_file_uuid

# vim: set et ts=4 sw=4 fdm=indent:
