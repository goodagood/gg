var path   = require('path');
var u      = require('underscore');
var test   = require('nodeunit');

var s3folder = require('./folder.js');
var s3file = require('./file.js');

var social = require('./social.js');

var myconfig =   require("../config/config.js");


function test_add_member(fpath, member_name){
  fpath = fpath || 'tmp';
  //s3folder.retrieve_folder(fpath, console.log);

  s3folder.retrieve_folder(fpath, function(fobj){
    var meta = fobj.get_meta();
    fobj.add_member(member_name);
    console.log(meta);
  });
}

function test_get_people_file_obj(){
  social.get_people_file_obj('tmpd', function(pfobj){
    var json = pfobj.get_json();

    console.log(pfobj.get_meta());
  });
}

function test_clear_current_people(){
  var username = 'tmpd';
  social.get_people_file_obj(username, function(pfobj){
    pfobj.get_json(function(json){
      console.log(json);
      json.current = [];
      pfobj.write_json(json);
      social.write_people_file_obj(username, pfobj, function(err, what){
        console.log(err);
        console.log(what);
      });
    });

    //console.log(pfobj);
    //console.log(pfobj.get_meta());
  });
}

function test_get_current_people(){
  var username = 'tmpd';
  social.get_people_file_obj(username, function(pfobj){
    pfobj.get_json(function(json){
      console.log(json);
      json.current = [];
      pfobj.write_json(json);
      social.write_people_file_obj(username, pfobj, function(err, what){
        console.log(err);
        console.log(what);
      });
    });

    //console.log(pfobj);
    //console.log(pfobj.get_meta());
  });
}

if(require.main === module){
  //test_add_member('tmp/teama', 'abc');
  //test_get_people_file_obj();
  test_clear_current_people();

}


// vim: set et ts=2 sw=2 fdm=indent:
