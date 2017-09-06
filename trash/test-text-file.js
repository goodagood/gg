
var textfile = require('./text-file.js');
var myutil = require('../myutils/myutil.js');

var s3folder = require('./folder.js');

function test_date(){
  var d = Date.now();
  console.log(myutil.all_date_parts_from_milli(d));

  var ds = d.toString();
  console.log(myutil.all_date_parts_from_milli(ds));
  console.log(myutil.all_date_parts_from_milli(0));
  console.log(myutil.all_date_parts_from_milli(null));
}

function make_one_text_file(folder_path, name, content){
  folder_path = folder_path || 'abc';
  name   = name   || 'text-file-' + Date.now().toString() + '.txt';
  content= content|| 'the default text file content? \n' + Date.now().toString();

  var file_meta = {
    name : name,
    folder_path : folder_path,
    filetype : 'text',  // this can make a text file without '.txt' extension.
  };
  console.log(file_meta);

  textfile.new_text_file_obj(file_meta, function(file_obj){
    // feed in text will give storage
    file_obj.feed_in_text(content);
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

function test_read_txt(file_path){
  file_path = file_path || 'abc/some-text.txt';
  s3folder.retrieve_file_obj(file_path, function(file_obj){
    file_obj.read_text_or_null(function(text){
      console.log(text);
    });
    //file_obj.read_file_to_string(function(text){
    //  console.log('read file to string is file obj method:');
    //  console.log(text);
    //});
    //console.log(file_obj);
    //console.log(file_obj.get_meta());
  });
}


if (require.main === module){
  //make_one_text_file('abc', null, null);
  //make_one_text_file('abc', 'txt-no-ext', 'text file with no extension');
  test_read_txt('abc/txt-no-ext');
  //
  //test_read_txt();
  //test_date();
}

// vim: set et ts=2 sw=2 fdm=indent:
