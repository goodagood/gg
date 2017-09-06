// Generated by CoffeeScript 1.8.0
(function() {
  var Promise, image, image_from_meta, new_image_file_obj, new_uploaded_img_file_obj, p, promise_to_make_image_file_object, stop, _meta;

  Promise = require("bluebird");

  image = require("./image-file.js");

  p = console.log;

  stop = function(time) {
    time = time || 500;
    return setTimeout(process.exit, time);
  };

  promise_to_make_image_file_object = Promise.promisify(image.new_image_file_obj);

  new_image_file_obj = promise_to_make_image_file_object;

  new_uploaded_img_file_obj = function(_meta, callback) {
    return promise_to_make_image_file_object(_meta).then(function(obj) {
      obj.calculate_meta_defaults();
      return obj.make_default_thumb_to_s3(function(err, s3thumb_key) {
        obj.render_html_repr();
        return obj.save_meta_file(function(err, reply) {
          return callback(err, obj);
        });
      });
    });
  };

  image_from_meta = Promise.promisify(new_uploaded_img_file_obj);

  module.exports.new_image_file_obj = new_image_file_obj;

  module.exports.new_uploaded_img_file_obj = new_uploaded_img_file_obj;

  module.exports.image_from_meta = image_from_meta;

  if (require.main === module) {
    _meta = {};
    new_image_file_obj(_meta).then(function(obj) {
      return p(obj);
    }).then(function(what) {
      return p(what);
    })["catch"](function(err) {
      return p('err ', err);
    });
    stop();
  }

}).call(this);
