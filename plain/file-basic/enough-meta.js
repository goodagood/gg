/*
 * not finished
 *
 * 2016 0118
 */


function add_bare_meta(meta){

  if(!meta.name) return false;

  if(!meta.path) return false;

  // not checking owner or owner_id

  if(!meta.dir) meta.dir = path.dirname(meta.path);

  if(!meta.timestamp) meta.timestamp = Date.now();

  if(!meta.uuid){
      meta.uuid      = myutil.get_uuid();
      meta.path_uuid = path.join(meta.dir, meta.uuid);

      // this will be the s3 key for `new` meta information:
      meta.new_meta_s3key = path.join(myconfig.new_meta_prefix, meta["dir"], meta.uuid);

      var s3key = path.join(myconfig.raw_file_prefix, cwd, meta.uuid);
      meta.storage = {type: 's3', key : s3key};
  }

  return meta;
}
