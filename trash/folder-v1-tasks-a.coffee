# Actually checking 'folder-v1.js'


u     = require('underscore')
#path = require('path')
#test = require('nodeunit')

argv = require("yargs").argv

bucket    = require('./bucket.js')
s3folder  = require('./folder-v1.js')
#s3file   = require('./simple-file.js')

tools     = require('./tools-cof.js')

fappend   = require('../myutils/mylogb.js').append_file
afile     = '/tmp/a9.log'


show_folder_meta = (folder_path, callback) ->
    s3folder.retrieve_folder  folder_path, (err, folder) ->
        meta = folder.get_meta()
        console.log err, meta
        callback()

read_json_from_s3 = (s3key, callback) ->
    bucket.read_json s3key, (err, obj) ->
        console.log err, obj
        callback()

folder_meta_without_array_of_names = (folder_path, name_array, callback) ->
    # @name_array : an array of names to exclude from the file meta

    if  not u.isArray(name_array)
        console.log('NOT ARRAY')
        return null

    s3folder.retrieve_folder  folder_path,  (err, folder_obj) ->
        callback(err, null) if err

        folder_meta = folder_obj.get_meta()

        for name in name_array
            if folder_meta[name] != 'undefined'
                delete folder_meta[name]

        #console.log folder_meta
        #exit()

        callback(null, folder_meta)


folder_meta_show = (folder_path, name_array, callback) ->
    # @name_array : an array of names to show from the file meta

    if  not u.isArray(name_array)
        console.log('NOT ARRAY: ' + name_array)
        return null

    s3folder.retrieve_folder  folder_path,  (err, folder_obj) ->

        folder_meta = folder_obj.get_meta()
        #console.log folder_meta

        to_show     = {}

        for name in name_array
            if folder_meta[name] != 'undefined'
                to_show[name] = folder_meta[name]

        #exit()

        callback(to_show) if callback

###
exit = (time) ->
    time = time || 500
    console.log "\n --- goint to exit at #{time}"
    setTimeout(process.exit, time)
###

show_meta      = ((what) ->)

do_some_stupid = (what) ->
    console.log "Can not understand the command: #{what}\n"
    tools.exit()

checking = () ->
    cmd = argv.cmd
    folder_path = argv['folder-path']
    key = argv.key

    #console.log "cmd, folder_path: #{cmd}, #{folder_path}"
    #console.dir argv
    #console.dir console

    switch cmd
        when 'show-folder-meta'  then show_folder_meta(folder_path, tools.exit)
        when 'read-json-from-s3' then read_json_from_s3(key, tools.exit)
        else do_some_stupid(cmd)


if require.main is module
    #checking()

    ###
    folder_meta_without_array_of_names 'abc',
        [ 'file_uuids', 'renders'],
        (err, _meta) ->
            console.log err, _meta
            tools.exit(88)
    ###

    folder_meta_show 'abc', ['file_uuids', 'renders', ],
        (err, _meta) ->
            console.log err, _meta
            tools.exit(88)



###


###
