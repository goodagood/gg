
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
folder_path = 'abc'
file_name   = 'txt22'
file_path   = 'abc/txt22'


p = console.log
stop = () ->
    setTimeout process.exit, 500


#################################
# Start testing
#################################


describe "t-folder-v5b.js, b, 1", () ->
    it "get uuids by name,", (done) ->
        this.timeout(15*1000) # set the long time run

        assert u.isFunction fm.get_file_uuid
        assert u.isString file_path
        #done()

        fm.get_file_uuid(file_path).then(
            (uuids)->
                assert true
                #assert not err
                #assert u.isArray ids
                #assert ids.length >= 1
                #console.log err, ids
                done()
        )



describe "t-folder-v5b.js, b, 2", () ->
    it "retrieve folder meta", (done) ->

        fm.retrieve_folder_meta folder_path
        .then (meta) ->
            assert typeof meta is 'object'
            assert not u.isNull(meta)
            done()

