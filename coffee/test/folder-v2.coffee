
u      = require 'underscore'
assert = require 'assert'

folder = require '../aws/folder-v2.js'

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
    it  'get non-empty instance, has meta ', ->
        f = new folder.S3Folder('kkk')
        assert(not u.isEmpty f )

        m = f.get_meta()
        #p m
        # the meta is an object now.
        assert(u.isObject m)


###
describe 'Retrieve folder,' , ->
    name = folders[0]
    it 'should get folder obj,', (done) ->
      s3folder.retrieve_folder  name, (err, folder_obj) ->
          assert not  err, "err after retrieve folder: #{name}" + name
          assert not  u.isNull(folder_obj), 'folder should not be null'

          meta = folder_obj.get_meta()

          assert(typeof meta != 'undefined')
          assert u.isObject(meta)
          assert not u.isNull (meta)
          done()
###
