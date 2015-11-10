
var path = require('path');
var u    = require('underscore');

var s3file   = require('./file.js');
var s3folder = require('./folder.js');
var json_file= require('./json-file.js');


function new_team_folder(folder_path, cb_pass_folder_obj){
  // For team folder, it's also s3 folder
  // 'folder' is different from file, 
  // for folder, we build it from path, not meta.

  s3folder.retrieve_folder(folder_path, function(folder_obj){
    // Every thing need to wrapped here.

    var meta = folder_obj.get_meta();

    meta.is_team_folder = true;
    var members_file_name = '.gg.members.json';
    var viewers_file_name = '.gg.viewers.json';

    // new functionalities: moved to folder itself.



    var new_functions = {
    };

    // Use the parent object as defaults, and leave it untouched,
    // so, parent 'methods' can be used more easily inside the new functions.
    u.defaults(new_functions, folder_obj);
    // To pass out the new folder object.
    cb_pass_folder_obj(new_functions);

  });
}

module.exports.new_team_folder = new_team_folder;

// vim: set et ts=2 sw=2 fdm=indent:
