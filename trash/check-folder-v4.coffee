
u       = require "underscore"
fs      = require "fs"
Promise = require "bluebird"
#path    = require "path"

s3folder = require "./folder-v4.js"


p = console.log
stop = () ->
    setTimeout process.exit, 500

# 
test_path = 'abc'
test_uuids = [
    'beeadcf7-ba8f-4e19-b16e-f92e5ee6106c', # food.txt
]

# Check we can get folder object, and file object
check_to_get_file_meta_ul_list = () ->
    s3folder.make_s3folder_v4(test_path).then(
        (folder) ->
            uuid = test_uuids[0]
            return new Promise( (resolve) ->
                folder.get_file_obj_by_uuid(uuid).then(
                    (file_obj) ->
                        _meta = file_obj.get_meta()
                        ul    = file_obj.convert_meta_to_ul()
                        p ul
                        resolve _meta
                )
            )
            #p folder
    ).then(stop)
#check_to_get_file_meta_ul_list().then(stop)

check_get_uuids = () ->
    name = "food.txt"
    name = "env-55"
    s3folder.make_s3folder_v4(test_path).then(
        (folder) ->
            #p folder.get_meta()
            uuids = folder.get_uuids("env-55")
            p "uuids : \n", uuids
            #fs.writeFile('/tmp/uuids', uuids)
    ).then(stop)

get_file_objs = () ->
    # By name to get file objects.
    name = "env-55"
    name = "env-85"
    s3folder.make_s3folder_v4(test_path).then(
        (folder) ->
            folder.get_file_objs_by_name(name, (err, objs) ->
                #p err, objs
                u.each objs, (o)->
                    p o.get_meta()['name'], o.get_meta()['uuid'],

            )
    ).catch(
        (err) ->
            p err
    ).then(stop)



pass_sample_file_meta = (fpath, callback) ->
    #--
    # This is to give a meta.  Be careful one file name can give meta array.
    # The file name can be set in the follow:
    #--

    #fpath = 'abc/env-55'
    fpath = fpath || 'abc/food.txt'

    s3folder.get_file_meta_by_path(fpath, (err, what) ->
        #p err, what
        #p build_ul(what)

        p "what is array: ", u.isArray(what)
        sample_meta = what[0]
        callback(null, sample_meta)
        #p 'sample meta[name] : ', sample_meta["name"]
        #stop()
        #
    )

#pass_sample_file_meta(null, (err, _meta) ->
#    p _meta
#    stop()
#)

retrieve_a_file = ()->
    filepath = "abc/env-55"
    s3folder.retrieve_file_obj(filepath, (err, file)->
        #p err, file
        file.read_to_string (str)->
            p str
            stop()
    )


read_a_file_by_name = ()->
    name = 'folder.css'
    name = 'test-txt-a'
    s3folder.make_s3folder_v4(test_path).then(
        (folder) ->
            folder.read_file_by_name(name)
    ).then(
        (str)->
            p str
    ).then(
        stop
    ).catch(
        (err)->
            p err
    )

write_a_text_file = ()->
    name = 'test-txt-a'
    f = null
    s3folder.make_s3folder_v4(test_path).then(
        (folder)->
            f = folder
            folder
            #folder.write_text_file(name, "abc \n 2nd line\n")
    ).then(
        (what)->
            p what
    ).then(
        ()->
            p ' ---- ', f
            f.read_text_file(name)
    ).then(
        (str)->
            p "text content: #{str}"
    ).then(stop).catch(
        (err)->
            p 'err: ', err
            stop()
    )


##
#- Do checkings:
##
#
#check_get_uuids()
#check_to_get_file_meta_ul_list()
#get_file_objs()
#retrieve_a_file()
#read_a_file_by_name()
write_a_text_file()

#pass_sample_file_meta(null, (err, _meta) ->
#    p _meta
#    stop()
#)



