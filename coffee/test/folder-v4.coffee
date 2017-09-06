
assert = require "assert"
u      = require "underscore"

Promise= require "bluebird"

fv4    = require "../aws/folder-v4.js"


folder_name = 'abc'

p = console.log
stop = () ->
    setTimeout process.exit, 500

describe "test (v4) folder-v4.js,", () ->
    it "should gives object,", (done) ->
        fv4.make_s3folder_v4a(folder_name).then(
            (folder)->
                assert not u.isEmpty folder
                assert u.isFunction folder.read_text_file
                assert u.isFunction folder.write_text_file
                assert u.isObject   folder.members_obj

                return folder.get_meta()
        ).then(
            (meta)->
                assert u.isObject meta
                assert not u.isEmpty meta
        ).then(
            ()->
                done()
        )


describe "folder-v4.js, 2,", () ->
    it "can we use it for sure? 1031,", (done) ->
        fv4.make_s3folder_v4a(folder_name).then(
            (folder)->
                assert folder.file_exists 'goodagood'
                assert not folder.file_exists 'what-the-fuck---'
                done()
        )



describe "test (v4) folder-v4.js,", () ->
    it "test delete in hash,", (done) ->
        a = { a:1, b:2, c: [1,2,3], d:{da:1, db:2}}
        len = Object.keys(a).length
        assert len > 1

        delete a['a']
        assert not a['a']?
        assert a['b']?
        delete a['d']['da']
        assert not a['d']['da']?
        assert a['d']['db']?
        #assert false
        done()


# can we get folder:
describe "check to get folder", () ->
    it "get folder", (done)->
        fv4.make_s3folder_v4a(folder_name).then(
            (folder) ->
                assert u.isObject folder
                assert not u.isEmpty folder
                #meta = folder.get_meta()
        ).then(
            done()
        )


## doing
#describe "folder-v4.js, write file", () ->
#    it "try to test plain file writing and reading,", (done) ->
#        
#        this.timeout(35*1000) # set the long time run
#        file_name = 'ttwo-2'
#        folder = null
#
#        fv4.make_s3folder_v4a(folder_name).then(
#            (f)->
#                folder = f
#                assert not u.isEmpty folder
#                folder.write_text_file  file_name, "ttwo, i am check: \nwrite a text file\nabc \n new line\n 1108"
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
#                fv4.make_s3folder_v4a(folder_name).then( (f)->
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
#                fv4.make_s3folder_v4a(folder_name)
#        ).then(
#            (f)->
#                folder = f
#                ## to do: assert the file got deleted, 11-15
#        ).catch(
#            (err)->
#                p 'fuck, i caught you', err
#                done()
#        )
#
#        #p "why you come here?"
#        #done()



