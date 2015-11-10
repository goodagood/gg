
#mocha  = require('mocha')
assert = require('assert')
async  = require('async')

path   = require('path')
u      = require('underscore')
#test   = require('nodeunit')

s3folder = require('../aws/folder-v1.js')
s3file   = require('../aws/simple-file.js')


fappend   = require('../myutils/mylogb.js').append_file
afile     = '/tmp/a9.log'

folders = ['abc',]


###
describe 'coffee test mocha is working,', ->
    it  'can make a few assert exception to make sure it keeps firing, ', ->
        assert.equal(1, 1, 'obviously equal')
        #assert.equal(1, 2, 'obviously not equal')
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
describe('try to test multiple async calls,', function(){
  names = ['abc', 'goodagood']
  it('should get EACH folder obj,', function(done){
    async.map(
      names, 
      s3folder.retrieve_folder, 

      function(err, folder_objs){
        assert not  err, 'err after retrieve folder: ' )
        assert not  u.isNull(folder_objs), 'folder should not be null')
        assert( u.isArray(folder_objs), 'folder list should be array')
        describe('see each folder,', function(){
          u.each(folder_objs, function(fobj){
            meta = fobj.get_meta()
            assert(u.isObject(meta))
            #fappend(afile, meta)
          })
          done()
        })
      }

    )

  })

})

###


# vim: set et ts=2 sw=2 fdm=indent:
