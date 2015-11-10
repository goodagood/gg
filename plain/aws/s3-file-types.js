
var simple_file   = require('./simple-file-v3.js');

var markdown_file = require('./markdown-file.js');

var message_file  = require('./message-file-2.js');
var msg_module    = require('./simple-msg.js');

var video_file    = require('./video-file.js');
var audio_file    = require('./audio-file.js');
var text_file     = require('./text-file-v1.js'); //?
//var json_file     = require('./json-file.js');
var json_file     = require('./simple-json.js');
var note_file    = require('./note-file.js');

var img_file      = require("./image-file-v2.js");


var file_ext      = require('../myutils/ext-type.js');


var p = console.log;


// start transferring to use plugins.
var plugin = require('./file-type-plugin.js');


// This will set up new file obj, and save it to folder
// The naming is not agree with plugin naming style, because this is used
//     before plugin coming.  2015 1006
function file_obj_from_meta(meta, callback){
  // callback will get (err, file-object), this will save file meta

  // Transfer to plugin structure, 2015 0928
  var plugable = plugin.find_plugin(meta);
  if(plugable){
    //p('got plugable: ', plugable);
    return plugable.set_file_obj(meta, callback);
  }

  // The old way
  if(typeof meta.filetype === 'undefined' || !meta.filetype){
    meta.filetype = file_ext.check_file_type_by_name(meta.name);
  }

  switch (meta.filetype){
    //?For 0926 2015 test, comment out all file types
    case 'web':
    case 'programming':
    case 'text':
      return text_file.new_text_file_obj(meta, callback);
        //text_file_obj.render_html_repr();
        //callback(err, text_file_obj);
      break;
    case 'json':
      // totest, 0318
      console.log('got json');
      return json_file.new_json_file_from_meta(meta, callback);
    case 'image':
      p('you got image file, 2015 0926, haha');
      return img_file.new_uploaded_img_file_obj(meta, callback);
    case 'goodagood-message-json':
      //console.log ("I got a message file in s3 file types");
      return msg_module.new_msg_file_from_meta(meta, callback);

    case 'audio':
      return audio_file.new_audio_file_obj_from_meta(meta, callback);
    case 'video':
      return video_file.new_video_file_obj_from_meta(meta, callback);
    case 'markdown': // doing 01 24
      console.log('got an markdown');
      return markdown_file.new_md_obj_to_s3(meta, callback);
    case 'goodagood-note':
      return note_file.make_note_file(meta, callback);
    default:
      p('default, simple file DOT new file obj from meta');
      simple_file.new_file_obj_from_meta(meta, callback);
      //meta.html['li'] = render.make_simple_li(meta);
  }
}




// This will not saving, it use meta to set up a file object.
function set_file_obj_from_meta(meta, callback){
  // callback will get (err, file-object), this will NOT save file meta

  // Transfer to plugin structure, 2015 0928.
  // The name 'set file obj from meta' is in oposite with it naming in plugin.
  p('try to find plugin, meta.path: ', meta.path);
  var plugable = plugin.find_plugin(meta);
  if(plugable){
    //p('got plugable: ', plugable);
    return plugable.get_file_obj(meta, callback);
  }

  p('// The old way ...');
  if(typeof meta.filetype === 'undefined' || !meta.filetype){
    meta.filetype = file_ext.check_file_type_by_name(meta.name);
  }

  switch (meta.filetype){
    case 'web':
    case 'programming':
    case 'text':
      p('web programming text, s3 file types ');
      return text_file.new_text_file_obj(meta, callback);
    case 'json':
      // totest, 0318
      return json_file.new_json_file_obj(meta, callback);
    case 'image':
      return img_file.new_image_file_obj(meta, callback);
    case 'goodagood-message-json':
      //console.log ("I got a message file in s3 file types");
      return msg_module.new_msg_file_obj(meta, callback);

    //case 'audio':
    //  return audio_file.new_audio_file_obj_from_meta(meta, callback);
    //case 'video':
    //  return video_file.new_video_file_obj_from_meta(meta, callback);
    case 'markdown': // doing 01 24
      return markdown_file.markdown_file_obj(meta, callback);
    case 'goodagood-note':
      console.log('--got to set a note file');
      return note_file.get_note_file(meta, callback);
    default:
      p('go to set defaualt, in s3 file type js # set file obj from meta ');
      p('923 -- meta.path'); p(meta.path);
      simple_file.simple_s3_file_obj(meta, callback);
      //meta.html['li'] = render.make_simple_li(meta);
  }
}




module.exports.file_obj_from_meta  = file_obj_from_meta;
module.exports.set_file_obj_from_meta  = set_file_obj_from_meta;



// vim: set et ts=2 sw=2 fdm=indent:
