//
// All storage object will include same interface:
//   read, write, remove.
// 

var bucket = require('./bucket.js');

var secrets  =  require("../config/secret-dir.js");
var aws_conf =  secrets.conf.aws;

function make_s3storage(_meta, callback){
  // 's3storage' represents a single s3 object, it trys to offer unified
  // api to read, write, delete storage.
  //
  // @_meta is in closure, of course.
  
  function _meta_ok(){
    if(typeof _meta.key !== 'string') return false;
    if( /^\s*$/.test(_meta.key) ) return false;

    if(_meta.type !== 's3') return false; //?

    return true;
  }

  function _set_s3_obj_key(s3key){
    _meta.key = s3key;
    _meta.type= 's3';
  }

  function _get_s3_obj_key(){
    if( _meta.type === 's3'){
      if( typeof _meta.key !== 'undefined') return _meta.key;
    }
  }

  var AWS = require('aws-sdk');

  function _get_read_stream(){

    var s3 = new AWS.S3();
    var params = {Bucket: aws_conf.root_bucket, Key: _meta.key};

    // get s3 object, read the stream and pipe it to target stream
    return s3.getObject(params).createReadStream();
  }

  function _remove(callback){
    if(!_meta.key) callback('no key', null);
    bucket.delete_object(_meta.s3key, callback); // cb is called from aws-sdk.
  }

  return {
    get_meta : function(){return _meta;},
    meta_ok  : _meta_ok,
    remove   : _remove,
    //write  : _write,

    write_s3_obj_key : _set_s3_obj_key,
    set_s3_obj_key   : _set_s3_obj_key,

    read_s3_obj_key  : function(){return _meta.key;},
  };
}


module.exports.make_s3storage  = make_s3storage;
