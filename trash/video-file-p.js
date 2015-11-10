// plugin for video file
// copy from ../video-file.js 2015, 0717
//
// Rewrite video file object as plugin, following the interface in ./readme:
//


var u      = require('underscore');
var path   = require('path');

var mime   = require('mime');

var ft     = require('../../myutils/filetype.js');

var bucket = require('../bucket.js');
var myutil = require('../../myutils/myutil.js');

var myconfig =   require("../config/config.js");
var image    = require("../image.js");
var s3folder = require("../folder-v5.js");
var s3file   = require("../simple-file-v3.js");

//var media_type = require('../../myutils/media-types.js');

var vft = require("../video-file-tpl.js");
var p = console.log;


var File_name_extension = /mp4|mpeg|avi/i;
var Extension_type      = 'video';
var Type                = '?';


/*
 * Check the meta is a video file type, only extension check,
 * no content checking.
 */
function can_be_used(meta){
  var mtype = mime.lookup(meta.name);

  if(!u.isString(mtype)) return false;

  //var pat = /^video\//;
  var pat = /^video/;
  if(pat.test(mtype)) return true;

  if(meta.type){
    if(pat.test(meta.type)) return true;
  }
  if(meta.filetype){
    if(pat.test(meta.filetype)) return true;
  }

  return false;
}


/*
 * The old name:
 * new_video_file_obj
 */
function get_file_obj(meta, pass_file_obj){
  //
  // For video file object.
  // When a file is video, it get data like thumbnails, width, height, etc.
  // The video file object take care it's own data and operations.  A file
  // object should be able to switch to video file object.
  // 2014, 0720, 2015, 0718
  //
  //
  

  s3file.simple_s3_file_obj(meta, function(err, fobj){
    //
    // Now we get simple s3 file object, expend it to video file object
    //

    //fobj.set_meta(meta);
    //var imeta= {}; // for image file specific things?

    function render2(){
      p('vp in render2');
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


    function add_poster_images(callback){
      var vthumb = require("../../video/thumbnail.js");
      vthumb.add_thumbnails(meta, callback);
    }

    // Object with new functionalities
    var new_functions = {
      version:    "video-plugin-v1",
      put_to_s3 : _put_to_s3,
      delete_s3_storage : _delete_s3_storage,
      //render_html_repr : _render_html_repr,
      render_html_repr  : render2,
      clone_content_to_user : _clone_content_to_user,

      add_poster_images : add_poster_images,
    };

    u.extend(fobj, new_functions);
    pass_file_obj(null, fobj); // This callback pass out the image file object.
  });

}



/*
 * the old name: new_video_file_obj_from_meta
 */
function set_file_obj(_meta, callback){
  //
  // make a new s3 file object, this means no old data need to read in.
  //
  // meta data of file saved in folder. ?
  //
  get_file_obj(_meta, function(err, file_obj){
    //log28('_meta', _meta);
    file_obj.calculate_meta_defaults();
    //file_obj.upgrade_to_s3storage_collection();

    file_obj.render_html_repr();
    //file_obj.save_meta_file(function(err, reply){})....
    file_obj.save_file_to_folder(function(err, reply){
      callback(err, file_obj);
    });
  });
}

var new_file_obj = set_file_obj;


//module.exports.new_video_file_obj  = new_video_file_obj;
//module.exports.new_video_file_obj_from_meta  = new_video_file_obj_from_meta;

module.exports.file_name_extension = File_name_extension;
module.exports.extension_type      = Extension_type;
module.exports.type                = Type;

// functions
module.exports.can_be_used   = can_be_used;

module.exports.get_file_obj  = get_file_obj;

module.exports.set_file_obj  = set_file_obj;
module.exports.new_file_obj  = set_file_obj;




if (require.main === module){
  p('oo');
  process.exit();
}


// vim: set et ts=2 sw=2 fdm=indent:
