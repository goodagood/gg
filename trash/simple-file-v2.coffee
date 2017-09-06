# in testing, 10/21, 11-21, 2014

u       = require "underscore"
Promise = require "bluebird"
path    = require "path"

old     = require "./simple-file.js"

bucket   = require "./bucket.js"
myutil   = require('../myutils/myutil.js')
myconfig =  require("gg-credentials").config
task     = require('../myutils/job.js')
ft       = require('../myutils/filetype.js')

p = console.log

promise_to_make_old_simple_file_object = Promise.promisify(old.simple_s3_file_obj)




simple_s3_file_obj = (meta_src, pass_file_obj) ->
    # ! global datas:
    Meta = null
    Obj = null

    set_meta = (_meta) ->
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


    calculate_meta_defaults = ()->
        
        #
        # Meta.name, Meta.path is required, offer them elsewhere.
        # All the defaults calculated here will NOT over-ride    existed ones.
        #
        
        #suppose name is already set
        Meta.filetype       = ft.check_file_type_by_name(Meta.name) if typeof Meta.filetype isnt "string"
        Meta.s3_stream_href = _calculate_s3_stream_href() if typeof Meta.s3_stream_href isnt "string"
        Meta.delete_href    = _calculate_delete_href() if typeof Meta.delete_href isnt "string"
        Meta.view_href      = _calculate_view_href() if typeof Meta.view_href isnt "string"
        Meta.uuid           = myutil.get_uuid() unless Meta.uuid
        guess_owner() if typeof Meta.owner isnt "string"

        # do we need this?
        if typeof Meta.uuid_path is "undefined"
            uuid_name = Meta.uuid + path.extname(Meta.name)
            parent_dir = path.dirname(Meta.path)
            Meta.uuid_path = path.join(parent_dir, uuid_name) # path_uuid?

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



    read_file_to_buffer = (callback) ->
        return callback(null)    if meta.storage.type isnt "s3"
        
        # assume it's s3 object
        bucket.read_data meta.storage.key, callback



    # Read 'content' to string
    read_to_string = (callback) ->
        bucket.read_to_string meta.storage.key, callback


    # build a new hash only use name in names array.
    _keep = (hash, names) ->
        return hash if u.isEmpty names
        _meta = {}
        _meta[name] = hash[name] for name in names
        _meta


    # To show a hash in web page, make it html <ul>
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
        attr_names = ['name', 'path', 'owner', 'uuid', 'timestamp',
            'size', 'permission' ]
        # download/delete/view href?

        _show_meta = _keep(Meta, attr_names)
        return _build_ul( _show_meta)


    increase_value = (amount) ->
        amount = 1    unless amount
        Meta.value.amount += amount

    # todo?
    save_meta_file = (callback) ->
        
        # Save the file Meta (json) to an file.    For s3, with prefix:
        #     file_meta_prefix/user-name//uuid     # it's:
        #            .gg.file.Meta/user-name//uuid
        Meta_s3key = path.join(myconfig.file_meta_prefix, Meta.owner, Meta.uuid)
        Meta.Meta_s3key = Meta_s3key
        bucket.write_json Meta_s3key, Meta, callback


    get_saved_meta = (callback) ->
        bucket.read_json Meta_s3key, callback

    old.simple_s3_file_obj(meta_src, (err, _obj) ->
        if not err
            Meta = _obj.get_meta()
            Obj  = _obj
        else
            return callback(err, _obj)

        err = 'empty object after "old.simple s3 file obj"?' if Obj is null

        Obj.convert_meta_to_ul = convert_meta_to_ul
        Obj.read_to_string     = read_to_string
        Obj.read_file_to_buffer= read_file_to_buffer

        Obj.set_meta = set_meta
        Obj.calculate_meta_defaults = calculate_meta_defaults
        Obj.increase_value = increase_value
        Obj.save_meta_file = save_meta_file #?
        Obj.get_saved_meta = get_saved_meta #?

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


        #Obj.get_meta = ->
        #    meta

        #Obj.read_file_to_buffer = _read_file_to_buffer
        #Obj.read_file_to_string = _read_to_string
        #Obj.read_to_string = _read_to_string
        #
        ##save_meta  = _save_meta,
        #Obj.render_html_repr = _render_html_repr
        #
        ##put_to_s3  = _put_to_s3,
        #Obj.delete_s3_storage = _delete_s3_storage
        #
        ##upgrade_with_filetype  = _upgrade_with_filetype,
        ##switch_with_filetype     = _switch_with_filetype,
        #Obj.clone_content_to_user = _clone_content_to_user
        #Obj.save_file_to_folder = _save_file_to_folder
        #Obj.upgrade_to_s3storage_collection = _upgrade_to_s3storage_collection
        #Obj.get_short_json_repr = _get_short_json_repr
        #
        # --

        pass_file_obj(err, Obj)

        # # end of object modification
    )

promised_simple_s3_file_obj = Promise.promisify simple_s3_file_obj



# # meta, obj not used from new on:


new_plain_file = (text, meta, callback) ->
    # @meta: 
    #       name, path, owner, size, filetype, ...
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


fix_file_meta = (_meta) ->
    return false if (not _meta.name?)
    return false if (not _meta.path?)

    return false if (not _meta.owner)

    if (not _meta.dir?)
        _meta.dir = path.dirname(_meta.path)

    if (not _meta.timestamp?)
        _meta.timestamp = Date.now()

    if (not _meta.uuid?)
        _meta.uuid = myutil.get_uuid()

    # This will be the s3 key for meta information:
    # The name is misleading, can be meta for file, but it's for new meta.
    _meta.meta_s3key = path.join(myconfig.new_meta_prefix, _meta.dir, _meta.uuid)
    _meta.initial_key = _meta.meta_s3key

    # this s3key is old thing, use storage.key instead
    _meta.s3key = path.join(myconfig.raw_file_prefix, _meta.dir, _meta.uuid)
    _meta.storage = {type: 's3', key : _meta.s3key}

    return _meta


pass_meta_to_task = (meta, callback) ->
    job = {
        name : 'new-file-meta'
        task_name : 'new-file-meta'

        username : meta.owner
        folder : meta.dir
        meta_s3key : meta.meta_s3key
    }
    #p "meta: ", meta
    #p "job json: ", job

    bucket.write_json(meta.meta_s3key, meta, (err, reply) ->
        if(err)
            log28('write file meta to s3 ERR', [meta.meta_s3key, meta])
            return callback(err, null)
        
        task.pub_task(task.channel, job, callback)
    )

# Used in simple-json before, move it here
#
# try to write file, path.join(dir, filename) => full path
# use 'new plain file', but save to do meta processes.
write_text_file = (owner, dir, filename, text)->
    file_meta = {
        name : filename
        path : path.join(dir, filename)
        owner: owner
        size : text.length
    }
    m = fix_file_meta(file_meta)
    #p "m -- ", m

    promised_new_plain_file(text, m)
    #return new Promise( (resolve, reject)->
    #    new_plain_file(text, m, (err, what)->
    #        if err
    #            reject(err)
    #        else
    #            resolve(what)
    #    )
    #)




module.exports.simple_s3_file_obj  = simple_s3_file_obj
module.exports.promised_simple_s3_file_obj = promised_simple_s3_file_obj

module.exports.new_file_obj_from_meta  = old.new_file_obj_from_meta


module.exports.fix_file_meta    = fix_file_meta
module.exports.new_plain_file   = new_plain_file
module.exports.promised_new_plain_file   = promised_new_plain_file
module.exports.write_text_file  = write_text_file
module.exports.put_local_file   = put_local_file
module.exports.put_local_file_without_pass  = put_local_file_without_pass


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


