
Promise= require "bluebird"
image  = require "./image-file.js"


p = console.log
stop = (time) ->
    time = time || 500
    setTimeout process.exit, time

promise_to_make_image_file_object = Promise.promisify(image.new_image_file_obj)

new_image_file_obj = promise_to_make_image_file_object



# tocheck
new_uploaded_img_file_obj = (_meta, callback) ->
    #
    # make a new s3 file object, this means no old data need to read in.
    #
    promise_to_make_image_file_object _meta
    .then (obj) ->
        obj.calculate_meta_defaults()
        #obj.upgrade_to_s3storage_collection()

        obj.make_default_thumb_to_s3(  (err, s3thumb_key) ->
            obj.render_html_repr()

            #callback(err, obj)
            obj.save_meta_file(  (err, reply) ->
              callback(err, obj)
            )
        )

image_from_meta = Promise.promisify(new_uploaded_img_file_obj)



module.exports.new_image_file_obj  = new_image_file_obj
module.exports.new_uploaded_img_file_obj  = new_uploaded_img_file_obj
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
