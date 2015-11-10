var u      = require('underscore');
var path   = require('path');
var stream = require('stream');

var bucket = require('./bucket.js');
//var ft     = require('../myutils/filetype.js');
var myutil = require('../myutils/myutil.js');

//var myconfig =   require("../config/config.js");
var s3folder = require("./folder-v5.js");
var txtfile   = require("./text-file-v1.js");


function new_json_file_obj(file_meta, pass_file_obj){
  //
  //
  
  var meta = file_meta;

  txtfile.new_text_file_obj(meta, function(err, file_obj){
    //
    // Based on text file object.
    //


    function _get_json(callback){
      file_obj.read_file_to_string(function(text){
        //console.log('text: ', text);
        if(!text) return callback(null);
        var j = JSON.parse(text);
        callback(j);
      })
    }

    function _write_json(ajson, callback){
      var text = JSON.stringify(ajson, null, 4);
      //console.log('text:', text);

      file_obj.feed_in_text(text, callback);
    }

    function _set_up_from_json(ajson){
      // do more than write the json, when there is a raw file to build.
      // But name, path, content must be prepare else where.
      _write_json(ajson);
      file_obj.calculate_meta_defaults();
      file_obj.render_html_repr();
    }


    // Object with new functionalities
    var new_obj = {
      get_json : _get_json,
      write_json : _write_json,
      set_up_from_json : _set_up_from_json,
    };

    u.defaults(new_obj, file_obj);
    if(typeof meta.html.li === 'undefined')  new_obj.render_html_repr();
    pass_file_obj(null, new_obj);
  });

}


function test_json_file (folder_path, name, content){
  folder_path = folder_path || 'abc';
  //name   = name   || 'json-file-' + Date.now().toString() + '.json';
  name   = name   || 'json-file.json';
  content= content|| [1, 2, 3, 'a string', {a:1, b:2}];

  var file_meta = {
    name : name,
    folder_path : folder_path,
    filetype : 'json',
  };
  console.log(file_meta);

  new_json_file_obj(file_meta, function(file_obj){
    // feed in json will give storage
    file_obj.write_json(content);
    file_obj.calculate_meta_defaults();
    file_obj.render_html_repr();

    var file_meta = file_obj.get_meta();
    s3folder.retrieve_folder(file_meta.folder_path, function(folder){
      folder.add_file(file_meta);
      folder.save_meta();
    });

    //console.log(file_obj.get_meta());
    //console.log(file_obj);
  });

}


function test_json_file_b (folder_path, name, content){
  folder_path = folder_path || 'abc';
  //name   = name   || 'json-file-' + Date.now().toString() + '.json';
  //name   = name   || 'json-b';
  name   = name   || 'json-b.json';
  content= content|| [1, 2, 3, 'a string', 'b string', {a:1, b:2}];

  var file_meta = {
    name : name,
    folder_path : folder_path,
    filetype : 'json',
  };
  console.log(file_meta);

  new_json_file_obj(file_meta, function(err, file_obj){
    file_obj.set_up_from_json(content);

    var file_meta = file_obj.get_meta();
    s3folder.retrieve_folder(file_meta.folder_path, function(folder){
      folder.add_file(file_meta);
      folder.save_meta();
    });

    //console.log(file_obj.get_meta());
    //console.log(file_obj);
  });

}


function test_read_json(file_path){
  file_path = file_path || 'abc/json-file.json';
  s3folder.retrieve_file_obj(file_path, function(file_obj){
    file_obj.get_json(function(j){
      console.log(typeof j);
      console.log(j);
    });
  });
}



if (require.main === module){
  //test_json_file();
  test_read_json();
}

module.exports.new_json_file_obj  = new_json_file_obj;

// vim: set et ts=2 sw=2 fdm=indent:
