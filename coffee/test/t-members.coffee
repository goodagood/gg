

assert = require "assert"
u      = require "underscore"
path   = require "path"

Promise= require "bluebird"

members= require "../aws/members.js"

p = console.log

test_folder_path = 'abc'


#describe "t-members, 1", () ->
#    it "hi", (done)->
#        members.retrieve_member_obj(test_folder_path).then(
#            (obj)->
#                obj.show_members_file()
#        ).then(
#            (text)->
#                p text
#                done()
#        )


check_member_file_exists = (dir)->
    #
    dir = dir || test_folder_name

    members.promised_member_obj(dir).then(
        (mobj)->
            mobj.check_members_file_exists()
    ).then(
        (exists)->
            p "exists: #{exists}"
    ).then(stop)
    

# testing functions:
check_init_folder = (dir)->
    #make_members_obj(dir)
    members.promised_member_obj(dir).then(
        (mobj)->
            p '1 member object: ', mobj
            mobj
    ).then(
        (mobj)->
            mobj.init_folder()
    ).then(
        (folder)->
            p '3 folder:'
            folder
    ).then(
        (f)->
            fm = f.get_meta()
            p 'name: ', fm.name
            p 'uuid: ', fm.uuid

    ).then( stop)
