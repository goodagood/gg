###
# Try to make json file object not based on text file, make it a little
# easier to read/write json file, which can serve as configuration files.
#
# change 0105, 
#   the new json file is quite different from the old, which use text file.
#
#
# json file type till not added to s3-file-types.js, 0225, added 0318
# read_as_json_file can be used
# read_json_file    currently linked to read_as_json_file
#
###


path    = require 'path'
u       = require 'underscore'
assert  = require 'assert'
Promise = require('bluebird')

myconfig =  require("../config/config.js")

file_module   = require("./simple-file-v3.js")
folder_module = require("./folder-v5.js")

p = console.log


new_json_file_obj = (file_meta, callback) ->
    #  module is going to be used as class
    #  All functions will get access to data object: Meta

    # Global data in this function:
    Meta = file_meta #should be an object works as hash
    Err  = null
    Obj  = {}
    Json = null

    set_json = (json)->
        Json = json

    get_json = ()->
        return Json


    #file_module.new_file_obj_from_meta  Meta, (err, fobj)
    file_module.simple_s3_file_obj  Meta, (err, fobj) ->
        # give up in error:
        return callback(err, fobj) if err

        u.defaults(Obj, fobj) # make Obj get defaults from the file object.

        retrieve_json = (callback)->
            #if Obj is null # can not be null now. 0318
            #    #throw err if Obj is null
            #    err = 'null file obj in "retrieve json", ' + Meta.path
            #    return callback(err, null)

            Obj.read_to_string((err, str)->
                return callback(err, null) if err

                Json = null
                try
                    Json = JSON.parse(str)
                catch jerr
                    return callback(jerr, null)

                callback(null, Json)
            )

        update_json = (json, callback)->
            Json = json
            text = JSON.stringify(json)
            Obj.write_s3_storage(text, callback)


        set_attribute = (name, value, callback)->
            # assume Json is updated, just set a name/value to it
            Json[name] = value
            update_json(Json, callback)

        get_attribute = (name)->
            # assume Json is updated
            return Json[name] if Json[name]?
            return null

        # Set other functionalities:
        Obj.version     = 'simple-json.coffee'
        Obj.update_json = update_json
        Obj.set_json = set_json #Useless?, use 'update json' instead.

        Obj.get_json = get_json #same useless?
        Obj.retrieve_json = retrieve_json

        Obj.set_attribute = set_attribute
        Obj.get_attribute = get_attribute

        #u.defaults(Obj, fobj)
        callback(null, Obj)


promise_to_new_json_file_obj = Promise.promisify(new_json_file_obj)


# to test, 0225, rewrite, 0711, to test
new_json_file_from_meta = (meta, callback)->
    # assume: josn already saved (serielized) to meta.storage.key
    # This will make up meta defaults, render, and save meta.

    new_json_file_obj(meta, (err, jfile)->
        jfile.calculate_meta_defaults()
        jfile.render_html_repr()
        jfile.save_file_to_folder().then((what)->
            callback err, jfile
        ).catch(callback)
    )


make_json_file = (json, user_name, file_path, callback)->
    # json to json file.
    # @file_path : user-name/path/to/file-name.json
    # @user_name : owner, who own the file_path.

    dirname = path.dirname (file_path)
    basename= path.basename(file_path)

    meta = {}
    meta.owner = user_name
    meta.path  = file_path
    meta.name  = basename
    meta.dir   = dirname

    new_json_file_obj(meta, (err, file)->
        return callback(err, file) if err

        file.calculate_meta_defaults()
        meta_ = file.get_meta()
        assert(meta_ is meta, "just calculate defaults, thing they are equal")
        #p('meta_:', meta_)

        # Could be empty?
        if(u.isEmpty(meta_.storage))
            key = path.join(myconfig.raw_file_prefix, meta_.dir, meta_.uuid)
            meta_.storage = {type:'s3', key:key}

        file.update_json(json, (err, reply)->
            return callback(err, reply) if err

            file.render_html_repr()

            file.save_file_to_folder().then((what)->
                callback(null, file)
            ).catch(callback)
            
        )
    )



# old name: write_json_file
# write file, path.join(dir, filename) => full path
write_json_file_as_text = (owner, dir, filename, json)->
    # reture a promise, this actually equal to text file
    text = JSON.stringify json, null, 4
    file_module.write_text_file(owner, dir, filename, text)



read_as_json_file = (full_path, callback)->
    dir      = path.dirname(full_path)
    filename = path.basename(full_path)

    folder_module.retrieve_folder(dir).then(
        (folder)->
            folder.read_recent_file_by_name(filename, (err,str)->
                j = null
                try
                    j = JSON.parse(str)
                catch jerr
                    return callback(jerr, str)
                callback(null, j)
            )
    )


read_json_file = (full_path, callback)->
    dir      = path.dirname(full_path)
    filename = path.basename(full_path)

    folder_module.retrieve_folder(dir).then(
        (folder)->
            folder.get_recent_file_by_name(filename, (err, obj)->
                return callback(err, obj) if err

                #p 'in "read json file", err, obj', err, obj
                obj.retrieve_json((err, json)->
                    return callback(err, json) if err

                    callback(null, json)
                )
                #return callback(null, obj)

                #assert(u.isFunction(obj.retrieve_json))
                #obj.retrieve_json(callback)
            )
    )



module.exports.new_json_file_obj = new_json_file_obj
module.exports.make_json_file = make_json_file

module.exports.write_json_file_as_text = write_json_file_as_text
module.exports.read_as_json_file = read_as_json_file
module.exports.read_json_file = read_json_file

module.exports.new_json_file_from_meta = new_json_file_from_meta


# # checkings: # #
p = console.log
stop = () ->
    setTimeout process.exit, 500

# parameters during checking
test_owner_name  = 'abc'
test_folder_name = 'abc'
test_file_path   = 'abc/ta.json'
test_json_file_name = 'test.json'
test_file_name   = 'txt25'

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
    #    .catch(
    #    (err)->
    #        p 'err in write a text file: ', err
    #        stop()
    #)

check_write_json = (filename)->
    filename = filename || 'test.json'
    username = test_owner_name
    dir      = 'abc'

    j = {
        a : 1
        b : 2
        c : {
            ca : 'a in c'
            cb : 'b in c'
            ar : [1, 2, 3]
        }
    }

    write_json_file_as_text(username, dir, filename, j).then(
        (what)->
            p 'what: ', what
            p 'check if it wrote'
    ).then(stop)


check_read_json = (filename)->
    filename =  filename || 'abc/test/j.json'
    read_as_json_file(filename, (err, j)->
        p 'err,str:', err, j

        read_json_file(filename, (err, j2)->
            p '2, err,str:', err, j2
            stop()
        )
    )


check_make_json_file = ()->
    test_json = {
        "what" : "I am testing, 0105"
        "date" : new Date()
        "ok"   : true
    }
    make_json_file(test_json, test_owner_name, test_file_path, (err, what)->
        p "In 'check make json file' \n", err, what
        stop()
    )


show_json_file = (file_path)->
    file_path = file_path || 'abc/test/.todo.json'

    folder_module.retrieve_file_objs(file_path, (err, files)->
        #p('retrieve file objs, in show json file, (err, files):\n', err, files)
        len = files.length
        p('number: ', len)
        assert(len > 0)
        file = files[0]

        file.read_to_string((err, str)->
            p('json file string:\n', str)
            stop()
        )
    )


check_read_a_json = (file_path)->
    filename =  filename || 'abc/test/json-txt.json'

    read_json_file(filename, (err, j2)->
        p '2, err,str:', err, j2
        stop()
    )



if require.main is module
    #write_a_text_file()
    #check_write_json()
    #check_read_json()

    #check_make_json_file()

    #show_json_file()

    check_read_a_json()


