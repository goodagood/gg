
u       = require "underscore"
fs      = require "fs"
Promise = require "bluebird"
#path    = require "path"
async   = require "async"
util    = require "util"

fm = require "./folder-v5.js"


p = console.log
stop = () ->
    setTimeout process.exit, 500

# 
folder_name = 'abc'
test_uuids = [
    # ttwo-2
    '6b550755-bf26-42f3-a081-586e5b867bb9',
    'af480243-fc91-402e-a35d-f7e2cd48ca82',
]
names = ['tone2', 'txt9', 'txt19', 'ttwo-2']


# can we get folder:
check_to_get_folder = () ->
    fm.retrieve_folder(folder_name).then(
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



check_get_uuids = () ->
    name = "tone2"
    name = "ttwo-2"

    obj  = null
    meta = null
    fm.retrieve_folder(folder_name).then(
        (obj_)->
            obj = obj_
            obj.promise_to_retrieve_saved_meta()
    ).then(
        (meta_)->
            meta = meta_
            p 'meta: ', meta
            obj
    ).then(
        (folder) ->
            #p folder.get_meta()
            uuids = folder.get_uuids(name)
            p "uuids : \n", uuids
            #fs.writeFile('/tmp/uuids', uuids)
    ).then(stop)



get_file_objs = () ->
    # By name to get file objects.
    name = "tone2"
    fm.retrieve_folder(folder_name).then(
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


check_details = () ->
    Meta   = null
    Folder = null

    fm.retrieve_folder(folder_name).then(
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


clear_names = () ->
    fm.retrieve_folder(folder_name).then(
        (folder) ->
            folder.promise_to_clear_empty_names()
    ).then(
        p 'cleared?'
        stop()
    ).catch(
        (err)->
            p 'err in clear name: ',  err
            stop()
    )


delete_a_file_by_uuid = () ->
    uuid = test_uuids[0]
    #p "name: #{name}"

    fm.retrieve_folder(folder_name).then(
        (folder) ->
            folder.promise_to_delete_uuid(uuid).then(
                (what)->
                    p "what ", what
                #
            )
    ).then(
        stop
    ).catch(
        (err)->
            p 'err when delete a file by uuid: ',  err
            stop()
    )


read_a_few_files_by_name = ()->
    name = 'ttwo-2'
    name = 'txt19'
    fm.retrieve_folder(folder_name).then(
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
    name = 'txt9'
    F = null
    fm.retrieve_folder(folder_name).then(
        (folder)->
            F = folder
            #folder
            folder.write_text_file name,
                "i am check to write : \nwrite a text file\nabc \n new line\n 19"
    ).then(stop).catch(
        (err)->
            p 'err in write a text file: ', err
            stop()
    )

# doing
# failed many times in test (mocha.js):
test_read_write = ()->
    file_name = 'tone3'
    Folder = null

    fm.retrieve_folder(folder_name).then(
        (f)->
            Folder = f
            Folder.write_text_file  file_name,
                "-- how many checking?: \nwrite a text file...\nnew line\n 1119"
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
            fm.retrieve_folder(folder_name)
    ).then(
        (f)->
            Folder = f
            p 'folder reget: ', Folder
    ).then(
        ()->
            stop()
    ).catch(
        (err)->
            p 'fuck, i caught you', err
            stop()
    )

        
    #    .then(
    #    ()->
    #        # get the folder refreshly
    #        fm.retrieve_folder(folder_name).then( (f)->
    #            Folder = f
    #        )
    #).then(
    #    ()->
    #        uuid_list = Folder.get_uuids(file_name)
    #        #assert uuid_list.length >= 1
    #        p "uuid_list.length: #{uuid_list.length}"
    #).then(
    #    ()->
    #        # read the file:
    #        Folder.read_file_by_name(file_name)
    #).then(
    #    (file_content)->
    #        p "this is the file contents?:\n", file_content
    #)

delete_a_file = () ->
    name = "txt19"
    name = "cat_music.gif"
    p "name: #{name}"

    fm.retrieve_folder(folder_name).then(
        (folder) ->
            p 'folder is not false' if folder?
            folder.delete_file name, (e,r)->
                p 'e,r: ', e,r
            
    ).then(
        stop
    ).catch(
        (err)->
            p 'err in delete a file: ',  err
            stop()
    )


delete_a_few_files = () ->
    names = ['tone2', 'txt9', 'txt23', 'txt28', 'ttwo-2']

    fm.retrieve_folder(folder_name).then(
        (folder) ->
            for n in names
                try
                    folder.delete_name(n).then(
                        (what)->
                            p "deleted #{n} ", what
                    )
                catch err
                    p "E, delete a few ? here name: #{n} ", err
                    "fuck.."

    ).then(
        stop
    )
    #    .catch(
    #    (err)->
    #        p 'err in delete a file: ',  err
    #        stop()
    #)


check_delete_name = () ->
    name = "ttwo-2"

    fm.retrieve_folder(folder_name).then(
        (folder) ->
            folder.delete_name(name).then(
                (what)->
                    p what
                    p "deleted? #{name}"
            )
    ).then(
        stop
    )


# not finish, it cause exception, 11-23
give_list = ()->
    username = folder_name

    fm.retrieve_folder(folder_name).then(
        (folder) ->
            promise_give = Promise.promisify folder.give_ul_renderring

            promise_give(username).then(
                (what)->
                    p 'u get what?'
                    p what
            )
    ).then(
        stop
    )


#
#
#delete_by_name = () ->
#    names = ['activities.txt', 'txt1108d', 'txt1']
#
#
#    fm.retrieve_folder(folder_name).then(
#        (folder) ->
#
#            function_list = names.map (name)->
#                return (callback)->
#                    folder.delete_file(name, callback)
#
#            async.series(function_list, (err, what)->
#                p 'woo waa: ', err, what
#                stop()
#            )
#
#    )
#
#
#
#check_can_have_member = () ->
#    fm.retrieve_folder(folder_name).then(
#        (folder) ->
#            #folder_meta = folder.get_meta()
#            
#            #keys = Object.keys(folder)
#            #p keys.sort()
#            #p folder
#            #p folder_meta
#
#            #mo = folder.members_obj
#            #p mo
#            #mo.show_members_file() if mo
#
#            #p folder
#            ##folder.members_obj.init_members_file()
#            #p  folder.members_obj.members_file_exists() ? 'exists' : 'not exists'
#    ).then(
#        stop
#    ).catch(
#        (err)->
#            p 'e r r: ',  err
#            stop()
#    )
#
## Check we can get folder object, and file object by it uuid
#check_to_get_file_meta_ul_list = () ->
#    fm.retrieve_folder(folder_name).then(
#        (folder) ->
#            uuid = test_uuids[0]
#            return new Promise( (resolve) ->
#                folder.get_file_obj_by_uuid(uuid).then(
#                    (file_obj) ->
#                        _meta = file_obj.get_meta()
#                        ul    = file_obj.convert_meta_to_ul()
#                        p ul
#                        resolve _meta
#                )
#            )
#            #p folder
#    ).then(stop)
##check_to_get_file_meta_ul_list().then(stop)
#
#
#
#pass_sample_file_meta = (fpath, callback) ->
#    #--
#    # This is to give a meta.  Be careful one file name can give meta array.
#    # The file name can be set in the follow:
#    #--
#
#    #fpath = 'abc/env-55'
#    fpath = fpath || 'abc/food.txt'
#
#    fm.get_file_meta_by_path(fpath, (err, what) ->
#        #p err, what
#        #p build_ul(what)
#
#        p "what is array: ", u.isArray(what)
#        sample_meta = what[0]
#        callback(null, sample_meta)
#        #p 'sample meta[name] : ', sample_meta["name"]
#        #stop()
#        #
#    )
#
##pass_sample_file_meta(null, (err, _meta) ->
##    p _meta
##    stop()
##)
#
#retrieve_a_file = ()->
#    filepath = "abc/folder.css"
#    fm.retrieve_file_obj(filepath, (err, file)->
#        #p err, file
#        file.read_to_string (str)->
#            p str
#            stop()
#    )
#
#
#read_a_file_by_uuid = ()->
#    name = 'txt1107a'
#    uuid = '02ff452f-f178-41d3-be54-ad69e3b6d3ea'
#    fm.retrieve_folder(folder_name).then(
#        (folder) ->
#            folder.read_file_by_uuid(uuid)
#    ).then(
#        (str)->
#            p str
#    ).then(
#        stop
#    ).catch(
#        (err)->
#            p "err in read a file by name checking", err
#            stop
#    )
#
#
#read_file_by_uuid = ()->
#    name = 'folder.css'
#    name = 'test-txt-a'
#    name = 'txt1107a'
#    fm.retrieve_folder(folder_name).then(
#        (folder) ->
#            folder.read_files_by_name(name)
#    ).then(
#        (arr_str)->
#            p arr_str
#    ).then(
#        stop
#    ).catch(
#        (err)->
#            p "err in read a file by name checking", err
#            stop
#    )
#
#
#write_and_read = ()->
#    name = 'txt1'
#    f = null
#    fm.retrieve_folder(folder_name).then(
#        (folder)->
#            f = folder
#            folder.write_text_file(name, "0238am read after write: \nwrite a text file\nabc \n new line\n 1108")
#    ).then(
#        (what)->
#            #p 'what we get from write the file: ', what
#    ).then(
#        ()->
#            #sleep 5 seconds
#            time = 15 * 1000
#            p 'sleep  mili-seconds ', time
#            return new Promise  (resolve)->
#                foo = ()->
#                    resolve('slept')
#                setTimeout(foo, time)
#    ).then(
#        ()->
#            fm.retrieve_folder(folder_name)
#    ).then(
#        (folder)->
#            f = folder
#    ).then(
#        (f)->
#            p ' ---- ' #, f
#            f.read_files_by_name(name)
#    ).then(
#        (str)->
#            p "text content:\n#{str}"
#    ).then(stop).catch(
#        (err)->
#            p 'err in write a text file: ', err
#            stop()
#    )
#
#
#
#
#
## to do, 15
#check_add_folder = () ->
#    folder_name = 'aa'
#
#    Meta   = null
#    Folder = null
#
#    fm.retrieve_folder(folder_name).then(
#        (folder) ->
#
#            Folder = folder
#            p folder
#            Meta = folder.get_meta()
#    ).then(
#        (meta)->
#            #Folder.promised_add_folder('test-add-folder')
#            p 'meta ', meta
#    ).then(
#        stop
#    ).catch(
#        (err)->
#            p 'e r r: ',  err
#            stop()
#    )
#
#check_init_home_15 = () ->
#    folder_name = 'aa'
#
#    Meta   = null
#    Folder = null
#
#    fm.init_home_folder_11_15(folder_name).then(
#        (f)->
#            p 'folder build: ', f
#            Meta = f.get_meta()
#            p 'meta: ', Meta
#
#    ).then(
#        stop
#    )



##
#- Do checkings:
##
#
check_to_get_folder()
#check_get_uuids()
#get_file_objs()
#check_details()
#clear_names()
#delete_a_file_by_uuid()
#read_a_few_files_by_name()
#write_a_text_file()
#test_read_write()
#delete_a_file()
#delete_a_few_files()
#check_delete_name()

#delete_by_name()

#check_to_get_file_meta_ul_list()
#check_can_have_member() #
#
#retrieve_a_file()
#read_a_file_by_uuid()

#write_and_read()

#check_add_folder()
#check_init_home_15()

#give_list()


