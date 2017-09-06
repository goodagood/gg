
assert = require "assert"
u      = require "underscore"
path   = require "path"

Promise= require "bluebird"

# folder module
folder_module     = require "../aws/folder-v5.js"
file_module       = require "../aws/simple-file-v2.js"
msg               = require "../aws/simple-msg.js"
myutil            = require('../myutils/myutil.js')
myconfig =  require("../config/config.js")


# prepare this names to get the test
user_name   = 'abc'
#folder_name = 'aa'
folder_name = 'abc'
file_name   = 'txt22'

sample_msg_text = "
    hello,
        this is simle,
        msg,
        in testing,
        stupid
        as
        it is"

# this is funny and different from the true use case, where msg file name is sys generated.
test_msg_file_name = 'test-msg'

p = console.log
stop = () ->
    setTimeout process.exit, 500

prepare_testing_msg = ()->
    json = {
        from : user_name
        to   : user_name
        text : sample_msg_text
        uuid : myutil.get_uuid() #the uuid is going to be used by 2, to/from.
        timestamp : Date.now()
    }
    text = JSON.stringify json, null, 4 # use 4 space tab, and easy to read.

    # To 'to'
    owner = json.to
    # dir : user/goodagood/message
    dir   = path.join(owner, myconfig.message_folder)
    fname = test_msg_file_name
    file_module.write_text_file(owner, dir, fname, text).then(
        ()->
            # To 'from', i.e. clone to self
            owner = json.from
            dir   = path.join(owner, myconfig.message_folder)
            fname = fname
            file_module.write_text_file(owner, dir, fname, text)
    ).then(
        (what)->
            what
    )


describe "t-simple-msg.js, 1", () ->
    it "prepare a msg,", (done) ->
        this.timeout(35*1000)

        prepare_testing_msg().then(
            (what)->
                #p 'i dont know what: ', what
        ).then(stop)
        #msg.new_msg_file_obj(folder_name).then(
        #    (folder)->
        #        assert u.isObject folder
        #        assert not u.isEmpty folder
        #        assert u.isFunction folder.read_text_file
        #        assert u.isFunction folder.write_text_file
        #        assert u.isFunction folder.get_meta
        #        #assert u.isObject   folder.members_obj
        #        return folder.get_meta()
        #).then(
        #    (meta)->
        #        assert u.isObject meta
        #        #p 'meta: ', meta
        #        #assert not u.isEmpty meta
        #).then(
        #    ()->
        #        done()
        #)


