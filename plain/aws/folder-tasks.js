var path   = require('path');
var u      = require('underscore');
var test   = require('nodeunit');

var s3folder = require('./folder.js');
var s3file = require('./file.js');

var myconfig =   require("../config/config.js");
var flog   = require('../myutils/mylogb.js').simple_log('/tmp/log72');


function _test_find_file_meta(){  // should i think nodeunit is trash?
  //var path = 'abc/82237957.jpg';
  var path = 'tmp/bookmarks.html';
  s3folder.retrieve_file_meta(path, function(file_meta){
    console.log(file_meta);

    //show_it_without.apply(this, file_meta, 'html');
  });
};


function retrieve_file_meta(fpath){
    //var fpath = 'abc/82237957.jpg';
    //var fpath = 'abc/Png.png';
    //var fpath = 'abc/82237959.jpg';
    //var fpath = 'abc/testi';
    //var fpath = 'abc/hy725.mp4';
    var fpath = fpath || 'abc/hy725.mp4';
    s3folder.retrieve_file_meta(fpath, function(file_meta){
        console.log(file_meta);
    });
};

function test_render_file(){
  //
  // forget to render file when doing message things.
  //
  //var folder_path = 'test/goodagood/in';
  var folder_path = 'abc/test717';
  //var filename    = 'abc/test717/echo.txt';
  //var filename    = 'echo.txt';
  var filename    = 'ruby';
  s3folder.retrieve_folder(folder_path, function(folder_obj){
    var folder_meta = folder_obj.get_meta();
    //console.log(folder_meta);
    //console.log(folder_meta.name);

    folder_obj.get_file_obj(filename, function(file_obj){
      file_obj.render_html_repr();
      file_obj.save_file_to_folder(function(){
        console.log(file_obj.get_meta()); //?
      });

      //folder_obj.add_file_obj_save_folder(file_obj);
      //console.log(file_obj);

      //console.log(file_obj.get_meta()); //?
    });

  });
}



function file_meta_without(file_path, to_exclude){
  // @to_exclude : any number of names to exclude from the file meta
  
  var arg = u.rest(arguments); // this make arg an array

  //var file_path = 'tmp/bookmarks.html';
  s3folder.retrieve_file_meta(file_path, function(file_meta){
    //console.log(file_meta);

    arg.splice(0,0,file_meta); // replace the first element with file_meta
    var to_show = u.omit.apply(this, arg);
    console.log(to_show);
    //if(callback) callback(to_show);
  });
};

function file_meta_with(file_path, to_include){
  // @to_include : any number of names to include from the file meta
  
  var arg = u.rest(arguments); // this make arg an array

  //var file_path = 'tmp/bookmarks.html';
  s3folder.retrieve_file_meta(file_path, function(file_meta){
    //console.log(file_meta);

    arg.splice(0,0,file_meta); // replace the first element with file_meta
    var to_show = u.pick.apply(this, arg);
    console.log(to_show);
    //if(callback) callback(to_show);
  });
};

function file_meta_without_array_of_names(file_path, name_array, callback){
  // @name_array : an array of names to exclude from the file meta
  
  if(!u.isArray(name_array)) {
    console.log('NOT ARRAY');
    return null;
  }

  //var file_path = 'tmp/bookmarks.html';
  s3folder.retrieve_file_meta(file_path, function(file_meta){
    //console.log(file_meta);

    name_array.splice(0,0,file_meta); // insert the first element with file_meta
    var to_show = u.omit.apply(this, name_array); //omit asks (obj, to_omit...)
    console.log(to_show);
    if(callback) callback(to_show);
  });
};

function file_meta_with_array_of_names(file_path, name_array, callback){
  // @name_array : an array of names to exclude from the file meta
  
  if(!u.isArray(name_array)) {
    console.log('NOT ARRAY');
    return null;
  }

  //var file_path = 'tmp/bookmarks.html';
  s3folder.retrieve_file_meta(file_path, function(file_meta){
    //console.log(file_meta)

    // name_array changed, insert the first element with file_meta
    name_array.splice(0,0,file_meta);
    //console.log(name_array);
    var to_show = u.pick.apply(this, name_array); //pick asks (obj, to_pick...)
    console.log(to_show);
    if(callback) callback(to_show);
  });
};

function folder_meta_without_array_of_names(folder_path, name_array, callback){
  // @name_array : an array of names to exclude from the file meta

  if(!u.isArray(name_array)) {
    console.log('NOT ARRAY');
    return null;
  }

  s3folder.retrieve_folder(folder_path, function(folder_obj){
    var folder_meta = folder_obj.get_meta();
    // insert the first element to be folder_meta
    name_array.splice(0,0,folder_meta);
    var to_show = u.omit.apply(this, name_array); //omit asks (obj, to_omit...)
    console.log(to_show);
    if(callback) callback(to_show);
  });
};

function folder_meta_with_array_of_names(folder_path, name_array, callback){
  // @name_array : an array of names to exclude from the file meta

  if(!u.isArray(name_array)) {
    console.log('NOT ARRAY');
    return null;
  }

  s3folder.retrieve_folder(folder_path, function(folder_obj){
    var folder_meta = folder_obj.get_meta();
    // insert the first element to be folder_meta
    name_array.splice(0,0,folder_meta);
    var to_show = u.pick.apply(this, name_array); //pick asks (obj, to_omit...)
    console.log(to_show);
    if(callback) callback(to_show);
  });
};

function pick_show(obj, attr_names){
  var arg = arguments;
  u.pick.apply(this, arguments);
}

function show_it_without(obj, names){
  var show = {};
  u.defaults(show, obj);
  
  if( u.isArray(names) ){
    u.each(names, function(name){
      delete show[name];
    });
    return console.log(show);
  }

  // @name is not array now.
  // to exclude all the names, it from arguments[1]
  for(var i=1; i<arguments.length; i++){
    delete show[arguments[i]];
  }
  return console.log(show);
}

function show_it_only(obj, names){
  var show = {};

  if( u.isArray(names) ){
    u.each(names, function(name){
      if(typeof obj[name] !== 'undefined') show[name] = obj[name];
    });
    return console.log(show);
  }

  for(var i=1; i<arguments.length; i++){
    if(typeof obj[arguments[i]] !== 'undefined') show[arguments[i]] = obj[arguments[i]];
  }
  return console.log(show);
}


function show_folder_without_attributes(fpath, attributes){
  fpath = fpath || 'tmp';

  s3folder.retrieve_folder(fpath, function(fobj){
    var meta = fobj.get_meta();
    show_it_without(meta, attributes);
  });
}

function test_retrieve(){
  var fpath = 'abc';
  //s3folder.retrieve_folder(fpath, console.log);

  s3folder.retrieve_folder(fpath, function(fobj){
    var meta = fobj.get_meta();
    //console.log(meta);
    //flog('meta of abc', meta);
    var toshow = {};


    var allfile = meta.files;
    var keys = u.keys(allfile);
    console.log(keys);
    keys.forEach(function(key){
      if( key.indexOf('test') >= 0){
        console.log('found: ', allfile[key] );
        //fobj.delete_file(key);
      }
    });

  });
};

// 0711
function test_retrieve_file(){
  // abc/14110247507.jpg
  // abc/14110028590.jpg
  //var filename = 'abc/Png.png';
  var filename = 'abc/test717/ls.txt';
  s3folder.retrieve_file_obj(filename, function(file_obj){
    //console.log('here 534');
    console.log(file_obj);
    console.log(file_obj.get_meta());
  });
}

function test_delete_file(file_path){
  //
  // bootswatch.css
  // 14110247507.jpg
  // 14110028590.jpg
  //
  //var file_path = 'abc/14110247507.jpg';
  //var file_path = 'abc/14110028590.jpg';
  //var file_path = 'abc/1.jpg';
  //var file_path = 'test/public/h.ra.rb';
  //var file_path = 'abc/testi';
  var file_path = file_path || 'abc/hy725.mp4';
  //console.log(file_path);
  s3folder.delete_file(file_path, function(folder_obj){
    //console.log(folder_obj);
    var f_meta = folder_obj.get_meta();
    var keys = Object.keys(f_meta.files);
    console.log(keys);
    //console.log(folder_obj.get_meta());
  });
}

function test_delete_many_files(){
  //
  // bootswatch.css
  // 14110247507.jpg
  // 14110028590.jpg
  //
  //var file_path = 'abc/14110247507.jpg';
  //var file_path = 'abc/14110028590.jpg';
  //var file_path = 'abc/1.jpg';
  //var file_path = 'test/public/h.ra.rb';
  var many_files = [
    'abc/1.jpg',
    'abc/2.jpg',
    ];
  //console.log(file_path);
  var wait = 5000;
  many_files.forEach(function(file_path){
    function todo(){
      s3folder.delete_file(file_path);
    }
    u.delay(todo, wait);
    wait += 5000;
  });
}


function test_rename_file(){
  //
  // bootswatch.css
  // 14110247507.jpg
  // 14110028590.jpg
  //
  //var file_path = 'abc/14110247507.jpg';
  //var file_path = 'abc/14110028590.jpg';

  //var file_path = 'abc/Png.png';
  var file_path = 'abc/mda.md';
  var new_name  = 'mda.md.bak';

  var folder_path = path.dirname(file_path);
  var filename    = path.basename(file_path);

  console.log(folder_path, filename);

  s3folder.retrieve_folder(folder_path, function(folder_obj){
    var folder_meta = folder_obj.get_meta();
    var file_meta   = folder_meta.files[filename];
    //console.log(file_meta);
    folder_obj.rename_file(filename, new_name);
  });
}

function render_folder(){
  //
  // forget to render file when doing message things.
  //
  //var folder_path = 'test/goodagood/in';
  var folder_path = 'abc';
  s3folder.retrieve_folder(folder_path, function(folder_obj){
    var folder_meta = folder_obj.get_meta();
    //console.log(folder_meta);
    var filenames = Object.keys(folder_meta.files);
    console.log(filenames);
    if(!filenames) return;
    filenames.forEach(function(filename){
      folder_obj.get_file_obj(filename, function(file_obj){
        file_obj.render_html_repr();
        folder_obj.add_file(file_obj.get_meta());
        console.log(file_obj.get_meta());
      });
    });

    u.delay(folder_obj.save_meta, 15000);
  });
}


function fix_folder_as_file(folder_path){
  //
  // forget folder is special file
  //
  //var folder_path = folder_path || 'abc';
  if( !folder_path ) return;
  s3folder.retrieve_folder(folder_path, function(folder_obj){
    folder_obj.render_html_repr();
    var folder_meta = folder_obj.get_meta();
    if( folder_meta.filetype !== 'goodagood-folder' ) folder_meta.filetype = 'goodagood-folder';
    console.log(folder_meta.path);

    var filenames = Object.keys(folder_meta.files);
    //console.log(filenames);

    //if(!filenames) return;
    filenames.forEach(function(filename){
      var file_meta = folder_meta.files[filename];
      //if( file_meta.what === myconfig.IamFolder ) file_meta.filetype = 'goodagood-folder';
      if( file_meta.what === myconfig.IamFolder ) fix_folder_as_file(file_meta.path);
      //console.log(file_meta.name, file_meta.filetype);
    });
    folder_obj.save_meta();

    //u.delay(folder_obj.save_meta, 15000);
  });
}


function render_folder_recursively(folder_path){
  //
  // forget folder is special file
  //
  if( !folder_path ) return;
  s3folder.retrieve_folder(folder_path, function(folder_obj){
    folder_obj.render_html_repr();

    var folder_meta = folder_obj.get_meta();
    if( folder_meta.filetype !== 'goodagood-folder' ) folder_meta.filetype = 'goodagood-folder';
    console.log(folder_meta.path);
    console.log(folder_meta.html.li);

    var filenames = Object.keys(folder_meta.files);
    //console.log(filenames);

    //if(!filenames) return;
    filenames.forEach(function(filename){
      var file_meta = folder_meta.files[filename];
      //if( file_meta.what === myconfig.IamFolder ) file_meta.filetype = 'goodagood-folder';
      if( file_meta.what === myconfig.IamFolder ) render_folder_recursively(file_meta.path);
      //console.log(file_meta.name, file_meta.filetype);
    });
    
    folder_obj.build_file_list();
    folder_obj.save_meta();
  });
}

function update_folder_meta_recursively(folder_path){
  //
  // try to update folder meta in meta.files
  //
  if( !folder_path ) return;
  s3folder.retrieve_folder(folder_path, function(folder_obj){

    var folder_meta = folder_obj.get_meta();
    //console.log(folder_meta.path);
    //console.log(folder_meta.html.li);

    var filenames = Object.keys(folder_meta.files);
    //console.log(filenames);

    //if(!filenames) return;
    filenames.forEach(function(filename){
      var file_meta = folder_meta.files[filename];
      //if( file_meta.what === myconfig.IamFolder ) file_meta.filetype = 'goodagood-folder';
      if( file_meta.what === myconfig.IamFolder ){
        console.log(file_meta.path);
        s3folder.retrieve_folder(file_meta.path, function(sub_folder){
          var sub_meta = sub_folder.get_meta();
          delete sub_meta.files;
          delete sub_meta.renders;
          console.log(sub_meta.html.li);
          folder_meta.files[filename] = sub_meta;
        });
      }
      //console.log(file_meta.name, file_meta.filetype);
    });
    
    function todelay(){
      folder_obj.build_file_list();
      folder_obj.save_meta();
    }
    u.delay(todelay, 15000);
  });
}

function test_get_sorted_message_list_as_ul(username){
  s3folder.get_sorted_message_list_as_ul('abc');
}

function get_sorted_message_list_as_ul(username){
  //
  // The message folder is set in config-mj.js
  // message is sorted by new coming.
  //
  var message_folder_path = path.join(username, myconfig.message_folder);
  s3folder.retrieve_folder(message_folder_path, function(folder){
    var files = folder.get_meta().files;
    //console.log(files);
    var names = Object.keys(files);
    var sorted_names = u.sortBy(names, function(name){
      var negative_timestamp = 0 - parseInt(files[name].timestamp);
      return negative_timestamp;
    });
    //console.log(names, sorted_names);

    var ul = '<ul class="folder-list list-unstyled">';
    sorted_names.forEach(function(name){
      var file = files[name];
      if(typeof file.html !== 'undefined') ul += file.html.li;
    });
    ul += '</ul>';
    
    //console.log(ul);
    return ul;
  });
}


function test_build_blueimp_list(){
  var folder_path = 'abc';
  s3folder.retrieve_folder(folder_path, function(the_folder){
    var list = the_folder.build_blueimp_pic_gallery_list();
    console.log(list);
  });
}

function retrieve_folder_meta(fpath){
  folder_path = fpath || 'abc';
  s3folder.retrieve_folder(folder_path, function(the_folder){
    var meta = the_folder.get_meta();
    console.log(meta);
  });
}


if(require.main === module){
  //retrieve_file_meta('tmp/goodagood/.gg.people.json');
  //retrieve_file_meta('tmpd/public/.gg.viewers.json');
  //retrieve_file_meta('andrew/public/ls55');

  //test_render_file();

  //file_meta_without('abc/public/xaa.txt', 'html');
  file_meta_without_array_of_names('abc/public/xaa.txt', ['html',]);
  //file_meta_with_array_of_names('abc/test717/ls.txt', ['storage', 'html',]);

  //folder_meta_without_array_of_names('abc/public', [ 'html' ]);
  //folder_meta_with_array_of_names('dd', [ 'files' ]);
  //folder_meta_with_array_of_names('tmpd', ['renders', ]);
  //folder_meta_with_array_of_names('tmp/goodagood', ['files', 'renders']);
  //folder_meta_with_array_of_names('tmp', ['files', 'renders']);
  //file_meta_with_array_of_names('tmp/bookmarks.html', ['html',]);
  //_test_find_file_meta();

  //show_it_without(33, 'a', 'b');
  //show_it_without({a:1, b:2, c:3}, 'a', 'b');
  //show_it_only({a:1, b:2, c:3}, 'a', 'b');

  //show_folder_without_attributes('abc/public', ['files', 'html', 'renders']);
  //test_retrieve();
  //test_retrieve_file();

  //test_delete_file('abc/hy725.mp4');
  //test_delete_many_files();
  //fix_folder_as_file('abc');
  //render_folder_recursively('abc');
  //update_folder_meta_recursively('abc');
  //test_rename_file();

  //render_folder();
  //get_sorted_message_list_as_ul('abc');
  //test_build_blueimp_list();

  //retrieve_folder_meta('abc');
  setTimeout(function(){process.exit();}, 3000);
}

module.exports.folder_meta_with_array_of_names   = folder_meta_with_array_of_names;

// vim: set et ts=2 sw=2 fdm=indent:
