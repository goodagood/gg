// plugin for image file.
// 2015 0930
//
// Rewrite image file object as plugin, following the interface in ./readme:
//


var u      = require('underscore');
var path   = require('path');

var mime   = require('mime');
var fs     = require("fs");
var handlebars = require('handlebars');

var ft     = require('../../myutils/filetype.js');

var bucket = require('../bucket.js');
var myutil = require('../../myutils/myutil.js');

var myconfig =   require("../../config/config.js");
var image    = require("../image.js");
var s3folder = require("../folder-v5.js");
var s3file   = require("../simple-file-v3.js");

//var media_type = require('../../myutils/media-types.js');

var vft = require("../video-file-tpl.js");
var p = console.log;


var File_name_extension_regex = /jpg|png|gif|tiff/i;

var Extension_type      = 'image';
var Type                = 'image?';


/*
 * Check the meta is a video file type, only extension check,
 * no content checking.
 */
function can_be_used(meta){
  //cut all and return!
  //p('image p .js RETURN! default to can not be used'); return false;

  // This stupid line of code save trouble.
  if(!meta){p('no meta'); return false;}

  if(typeof meta.name !== 'undefined') var mtype = mime.lookup(meta.name);

  if(!u.isString(mtype)) return false;

  var Pattern = /^image/i;
  if(Pattern.test(mtype))           return true;

  if(meta.type){
    if(Pattern.test(meta.type))     return true;
  }
  if(meta.filetype){
    if(Pattern.test(meta.filetype)) return true;
  }
  if(meta.mimetype){
    if(Pattern.test(meta.filetype)) return true;
  }

  return false;
}


function get_file_obj (file_meta, pass_file_obj) {
  var meta = file_meta;
  var Template_file = path.join(__dirname, 'image-template.html');

  return s3file.simple_s3_file_obj(meta, function(err, fobj) {

    var _clone_content_to_user,
         bucket2,
         //calculate_thum_name,
         //callback_thumb_read_stream,
         delete_s3_storage,
         delete_s3_storage_2,
         delete_s3_storage_old,
         get_client_json,
         //get_thumb_keys,
         is_image_file_obj,
         make_default_thumb_to_s3,
         //make_thumb,
         make_thumb_defaults,
         new_functions,
         prepare_default_thumbnail,
         prepare_html_elements,
         promise_to_read_template_file,
         put_to_s3,
         read_in_template,
         render_html_repr,
         render_image_as_li,
         render_template,
         try_template,
         //?
         write_thumb;

    render_html_repr = function() {
      return meta.html["li"] = render_image_as_li(meta);
    };

    render_image_as_li = function() {
      var h, he, s3key, value_amount;
      prepare_html_elements();
      s3key = meta["storage"]["key"];
      h = meta.html.elements;
      he = "\n<li>";
      he += '<span class="thumb">' + h["thumb-img"] + "</span>\n";
      he += "<div class=\"selector\">" + h["file-selector"] + "</div>";
      he += "<div class=\"download\">" + h["download"] + "</div>";
      he += "<div class=\"what\">";
      he += '<span class="delete">' + h['remove'] + "</span>\n";
      if (meta["lastModifiedDate"]) {
        he += "<span class=\"time\"> " + meta["lastModifiedDate"] + " </span>\n";
      }
      if (meta.value == null) {
        value_amount = 0;
      }
      he += "<span class=\"value\"> " + value_amount + "\n<i class=\"fa fa-circle-o\"></i></span>";
      he += "</div>";
      he += "</li>\n";
      h["li-element"] = he;
      h["li"] = he;
      meta["li-element"] = he;
      return meta["html"] = h;
    };

    prepare_html_elements = function() {
      var h, href_download, thumb_key, thumb_src;
      fobj.prepare_html_elements();
      h = meta.html.elements;
      href_download = meta["s3_stream_href"];
      h["basename"] = meta.name;
      h["download_anchor"] = "<a href=\"" + href_download + "\" >" + h["basename"] + "</a>";
      h["download"] = "<a href=\"" + meta.s3_stream_href + "\">\n<i class=\"fa fa-cloud-download\"></i> Download</a>";
      thumb_src = "";
      if (meta["thumbnail-s3key"] != null) {
        thumb_key = meta["thumbnail-s3key"];
        thumb_src = path.join(s3_stream_prefix, thumb_key);
      }
      if (meta.thumb != null) {
        thumb_key = meta.thumb.defaults.s3key;
        thumb_src = path.join(s3_stream_prefix, thumb_key);
      }
      h["thumb-src"] = thumb_src;
      h["thumb-img"] = "<img src=\"" + thumb_src + "\" alt=\"" + h["basename"] + "\"  />";
      return h["image-indicator"] = '<span class="glyphicon glyphicon-picture"></span>';
    };

    read_in_template = function(callback) {
      return fs.readFile(Template_file, function(err, buf) {
        var str;
        if (err) {
          return callback(err, buf);
        }
        str = buf.toString();
        p('template string: ', err, str);
        if (meta.html == null) {
          meta.html = {};
        }
        meta.html.template_str = str;
        callback(null, meta.html.template);
        return meta.html.template;
      });
    };
    promise_to_read_template_file = Promise.promisify(read_in_template);

    render_template = function(callback) {
      return Promise.resolve(function() {
        if ((meta.html.template_str == null) || (meta.html.template_str == null)) {
          return promise_to_read_template_file();
        } else {
          return meta.html.template_str;
        }
      }).then(function(str) {
        var data, error, template;
        template = null;
        try {
          template = u.template(str);
        } catch (error) {
          err = error;
          return callback(err, null);
        }
        data = get_client_json();
        return try_template(template, data, callback);
      });
    };

    try_template = function(template, data, callback) {
      var error, html;
      try {
        html = template(data);
        return callback(null, html);
      } catch (error) {
        err = error;
        return callback(err, null);
      }
    };

    get_client_json = function() {
      var add, j, thumb_height, thumb_key, thumb_width;
      j = fobj.get_client_json();
      p('got client json parent: ', j);
      thumb_key = 'who know?';
      thumb_width = 100;
      thumb_height = 100;
      if (meta.thumb.defaults.s3key != null) {
        thumb_key = meta.thumb.defaults.s3key;
        thumb_width = meta.thumb.defaults.width;
        thumb_height = meta.thumb.defaults.height;
      }
      add = {
        thumb_key: thumb_key,
        thumb_width: thumb_width,
        thumb_height: thumb_height
      };
      return u.extend(j, add);
    };
    prepare_default_thumbnail = function(callback) {
      var infile, thumb_file;
      meta["thumbnail-s3key"] = image.make_thumb_key_from_file_key(meta.storage.key);
      thumb_file = path.join("/tmp", myutil.get_uuid());
      meta.local_file_thumb_file = thumb_file;
      infile = meta.local_file.path;
      return image.make_thumbnail(80, 80, infile, 100, thumb_file, function(err, out_file) {
        if (callback) {
          return callback();
        }
      });
    };
    make_thumb_defaults = function() {
      if (typeof meta.thumb === "undefined") {
        meta.thumb = {};
      }
      if (typeof meta.thumb.defaults === "undefined") {
        meta.thumb.defaults = {};
      }
      meta.thumb.defaults.width = 100;
      meta.thumb.defaults.height = 100;
      meta.thumb.defaults.quality = 100;
      meta.thumb.defaults.s3key = image.make_thumb_key_from_file_key(meta.storage.key);
      meta.thumb.defaults.s3key += path.extname(meta.name);
      meta["thumbnail-s3key"] = meta.thumb.defaults.s3key;
      return meta.thumb;
    };
    make_default_thumb_to_s3 = function(callback) {
      var local_thumb_file_name, uniq;
      make_thumb_defaults();
      uniq = myutil.get_uuid();
      local_thumb_file_name = path.join("/tmp", uniq);
      return bucket.get_object(meta.storage.key, function(err, s3reply) {
        var image_buf;
        if (err) {
          return callback(err, null);
        }
        image_buf = s3reply.Body;
        return image.make_thumbnail_from_buf(image_buf, meta.name, meta.thumb.defaults.width, meta.thumb.defaults.height, meta.thumb.defaults.quality, local_thumb_file_name, function(err) {
          if (err) {
            return callback(err);
          }
          return bucket.put_one_file(local_thumb_file_name, meta["thumbnail-s3key"], function(err, s3reply) {
            if (!err) {
              fs.unlink(local_thumb_file_name);
            }
            delete meta.local_thumb_file_name;
            return callback(err, meta["thumbnail-s3key"]);
          });
        });
      });
    };

    /* filename.image ==> filename-thumb-_WIDTH_x_HEIGHT_.image */
    function calculate_thum_name(w, h) {
      var ext, idx, name, noextension, reg, size;
      name = meta.name;
      ext = path.extname(name);
      reg = RegExp(ext + '$');
      idx = name.search(reg);
      noextension = name.substring(0, idx);  // file name without extension
      size = w.toString() + 'x' + h.toString();
      name = noextension + '-thumb-' + size + ext;
      return name;
    };

    function get_thumb_keys(w, h, callback) {
      var name = calculate_thum_name(w, h);

      return fobj.callback_file_auxiliary_path(function(err, apath) {
        var keys, s3key;
        if (err) {
          return callback(err);
        }
        s3key = path.join(apath, name);
        keys = {
           name: name,
           full_name: s3key,
           s3key: s3key
        };
        return callback(null, keys);
      });
    };

    function make_thumb(w, h, quality, callback) {
      var assert;
      p('in "image-p.js", make thumb');
      assert = require("assert");
      assert(u.isFunction(fobj.read_file_to_buffer));
      assert(u.isFunction(myutil.get_uuid));
      quality = quality || 100;
      return fobj.read_file_to_buffer(function(err, buf) {
        if (err) {
          p('err --- ! in make thumb of image file v2', err);
        }
        if (err) {
          return callback(err);
        }
        return get_thumb_keys(w, h, function(err, keys) {
          var tmp_image_file;
          tmp_image_file = path.join('/tmp', myutil.get_uuid());
          p('w,h,tmp_image_file, quality', w, h, tmp_image_file, quality);
          return image.gm(buf, meta.name).thumb(w, h, tmp_image_file, quality, function(err) {
            if (err) {
              return callback(err);
            }
            p('after .thumb');
            return bucket.put_one_file(tmp_image_file, keys.s3key, function(err, s3reply) {
              if (err) {
                return callback(err);
              }
              p('after put one file');
              fs.unlink(tmp_image_file);
              meta.thumb[keys.name] = keys.s3key;
              return fobj.save_file_to_folder().then(function(what) {
                return callback(null, what);
              })["catch"](callback);
            });
          });
        });
      });
    };
    
    //?
    write_thumb = function(options, callback) {
      var h, q, w;
      w = options.w;
      h = options.h;
      return q = options.quality || 100;
    };


    // can this still make icon thumb work? 2015 1004
    function callback_thumb_read_stream(options, callback) {
      var h, name, q, stream, w;
      w = options.w;
      h = options.h;
      q = options.q || 100;
      name = calculate_thum_name(w, h);
      p('in read stream of image file v2', w, h, name);
      if (meta.thumb[name] != null) {
        stream = bucket.s3_object_read_stream(meta.thumb[name]);
        return callback(null, stream);
      }
      return make_thumb(w, h, q, function(err, what) {
        if (err) {
          return callback(err);
        }
        stream = bucket.s3_object_read_stream(meta.thumb[name]);
        return callback(null, stream);
      });
    };

    is_image_file_obj = function() {
      return true;
    };
    put_to_s3 = function(callback) {
      var callback_after;
      if (!callback) {
        callback = (function() {});
      }
      callback_after = u.after(2, callback);
      bucket.put_one_file(meta.local_file_thumb_file, meta["thumbnail-s3key"], callback_after);
      return bucket.put_one_file(meta.local_file.path, meta.storage.key, callback_after);
    };

    //?
    bucket2 = require('../bucket-v2.js');
    delete_s3_storage_2 = function() {
      var all_promise;
      all_promise = [];
      all_promise.push(bucket2.v1_promised.delete_object_promised(meta["thumbnail-s3key"]));
      if (meta.thumbnails != null) {
        if (meta.thumbnails.length > 0) {
          meta.thumbnails.forEach(function(thumb) {
            return all_promise.push(bucket2.v1_promised.delete_object_promised(thumb.s3key));
          });
        }
      }
      all_promise.push(bucket2.v1_promised.delete_object_promised(meta.storage.key, (function() {})));
      return Promise.all(all_promise);
    };

    delete_s3_storage = function(callback) {
      var fun, funs;
      funs = [];
      fun = function(callback) {
        return bucket.delete_object(meta["thumbnail-s3key"], callback);
      };
      funs.push(fun);
      if (meta.thumbnails) {
        meta.thumbnails.forEach(function(thumb) {
          fun = function(callback) {
            return bucket.delete_object(thumb.s3key, callback);
          };
          return funs.push(fun);
        });
      }
      fun = function(callback) {
        return bucket.delete_object(meta.storage.key, callback);
      };
      funs.push(fun);
      if (meta.meta_file_key != null) {
        fun = function(callback) {
          return bucket.delete_object(meta.meta_file_key, callback);
        };
        funs.push(fun);
      }
      return async.series(funs, callback);
    };
    delete_s3_storage_old = function() {
      bucket.delete_object(meta["thumbnail-s3key"]);
      if (meta.thumbnails) {
        meta.thumbnails.forEach(function(thumb) {
          return bucket.delete_object(thumb.s3key);
        });
      }
      return bucket.delete_object(meta.storage.key, (function() {}));
    };
    _clone_content_to_user = function(user_name, callback) {
      var fid, new_name, tgt_meta, tgt_s3key, tgt_storage;
      tgt_meta = {};
      fid = myutil.get_uuid();
      new_name = fid + path.extname(meta.name);
      tgt_s3key = path.join(user_name, ".files", new_name);
      tgt_storage = {
        type: "s3",
        key: tgt_s3key
      };
      tgt_meta.storage = tgt_storage;
      bucket.copy_file(meta.storage.key, tgt_s3key);
      tgt_meta["thumbnail-s3key"] = image.make_thumb_key_from_file_key(tgt_meta.storage.key);
      bucket.copy_file(meta["thumbnail-s3key"], tgt_meta["thumbnail-s3key"]);
      return callback(tgt_meta);
    };


    // meta setting!
    fobj.set_meta(meta);

    new_functions = {
      version: 'image-file-v2',
      prepare_default_thumbnail: prepare_default_thumbnail,
      put_to_s3:                 put_to_s3,
      delete_s3_storage:         delete_s3_storage,
      render_html_repr:          render_html_repr,
      clone_content_to_user:     _clone_content_to_user,
      make_default_thumb_to_s3:  make_default_thumb_to_s3,
      make_thumb_defaults:       make_thumb_defaults,
      make_thumb:                make_thumb,
      write_thumb: write_thumb, //?
      delete_s3_storage_2:       delete_s3_storage_2,
      read_in_template:          read_in_template,
      render_template:           render_template,
      get_client_json:           get_client_json,
      get_thumb_keys:            get_thumb_keys,
      callback_thumb_read_stream:callback_thumb_read_stream,
      is_image_file_obj:         is_image_file_obj
    };

    u.defaults(new_functions, fobj);
    return pass_file_obj(null, new_functions);
  });
}




/*
 * This will set an image file object from given 'meta', the file will be
 * saved to folder.  It will try to make thumbnail for image.
 */
function set_file_obj(meta, callback){
    return get_file_obj(meta, function(err, obj) {
      obj.calculate_meta_defaults();
      return obj.make_default_thumb_to_s3(function(error, s3thumb_key) {
        // it will go on in error if it happens
        if (error) {
          p('Error: image file v2. make default thumb to s3(...) error for ', meta.path);
          p(error);
        }
        obj.render_html_repr();

        return obj.save_file_to_folder(function(err, reply) {
          if(error || err) return callback([error, err], obj);

          return callback(null, obj);
        });
      });
    });
}


module.exports.File_name_extension_regex = File_name_extension_regex;
module.exports.Extension_type      = Extension_type;
module.exports.Type                = Type;

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
