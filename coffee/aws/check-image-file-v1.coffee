

path = require "path"
fs   = require "fs"

simple_file = require "./simple-file-v1.js"
image_file  = require("./image-file-v1.js")
s3folder    = require('./folder-v1.js')
collector   = require('./file-collector.js')

p = console.log
stop = (time) ->
    time = time || 500
    setTimeout process.exit, time


check_a_image_file = () ->

    _meta =
        local_file : "/home/ubuntu/tmp/Uruguay-OKs-Plan.jpg"
        name  : "ub.jpg"
        dir   : "abc"
        owner : "abc"
    _meta.path = path.join(_meta.dir, _meta.name)

    meta = simple_file.fix_file_meta(_meta)
    file_path = meta.local_file
    p meta

    #simple_file.put_local_file_without_pass(file_path, meta, (err, json) ->
    #    p err, json

    #    ## try to finish the whole cycle:
    #    ###
    #    return image_file.new_uploaded_img_file_obj(meta,  (err, if_obj) ->
    #        if_obj.make_default_thumb_to_s3( (err, thumb_key) ->
    #            callback(err, if_obj)
    #        )
    #    ###
    #)
    stop()
#check_a_image_file()


step_by_step = () ->
    p 'step by step'

    _meta =
        local_file : "/home/ubuntu/tmp/Uruguay-OKs-Plan.jpg"
        name  : "ub.jpg"
        dir   : "abc"
        owner : "abc"
        #uuid  : "c57f8ab8-f382-4099-af76-c85297fdf673"
    _meta.path = path.join(_meta.dir, _meta.name)

    meta = simple_file.fix_file_meta(_meta)
    file_path = meta.local_file

    folder_path = _meta.dir
    username    = _meta.owner
    #p meta
    p 'start to put the local file to s3'

    simple_file.put_local_file_without_pass file_path, meta, (err, json) ->
        fs.writeFile('/tmp/imeta.json', JSON.stringify(meta, null, 4))
        p meta

        s3folder.retrieve_folder(folder_path,  (err, folder_obj) ->
            if(!folder_obj)
                return callback('not folder object', null)
                #console.log('folder meta in retry : \n', folder_obj.get_meta())
            p 'here 12'

            image_file.image_from_meta meta
            .then (iobj) ->
                    p 'iobj'
                    file_meta = iobj.get_meta()
                    fs.writeFile('/tmp/i2meta.json', JSON.stringify(file_meta, null, 4))
                    collector.add_file_the_old_way(username, file_meta, folder_path, folder_obj,  (err, user) ->

                    )
            .catch (err) ->
                    p 'err'
                    p err
            stop()
        )


       
        p 'here 11'
        #stop()


    #simple_file.put_local_file_without_pass(file_path, meta, (err, json) ->
    #    p err, json

    #    ## try to finish the whole cycle:
    #    ###
    #    return image_file.new_uploaded_img_file_obj(meta,  (err, if_obj) ->
    #        if_obj.make_default_thumb_to_s3( (err, thumb_key) ->
    #            callback(err, if_obj)
    #        )
    #    ###
    #)
    #stop()
step_by_step()


