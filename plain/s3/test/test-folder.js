
var folder = require("../folder.js");
var p      = console.log;

var should = require("should");
//var u      = require("underscore");

describe('Mocha should run', function() {
    describe('check array indexOf works', function() {
        it('should return -1 when the value is not present', function() {
            [1,2,3].indexOf(5).should.equal(-1);
            [1,2,3].indexOf(0).should.equal(-1);
        });
    });
});


describe('be able to make s3key for path', function(){
    it('should make s3key', function(done){
        var dir = 'aa/bb/cc';

        folder.make_s3key_for_folder_meta_file(dir, function(err, s3key){
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
});

//function s3key(dir){
//    dir = dir || 'aa/bb/cc';
//
//    folder.make_s3key_for_folder_meta_file(dir, function(err, s3key){
//        p(err, s3key);
//    });
//}
//
//function new_folder(){
//    var owner = {
//        name : 'some-one',
//        id : 'some-one-28-feb-y6'
//    }
//
//    var patha = 'some-one/first';
//
//    folder.new_obj(patha, function(err, obj){
//        p(err, obj);
//        process.exit();
//    });
//}
//
//
//if(require.main === module){
//    //s3key();
//    new_folder();
//}
