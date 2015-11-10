# This transferred to coffee script
# After a few transferring, CoffeeScript shows it's weakness
#   - node.js will not show coffe line number in debugging
#   - it bring error sometime, if missing parentheses

u    = require("underscore")
path = require("path")
fs   = require("fs")
async= require("async")
Promise = require "bluebird"

bucket = require("./bucket.js")
ft = require("../myutils/filetype.js")
myutil = require("../myutils/myutil.js")
myconfig =  require("../config/config.js")

image = require("./image.js") # this is for image editing, as making thumbnail

#s3folder = require("./folder.js")
file_module = require("./simple-file-v3.js")

my_image  = require "./image-file.js"

s3_stream_prefix = myconfig.s3_stream_prefix

p = console.log

promise_to_make_image_file_object = Promise.promisify(my_image.new_image_file_obj)

# conflict with the function in the follow? 0928
#new_image_file_obj = promise_to_make_image_file_object



# tocheck, ... redo 212, give up the old promise_to_make_image_file_object.
# failed 2015 0928 on thinkpad x240, it should because imagemagick instead of
#     graphicsmagick installed. 
new_uploaded_img_file_obj = (_meta, callback) ->
    #
    # make a new s3 file object, this means no old data need to read in.
    #

    ##promise_to_make_image_file_object _meta
    ##.then (obj) ->

    new_image_file_obj(_meta, (err, obj)->
        obj.calculate_meta_defaults()


        obj.make_default_thumb_to_s3(  (error, s3thumb_key) ->
            #p "make default thumb to s3, got problem whith thumbnail making now, 0929, 2015"

            if(error)
                p 'Error: image file v2. make default thumb to s3(...) error for ', meta.path
                p error
            #callback(error, obj) ## even error, the rest must be done.

            obj.render_html_repr()
            obj.save_meta_file(  (err, reply) ->
                return callback([err,error], obj) if(err || error) 

                callback(null, obj)
            )
        )
    )


#d? 0930, 2015
image_from_meta = Promise.promisify(new_uploaded_img_file_obj)


# --- to refact from old js #





new_image_file_obj = (file_meta, pass_file_obj) ->

    #
    # For image file object.
    #
    # When a file is image, it get data like thumbnails, width, height, etc.
    # The image file object take care it's own data and operations.  A file
    # object should be able to switch to image file object.
    #
    # 0720
    #
    meta = file_meta

    Template_file = path.join(__dirname, 'image-template.html')

    file_module.simple_s3_file_obj(meta, (err, fobj)->

        #
        # It going to be wrapped here, in a callback where we have parent obj
        # and data. The meta is set in the below, to make use of closure.
        #

        #
        # Data:
        # meta['thumbnail-s3key'] : default thumbnail s3key
        # 
        # For more thumbnails, not used yet: ? 0321
        # meta.thumbnails = [ {width:..., 
        #                      height:..., 
        #                      quality:...,
        #                      s3key:...,
        #                      local_file_path:...},
        #
        #                      // the next thumbnail image if there is,
        #
        #                      ... ]
        #

        # Now, we have file object and it's meta data.  Here it get modified
        # for image files:

        #var imeta= {}; // for image file specific things?

        render_html_repr = ->
            meta.html["li"] = render_image_as_li(meta)


        render_image_as_li = ->
            prepare_html_elements()
      
            s3key = meta["storage"]["key"]
            h = meta.html.elements
      
            # he is html element, representing the image in web page:
            # <li> file-selector, image-glyphicon, name, file informations ...
            #   <ul> 
            #     <li> thumbnail
            #     <li> date
            #     <li> ...
            #   </ul>
            # </li>
            # changing to <li> <div>s </li>, no li nesting. 212
            he = "\n<li>" # html element
            he += '<span class="thumb">' + h["thumb-img"] + "</span>\n"
            he += """<div class="selector">#{h["file-selector"]}</div>"""
            #he += meta.name
            #he += h['image-indicator'];
            he += """<div class="download">#{h["download"]}</div>"""
            he += """<div class="what">"""
            he += '<span class="delete">' + h['remove'] + "</span>\n"
            he += """<span class="time"> #{meta["lastModifiedDate"]} </span>\n"""  if meta["lastModifiedDate"]
            #he += "<span>" + meta["create-date"] + "</span>\n"  if meta["create-date"]
            # fa-cog -> circle-o

            value_amount = 0 if not meta.value?
            he += """<span class="value"> #{value_amount}
                     <i class="fa fa-circle-o"></i></span>"""

            he += "</div>"
            he += "</li>\n"

            h["li-element"] = he
            h["li"] = he
      
            meta["li-element"] = he # already used #d?
            meta["html"] = h


        prepare_html_elements = ()->
            # call parent's method first
            fobj.prepare_html_elements()

            #doing
            h = meta.html.elements
            href_download = meta["s3_stream_href"]

            h["basename"] = meta.name
            h["download_anchor"] = "<a href=\"" + href_download + "\" >" + h["basename"] + "</a>"

            h["download"] = """<a href="#{meta.s3_stream_href}">
                <i class="fa fa-cloud-download"></i> Download</a>"""

            thumb_src = ""
            if meta["thumbnail-s3key"]?
                thumb_key = meta["thumbnail-s3key"]
                thumb_src = path.join(s3_stream_prefix, thumb_key)
            if meta.thumb?
                thumb_key = meta.thumb.defaults.s3key
                thumb_src = path.join(s3_stream_prefix, thumb_key)

            h["thumb-src"] = thumb_src

            h["thumb-img"] = "<img src=\"" + thumb_src + "\" alt=\"" + h["basename"] + "\"  />"

            h["image-indicator"] = '''<span class="glyphicon glyphicon-picture"></span>'''

            #delete_link =  ... use elements.remove of parent


        # read in template from the file
        read_in_template = (callback)->
            fs.readFile(Template_file, (err, buf)->
                return callback(err, buf) if err

                str = buf.toString()
                p('template string: ',err, str)

                meta.html = {} if not meta.html?
                meta.html.template_str = str

                callback(null, meta.html.template)
                return meta.html.template
            )

        promise_to_read_template_file = Promise.promisify(read_in_template)


        # this replace 'render html repr'? 0322
        render_template = (callback)->
            Promise.resolve(()->
                if not meta.html.template_str? or not meta.html.template_str?
                    promise_to_read_template_file()
                else
                    return meta.html.template_str
            ).then((str)->

                template = null
                try
                    template = u.template(str)
                catch err
                    return callback(err, null)

                data = get_client_json()
                return try_template(template, data, callback)
            )


        try_template = (template, data, callback)->
            try
                html = template(data)
                return callback(null, html)
            catch err
                return callback(err, null)


        # give the json client side can use
        get_client_json = ()->

            # meta.client_json also set:
            j = fobj.get_client_json()
            p('got client json parent: ', j)

            thumb_key    = 'who know?'
            thumb_width  = 100
            thumb_height = 100
            if meta.thumb.defaults.s3key?
                thumb_key    = meta.thumb.defaults.s3key
                thumb_width  = meta.thumb.defaults.width
                thumb_height = meta.thumb.defaults.height

            add = {
                thumb_key    : thumb_key
                thumb_width  : thumb_width
                thumb_height : thumb_height
            }
            
            return u.extend(j, add)


        # Still get meta.local_file ?
        #d
        prepare_default_thumbnail = (callback) ->
            meta["thumbnail-s3key"] = image.make_thumb_key_from_file_key(meta.storage.key)
            thumb_file = path.join("/tmp", myutil.get_uuid())
            meta.local_file_thumb_file = thumb_file
            infile = meta.local_file.path
      
            # its width=80 height=80 quality=100
            image.make_thumbnail 80, 80, infile, 100, thumb_file, (err, out_file) ->
      
                # out_file is thumb_file
                callback()  if callback


        make_thumb_defaults = ->
            meta.thumb = {}  if typeof meta.thumb is "undefined"
            meta.thumb.defaults = {}  if typeof meta.thumb.defaults is "undefined"
            meta.thumb.defaults.width = 100
            meta.thumb.defaults.height = 100
            meta.thumb.defaults.quality = 100
            meta.thumb.defaults.s3key = image.make_thumb_key_from_file_key(meta.storage.key)
            meta.thumb.defaults.s3key += path.extname(meta.name) # get extension
            meta["thumbnail-s3key"] = meta.thumb.defaults.s3key
            return meta.thumb
      

        # How to arrange thumbnail better then this?
        make_default_thumb_to_s3 = (callback) ->
            make_thumb_defaults()

            # make an unique local file name:
            uniq = myutil.get_uuid() #?
            local_thumb_file_name = path.join("/tmp", uniq)

            bucket.get_object  meta.storage.key, (err, s3reply) ->
                return callback(err, null)  if err
                image_buf = s3reply.Body

                image.make_thumbnail_from_buf  image_buf,
                    meta.name,
                    meta.thumb.defaults.width,
                    meta.thumb.defaults.height,
                    meta.thumb.defaults.quality,
                    local_thumb_file_name,
                    (err) ->
                        return callback(err) if(err)

                        bucket.put_one_file  local_thumb_file_name, meta["thumbnail-s3key"], (err, s3reply) ->
                                fs.unlink local_thumb_file_name unless err
                                delete meta.local_thumb_file_name
                                callback err, meta["thumbnail-s3key"]
                        
                


        calculate_thum_name = (w, h)->
            name = meta.name
            ext  = path.extname(name)
            reg  = RegExp(ext + '$')
            idx  = name.search reg

            #p('name:', name, 'ext: ', ext, 'idx: ', idx)
            noextension = name.substring 0, idx
            #p('no extension name: ', noextension)

            size = w.toString() + 'x' + h.toString()
            name = noextension + '-thumb-' + size + ext
            return name



        get_thumb_keys = (w, h, callback)->
            name = calculate_thum_name(w,h)
            #p('thumb name: ', name)

            fobj.callback_file_auxiliary_path( (err, apath)->
                return callback(err) if err

                s3key = path.join(apath, name)
                #p('full thumb name: ', s3key)

                keys = {
                    name     : name,
                    full_name: s3key,
                    s3key    : s3key,
                }
                #p('keys: ', keys)
                callback(null, keys)
            )


        make_thumb = (w, h, quality, callback)->
            p 'in "image-file-v2.coffee", make thumb'
            assert = require "assert"
            assert u.isFunction fobj.read_file_to_buffer
            assert u.isFunction myutil.get_uuid
            #p('get_uuid: ', myutil.get_uuid())

            quality = quality || 100

            fobj.read_file_to_buffer( (err, buf)->
                p 'err --- ! in make thumb of image file v2', err if err
                return callback(err) if err

                get_thumb_keys(w,h, (err, keys)->
                    tmp_image_file = path.join('/tmp', myutil.get_uuid())
                    p('w,h,tmp_image_file, quality', w,h,tmp_image_file, quality)

                    image.gm(buf, meta.name).thumb(w,h, tmp_image_file, quality, (err)->
                        return callback(err) if(err)
                        p('after .thumb')

                        bucket.put_one_file(tmp_image_file, keys.s3key, (err, s3reply) ->
                            return callback(err) if err
                            p('after put one file')

                            fs.unlink tmp_image_file
                            meta.thumb[keys.name] = keys.s3key
                            fobj.save_file_to_folder().then((what)->
                                callback(null, what)
                            ).catch(callback)
                        )
                    )
                )

            )

        #trying
        write_thumb = (options, callback)->
            w = options.w
            h = options.h
            q = options.quality || 100

        # return a readable stream, which can be past to res (express.js):
        #   read_stream().pipe(res) 
        #   
        #   options: {
        #     w : width
        #     h : height
        #   }
        callback_thumb_read_stream = (options, callback) ->
            w = options.w
            h = options.h
            q = options.q || 100

            name = calculate_thum_name(w,h)
            p 'in read stream of image file v2', w,h,name

            if meta.thumb[name]?
                stream = bucket.s3_object_read_stream(meta.thumb[name])
                return callback(null, stream)

            make_thumb(w,h,q, (err, what)->
                return callback(err) if err

                stream = bucket.s3_object_read_stream(meta.thumb[name])
                return callback(null, stream)
            )
            

        is_image_file_obj = ()->
            true


        # not to use, file content no need to upload to s3 here.
        put_to_s3 = (callback) ->

            # @callback will get: (err, aws-reply-of-'putObject')
            callback = (->)  unless callback # make a callback anyway.
            callback_after = u.after(2, callback) # it actually run after they all finished.
            bucket.put_one_file(meta.local_file_thumb_file, meta["thumbnail-s3key"], callback_after)
            bucket.put_one_file(meta.local_file.path, meta.storage.key, callback_after)



        bucket2 = require('./bucket-v2.js')

        # not test.
        delete_s3_storage_2 = ()->
            # return a promise, try to delete all s3 storage of a file.

            all_promise = []
            # delete the default thumbnail file:
            all_promise.push bucket2.v1_promised.delete_object_promised(meta["thumbnail-s3key"])

            # delete other thumbnails:
            if meta.thumbnails?
                if meta.thumbnails.length > 0
                
                    meta.thumbnails.forEach( (thumb) ->
                        all_promise.push bucket2.v1_promised.delete_object_promised thumb.s3key
                    )
      
            # delete the image file:
            all_promise.push bucket2.v1_promised.delete_object_promised(meta.storage.key, (->))

            return Promise.all(all_promise)


        delete_s3_storage =(callback) ->
            # Same as "delete_s3_storage_2", use callback/async
            funs = []

            # delete the default thumbnail file:
            fun = (callback)->
                bucket.delete_object(meta["thumbnail-s3key"], callback)
            funs.push(fun)
      
            # delete other thumbnails:
            if meta.thumbnails
                meta.thumbnails.forEach( (thumb) ->
                    fun = (callback)->
                        bucket.delete_object(thumb.s3key, callback)
                    funs.push(fun)
                )
      
            # delete the image file:
            fun = (callback)->
                bucket.delete_object(meta.storage.key, callback)
            funs.push(fun)

            if meta.meta_file_key?
                fun = (callback)->
                    bucket.delete_object(meta.meta_file_key, callback)
                funs.push(fun)

            async.series(funs, callback)


        delete_s3_storage_old = ->
            # the careless way to delete s3 storage, just try to pass out 
            # without callback/promise.

            # delete the default thumbnail file:
            bucket.delete_object meta["thumbnail-s3key"]
      
            # delete other thumbnails:
            if meta.thumbnails
                meta.thumbnails.forEach( (thumb) ->
                    bucket.delete_object thumb.s3key
                )
      
            # delete the image file:
            bucket.delete_object(meta.storage.key, (->))

      
        _clone_content_to_user = (user_name, callback) ->
      
            # Can we use the parent method, 
            # when the method will be over-rided after a while?
            # Can we do it this way:
            # fobj._clone_content_to_user(....)
            #
            tgt_meta = {}
            fid = myutil.get_uuid()
            new_name = fid + path.extname(meta.name)
            tgt_s3key = path.join(user_name, ".files", new_name)
            tgt_storage = {
                type: "s3"
                key: tgt_s3key
            }
      
            tgt_meta.storage = tgt_storage
            bucket.copy_file(meta.storage.key, tgt_s3key)  #This has no callback
      
            # For thumbnail, only default thumbnail
            tgt_meta["thumbnail-s3key"] = image.make_thumb_key_from_file_key(tgt_meta.storage.key)
            bucket.copy_file(meta["thumbnail-s3key"], tgt_meta["thumbnail-s3key"]) #This has no callback
            return callback(tgt_meta)
      
        #
        fobj.set_meta(meta)
      
        # Object with new functionalities
        new_functions = {
            version: 'image-file-v2'
            prepare_default_thumbnail: prepare_default_thumbnail #d
            put_to_s3: put_to_s3
            delete_s3_storage: delete_s3_storage
            render_html_repr: render_html_repr
            clone_content_to_user: _clone_content_to_user
            make_default_thumb_to_s3: make_default_thumb_to_s3

            # exists only in tests
            make_thumb_defaults: make_thumb_defaults
            make_thumb : make_thumb #0520
            write_thumb : write_thumb #0520

            delete_s3_storage_2: delete_s3_storage_2

            read_in_template: read_in_template
            render_template : render_template
            get_client_json : get_client_json

            get_thumb_keys : get_thumb_keys
            callback_thumb_read_stream: callback_thumb_read_stream
            is_image_file_obj : is_image_file_obj
        }

        #u.extend(fobj, new_functions)
        u.defaults(new_functions, fobj)
        pass_file_obj(null, new_functions) # This callback pass out the image file object.

    ) # end of "simple s3 file obj" callback


module.exports.new_image_file_obj = new_image_file_obj
module.exports.new_uploaded_img_file_obj = new_uploaded_img_file_obj




# --- end to refact#




module.exports.image_from_meta  = image_from_meta


# Checkings

if require.main == module
    #image_file_obj = 
    _meta = {}
    new_image_file_obj _meta
    .then (obj) ->
        p obj
    .then (what) ->
        p what
        #stop()
    .catch (err) ->
        p 'err ', err
     

    stop()
