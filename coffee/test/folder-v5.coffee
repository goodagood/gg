
assert = require "assert"
u      = require "underscore"

Promise= require "bluebird"

# folder module
fm     = require "../aws/folder-v5.js"


#################################################
# 
#   Prepare this names to get the test:
#
#################################################
#
#folder_name = 'aa'
folder_name = 'abc'
file_name   = 'txt22'
file_path   = 'abc/txt22'


p = console.log
stop = () ->
    setTimeout process.exit, 500


describe "folder-v5.js, 1", () ->
    it "should gives object,", (done) ->
        this.timeout(35*1000) # set the long time run
        fm.make_s3folder(folder_name).then(
            (folder)->
                assert u.isObject folder
                assert not u.isEmpty folder
                assert u.isFunction folder.read_text_file
                assert u.isFunction folder.write_text_file
                assert u.isFunction folder.get_meta
                #assert u.isObject   folder.members_obj
                return folder.get_meta()
        ).then(
            (meta)->
                assert u.isObject meta
                #p 'meta: ', meta
                #assert not u.isEmpty meta
        ).then(
            ()->
                done()
        )


describe "folder-v5.js, 1.1", () ->
    it "retrieve folder object,", (done) ->
        fm.retrieve_folder(folder_name).then(
            (folder) ->
                assert not u.isEmpty folder
                meta = folder.get_meta()
        ).then(
            (meta)->
                assert not u.isEmpty meta
                assert u.isString meta.name
                done()
        )

describe "folder-v5.js, 1.2", () ->
    it "is owner", (done) ->
        fm.retrieve_folder(folder_name).then(
            (folder) ->
                assert not u.isEmpty folder
                assert folder.is_owner(folder_name) # happened to be same for root
                done()
        )


describe "folder-v5.js, 1.3", () ->
    it "can we use it for sure? 1031,", (done) ->
        fm.retrieve_folder(folder_name).then(
            (folder)->
                assert folder.file_exists 'goodagood'
                assert not folder.file_exists 'what-the-fuck---'
                done()
        )


describe "folder-v5.js, 2", () ->
    it "we can get meta?", (done) ->
        fm.make_s3folder(folder_name).then(
            (folder)->
                assert not u.isEmpty folder
                assert u.isFunction folder.add_folder

                #folder.add_folder('test')
                folder.promise_to_retrieve_saved_meta()

        ).then(
            (meta)->
                assert u.isObject meta
                assert not u.isEmpty meta
                assert u.isString meta.name
                assert u.isString meta.path
                #p 'meta: ', meta
        ).then(
            ()->
                done()
        )


describe "folder-v5.js, 3", () ->
    it "should get file uuid,", (done) ->
        #this.timeout(35*1000) # set the long time run
        # By name to get file objects.
        name = file_name
        fm.retrieve_folder(folder_name).then(
            (folder) ->
                folder.get_file_objs_by_name(name, (err, objs) ->
                    assert objs.length >0
                    one = objs[0]
                    #p err, objs
                    u.each objs, (o)->
                        #p o.get_meta()['name'], o.get_meta()['uuid']
                        n    = o.get_meta()['name']
                        uuid = o.get_meta()['uuid']
                        assert u.isString n
                        assert u.isString uuid


                )

        ).then(
            ()->
                done()
        )


describe "folder-v5.js, 4", () ->
    it "should get meta of files,", (done) ->
        this.timeout(35*1000) # set the long time run

        Meta   = null
        Folder = null
    
        fm.retrieve_folder(folder_name).then(
            (folder) ->
                Meta = folder.get_meta()
                files= Meta.files
                keys = Object.keys files
                assert keys.length > 0

                for k,v of files
                    assert u.isString k
                    if v.name == 'goodagood'
                        #p k
                        #p v
                        assert u.isObject v
                        assert not u.isEmpty v
                        assert u.isString v.name
                #p util.inspect Meta.files, {depth:null}
        ).then(
            ()->
                done()
        )



## doing
#describe "folder-v5.js, 5, write file", () ->
#    it "try to test plain file writing and reading,", (done) ->
#        file_name = 'test04'
#        text = '\nin testing,\n1204,\n2014\nwrite a text file,\nthen delete it.\n'
#        
#        this.timeout(35*1000) # set the long time run
#
#        folder = null
#
#        fm.retrieve_folder(folder_name).then(
#            (f)->
#                folder = f
#                assert not u.isEmpty folder
#                folder.write_text_file  file_name, text
#                folder
#        ).then(
#            (results_from_writting)->
#                p  "results_from_writting #{results_from_writting}"
#        ).then(
#            ()->
#                p 'keep some time away: '
#                sleep = 15 # in seconds
#                return new Promise (resolve)->
#                    foo = ()->
#                        resolve 1
#                    setTimeout(foo, sleep*1000)
#        ).then(
#            ()->
#                p 'get the folder refreshly'
#                fm.make_s3folder(folder_name).then( (f)->
#                    folder = f
#                )
#
#        ).then(
#            ()->
#                uuid_list = folder.get_uuids(file_name)
#                assert uuid_list.length >= 1
#                p "uuid_list.length: #{uuid_list.length}"
#                done()
#        ).then(
#            ()->
#                folder.delete_name(file_name)
#        ).then(
#            ()->
#                fm.make_s3folder(folder_name)
#        ).then(
#            (f)->
#                folder = f
#                ## to do: assert the file got deleted, 11-15
#                done()
#        ).catch(
#            (err)->
#                p 'fuck, i caught you', err
#                #done()
#        )
#
#        #p "why you come here?"
#        #done()


describe "folder-v5.js, 6", () ->
    it "get uuids by name,", (done) ->
        #this.timeout(35*1000) # set the long time run

        assert u.isFunction fm.get_file_uuid
        assert u.isString file_path
        done()
        #fm.get_file_uuid file_path, (err, ids) ->
        #    assert not err
        #    assert u.isArray ids
        #    assert ids.length >= 1
        #    console.log err, ids
        #    done()



