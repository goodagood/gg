//var mocha  = require('mocha');
var assert = require('assert');
var async  = require('async');

var path   = require('path');
var u      = require('underscore');
//var test   = require('nodeunit');

var s3folder = require('../aws/folder-v1.js');
var s3file   = require('../aws/simple-file.js');

var myconfig  =   require("../config/config.js");

var fappend   = require('../myutils/mylogb.js').append_file;
var afile     = '/tmp/a9.log';

var folders = ['abc',];

describe('test mocha is working,', function(){
  it('can make a few assert exception to make sure it keeps firing, ', function(){
    assert.equal(1, 1, 'obviously equal');
    //assert.equal(1, 2, 'obviously not equal');
  });
});

describe('Retrieve folder,', function(){
  var name = folders[0];
  it('should get folder obj,', function(done){
    s3folder.retrieve_folder(name, function(err, folder_obj){
        assert(! err, 'err after retrieve folder: ' + name);
        assert(! u.isNull(folder_obj), 'folder should not be null');

        var meta = folder_obj.get_meta();
        assert(typeof meta !== 'undefined');
        assert(u.isObject(meta));
        assert(!u.isNull (meta));
        done();
    });
  });

});


describe('try to test multiple async calls,', function(){
  var names = ['abc', 'goodagood'];
  it('should get EACH folder obj,', function(done){
    async.map(
      names, 
      s3folder.retrieve_folder, 

      function(err, folder_objs){
        assert(! err, 'err after retrieve folder: ' );
        assert(! u.isNull(folder_objs), 'folder should not be null');
        assert( u.isArray(folder_objs), 'folder list should be array');
        describe('see each folder,', function(){
          u.each(folder_objs, function(fobj){
            var meta = fobj.get_meta();
            assert(u.isObject(meta));
            //fappend(afile, meta);
          });
          done();
        });
      }

    );

  });

});




// vim: set et ts=2 sw=2 fdm=indent:
