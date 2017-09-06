
var u        = require('underscore');
var s3folder = require('./folder.js');
var tf       = require('./team-folder.js');

function get_old_folder(fpath){
  // fpath is folder_path here
  fpath = fpath || 'abc/public';
  s3folder.retrieve_folder(fpath, function(afolder){
    console.log(afolder);
  });
}

function convert_old_one(fpath){
  // fpath is folder_path here
  fpath = fpath || 'abc/public';
  tf.new_team_folder(fpath, function(afolder){
    afolder.init_members_file();
    afolder.init_viewers_file();

    var ameta = afolder.get_meta();
    //var without_files = get_rid_of_thing(ameta, 'files');
    //console.log(without_files);
    console.log( get_rid_of_thing(ameta, 'files'));
    //console.log(ameta.files);

  });
}


function check_has_member(fpath, member_name){
  // fpath is folder_path here
  fpath = fpath || 'abc/public';
  tf.new_team_folder(fpath, function(afolder){
    afolder.has_member('andrew', function(in_question){
      console.log(in_question);
      if(!in_question) afolder.add_member('andrew');
      afolder.save_meta();
    });
  });
}

function show_members(fpath){
  // fpath is folder_path here
  fpath = fpath || 'abc/public';
  tf.new_team_folder(fpath, function(afolder){
    afolder.get_all_members(function(member_array){
      console.log(member_array);
    });
  });
}



function get_rid_of_thing (meta, thing){
    var without_thing =  {};
    without_thing[thing] = null;
    //console.log(without_thing);
    u.defaults(without_thing, meta);
    //console.log(without_thing);
    return without_thing;
}


if (require.main === module){
  //get_old_folder();
  //convert_old_one();
  //check_has_member();
  show_members();
}


// vim: set et ts=2 sw=2 fdm=indent:
