# in testing, 10/21, 11-21, 2014
#
# 2015, 0410 (todos)
# File object should give such interfaces:
#   rm_storage : remove storage known by the file object
#   rm_comments: comments adding files
#   rm_addons  : comments addons of the file such as value adding, lockers...
#   rm_meta    : remove file meta
#   rm_all     : all necessary to be removed before remove the file.

u       = require "underscore"
Promise = require "bluebird"
async   = require "async"
path    = require "path"
util    = require "util"

old     = require "./simple-file.js"

bucket   = require "./bucket.js"
folder_v5= require "./folder-v5.js"

myutil   = require('../myutils/myutil.js')
myconfig =  require("../config/config.js")

task     = require('../myutils/job.js')
ft       = require('../myutils/filetype.js')

p = console.log

# Web prefix, such as /file-info/path/to/file/uuid
Web_file_info = "/file-info/"

promise_to_make_old_simple_file_object = Promise.promisify(old.simple_s3_file_obj)




simple_s3_file_obj = (meta_src, callback) ->
    # ! global datas:
    Meta = {}
    Obj = {}

    set_meta = (_meta) ->
        _meta = _meta || meta_src
        Meta = _meta

    isError = ()->
        Meta.error


    guess_owner = ()->
        # 'guess' owner from file path, because the path is: 
        #         user-name(id)/folder/path/to/file-name.ext
        
        # if not empty string, think it's owner's name, nothing need to do.
        return Meta.owner if typeof Meta.owner is "string" or /^\s*$/.test(Meta.owner)
        
        # guess it from file path:
        if Meta.path
            guess = Meta.path.split("/")[0]
            if typeof guess is "string" or /^\s*$/.test(guess)
                    Meta.owner = guess
                    Meta.owner
        else
            guess = null

        return guess

    calculate_s3_stream_href = ->
        return ""    unless Meta.storage
        return ""    unless Meta.storage.key
        s3_stream_href = path.join(myconfig.s3_stream_prefix, Meta.storage.key)
        s3_stream_href

    calculate_delete_href = ->
        return    unless Meta.path
        delete_href = path.join("/del/", Meta.path_uuid)
        delete_href

    calculate_view_href = ->
        
        # the link (href) to view the file
        return    unless Meta.path
        view_href = path.join("/viewtxt/", Meta.path_uuid)
        view_href


    calculate_meta_defaults = ()->
        #
        # Meta.name, Meta.path is required, offer them elsewhere.
        # All the defaults calculated here will NOT over-ride existed ones.
        # path would be full path: user-name/dirs/.../file-name.extension
        #
        
        p ' -- where the Meta go? in file obj' if not Meta?
        #suppose name is already set
        Meta.filetype       = ft.check_file_type_by_name(Meta.name) if typeof Meta.filetype isnt "string"
        Meta.uuid           = myutil.get_uuid() unless Meta.uuid
        Meta.owner          = guess_owner() if typeof Meta.owner isnt "string"

        Meta.dir            = path.dirname(Meta.path) if typeof Meta.dir isnt "string"
        Meta.path_uuid      = path.join(Meta.dir, Meta.uuid) if typeof Meta.path_uuid isnt "string"

        # meta_s3key is deprecated?
        #p "in simple file v3, calculate meta defaults, myconfig.file meta prefix: ", myconfig.file_meta_prefix
        Meta_s3key = path.join(myconfig.file_meta_prefix, Meta.owner, Meta.uuid)
        Meta.Meta_s3key     = Meta_s3key
        Meta.file_meta_s3key= Meta_s3key

        Meta.s3_stream_href = calculate_s3_stream_href() if typeof Meta.s3_stream_href isnt "string"
        Meta.delete_href    = calculate_delete_href() if typeof Meta.delete_href isnt "string"
        Meta.view_href      = calculate_view_href() if typeof Meta.view_href isnt "string"

        ## do we need this?
        #if typeof Meta.uuid_path is "undefined"
        #    uuid_name = Meta.uuid + path.extname(Meta.name)
        #    parent_dir = path.dirname(Meta.path)
        #    Meta.uuid_path = path.join(parent_dir, uuid_name) # path_uuid?

        necessaries =
            what: myconfig.IamFile
            timestamp: Date.now()
            permission:
                owner: "rwx"
                group: ""
                other: ""

            "file-types": []
            storage: {} # deprecate soon, 0908.
            storages: []
            html: {}
            value:
                amount: 0
                unit: "GG"

        u.defaults Meta, necessaries # make sure we have defaults


    calculate_meta = ()->
        #
        # Meta.name, Meta.path is required, offer them elsewhere.
        # This calculate and return it, change none.
        #
        
        p ' -- what the fuck Meta go? in file obj' if not Meta?
        m = {
            path:   Meta.path
            , name: Meta.name
        }
        m.uuid = Meta.uuid if Meta.uuid?

        #suppose name is already set
        m.filetype       = ft.check_file_type_by_name(m.name)
        m.uuid           = myutil.get_uuid() unless m.uuid
        m.owner          = Meta.owner
        m.owner          = guess_owner() if typeof m.owner isnt "string"

        m.dir            = path.dirname(m.path)
        m.path_uuid      = path.join(m.dir, m.uuid)

        # Change Meta, It's needed in the rest functions.
        Meta.path_uuid   = m.path_uuid

        console.log('m\n', m, myconfig.file_meta_prefix)
        Meta_s3key = path.join(myconfig.file_meta_prefix, m.owner, m.uuid)
        m.Meta_s3key     = Meta_s3key
        m.file_meta_s3key= Meta_s3key

        m.s3_stream_href = calculate_s3_stream_href()
        m.delete_href    = calculate_delete_href()
        m.view_href      = calculate_view_href()

        necessaries =
            what: myconfig.IamFile
            timestamp: Date.now()
            permission:
                owner: "rwx"
                group: ""
                other: ""

            "file-types": []
            storage: {} # deprecate soon, 0908.
            storages: []
            html: {}
            value:
                amount: 0
                unit: "GG"

        u.defaults m, necessaries # make sure we have defaults
        return m


    read_file_to_buffer = (callback) ->
        return callback('it might NOT be s3 storage', null)    if Meta.storage.type isnt "s3"
        bucket.read_data Meta.storage.key, callback


    # Read 'content' to string
    read_to_string = (callback) ->
        #p 'in read to string of file obj'
        bucket.read_to_string Meta.storage.key, callback


    # return a readable stream, which can be past to res (express.js):
    #   read_stream().pipe(res) 
    #   # used for file downloading.
    read_stream = () ->
        #p 'in read stream of file obj'
        return bucket.s3_object_read_stream Meta.storage.key

    write_s3_storage = (content, callback)->
        # @content: can be Buffer/string/stream
        bucket.put_object(Meta.storage.key, content, (err, aws_reply)->
            return callback(err, aws_reply) if err

            Meta.lastModifiedDate = Date.now()
            callback(err, aws_reply)
        )

    # build a new hash only use name in names array.
    _keep = (hash, names) ->
        return hash if u.isEmpty names
        _meta = {}
        _meta[name] = hash[name] for name in names
        _meta


    # To show a hash in web page, make it html <ul>
    # recursivly make hash to html ul list.
    _build_ul = (hash) ->
          ul = "<ul> \n"
          u.each(hash, (val, key) ->
              li = '<li class="key"> <span>' + key.toString() + "</span> : "

              if (u.isArray(val))
                  li += _build_ul(val)
              else if(u.isObject(val))
                  li += _build_ul(val)
              else if(not val)
                  li += '<span class="value">' + " #{val} </span>"
              else
                  li += '<span class="value">' + val.toString() + '</span>'
              
              li += "</li>\n"
              ul += li + "\n"
          )

          ul += "</ul>\n"
          return ul
        

    # Make <ul> from meta.
    convert_meta_to_ul = () ->
        attr_names = ['name', 'path', 'owner', 'type', 'timestamp',
            'size', 'permission', 'value' ]
        exclude = ['html', 'storage', 'storages']
        # download/delete/view href?

        _show_meta = _keep(Meta, attr_names)
        return _build_ul( _show_meta)


    build_util_list = ()->
        # This will give utilities, all links now, for the file.

        del_href   = calculate_delete_href()
        del_a     = 'delete'.link(href=del_href)

        view_href  = calculate_view_href()
        view_a    = 'Text Viewer'.link(href=view_href)

        stream_href= calculate_s3_stream_href()
        stream_a    = 'Download'.link(href=stream_href)

        ul = """
              <ul class="util-list">
              <li class="util-list-item">
                <span class="glyphicon glyphicon-remove"> </span> #{del_a}
              </li>\n
              <li class="util-list-item">
                <span class="glyphicon glyphicon-zoom-in"> </span> #{view_a}
              </li>\n
              <li class="util-list-item">
                <span class="glyphicon glyphicon-arrow-down"> </span> #{stream_a}
              </li>\n
              </ul>\n
             """
        #return [del_a, view_a, stream_a]
        return ul

    build_file_info_list = ()->
        util_ul = build_util_list()
        meta_ul = convert_meta_to_ul()

        file_info_ul = """
            <h2 class="util-list-name"> File tools </h2>\n
            #{util_ul}\n
            <h2 class="util-list-name"> File information </h2>\n
            #{meta_ul}
            """
        return file_info_ul

    increase_value = (amount) ->
        amount = 1    unless amount
        if(Meta.value.amount >= 0)
            Meta.value.amount += amount
        else
            Meta.value.amount -= amount


    clear_past_meta_store = (callback)->
        # Try to delete the 'past meta', it's new file meta before file checked in.
        index = -2
        if Meta.meta_s3key?
            p('Meta.meta_s3key in "clear past meta store" ', Meta.mets_s3key)
            # If index >= 0, it means it is the old meta, needed to be deleted.
            index = Meta.meta_s3key.indexOf(myconfig.new_meta_prefix)

        if( index >= 0)
            p('going to delete past meta store: ', Meta.path)
            bucket.delete_object(Meta.meta_s3key, (err, reply)->
                callback(err, reply) if err
                delete Meta.meta_s3key
                callback(err, reply)
            )
        else
            p('no need to delete past meta store?', Meta.path)
            callback(null, null)


    save_meta_file = (callback) ->
        # Save the file Meta (json) to an file.
        # For s3, with prefix:
        #     file_meta_prefix/user-name/uuid     # it's:
        #            .gg.file.Meta/user-name/uuid

        if not Meta.file_meta_s3key?
            err = "Meta.file_meta_s3key not prepared, in " + Meta.path
            return callback(err, null)

        bucket.write_json  Meta.file_meta_s3key, Meta, (err, reply)->
            return callback(err, reply) if err
            #p 'i am here: "save meta file" ', Meta.name
            callback(err, reply)
            #clear_past_meta_store(callback)

    promise_to_save_meta_file = Promise.promisify(save_meta_file)


    # not test
    retrieve_meta = (callback)->
        bucket.read_json  Meta.file_meta_s3key, (err, json)->
            Meta = json
            callback(null, json)


    # Meta_s3key -> file_meta_s3key? 2015 1017
    get_saved_meta = (callback) ->
        #bucket.read_json Meta.Meta_s3key, callback
        bucket.read_json Meta.file_meta_s3key, callback



    render_html_repr = ->
        prepare_html_elements()
        render_html_for_owner()
        render_html_for_viewer()


    render_html_for_owner = ->
        li = "<li class=\"file\">"
        
        # file selector
        li += Meta.html.elements["file-selector"] + "&nbsp;\n"
        #li += Meta.html.elements["anchor"] + "&nbsp;\n"
        li += "<ul class=\"list-unstyled file-info\"><li>\n"
        li += Meta.html.elements["text-view"] + "&nbsp;\n"
        li += Meta.html.elements["remove"] + "&nbsp;\n"
        li += Meta.html.elements["path-uuid"] + "&nbsp;\n"
        li += "</li></ul></li>\n"
        Meta.html["li"] = li


    render_html_for_viewer = ->
        li = "<li class=\"file\">"
        
        # file selector
        li += Meta.html.elements["file-selector"] + "&nbsp;\n"
        li += Meta.html.elements["anchor"] + "&nbsp;\n"
        li += "<ul class=\"list-unstyled file-info\"><li>\n"
        li += Meta.html.elements["text-view"] + "&nbsp;\n"
        
        #li += Meta.html.elements['remove'] + '&nbsp;\n';
        li += "</li></ul></li>"
        Meta.html["li_viewer"] = li


    prepare_html_elements = ->
        Meta.html = {}    if typeof Meta.html is "undefined"
        Meta.html.elements = {}    if typeof Meta.html.elements is "undefined"
        ele = Meta.html.elements
        ele["file-selector"] =
            """
            <label class="file-selector">
            <input type="checkbox" name="filepath[]" value="#{Meta.path_uuid}" />\n
            <span class="filename"><a href="/fileinfo-pathuuid/#{Meta.path_uuid}">#{Meta.name}</a></span>
            </label>
            """

        ele["anchor"] = """<a href="#{Meta.s3_stream_href}"> #{Meta.name}</a>"""

        ele["text-view"] =
            """<a href="/viewtxt/#{Meta.path_uuid}">
               <span class="glyphicon glyphicon-zoom-in"> </span>Read
               </a>
            """

        ele["remove"] = """<a href="#{Meta.delete_href}">
            <span class="glyphicon glyphicon-remove"></span>Delete</a>"""

        dir = path.dirname(Meta.path)
        puuid = path.join("/fileinfo-pathuuid/", dir, Meta.uuid)
        ele["path-uuid"] = """
            <a href="#{puuid}"> <i class="fa fa-paw"> </i> Paw-in </a>
            """

        #?
        ele["name-info"] = '<a href="' + Web_file_info + Meta.path_uuid + '" >' +
            Meta["name"] + "</a>"


    # changed to promise style, 12 28. call it and ().then(some-function)
    # this save file meta first.
    save_file_to_folder = () ->
        dirname = path.dirname(Meta.path)

        promise_to_save_meta_file().then(()->
            return folder_v5.retrieve_folder(dirname)
        ).then((folder)->
            folder.add_file(Meta)
            return folder.promise_to_save_meta()
        )

    #save_file_to_folder = (callback) ->
    #    dirname = path.dirname(Meta.path)
    #    save_meta_file( (err, res)->
    #        folder_v5.retrieve_folder dirname
    #        .then (folder) ->
    #            #log28 "saving file to", folder.get_Meta().path
    #            folder.add_file_save_folder Meta, callback
    #    )


    get_meta = () ->
        return Meta
    

    # this is more complex than 'remove storage'
    # try to delete file contents and file meta storage
    delete_s3_storage = (callback)->
        callback = callback || (->)

        funs_to_rm = []
        if Meta.storage?
            if Meta.storage.key?
                # Do some duplicated check, and give some msg
                if Meta.meta_s3key?
                    if Meta.meta_s3key == Meta.storage.key
                        p 'meta_s3key == storage.key, this is duplicated?'
                    else
                        p 'ok meta_s3key != storage.key, are you sure? msg from:', Meta.path
                # End of the -stupid- checking

                rm = (callback)->
                    bucket.delete_object(Meta.storage.key, callback)
                funs_to_rm.push(rm)

        # This is file meta in old way:
        if Meta.meta_s3key?
            #p 'to delete the meta of the file, in " deleting s3 storage", ', Meta.path

            # add a function into the list
            rm = (callback)->
                bucket.delete_object(Meta.meta_s3key, callback)
            funs_to_rm.push(rm)

        # This is file meta in new way:
        if Meta.file_meta_s3key?
            #p 'to delete the meta of the file, in " deleting s3 storage", ', Meta.path

            # add a function into the list
            rm = (callback)->
                bucket.delete_object(Meta.file_meta_s3key, callback)
            funs_to_rm.push(rm)

        if not u.isEmpty(funs_to_rm)
            async.parallel(funs_to_rm, callback)
        else
            callback(null, null)

    promise_to_delete_s3_storage = Promise.promisify delete_s3_storage


    meta2s3 = (_meta, callback) ->
        #
        # make a new s3 file object
        #
        # meta data of file saved in folder. ?
        #
        Meta = _meta
          
        fix_file_meta(_meta)
        calculate_meta_defaults()
        #upgrade_to_s3storage_collection()

        render_html_repr() # this will prepare html elements too.
        save_meta_file (err, reply) ->
            callback err, Meta

    update_storage = (obj, callback)->
        # replace the storage, not put duplicated file. 
        # @obj can be: string, buffer
        bucket.put_object(Meta.storage.key, obj, (err, aws_reply)->
            return callback(err, aws_reply) if (err)
            Meta.timestamp = Date.now()
            Meta.lastModifiedDate = Date.now()
            callback(null, Meta)
        )

    update_storage_a = (storage, callback)->
        # replace the storage, where:
        # @storage: {type: 's3', key: 's3key'}
        #           {type: 'object', 'buf-str': 'what s3 can put'}
        #
        # Not suppose to change file type, uuid, etc.

        if(storage.type == 'object')
            update_storage(storage['buf-str'], (err, what)->
                Meta.timestamp = Date.now()
                Meta.lastModifiedDate = Date.now()
                callback(null, Meta)
            )
        else if(storage.type == 's3')
            bucket.copy_object(storage.key, Meta.storage.key, (err,what)->
                Meta.timestamp = Date.now()
                Meta.lastModifiedDate = Date.now()
                callback(null, Meta)
            )
        else
            callback("don't know storage type", null)


    # give the json client side can use
    get_client_json = ()->

        milli = 0
        if Meta.timestamp? i
            if u.isNumber(Meta.timestamp)
                milli = Meta.timestamp
            else
                try
                    milli = parseInt(Meta.timestamp)
                catch err
                    milli = 0

        value = 0
        if Meta.value?
            if Meta.value.amount?
                value = Meta.value.amount

        file_key = null
        if Meta.storage?
            if Meta.storage.key?
                file_key = Meta.storage.key

        if not Meta['client_json']?
            Meta['client_json'] = {}

        size = -1
        size = Meta.size if Meta.size?

        filetype = ''
        filetype = Meta.filetype if Meta.filetype?

        unique   = false
        unique   = Meta.unique if (Meta.unique?)

        Meta['client_json'] = {
            name         : Meta.name
            path         : Meta.path
            uuid         : Meta.uuid
            path_uuid    : Meta.path_uuid
            file_key     : file_key
            value        : value
            order        : 0 - milli
            milli        : milli
            size         : size
            filetype     : filetype
            unique       : unique
        }

        return Meta['client_json']
       

    update_meta = (hash, callback)->
        # Suppose to update Meta according hash.
        # But we need file locker for good reasons, this is
        # temperory solution.
        # uuid, folder path is not supposed to change.

        # need works, value supposed to add by ../file-value/value.js
        if(hash.value)
            Meta.value += hash.value
            delete Meta.value

        delete hash.uuid if(hash.uuid)
        delete hash.path_uuid if(hash.path_uuid)
        delete hash.dir if(hash.dir)
        p 'update meta: hash: ', hash

        Meta[i] = hash[i] for i in Object.keys(hash)

        #Meta.timestamp = Date.now()

        save_file_to_folder().then((this_get_s3_write_reply)->
            j = get_client_json()
            callback(null, j)
        )

    remove_storage = (callback)->
        bucket.delete_object(Meta.storage.key, callback)


    get_owner_id = ()->
        return Meta.owner_id if _meta_.owner_id?

        guess = Meta.path.split("/")[0]
        return guess if u.isString(guess)
        return null

    # used? 0520
    # simple auxiliary_path would be: uuid
    get_complex_auxiliary_path = ()->
        create_time = -1
        if Meta['create_time']?
            create_time = Meta['create_time']

        oid = get_owner_id()
        if not oid? or not oid
            throw new Exception('no owner id for folder: ' + Meta.path)
        oid = oid.toString()

        auxiliary_path = path.join(oid, Meta.uuid, create_time)
        return auxiliary_path

    file_uuid = ()->
        return Meta.uuid

    # milli_uuid should not change after setting.
    # get Meta.milli_uuid if don't want callback, 
    # This will set it if not exists.
    callback_milli_uuid = (callback)->
        # This save meta to folder, and save file meta.
        return callback(null, Meta['milli_uuid']) if Meta['milli_uuid']?

        # The rest is to build the milli_uuid, when there is none.
        if Meta['create_time']?
            create_time = Meta['create_time']
        else
            create_time = Date.now()

        milli_uuid = path.join(create_time.toString(), Meta.uuid)
        Meta['milli_uuid'] = milli_uuid

        #save_meta_file((err, s3rep)->
        #    return callback(err, null) if(err)
        #    callback(null, milli_uuid)
        #)
        save_file_to_folder().then(()->
            callback(null, milli_uuid)
        ).catch((err)->
            callback(err, null)
        )


    # file aux path, based on 'milli uuid', it would not change after created.
    get_file_auxiliary_path = ()->
        muuid = null
        if Meta.milli_uuid?
            muuid = Meta.milli_uuid
            key = path.join(myconfig.file_auxiliary_prefix, muuid)
            Meta.aux_path = key
            return key

        #else
        return null


    callback_file_auxiliary_path = (callback)->
        return callback(null, Meta.aux_path) if Meta.aux_path?

        callback_milli_uuid (err, muuid)->
            return callback(err, null) if err

            key = path.join(myconfig.file_auxiliary_prefix, muuid)
            Meta.aux_path = key
            save_file_to_folder().then((what)->
                callback(null, key)
            ).catch((err)->
                callback(err)
            )

        return null



    Obj.version = '3 simple file'
    Obj.get_meta = get_meta
    Obj.delete_s3_storage = delete_s3_storage
    Obj.promise_to_delete_s3_storage = promise_to_delete_s3_storage

    Obj.read_to_string     = read_to_string
    Obj.read_file_to_buffer= read_file_to_buffer
    Obj.read_stream        = read_stream # 0519

    Obj.set_meta = set_meta
    Obj.calculate_meta_defaults = calculate_meta_defaults
    Obj.calculate_meta = calculate_meta

    Obj.increase_value = increase_value
    Obj.save_meta_file = save_meta_file #?
    Obj.retrieve_meta  = retrieve_meta
    Obj.get_saved_meta = get_saved_meta #?

    Obj.prepare_html_elements = prepare_html_elements
    Obj.render_html_repr = render_html_repr
    Obj.save_file_to_folder = save_file_to_folder

    Obj.write_s3_storage = write_s3_storage

    Obj.convert_meta_to_ul = convert_meta_to_ul
    Obj.build_util_list  = build_util_list
    Obj.build_file_info_list = build_file_info_list

    Obj.meta2s3 = meta2s3
    Obj.update_storage = update_storage
    Obj.update_storage_a = update_storage_a

    Obj.get_client_json = get_client_json
    Obj.update_meta = update_meta

    Obj.remove_storage = remove_storage

    Obj.callback_milli_uuid = callback_milli_uuid
    Obj.file_uuid = file_uuid
    Obj.get_file_auxiliary_path = get_file_auxiliary_path
    Obj.callback_file_auxiliary_path = callback_file_auxiliary_path
    
    # --
    #
    ##calculate_s3_meta_file_path  = _calculate_s3_meta_file_path,
    ##read_meta_from_s3_obj  = _read_meta_from_s3_obj,
    #
    ##read_replace_meta  = _read_replace_meta,
    #
    ##backup_meta  = _backup_meta,
    #Obj.extend_meta = (newOpt, callback) ->
    #    
    #    # extend the meta.
    #    u.extend meta, newOpt
    #    callback meta    if callback



    #Obj.read_file_to_buffer = _read_file_to_buffer
    #Obj.read_file_to_string = _read_to_string
    #
    ##save_meta  = _save_meta,
    #
    ##put_to_s3  = _put_to_s3,
    #
    ##upgrade_with_filetype  = _upgrade_with_filetype,
    ##switch_with_filetype     = _switch_with_filetype,
    #Obj.clone_content_to_user = _clone_content_to_user
    #Obj.upgrade_to_s3storage_collection = _upgrade_to_s3storage_collection
    #Obj.get_short_json_repr = _get_short_json_repr
    #
    # --

    set_meta(meta_src) if meta_src?
    #p 'you got here, simple file going to callback, 2015 0817 1:52am'
    callback(null, Obj)

    # # end of object modification


promised_simple_s3_file_obj = Promise.promisify simple_s3_file_obj



# # global meta, obj not used from new on:


new_plain_file = (text, meta, callback) ->
    # @meta: 
    #       name, path, owner, size, filetype, ...
    #
    # callback get (err, reply-of-pass-job-out)

    fix_file_meta(meta)
    s3key = meta.storage.key

    bucket.write_text_file  s3key, text, (err, aws_result) ->
        pass_meta_to_task  meta, callback
            #(err, what) ->
            #callback(err, what) if callback?
            #p err, what
            #task.pub_task(task.channel, job, callback)

promised_new_plain_file = Promise.promisify new_plain_file


put_local_file = (local_file_path, meta, callback) ->
    fix_file_meta(meta)
    s3key = meta.storage.key

    bucket.put_one_file  local_file_path, s3key, (err, aws_result) ->
        pass_meta_to_task  meta, callback

put_local_file_without_pass = (local_file_path, meta, callback) ->
    # Used in testing, such as image files, it will not pass to job pub/sub,
    # The rest will be same.
    fix_file_meta(meta)
    s3key = meta.storage.key

    bucket.put_one_file  local_file_path, s3key, (err, aws_result) ->
        callback err, meta
        #pass_meta_to_task  meta, callback


check_meta_has_basics = (_meta)->
    err = 0
    err += 1 if (not _meta.name?)
    err += 1 if (not _meta.path?)
    err += 1 if (not _meta.owner?)

    err += 1 if (not u.isString(_meta.name))
    err += 1 if (not u.isString(_meta.path))
    err += 1 if (not u.isString(_meta.owner))

    if err == 0
        return true # it's ok
    else
        return false


fix_file_meta = (_meta) ->
    if not check_meta_has_basics(_meta)
        err = 'can not do this meta data: ' + _meta.toString()
        throw new Error(err)

    if (not _meta.dir?)
        _meta.dir = path.dirname(_meta.path)

    if (not _meta.timestamp?)
        _meta.timestamp = Date.now()

    if (not _meta.uuid?)
        _meta.uuid = myutil.get_uuid()

    # This will be the s3 key for new meta information:
    # it's for new meta.
    _meta.new_meta_s3key = path.join(myconfig.new_meta_prefix, _meta.dir, _meta.uuid)
    # 'initial key' is a kind of duplicated
    _meta.initial_key = _meta.new_meta_s3key

    # this s3key is old thing, use storage.key instead
    _meta.s3key = path.join(myconfig.raw_file_prefix, _meta.dir, _meta.uuid)
    _meta.storage = {type: 's3', key : _meta.s3key}

    return _meta


pass_meta_to_task = (meta, callback) ->
    tkey = task.task_rec_prefix + meta.uuid
    job = {
        name :      'new-file-meta'
        task_name : 'new-file-meta'

        username :  meta.owner
        folder   :  meta.dir
        new_meta_s3key : meta.new_meta_s3key

        filepath:   meta.path
        task_id:    tkey
    }
    #p "meta: ", meta
    #p "job json: ", job

    bucket.write_json(meta.new_meta_s3key, meta, (err, reply) ->
        if(err)
            log28('write file meta to s3 ERR, in "pass meta to task"', [meta.new_meta_s3key, meta])
            return callback(err, null)
        
        task.pub_task(task.channel, job, callback)
    )


# Used in simple-json before, move it here
#
# try to write file, path.join(dir, filename) => full path
# 'dir' contains 'owner' information, but give owner for clearity.
# 
# use 'new plain file', but save to do meta processes.
#
write_text_file = (owner, dir, filename, text)->
    # promise get reply of passing out the job, it's useless?

    #meta = prepare_meta(file, username, cwd)

    #tkey = task.task_rec_prefix + meta.uuid

    file_meta = {
        name : filename
        path : path.join(dir, filename)
        owner: owner
        size : text.length
    }
    m = fix_file_meta(file_meta)
    p "m -- ", m

    promised_new_plain_file(text, m)



new_file_obj_from_meta = (_meta, callback) ->
  
    #
    # make a new s3 file object, this means no old data need to read in.
    #
    # meta data of file saved in folder. ?
    #
    simple_s3_file_obj _meta, (err, file_obj) ->
      
        #log28('_meta', _meta);
        p('in new file obj from meta, _meta', _meta);
        
        file_obj.set_meta(_meta)
        file_obj.calculate_meta_defaults()
        #file_obj.upgrade_to_s3storage_collection()
        file_obj.render_html_repr()

        file_obj.save_file_to_folder()
        .then(
            (what)->
                p '## the "what" is s3 json write reply.'
                return callback(null, file_obj);
        ).catch(callback);


        #file_obj.save_meta_file (err, reply) ->
        #    callback err, file_obj



module.exports.simple_s3_file_obj  = simple_s3_file_obj
module.exports.promised_simple_s3_file_obj = promised_simple_s3_file_obj



module.exports.fix_file_meta    = fix_file_meta
module.exports.new_plain_file   = new_plain_file
module.exports.promised_new_plain_file   = promised_new_plain_file
module.exports.write_text_file  = write_text_file
module.exports.put_local_file   = put_local_file
module.exports.put_local_file_without_pass  = put_local_file_without_pass


module.exports.new_file_obj_from_meta  = new_file_obj_from_meta

# # checkings: # #
p = console.log
stop = () ->
    setTimeout process.exit, 500


# parameters during checking
test_owner_name  = 'abc'
test_folder_name = 'abc'
test_json_file_name = 'test.json'
test_file_name   = 'check04'


write_a_text_file = ()->
    owner= test_owner_name
    dir  = test_folder_name
    name = test_file_name
    text = "\nI am checking\na new plain\nfile\n"

    F = null
    write_text_file(owner, dir, name, text).then(
        (what)->
            p 'what: ', what

    ).then(stop)

if require.main is module
    write_a_text_file()


