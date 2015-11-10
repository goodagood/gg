//
// For file size not big, it will save querying cost if file is put into
// meta file.  
//
// to be done, 0911
//

var s3storage = require('./s3storage.js');

var bucket = require('./bucket.js');

function make_middle_storage(_meta, callback){
  s3storage.make_s3storage(_meta, function(err, basic_storage){
    function _upgrade_from_basic_s3_storage(callback){
      if(_meta.type !== 's3') return callback('not simple s3 storage', null);

    }
  });
}

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
