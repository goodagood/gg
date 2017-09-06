# 
# Testing the promisifyAll -ed methods
#

assert = require "assert"
u      = require "underscore"
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
folder_name = 'abc'
folder_path = 'abc'
root_name   = 'abc'
gg_folder_name = 'goodagood'
new_folder_name= 'test'
file_name   = 'txt22'
file_path   = 'abc/txt22'


p = console.log
stop = () ->
    setTimeout process.exit, 500


#################################
# Start testing
#################################





# add folder testing not finished:

#describe "t-folder-v5d, 1", () ->
#    Obj = null
#    Meta= null
#    Nobj= null
#    Nmeta = null
#    new_folder_path = path.join(folder_path, new_folder_name)
#    p 'new_folder_path: ', new_folder_path
#    assert u.isString new_folder_path
#
#    it "add folder", (done) ->
#        #this.timeout(33*1000)
#
#        fm.retrieve_promisified_folder(folder_path).then(
#            (obj)->
#                Obj = obj
#                Meta= Obj.get_meta()
#                p "name: #{Meta.name}"
#                #obj.add_folder(new_folder_name)
#        ).then(
#            (nobj)->
#                Nobj = nobj
#                done()
#        )
#
#    #it "retrieve the added folder", (done) ->
#    #    this.timeout(66*1000)
#
#    #    data.wait(25).then(
#    #        ()->
#    #            fm.retrieve_promisified_folder(new_folder_path)
#    #    ).then(
#    #        (folder)->
#    #            assert folder?
#    #            meta = folder.get_meta()
#    #            assert meta.path is new_folder_path
#    #    )


describe "t-folder-v5d, 2", () ->
    it "build file list", (done)->

        fm.retrieve_promisified_folder(folder_path).then(
            (folder)->
                folder.build_file_list()
                folder.save_meta_promised()
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


