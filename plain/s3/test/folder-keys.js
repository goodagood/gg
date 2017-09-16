
var should = require("should");
var u      = require("underscore");

var keys   = require("../folder-keys.js");
var p      = console.log;

describe('keys for folder, put calculation into folder-keys.js', function(){
    var dir = 'aa/bb/cc';

    it('should make s3key', function(done){

        keys.make_s3key_for_folder_meta(dir, function(err, s3key){
            should.not.exist(err);
            should.exist(s3key);
            //true.should.be.exactly(false);
            //u.areYouDoThis().should.be.exactly(true);
            console.log("is string 'aaa' : ", u.isString('aaa'));
            u.isString(s3key).should.be.exactly(true);
            u.isEmpty (s3key).should.be.exactly(false);
            done();
        });
    });

    it('should make key for name space', function(done){
        var folder_info = {
            uuid: 'xxxsome-fake-uuid-473092',
            owner_name: 'aa-name',
            owner_id: 'aa-id',
            owner: {
                name:  'aa-name-in-owner-obj',
                id: 'aa-id-in-owner-obj',
            }
        };

        keys.make_s3key_for_folder_name_space(folder_info, function(err, s3key){
            should.not.exist(err);
            should.exist(s3key);
            //true.should.be.exactly(false);
            //u.areYouDoThis().should.be.exactly(true);
            //console.log("is string 'aaa' : ", u.isString('aaa'));
            console.log("is string 's3key' : ", u.isString('s3key'), s3key);
            u.isString(s3key).should.be.exactly(true);
            u.isEmpty (s3key).should.be.exactly(false);
            done();
        });
    });
});

