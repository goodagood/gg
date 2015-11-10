# 
# Testing check user name,
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






# failed 1209
describe "t-simple-file-v3, 1", () ->
    it "get file list", (done)->
        file_name = 'goodagood'

        fm.retrieve_promisified_folder(folder_path).then(
            (folder)->
                assert u.isObject folder
                folder.get_file_objs_by_name(file_name, (e, objs)->
                    #p 'get file objs by name: ', e, objs
                    
                    assert u.isArray objs
                    u.each objs, (o)->
                        if o
                            o.read_to_string()  #?
                    done()
                )
        )
        #    .catch(
        #    (err)->
        #        p 'got : ', err
        #        assert err
        #)

describe "t-simple-file-v3, 2", () ->
    it "get one file '.gg.members.json'", (done)->
        file_name = '.gg.members.json'

        fm.retrieve_promisified_folder(folder_path).then(
            (folder)->
                assert u.isObject folder
                folder.get_file_objs_by_name(file_name, (e, objs)->
                    assert not e
                    meta0 = objs[0].get_meta()
                    assert u.isObject meta0

                    #p 'get file objs by name: ', e, objs
                    #p 'length: ', objs.length
                    #p 'the 1st meta: ',  objs[0].get_meta()
                    
                    # fuck we get using async to give single 'done' call
                    async.map(
                        objs
                        ,(o, callback)->
                            #p o.get_meta()
                            o.read_to_string(  (e,s)->
                                #p 'e is : ', e
                                assert not e
                                #p 'read to string in 2: e,s: ', e,s
                                #p 'read to string, typeof s: ', typeof s
                                assert u.isString s
                                callback(null, s)
                            )
                        ,(err, results)->
                                done()
                    )
                )
        )


describe "t-simple-file-v3, 3", () ->
    it "get one file 'folder.css'", (done)->
        file_name = 'folder.css'

        fm.retrieve_promisified_folder(folder_path).then(
            (folder)->
                assert u.isObject folder
                folder.get_file_objs_by_name(file_name, (e, objs)->
                    assert not e
                    meta0 = objs[0].get_meta()
                    assert u.isObject meta0

                    #p 'get file objs by name: ', e, objs
                    #p 'length: ', objs.length
                    #p 'the 1st meta: ',  objs[0].get_meta()
                    
                    u.each objs, (o)->
                        #p 'o: ', o
                        #p o.get_meta()
                        o.read_to_string( (e,s)->
                            #p 'e is : ', e
                            assert not e
                            #p 'read to string: e,s: ', e,s
                            #p 'read to string, typeof s: ', typeof s
                            assert u.isString s
                            done()
                        )
                )
        )








