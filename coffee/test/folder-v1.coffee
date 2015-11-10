
u      = require 'underscore'
assert = require 'assert'

folder = require '../aws/folder-v1.js'

p      = console.log


# the folder list and a single one that can be used in tests
folder_list = ['abc', ]
#
folder_name = 'abc'


describe 'coffee test mocha is working,', ->
    it  'can make a few assert exception to make sure it keeps firing, ', ->
        assert.equal(1, 1, 'obviously equal')
        assert.ok(true, 'obviously ok')
        assert.ok('ok', 'obviously ok')
        #assert.equal(1, 2, 'obviously not equal')

describe 'new folder testing,', ->
    it  'get non-empty instance, has meta ', (done) ->
        folder.make_s3folder(folder_name, (err, f) ->
            assert(not u.isEmpty f )
            f.retrieve_old_folder_meta( (err, what) ->

                m = f.get_meta()
                #p m
                # the meta is an object now.
                assert(u.isObject m)
                assert not u.isEmpty(m.files)
                done()
            )
        )


