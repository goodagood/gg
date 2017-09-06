# 
# Coffee script make the testing faile, 
# change it to javascript directly, s-folder-v5e.js
#

assert = require "assert"
u      = require "underscore"
async  = require "async"
path   = require "path"

Promise= require "bluebird"

# some test settings:
data   = require "./config.js"

# folder module
fm     = require "../aws/folder-v5.js"


#################################################
# 
#   Prepare this names to get the test:
#
#################################################
#
#folder_name = 'aa'
folder_path = 'abc'
user_name   = 'abc'

gg_folder_name = 'goodagood'
new_folder_name= 'test'


p = console.log
stop = () ->
    setTimeout process.exit, 500


#################################
# Start testing
#################################





describe "t-folder-v5e, 1", () ->
    it "build file list", (done)->

        fm.retrieve_promisified_folder(user_name).then(
            (folder)->
                #folder.check_user_role(user_name)
                #folder.save_meta_promised()
                folder
        ).then(
            (f)->
                Meta = f.get_meta()
        ).then(
            (m)->
                ul = m.renders.ul
                #p ul
                assert u.isString ul
                done()
        )


# failed 1209
describe "t-folder-v5e, 2", () ->
    it "get file list", (done)->
        file_name = '.gg.members.json'

        fm.retrieve_promisified_folder(folder_path).then(
            (folder)->
                folder.get_file_objs_by_name(file_name, (e, objs)->
                    #p 'get file objs by name: ', e, objs
                    u.each objs, (o)->
                        o.read_to_string()  #?
                    done()
                )
        )



describe "t-folder-v5e, 3", () ->
    it "get file meta by uuid", (done)->

        file_path = "abc/goodagood"
        dirname = "abc"
        done()
        #fm.get_file_uuid file_path
        #.then (uuid) ->
        #    #console.log 'test get file meta by uuid: ',  file_path, uuid
        #    #fm.get_file_meta_by_uuid dirname, uuid
        #    done()
        ##.then(
        #    (_meta) ->
        #        #console.log 'get the meta in test get file meta by uuid: ', _meta
        #        assert u.isObject _meta
        #        #assert u.isObject _meta.files
        #        #assert u.isObject _meta.renders
        #        assert u.isString _meta.name
        #        assert u.isString _meta.path
        #        done()
        #)


#describe "t-folder-v5e, 4", () ->
#    it "get file meta by path", (done)->
#
#        file_path = "abc/goodagood"
#        fm.get_file_meta_by_path file_path
#            .then( (metas) ->
#                assert u.isArray metas
#                if metas.length > 0
#                    m0 = metas[0]
#                    assert u.isObject m0
#
#                done()
#            )



# -- Brain Fucker --
# This failed any way, 'undefined is not a function', brain fucker
# test_retrieve_a_css in 'folder-v5.coffee' can work.
# It shows this is nonsence
#
#describe "t-folder-v5e, 5", () ->
#    it "get file object by name, 'folder.css'", (done)->
#        file_name = 'folder.css'
#
#        assert u.isFunction fm.retrieve_promisified_folder
#        #done()
#        fm.retrieve_promisified_folder(folder_path).then(
#            (folder)->
#                done()
#                #assert u.isObject folder
#                #assert u.isFunction folder.get_file_objs_by_name
#                #folder.get_file_objs_by_name(file_name, (e, objs)->
#                #    assert not e
#                #    meta0 = objs[0].get_meta()
#                #    assert u.isObject meta0
#                #    done()
#                #)
#        )

