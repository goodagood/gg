# Actually checking 'folder-v1.js'


u    = require('underscore')
path = require('path')
async= require 'async'
#test = require('nodeunit')

argv = require("yargs").argv

bucket    = require('./bucket.js')
#s3folder  = require('./folder-v1.js')
s3folder  = require('./folder-v5.js')
#s3file   = require('./simple-file.js')

tools     = require('./tools-cof.js')

# a function to exit
stop      = (time) ->
    time = time || 500
    setTimeout(process.exit, time)

p         = console.log

fappend   = require('../myutils/mylogb.js').append_file
afile     = '/tmp/a9.log'


show_folder_meta = (folder_path, callback) ->
    s3folder.retrieve_folder(folder_path).then((folder) ->
        meta = folder.get_meta()
        console.log  meta
        callback()
    )


show_folder_meta_with_options = (_path, argv, callback) ->
    #console.log argv
    #p "in 'show folder m w o', _path, argv._ : ", _path, argv._

    opt = argv._

    s3folder.retrieve_folder(_path).then((folder) ->
        meta = folder.get_meta()
        #console.log  meta
        if(argv.without)
            show_it_without(meta, opt)
        else if(argv.only)
            show_it_only(meta, opt)
        else
            p meta

        stop()
    )



file_meta_with_opt = (file_path, argv)->
    #p 'argv in f m w o : ', argv

    opt = argv._

    s3folder.get_file_meta_by_path(file_path).then( (meta_list) ->
        #p "meta_list", meta_list
        #p typeof meta_list
        #p 'is array: ', u.isArray(meta_list)

        if(argv.without)
            #p 'without'
            meta_list.forEach( (meta)->
                show_it_without(meta, opt)
            )
            #
        else if(argv.only)
            #p 'only'
            meta_list.forEach( (meta)->
                show_it_only(meta, opt)
            )
        else
            #p 'others'
            p meta_list

        stop()
    )



show_file_info = (file_path, argv_, callback) ->
    p 'argv got: \n', argv_

    dirname  = path.dirname(file_path)
    filename = path.basename(file_path)

    keep = (element) ->
        names = argv_._
        return element if u.isEmpty names
        #p names
        _meta = {}
        _meta[name] = element[name] for name in names
        _meta


    #s3folder.retrieve_folder  dirname, (err, folder) ->
    s3folder.get_file_meta_by_path(file_path).then( (meta_list) ->
        p 111, err, meta_list
        #return callback() if err or not meta_list or u.isEmpty(meta_list)
        #p "err, meta_list", err, meta_list
        _m = meta_list.map  keep
        p _m
        #callback()
        stop()
    )
    
    #


get_file_uuid = (argv_, callback) ->
    return console.log('empty parameters') if u.isEmpty(argv_)
    return console.log('parameter not array') if not u.isArray(argv_)

    async.map argv_, (file_path) ->
        dirname   = path.dirname(file_path)
        filename    = path.basename(file_path)
        s3folder.retrieve_folder_meta dirname, (err, _meta) ->
            console.log err, _meta


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


folder_meta_show_array = (folder_path, name_array, callback) ->
    # @name_array : an array of names to show from the file meta

    if  not u.isArray(name_array)
        console.log('NOT ARRAY: ' + name_array)
        return null

    s3folder.retrieve_folder( folder_path).then(  (folder_obj) ->

        folder_meta = folder_obj.get_meta()
        #console.log folder_meta

        to_show     = {}

        for name in name_array
            if folder_meta[name] != 'undefined'
                to_show[name] = folder_meta[name]

        #exit()

        callback(to_show) if callback
    )


# tools 


show_it_without = (obj, names) ->
    show = {}
    u.defaults show, obj
    if u.isArray(names)
        u.each names, (name) ->
            delete show[name]
  
        return console.log(show)
    
    # @name is not array now.
    # to exclude all the names, it from arguments[1]
    i = 1
  
    while i < arguments.length
        delete show[arguments[i]]
        i++
    console.log show


show_it_only = (obj, names) ->

    show = {}
    if u.isArray(names)
        u.each names, (name) ->
            show[name] = obj[name]  if obj[name]?
  
        return console.log(show)
    i = 1
  
    while i < arguments.length
        show[arguments[i]] = obj[arguments[i]]  if obj[arguments[i]]?
        i++
    console.log show




do_some_stupid = (what) ->
    console.log "Can not understand the command: #{what}\n"
    tools.exit()


checking = () ->
    # Boolean options keep to ending, because the way 'yargs' works.
    # Currently: -x -i
    cmd   = argv.cmd
    argv_ = argv._

    path_     = argv['path']
    key      = argv.key

    argv.only     = argv.i if u.isBoolean argv.i # -i means include
    argv.without  = argv.x if u.isBoolean argv.x # -x means exclude
    

    switch cmd
        when 'show-folder-meta'  then show_folder_meta_with_options(path_, argv, tools.exit)
        when 'show-file-meta'    then file_meta_with_opt(path_, argv)
        #when 'show-file-meta'    then show_file_meta(path_, argv, tools.exit)
        when 'show-file-info'    then show_file_info(path_, argv, tools.exit)
        when 'get-file-uuid'     then get_file_uuid(argv_, tools.exit)
        when 'read-json-from-s3' then read_json_from_s3(key, tools.exit)

        when 'deep-folder-info'  then deep_folder_info(path_, argv) #todo
        else do_some_stupid(cmd)

#
# How to use:
# ===========
#
# node ./this-file.js  show-file-info --path file-abs-path   attr-name-1 name-2 ... -i
#     show file meta attributes with attr-name-1 ...
#     if not attr-names, all meta info will be listed.
#
# ... show-folder-meta --path folder-path  attr-name-1, 2, ... -i -x
#     -i : include
#     -x : exclude


if require.main is module
    checking()

    #
    #folder_meta_without_array_of_names 'abc',
    #    [ 'file_uuids', 'renders'],
    #    (err, _meta) ->
    #        console.log err, _meta
    #        tools.exit(88)

    #folder_meta_show_array 'abc', ['file_uuids', 'renders', ],
    #    (err, _meta) ->
    #        console.log err, _meta
    #        tools.exit(88)

    #


