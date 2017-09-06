var u      = require('underscore');
var path   = require('path');
var bucket = require('./bucket.js');
var filetype = require('../myutils/filetype.js');

var myconfig =   require("../config/config.js");
var s3_stream_prefix = myconfig.s3_stream_prefix;
var folder_list_prefix = myconfig.folder_list_prefix;


function render_files_in_folder(folder){
  bucket.list(folder, function(err, contents){
    //console.log(contents);
    u.each(contents, function(onefile,k){
      //console.log('key:', k, onefile.Key);
      bucket.read_file_meta(onefile.Key, function(err, meta_info){
        //console.log('key:', k, onefile.Key);
        //console.log(meta_info);
        if(meta_info){
          meta_info['file-s3key'] = onefile.Key;
        }else{
          meta_info = { 'file-s3key' : onefile.Key };
        }
        render_to_html_li(meta_info);
      });
    });
  });
}


function test_render_files_in_folder(folder){
  //if(typeof folder === 'undefined' || !folder) var folder = 'muji/goodagood/.in';

  //render_files_in_folder(folder,  function(err, what){
  //  console.log('what getten from render_files_in_folder? '); console.log(what);
  //});

  // This will try to render many files:
  var many = ['muji', 'abc', 'tmp', 'dirty-show', 'test'];
  many.forEach(function(folder){
    render_files_in_folder(folder);
  });
}


function render_to_html_li(file_info){
  // 
  // make an html element to represent the file on web page, save it as meta data.
  // 
  // It depends on file type, 
  //    image will get an thumbnail
  //    message will display text, and ...
  // 
  //    folder need more ...
  // 

  var ftype;

  //bucket.guess_to_be_folder(file_info['file-s3key'], function(yes){
  //  if(yes){
  //    ftype = 'folder';
  //    file_info['type'] = 'folder';
  //  }
  //});

  if (typeof file_info.type === 'undefined' && file_info.type !== 'folder'){
    ftype = filetype.check_file_type_by_name(file_info['file-s3key']);
    file_info['file-type'] = ftype;
  }
  //console.log(333, ftype, file_info);
  switch (ftype){
    case 'image':
      render_image_as_li(file_info);
      break;
    case 'folder':
      //file_info['file-selector'] = '';
      render_folder_file_as_li(file_info);
      prepare_folder_list(file_info['file-s3key']);
      break;
    case 'goodagood file link':
      ;
    case 'goodagood msg file':
      render_msg_as_li(file_info);  // this contains s3 API callback, it's asyn
      ;
    default:
      assemble_html_element(file_info);
      break;
  }
}


function render_one_file(file_s3key){
  bucket.read_file_meta(file_s3key, function(err, meta_info){
    render_to_html_li(meta_info);
  });
}


function render_msg_as_li(fi){
  bucket.read_file(fi['file-s3key'], function(err, data){
    var j = JSON.parse(data);
    var he = '<li><span class="label label-success"> <span class="glyphicon glyphicon-info-sign"></span></span>Message from: ' + j.from  + '<br />';
    he += '<ul><li>' + j.message + '</li>';
    he += '<li>' + new Date(parseInt(j.time)) + '</li>';
    he += '</ul></li>';
    fi['li-element'] = he;
    bucket.write_file_meta(fi['file-s3key'], fi, function(){});
  });
}


function render_image_as_li(file_info, callback){
  // to be used in file listing, save the result into meta file.
  var fi = file_info;
  //if(u.isEmpty(fi)){ }
  var s3key = fi['file-s3key'];
  var h = {};
  h['file-selector'] = '<input type="checkbox" name="filepath[]" value="' + s3key + '" />' ;
  var href_download = path.join(s3_stream_prefix, s3key );
  h['basename'] = path.basename(s3key);
  h['download_anchor'] = '<a href="' + href_download + '" >' + h['basename'] + '</a>' ;

  img_src = '';
  if( typeof fi['thumbnails'] !== 'undefined'){
    var thumb_key = fi['thumbnails'][0].s3key;
    var img_src = path.join(s3_stream_prefix, thumb_key) ;
  }
  h['thumb-img'] = '<img src="' + img_src + '" alt="' + h['basename'] +'"  />';
  h['image-indicator'] = '<span class="glyphicon glyphicon-picture"></span>';

  // he is html element, representing the image in web page:
  // <li> file-selector, image-glyphicon, name, file informations ...
  //   <ul> 
  //     <li> thumbnail
  //     <li> date
  //     <li> ...
  //   </ul>
  // </li>
  var he = '<li>';  // html element
  he += h['file-selector']; // + '<br />';
  he += h['image-indicator'];
  he += h['download_anchor'];
  he += '<ul>';
  he += '<li> Thumbnail: ' + h['thumb-img'] + '</li>';
  if(fi['lastModifiedDate']) he += '<li>' + fi['lastModifiedDate'] + '</li>';
  if(fi['create-date']) he += '<li>' + fi['create-date'] + '</li>';
  he += '</ul>';


  he += '</li>\n';
  h['li-element'] = he;
  fi['li-element'] = he;  // already used
  fi['html'] = h;

  if(callback){
    bucket.write_file_meta(fi['file-s3key'], fi, callback);
  }else{
    bucket.write_file_meta(fi['file-s3key'], fi, function(){});
  }
}


function render_folder_file_as_li(file_info){
  var he = '<li>';
  he = he + '<a href="';
  he += path.join(folder_list_prefix, file_info['file-s3key']); 
  he += '">';

  var folder_glyphicon = '<span class="glyphicon glyphicon-folder-close"></span>';
  he += folder_glyphicon;

  var basename = path.basename(file_info['file-s3key']);
  he = he + basename;
  he = he + '</a></li>\n';
  file_info['folder-link'] = he;
  file_info['li-element'] = he;
  bucket.write_file_meta(file_info['file-s3key'], file_info, function(){});
}


/* to be deprecated 0620 */
function assemble_html_element(file_info){
  //if (typeof file_info['li-element'] !== 'undefined') return;
  var he = '<li>';
  file_info['file-selector'] = '<input type="checkbox" name="filepath[]" value="' + file_info['file-s3key'] + '" />' ;
  he += file_info['file-selector'];

  var href_download = path.join(s3_stream_prefix, file_info['file-s3key'] );
  file_info['basename'] = path.basename(file_info['file-s3key']);
  file_info['anchor'] = '<a href="' + href_download + '" >' + file_info['basename'] + '</a>' ;

  //if (typeof file_info['thumb-img'] !== 'undefined')  he += file_info['thumb-img'];
  //if (typeof file_info['folder-link'] !== 'undefined') he += file_info['folder-link'];

  he += file_info['anchor'];

  he += '</li>\n';
  file_info['li-element'] = he;
  bucket.write_file_meta(file_info['file-s3key'], file_info, function(){});
}


function get_html_li(file_s3key, render_when_not_exist, pass_li){
  bucket.read_file_meta(file_s3key, function(err, meta_info){
    if(err){
      pass_li(err, null); return;
    }
    //console.log('get html li, meta_info'); console.log(meta_info);  //test

    // When we get the ready li representation, done.
    if(typeof meta_info['li-element'] !== 'undefined' && meta_info['li-element']){
      pass_li(null, meta_info['li-element']);
      return;
    }

    pass_li(null, get_html_li_anyway(file_s3key));

    // if no need to do more.
    if(!render_when_not_exist) return;

    render_to_html_li(meta_info); 
  });
}


function test_get_html_li(){
  var key = 'abc/one/testa.txt';
  get_html_li(key, false, function(err, data){
    console.log(data);
  });
}


function get_html_li_anyway(file_s3key){
  if(!file_s3key) return '<li> ?what file? </li>';

  var basename = path.basename(file_s3key);
  return '<li> basename </li>';
}


function print_renderring_in_folder(folder){
  bucket.list(folder, function(err, contents){
    //console.log(contents);
    u.each(contents, function(onefile,k){
      //console.log('key:', k, onefile.Key);
      var key = onefile.Key
      get_html_li(key, false, function(err, data){
        console.log(key, ' -  ', data);
      });
    });
  });
}


function prepare_folder_list(folder_path){
  // get file only in cwd
  // This will update the meta file of 'folder file'

  bucket.list(folder_path, function(err, contents){
    var files = bucket.shrink_s3list_to_cwd(contents, folder_path);
    //console.log(files);
    var ul = '<ul class="list-folder">\n';

    // make the callback called after all been done.
    var update_folder_meta_after_all = u.after(u.size(files), function(){
      ul += '</ul>';
      bucket.update_file_meta(folder_path, {'list-folder':ul}, function(){});
      console.log(ul);
    });

    u.each(files, function(info, key){
      get_html_li(key, false, function(err, li){
        //console.log(key, li);
        //if(!li) get_html_li_anyway(key);
        if(!li) li = "<li> I found no li, in prepare folder list </li>";
        ul += li;
        update_folder_meta_after_all();
      });
    });

  });
}


function test_prepare_folder_list(fold_path){
  if(typeof folder_path === 'undefined' || !folder_path) var folder_path = 'abc/one';

  prepare_folder_list(folder_path);
}


function sort_out_folder_list_a(folder_path){
  bucket.list(folder_path, function(err, contents){
    var sorted = u.sortBy(contents, function(e){
      var date = new Date(e['LastModified']);
      var epoc = date.getTime();
      return 1 - epoc;
    });
    //console.log(sorted);

    // make the callback called after all been done.
    var update_folder_meta_after_all = u.after(u.size(sorted), function(){
      var ul = '<ul class="list-folder list-unstyled">\n';
      sorted.forEach(function(s3file){ ul += s3file.li; });
      ul += '</ul>';
      console.log(ul);
      bucket.update_file_meta(folder_path, {'list-folder':ul}, function(){});
    });

    sorted.forEach(function(s3file){  
      console.log(s3file.Key); //
      get_html_li(s3file.Key, false, function(err, li){
        if(!li) li = "<li> I found no li, in prepare folder list </li>";
        //console.log(li); //
        s3file.li = li;
        //ul += li;
        update_folder_meta_after_all();
      });

    });

  });
}


function test_sort_out_folder_list_a(){
  sort_out_folder_list_a('muji/goodagood/.in');
}


function render_files_and_list_folder(folder_path){
  // used in develop to redo a folder and all it's files. 0623
  if(typeof folder_path === 'undefined' || !folder_path) var folder_path = 'abc/one';

  render_files_in_folder(folder_path);
  setTimeout(function(){
    //prepare_folder_list(folder_path);
    sort_out_folder_list_a(folder_path);
  }, 10000);
}


module.exports.render_files_in_folder = render_files_in_folder;
module.exports.render_one_file = render_one_file;
module.exports.prepare_folder_list = prepare_folder_list;


if (require.main === module){
  //test_get_html_li();
  var key = 'abc/one/testa.txt';
  //render_one_file(key);

  //var fa = 'abc/one/happy-hens.jpg';
  //bucket.print_file_meta(fa);
  //render_one_file(fa);
  //bucket.print_file_meta(fa);

  //var folder_a = 'abc/one';
  var folder_a = 'muji/goodagood/.in';
  var folder_a = 'muji/';

  // render files in a folder and print it out
  //test_render_files_in_folder(folder_a);
  //print_renderring_in_folder(folder_a);
  //bucket.print_file_meta(folder_a);

  //bucket.read_file_meta(folder_a, function(err, meta){
  //  console.log(meta);
  //});
  //
  //bucket.print_file_meta('abc/one/happy-hens.jpg');

  //folder_a = 
  //test_prepare_folder_list(folder_a);
  //

  render_files_and_list_folder('muji/goodagood/.in');
  //test_sort_out_folder_list_a();
}

// vim: set et ts=2 sw=2 fdm=indent:
