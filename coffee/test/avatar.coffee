
assert = require "assert"
u      = require "underscore"

avatar = require '../users/avatar.js'

username = 'abc'


describe "test avatar.js (user),", () ->
    it "should gives object,", (done) ->
        avatar.make_user_obj username, (user) ->
            assert not u.isEmpty(user)
            #console.log(user)
            #return exit() if not user
            user.pass_attr (err, attrs) ->
                assert u.isNull(err)
                assert not u.isNull(attrs)
                assert not u.isEmpty(attrs)
                done()


describe "test avatar.js,", () ->
    it "flag can be up,", (done) ->
        avatar.make_user_obj( username, (user) ->
            user.flag_up  'test-flag',  (ok, flag_down) ->
                assert(ok, 'flag should be up')
                flag_down() if(ok)
                done()
        )



