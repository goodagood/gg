
u       = require "underscore"
fs      = require "fs"
Promise = require "bluebird"
#path    = require "path"
async   = require "async"
util    = require "util"

s3folder = require "./folder-v4.js"


p = console.log
stop = () ->
    setTimeout process.exit, 500

# 
test_path = 'abc'
test_uuids = [
    'beeadcf7-ba8f-4e19-b16e-f92e5ee6106c', # food.txt
    'efb9dde7-c9ec-4f6c-8a35-345b087bbf78', # txt1107
    '02ff452f-f178-41d3-be54-ad69e3b6d3ea',
    '81026825-fa89-4a6e-b796-544a599403e5',

    'b77efc00-02dd-46b1-adf1-246bfb13b60e', # txt1108a
    '93d0924c-d911-4143-98c4-2bc762bef74b',

]
names = ['env-55', 'food.txt', 'test-1015', 'plain_1']


# can we get folder:
check_to_get_folder = () ->
    s3folder.make_s3folder_v4a(test_path).then(
        (folder) ->
            p folder
            meta = folder.get_meta()
    ).then(
        stop
    ).catch(
        (err)->
            p 'e r r: ',  err
            stop()
    )


delete_a_file = () ->
    name = "test-1015"
    name = "txt1108a"
    p "name: #{name}"

    s3folder.make_s3folder_v4a(test_path).then(
        (folder) ->
            p 'folder is not false' if folder?
            folder.delete_file name, ()->
                #
            
    ).then(
        stop
    ).catch(
        (err)->
            p 'err in delete a file: ',  err
            stop()
    )


clear_names = () ->
    s3folder.make_s3folder_v4a(test_path).then(
        (folder) ->
            folder.promise_to_clear_empty_names()
    ).then(
        stop()
    ).catch(
        (err)->
            p 'err in clear name: ',  err
            stop()
    )



delete_a_few_files = () ->
    names = ['ttwo', 'ttwo-2', 'txt1108d', 'txt1']

    s3folder.make_s3folder_v4a(test_path).then(
        (folder) ->
            for n in names
                try
                    folder.delete_name(n).then(
                        (what)->
                            p "deleted #{n} ", what
                    )
                catch err
                    p "delete a few ? here name: #{n} ", err
                    new Promise(->)

    ).then(
        stop
    )
    #    .catch(
    #    (err)->
    #        p 'err in delete a file: ',  err
    #        stop()
    #)

delete_by_name = () ->
    names = ['activities.txt', 'txt1108d', 'txt1']


    s3folder.make_s3folder_v4a(test_path).then(
        (folder) ->

            function_list = names.map (name)->
                return (callback)->
                    folder.delete_file(name, callback)

            async.series(function_list, (err, what)->
                p 'woo waa: ', err, what
                stop()
            )

    )

delete_name = () ->
    name = "txt1108b"

    s3folder.make_s3folder_v4a(test_path).then(
        (folder) ->
            folder.delete_name(name).then(
                (what)->
                    p what
                    p "deleted? #{name}"
            )
    ).then(
        stop
    )


delete_a_file_by_uuid = () ->
    uuid = test_uuids[0]
    #p "name: #{name}"

    s3folder.make_s3folder_v4a(test_path).then(
        (folder) ->
            folder.delete_file_by_uuid(uuid, ()->
                #
            )
    ).then(
        stop
    ).catch(
        (err)->
            p 'err when delete a file by uuid: ',  err
            stop()
    )

check_can_have_member = () ->
    s3folder.make_s3folder_v4a(test_path).then(
        (folder) ->
            #folder_meta = folder.get_meta()
            
            #keys = Object.keys(folder)
            #p keys.sort()
            #p folder
            #p folder_meta

            #mo = folder.members_obj
            #p mo
            #mo.show_members_file() if mo

            #p folder
            ##folder.members_obj.init_members_file()
            #p  folder.members_obj.members_file_exists() ? 'exists' : 'not exists'
    ).then(
        stop
    ).catch(
        (err)->
            p 'e r r: ',  err
            stop()
    )

# Check we can get folder object, and file object by it uuid
check_to_get_file_meta_ul_list = () ->
    s3folder.make_s3folder_v4a(test_path).then(
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
    name = "food.txt"
    name = "txt1108a"
    s3folder.make_s3folder_v4a(test_path).then(
        (folder) ->
            #p folder.get_meta()
            uuids = folder.get_uuids(name)
            p "uuids : \n", uuids
            #fs.writeFile('/tmp/uuids', uuids)
    ).then(stop)

get_file_objs = () ->
    # By name to get file objects.
    name = "env-55"
    name = "env-85"
    s3folder.make_s3folder_v4a(test_path).then(
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
    filepath = "abc/folder.css"
    s3folder.retrieve_file_obj(filepath, (err, file)->
        #p err, file
        file.read_to_string (str)->
            p str
            stop()
    )


read_a_file_by_uuid = ()->
    name = 'txt1107a'
    uuid = '02ff452f-f178-41d3-be54-ad69e3b6d3ea'
    s3folder.make_s3folder_v4a(test_path).then(
        (folder) ->
            folder.read_file_by_uuid(uuid)
    ).then(
        (str)->
            p str
    ).then(
        stop
    ).catch(
        (err)->
            p "err in read a file by name checking", err
            stop
    )


read_a_few_files_by_name = ()->
    name = 'txt1108d'
    name = 'folder.css'
    s3folder.make_s3folder_v4a(test_path).then(
        (folder) ->
            folder.read_files_by_name(name)
    ).then(
        (arr_str)->
            p arr_str
    ).then(
        stop
    ).catch(
        (err)->
            p "err in read a file by name checking", err
            stop
    )

read_file_by_uuid = ()->
    name = 'folder.css'
    name = 'test-txt-a'
    name = 'txt1107a'
    s3folder.make_s3folder_v4a(test_path).then(
        (folder) ->
            folder.read_files_by_name(name)
    ).then(
        (arr_str)->
            p arr_str
    ).then(
        stop
    ).catch(
        (err)->
            p "err in read a file by name checking", err
            stop
    )


write_a_text_file = ()->
    name = 'test-txt-a'
    name = 'txt1108b'
    f = null
    s3folder.make_s3folder_v4a(test_path).then(
        (folder)->
            f = folder
            #folder
            folder.write_text_file(name, "i am check 949pm: \nwrite a text file\nabc \n new line\n 1108")
    ).then(
        (what)->
            p 'what we get from write the file: ', what
    ).then(
        ()->
            #sleep 5 seconds
            return new Promise  (resolve)->
                foo = ()->
                    resolve('slept')
                setTimeout(foo, 5000)
    ).then(
        ()->
            p ' ---- ' #, f
            f.read_text_file(name)
    ).then(
        (str)->
            p "text content: #{str}"
    ).then(stop).catch(
        (err)->
            p 'err in write a text file: ', err
            stop()
    )

write_and_read = ()->
    name = 'txt1'
    f = null
    s3folder.make_s3folder_v4a(test_path).then(
        (folder)->
            f = folder
            folder.write_text_file(name, "0238am read after write: \nwrite a text file\nabc \n new line\n 1108")
    ).then(
        (what)->
            #p 'what we get from write the file: ', what
    ).then(
        ()->
            #sleep 5 seconds
            time = 15 * 1000
            p 'sleep  mili-seconds ', time
            return new Promise  (resolve)->
                foo = ()->
                    resolve('slept')
                setTimeout(foo, time)
    ).then(
        ()->
            s3folder.make_s3folder_v4a(test_path)
    ).then(
        (folder)->
            f = folder
    ).then(
        (f)->
            p ' ---- ' #, f
            f.read_files_by_name(name)
    ).then(
        (str)->
            p "text content:\n#{str}"
    ).then(stop).catch(
        (err)->
            p 'err in write a text file: ', err
            stop()
    )

# failed many times in test (mocha.js):
fv4 = s3folder
test_read_write = ()->
    file_name = 'tone2'
    folder = null

    fv4.make_s3folder_v4a(test_path).then(
        (f)->
            folder = f
            folder.write_text_file  file_name, "-- i am checking: \nwrite a text file...\nabc \n new line\n 1108"
            #assert not u.isEmpty folder
    ).then(
        (results_from_writting)->
            p  "results_from_writting #{results_from_writting}", results_from_writting
    ).then(
        ()->
            # keep some time away:
            sleep = 15 # in seconds
            p "sleep: #{sleep} seconds"
            return new Promise (resolve)->
                foo = ()->
                    resolve 1
                setTimeout(foo, sleep*1000)
    ).then(
        ()->
            # get the folder refreshly
            fv4.make_s3folder_v4a(test_path).then( (f)->
                folder = f
            )

    ).then(
        ()->
            uuid_list = folder.get_uuids(file_name)
            #assert uuid_list.length >= 1
            p "uuid_list.length: #{uuid_list.length}"
            stop()
    ).catch(
        (err)->
            p 'fuck, i caught you', err
            stop()
    )

check_details = () ->
    Meta   = null
    Folder = null

    s3folder.make_s3folder_v4a(test_path).then(
        (folder) ->
            Meta = folder.get_meta()
            files= Meta.files
            for k,v of files
                if v.name == 'goodagood'
                    p k
                    p v
            #p util.inspect Meta.files, {depth:null}
    ).then(
        stop
    )


# to do, 15
check_add_folder = () ->
    folder_path = 'aa'

    Meta   = null
    Folder = null

    s3folder.make_s3folder_v4a(folder_path).then(
        (folder) ->

            Folder = folder
            p folder
            Meta = folder.get_meta()
    ).then(
        (meta)->
            #Folder.promised_add_folder('test-add-folder')
            p 'meta ', meta
    ).then(
        stop
    ).catch(
        (err)->
            p 'e r r: ',  err
            stop()
    )

check_init_home_15 = () ->
    folder_path = 'aa'

    Meta   = null
    Folder = null

    s3folder.init_home_folder_11_15(folder_path).then(
        (f)->
            p 'folder build: ', f
            Meta = f.get_meta()
            p 'meta: ', Meta

    ).then(
        stop
    )



##
#- Do checkings:
##
#
#check_to_get_folder()
#delete_a_file()
#delete_a_file_by_uuid()
#delete_a_few_files()
#delete_by_name()
#delete_name()
#clear_names()

#check_get_uuids()
#check_to_get_file_meta_ul_list()
#check_can_have_member() #
#
#get_file_objs()
#retrieve_a_file()
#read_a_few_files_by_name()
#read_a_file_by_uuid()
#write_a_text_file()

#write_and_read()
#test_read_write()

#check_details()
#check_add_folder()
check_init_home_15()

#pass_sample_file_meta(null, (err, _meta) ->
#    p _meta
#    stop()
#)



