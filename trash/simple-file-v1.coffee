# in testing, 10/21, 2014

u       = require "underscore"
Promise = require "bluebird"
path    = require "path"

old     = require "./simple-file.js"

bucket   = require "./bucket.js"
myutil   = require('../myutils/myutil.js')
myconfig =  require("gg-credentials").config
task     = require('../myutils/job.js')

p = console.log


# ! global datas:
meta = {}
obj = {}


promise_to_make_old_simple_file_object = Promise.promisify(old.simple_s3_file_obj)

_simple_s3_file_obj = (meta_src, pass_file_obj) ->
    # make the old version object:
    #old.simple_s3_file_obj(meta_src, pass_file_obj)
    promise_to_make_old_simple_file_object(meta_src).then(
        (obj) ->
            obj
    ).catch(
        (err) ->
            p "Error: ", err
            err # return err
    )


simple_s3_file_obj = (meta_src, pass_file_obj) ->
    old.simple_s3_file_obj(meta_src, (err, _obj) ->
        if not err
            meta = _obj.get_meta()
            obj  = _obj

        obj.convert_meta_to_ul = convert_meta_to_ul
        pass_file_obj(err, obj)
    )
promised_simple_s3_file_obj = Promise.promisify simple_s3_file_obj


_keep = (hash, names) ->
    return hash if u.isEmpty names
    _meta = {}
    _meta[name] = hash[name] for name in names
    _meta

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
    
convert_meta_to_ul = () ->
    attr_names = ['name', 'path', 'owner', 'uuid', 'timestamp',
        'size', 'permission' ]
    # download/delete/view href?

    _show_meta = _keep(meta, attr_names)
    return _build_ul( _show_meta)



new_plain_file = (text, meta, callback) ->
    # @meta: 
    #       name, path, owner, size, filetype, ...
    fix_file_meta(meta)
    s3key = meta.storage.key

    bucket.write_text_file  s3key, text, (err, aws_result) ->
        pass_meta_to_task  meta, (err, what) ->
            callback(err, what) if callback?
            #p err, what
            #task.pub_task(task.channel, job, callback)


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


module.exports.simple_s3_file_obj  = simple_s3_file_obj
module.exports.promised_simple_s3_file_obj = promised_simple_s3_file_obj

module.exports.new_file_obj_from_meta  = old.new_file_obj_from_meta


module.exports.fix_file_meta  = fix_file_meta
module.exports.new_plain_file  = new_plain_file
module.exports.put_local_file  = put_local_file
module.exports.put_local_file_without_pass  = put_local_file_without_pass

