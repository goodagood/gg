var u      = require('underscore');
var path   = require('path');

var bucket = require('./bucket.js');
var ft     = require('../myutils/filetype.js');
var myutil = require('../myutils/myutil.js');

var myconfig =   require("../config/config.js");
var render   = require("./render-b.js");
var image    = require("./image.js");
var s3folder = require("./folder-v5.js");
//var s3file   = require("./simple-file.js");
var s3file   = require("./simple-file-v3.js");

var p = console.log;

function new_video_file_obj(file_meta, pass_file_obj){
  //
  // For image file object.
  //
  // When a file is image, it get data like thumbnails, width, height, etc.
  // The image file object take care it's own data and operations.  A file
  // object should be able to switch to image file object.
  //
  // 0720
  //
  
  var meta = file_meta;

  s3file.simple_s3_file_obj(meta, function(err, fobj){
    //
    // It going to be wrapped here, in a callback where we have parent obj
    // and data.
    //

    //
    // Data:
    //

    fobj.set_meta(meta);
    // Now, we have file object and it's meta data.  Here it get modified
    // for image files:

    var imeta= {}; // for image file specific things?

    function _render_html_repr(){
      //
      // Results will be saved to meta.html.li, it represent the file in 
      // web page
      //

      var li = '<li class="file video-file">';
      li    += '<input type="checkbox" name="filepath[]" value="' + meta['path'] + '" />&nbsp;' ;

      li    += '<span class="label label-success"> <span class="glyphicon glyphicon-facetime-video"></span></span>&nbsp;\n';
      li    +=  meta.name + '\n' ;
      var remove = [' <a href="', meta['delete_href'], '"> <span class="glyphicon glyphicon-trash"> </span>delete</a>'].join('');
      if(meta['delete_href']) li    += remove + '\n';
      li    +=  '<ul class="list-unstyled"><li>\n' ;
      //li    +=  '<a href="/viewvid/' + meta.path + '"><span class="glyphicon glyphicon-play"></span> &nbsp;play</a>';
      li    +=  '<a href="/viewvid/' + meta.path_uuid + '"><span class="glyphicon glyphicon-play"></span> &nbsp;play</a>';
      li    +=  '</li>\n';
      li    +=  '<li>' + new Date(parseInt(meta.timestamp)) + '</li></ul>\n' ;
      li    += '</li>\n';

      if( !meta.html ) meta.html = {};
      meta.html.li = li;
      return li;
    }

    var vft = require("./video-file-tpl.js");
    function render2(){
      p('in render2');
      var li = vft.render_li(meta);

      if( !meta.html ) meta.html = {};
      meta.html.li = li;
      return li;
    }


    function _prepare_default_thumbnail(callback){

      meta['thumbnail-s3key'] = image.make_thumb_key_from_file_key(meta.storage.key);
      var thumb_file = path.join('/tmp', myutil.get_uuid() );
      meta.local_file.thumb_file = thumb_file;
      var infile     = meta.local_file.path;
      // its width=80 height=80 quality=100
      image.make_thumbnail(80, 80, infile, 100, thumb_file, function(err, out_file){
        // out_file is thumb_file
        if(callback) callback();
      });
    }

    function _put_to_s3(callback){
      //bucket.put_one_file(meta.local_file.thumb_file, meta['thumbnail-s3key']);
      bucket.put_one_file(meta.local_file.path, meta.storage.key);
    }

    function _delete_s3_storage(){
      //
      // 
      //// delete the default thumbnail file:
      //bucket.delete_object(meta['thumbnail-s3key']);

      //// delete other thumbnails:
      //if(meta.thumbnails){
      //  meta.thumbnails.forEach(function(thumb){
      //    bucket.delete_object(thumb.s3key);
      //  });
      //}
      // delete the image file:
      bucket.delete_object(meta.storage.key, function(){});
    }

    function _clone_content_to_user(user_name, callback){
      // Can we use the parent method, 
      // when the method will be over-rided after a while?
      // Can we do it this way:
      // fobj._clone_content_to_user(....)
      //
      var tgt_meta  = {};

      var fid  = myutil.get_uuid();
      var new_name = fid + path.extname(meta.name); 

      var tgt_s3key = path.join(user_name, '.files', new_name );

      var tgt_storage = {type:'s3', key: tgt_s3key};

      tgt_meta.storage   = tgt_storage;
      bucket.copy_file(meta.storage.key, tgt_s3key); //This has no callback

      //// For thumbnail, only default thumbnail
      //tgt_meta['thumbnail-s3key'] = image.make_thumb_key_from_file_key(tgt_meta.storage.key);
      //bucket.copy_file(meta['thumbnail-s3key'], tgt_meta['thumbnail-s3key']); //This has no callback

      callback(tgt_meta);
    }

    // Object with new functionalities
    var new_functions = {
      put_to_s3 : _put_to_s3,
      delete_s3_storage : _delete_s3_storage,
      //render_html_repr : _render_html_repr,
      render_html_repr : render2,
      clone_content_to_user : _clone_content_to_user,
    };

    u.extend(fobj, new_functions);
    pass_file_obj(null, fobj); // This callback pass out the image file object.
  });

}


function new_video_file_obj_from_meta(_meta, callback){
  //
  // make a new s3 file object, this means no old data need to read in.
  //
  // meta data of file saved in folder. ?
  //
  new_video_file_obj(_meta, function(err, file_obj){
    //log28('_meta', _meta);
    file_obj.calculate_meta_defaults();
    //file_obj.upgrade_to_s3storage_collection();

    file_obj.render_html_repr();
    file_obj.save_meta_file(function(err, reply){
      callback(err, file_obj);
    });
  });
}


// template helpers
function render_li(){
}

if (require.main === module){
}

module.exports.new_video_file_obj  = new_video_file_obj;
module.exports.new_video_file_obj_from_meta  = new_video_file_obj_from_meta;

// vim: set et ts=2 sw=2 fdm=indent:
