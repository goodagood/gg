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




describe "t-folder-v5c, 1", () ->
    it "promisify the methods in folder obj", (done) ->
        #this.timeout(20*1000)
        fm.make_promisified_s3folder(data.config.folder_path).then(
            (obj)->
                assert obj.init?
                assert obj.init_promised?
                assert not obj.promise_to_retrieve_saved_meta_promised?
                done()
        )

    it "folder obj can do: init", (done) ->
        name = 'test-folder-not-save'
        opt = {
            name : name
            path : path.join data.config.user_name, name
        }
        fm.make_s3folder(data.config.folder_path).then(
            (folder)->
                assert u.isObject folder
                assert not u.isEmpty folder
                folder.init(opt)
        ).then(
            (meta)->
                assert u.isObject meta
                assert not u.isEmpty meta
                # We can get the file name in the key:
                #p meta.meta_s3key.indexOf(name)
                assert meta.meta_s3key.indexOf(name) >= 0
                #p meta
                done()
        )


describe "t-folder-v5c, 2, folder goodagood should exists ", () ->
    it "test retrieve gg folder obj", (done) ->
        gg_folder_path = path.join root_name, gg_folder_name
        fm.retrieve_folder(gg_folder_path).then(
            (folder)->
                assert not u.isNull folder
                meta = folder.get_meta()
        ).then(
            (meta)->
                #p meta.renders
                assert u.isString meta.name
                assert meta.name is 'goodagood'
                done()
        )

describe "t-folder-v5c, 2.1 ", () ->
    it "test gg folder to build file list", (done) ->
        this.timeout(10*1000)

        gg_folder_path = path.join root_name, gg_folder_name
        Folder = null
        fm.retrieve_promisified_folder(gg_folder_path).then(
            (folder)->
                Folder = folder
                assert u.isFunction folder.retrieve_saved_meta_promised
                folder.list_files_and_save_promised()
        ).then(
            (folder)->
                meta = Folder.get_meta()
                #p '2 ', meta.renders
                assert meta.renders.ul.indexOf('glyphicon-folder') > 0
                done()
        )



describe "t-folder-v5c, 3", () ->
    it "test retrieve msg folder obj", (done) ->
        gg_folder_path = path.join root_name, gg_folder_name

        fm.retrieve_folder(gg_folder_path).then(
            (folder)->
                meta = folder.get_meta()
        ).then(
            (meta)->
                #p meta.renders
                assert u.isString meta.name
                done()
        )






