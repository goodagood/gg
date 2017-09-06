var u      = require('underscore');
var path   = require('path');
var fs     = require('fs');

var bucket = require('./bucket.js');
var ft     = require('../myutils/filetype.js');
var myutil = require('../myutils/myutil.js');

var myconfig =   require("../config/config.js");
var render   = require("./render-b.js");
var image    = require("./image.js");
var s3folder = require("./folder.js");
//var s3file   = require("./file.js");

var s3file   = require("./simple-file.js"); //?



function new_image_file_obj(file_meta, pass_file_obj){
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

  s3file.simple_s3_file_obj({}, function(err, fobj){
    //
    // It going to be wrapped here, in a callback where we have parent obj
    // and data. The meta is set in the below, to make use of closure.
    //

    //
    // Data:
    // meta['thumbnail-s3key'] : default thumbnail s3key
    // 
    // For more thumbnails, not used yet:
    // meta.thumbnails = [ {width:..., 
    //                      height:..., 
    //                      quality:...,
    //                      s3key:...,
    //                      local_file_path:...},
    //
    //                      // the next thumbnail image if there is,
    //                      ... ]
    //

    fobj.set_meta(meta);
    // Now, we have file object and it's meta data.  Here it get modified
    // for image files:

    //var imeta= {}; // for image file specific things?

    function _render_html_repr(){
      meta.html['li'] = render.render_image_as_li(meta);
    }

    function _render_image_as_li(){
      var fi = meta;
      //if(u.isEmpty(fi)){ }
      var s3key = fi['storage']['key'];
      var h = {};
      h['file-selector'] = '<input type="checkbox" name="filepath[]" value="' + fi.path + '" />' ;

      var href_download = fi['s3_stream_href'];

      h['basename'] = fi.name;
      h['download_anchor'] = '<a href="' + href_download + '" >' + h['basename'] + '</a>' ;

      img_src = '';
      if( typeof fi['thumbnail-s3key'] !== 'undefined'){
        var thumb_key = fi['thumbnail-s3key'];
        var img_src = path.join(s3_stream_prefix, thumb_key) ;
      }
      h['thumb-img'] = '<img src="' + img_src + '" alt="' + h['basename'] +'"  />';
      h['image-indicator'] = '<span class="glyphicon glyphicon-picture"></span>';

      var delete_link = [' <a href="', 
        fi['delete_href'], 
        '"> <span class="glyphicon glyphicon-remove"> </span></a>'].join('');
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
      //he += h['image-indicator'];
      he += h['download_anchor'];
      he += delete_link;
      he += '<ul class="list-unstyled">';
      he += '<li>' + h['thumb-img'] + '</li>\n';
      if(fi['lastModifiedDate']) he += '<li>' + fi['lastModifiedDate'] + '</li>\n';
      if(fi['create-date']) he += '<li>' + fi['create-date'] + '</li>\n';
      he += '</ul>';

      he += '</li>\n';
      h['li-element'] = he;

      return he;

      fi['li-element'] = he;  // already used
      fi['html'] = h;

    }


    // Still get meta.local_file ?
    function _prepare_default_thumbnail(callback){

      meta['thumbnail-s3key'] = image.make_thumb_key_from_file_key(meta.storage.key);
      var thumb_file = path.join('/tmp', myutil.get_uuid() );
      meta.local_file_thumb_file = thumb_file;
      var infile     = meta.local_file.path;
      // its width=80 height=80 quality=100
      image.make_thumbnail(80, 80, infile, 100, thumb_file, function(err, out_file){
        // out_file is thumb_file
        if(callback) callback();
      });
    }

    function _make_thumb_defaults(){
      if(typeof meta.thumb === 'undefined') meta.thumb = {};
      if(typeof meta.thumb.defaults === 'undefined') meta.thumb.defaults = {};
      meta.thumb.defaults.width   = 100;
      meta.thumb.defaults.height  = 100;
      meta.thumb.defaults.quality = 100;
      meta.thumb.defaults.s3key   = image.make_thumb_key_from_file_key(meta.storage.key);
      meta['thumbnail-s3key'] = meta.thumb.defaults.s3key;
    }

    // How to arrange thumbnail better then this?
    function _make_default_thumb_to_s3(callback){
      _make_thumb_defaults();

      var uniq = myutil.get_uuid();
      var local_thumb_file_name = path.join('/tmp', uniq);

      bucket.get_object(meta.storage.key, function(err, s3reply){
        if(err) return callback(err, null);
        var image_buf = s3reply.Body;
        image.make_thumbnail_from_buf(image_buf, 
          meta.name, 
          meta.thumb.defaults.width,  
          meta.thumb.defaults.height,
          meta.thumb.defaults.quality,
          local_thumb_file_name,
          function(err){
                bucket.put_one_file(
                  local_thumb_file_name,
                  meta['thumbnail-s3key'],
                  function(err, s3reply){
                    if(!err){
                      fs.unlink(local_thumb_file_name);
                      delete meta.local_thumb_file_name;
                    }
                    callback(err, meta['thumbnail-s3key']);
                  });
          });

      });
    }

    // not to use, file content no need to upload to s3 here.
    function _put_to_s3(callback){
      // @callback will get: (err, aws-reply-of-'putObject')
      if (!callback) callback = function(){}; // make a callback anyway.

      var callback_after = u.after(2, callback); // it actually run after they all finished.
      bucket.put_one_file(meta.local_file_thumb_file, meta['thumbnail-s3key'], callback_after);
      bucket.put_one_file(meta.local_file.path, meta.storage.key, callback_after);
    }

    function _delete_s3_storage(){
      //
      // 
      // delete the default thumbnail file:
      bucket.delete_object(meta['thumbnail-s3key']);

      // delete other thumbnails:
      if(meta.thumbnails){
        meta.thumbnails.forEach(function(thumb){
          bucket.delete_object(thumb.s3key);
        });
      }
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

      // For thumbnail, only default thumbnail
      tgt_meta['thumbnail-s3key'] = image.make_thumb_key_from_file_key(tgt_meta.storage.key);
      bucket.copy_file(meta['thumbnail-s3key'], tgt_meta['thumbnail-s3key']); //This has no callback

      callback(tgt_meta);
    }

    // Object with new functionalities
    var new_functions = {
      prepare_default_thumbnail : _prepare_default_thumbnail,
      put_to_s3 : _put_to_s3,
      delete_s3_storage : _delete_s3_storage,
      render_html_repr : _render_html_repr,
      clone_content_to_user : _clone_content_to_user,
      make_default_thumb_to_s3 : _make_default_thumb_to_s3,
    };

    u.extend(fobj, new_functions);
    pass_file_obj(null, fobj); // This callback pass out the image file object.
  });

}


function new_uploaded_img_file_obj(_meta, callback){
  //
  // make a new s3 file object, this means no old data need to read in.
  //

  new_image_file_obj(_meta, function(err, file_obj){
    //log28('_meta', _meta);
    file_obj.calculate_meta_defaults();
    file_obj.upgrade_to_s3storage_collection();

    file_obj.make_default_thumb_to_s3(function(err, s3thumb_key){
      file_obj.render_html_repr();
      file_obj.save_meta_file(function(err, reply){
        callback(err, file_obj);
      });
    });
  });
}


if (require.main === module){
}

module.exports.new_image_file_obj  = new_image_file_obj;
module.exports.new_uploaded_img_file_obj  = new_uploaded_img_file_obj;

// vim: set et ts=2 sw=2 fdm=indent:
