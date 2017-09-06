var bucket = require('./bucket.js');
var myconfig =   require("../config/config.js");
var myutil = require('../myutils/myutil.js');

function fire_folder_event(folder, event_json){
  var event_file = path.join(myconfig.meta_file_prefix,
      folder,
      myconfig.event_folder,
      myutil.get_uuid()
      );
  bucket.write_json(event_file, event_json);
}


function get_one_event(folder, callback){
  var prefix = path.join(myconfig.meta_file_prefix,
      folder,
      myconfig.event_folder,
      );

  // get one file
  bucket.list(prefix, function(err, contents){
    if(typeof contents[0] !== 'undefined' && contents[0]){
      var s3_key = contents[0].Key;
      bucket.read_json(s3_key, function(err, json){
        callback(s3_key, json);
      });
    }

  });
}


// vim: set et ts=2 sw=2 fdm=indent:
