
/*
 * Meta data of file object, preparing and checking.
 *
 * 2016 0205
 */

var path = require("path");
var u    = require("underscore");


var myconfig =   require("../config/config.js");


/*
 * Using uploaded (multer) file info to prepare meta data.
 */
function prepare_meta(file, username, cwd){
  var meta  = u.pick(file, 'originalname', 'size', 'mimetype', 'encoding' );

  meta.type = meta.mimetype;
  meta.name = meta.originalname;

  meta.local_file = file.path;
  meta.path = path.join(cwd, meta.name);

  meta["dir"]  = cwd;
  meta.owner   = username; //what if other user put this file?
  meta.creator = username;
  meta.timestamp = Date.now();

  meta.uuid      = myutil.get_uuid();
  meta.path_uuid = path.join(meta.dir, meta.uuid);

  // this will be the s3 key for `new` meta information:
  meta.new_meta_s3key = path.join(myconfig.new_meta_prefix, meta["dir"], meta.uuid);

  var s3key = path.join(myconfig.raw_file_prefix, cwd, meta.uuid);
  meta.storage = {type: 's3', key : s3key};

  return meta;
}


module.exports.prepare_meta = prepare_meta;
