
var myfolder = require('./folder.js');

var log78 = require('../myutils/mylogb.js').simple_log( '/tmp/log78' );
var test = require('nodeunit');


function test_retrieve_folder(){
  retrieve_folder('abcd', function(folder){
    if(!folder){
      console.log('not a folder?');
      return;
    }
    console.log(folder);
  });
}
//exports.test_retrieve_folder = test_retrieve_folder;


function test_retrieve_folder_meta(test){

  myfolder.retrieve_folder_meta('abc', function(meta){
    //if(!meta){
    //  console.log('not a meta?');
    //  return;
    //}

    test.ok(true, 'test working');
    test.done();
    console.log(meta);
  });

  myfolder.retrieve_folder_meta('abcd', function(meta){
    //if(!meta){
    //  console.log('not a meta?');
    //  return;
    //}

    test.ok(true, 'test working');
    test.done();
    console.log(meta);
  });
}
//exports.test_retrieve_folder_meta = test_retrieve_folder_meta;


function test_simple(test){
  //test.ok(false, 'this is to fail');
  test.expect(1);
  test.ok(true, 'this is to pass');
  //test.ok(false, 'this is to NOT pass');
  test.done();
}

exports.test_simple = test_simple;

// vim: set et ts=2 sw=2 fdm=indent:
