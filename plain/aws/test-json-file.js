var path   = require('path');
var test   = require('nodeunit');

var s3folder = require('./folder.js');

var json_file = require('./json-file.js');


function test_write_json_data(test){
}
//exports.test_write_json_data = test_write_json_data;


function a(folder_path, name, content){
  folder_path = folder_path || 'tmpd';
  name   = name   || 'j-a';
  content= content|| {old: [1, 2, 3, 'a string', 'b string', {a:1, b:2}],
      new : Date()
  };

  var file_meta = {
    name : name,
    folder_path : folder_path,
    path : path.join(folder_path, name),
    filetype : 'json',
  };
  console.log(file_meta);

  json_file.new_json_file_obj(file_meta, function(file_obj){
    file_obj.set_up_from_json(content);

    var file_meta = file_obj.get_meta();
    console.log('after set up from json');
    console.log(file_meta);
    s3folder.retrieve_folder(file_meta.folder_path, function(folder){
      folder.add_file_save_folder(file_meta);
      //folder.save_meta();
    });

    //console.log(file_obj.get_meta());
    //console.log(file_obj);
  });
}

if (require.main === module){
  //test_json_file();
  a();
}


// vim: set et ts=2 sw=2 fdm=indent:
