
var u      = require('underscore' );
var path   = require('path');

var s3folder = require('./folder.js');
var social = require('./social.js');

var myuser = require('../myuser.js');

var people_file_name       = '.gg.people.json';
var config_folder_location = 'goodagood';

function find_and_init_people_file(){
  myuser.get_user_names(function(err, names){
    //console.log(u.isArray(names))
    //console.log(typeof names);
    //console.log(names);
    names.forEach(function(username){
      var config_folder_path = path.join(username, config_folder_location);
        s3folder.retrieve_folder(config_folder_path, function(folder){
          if( !folder.is_file_exists(people_file_name)){
            console.log('init for : ', username);
            social.init_people_file(username);
          }
        });
    });
  });
}


function reset_people_files(){
  myuser.get_user_names(function(err, names){
    //console.log(u.isArray(names))
    //console.log(typeof names);
    //console.log(names);
    names.forEach(function(username){
      var config_folder_path = path.join(username, config_folder_location);
        s3folder.retrieve_folder(config_folder_path, function(folder){
          var folder_meta = folder.get_meta();
          if( folder.is_file_exists(people_file_name)){
            //console.log('init for : ', username);
            //console.log('file exists : %s %s ', folder_meta.path, people_file_name);
            folder.get_file_obj(people_file_name, function(file_obj){
              console.log('try to get json : %s %s ', folder_meta.path, people_file_name);
              var j = file_obj.get_json(function(j){
                console.log('before: ', j);
                var without_null = u.without(j, 'null', null);

                var content = {
                  current : [],
                  all     : without_null,
                  people  : [],
                  teams   : [],
                  groups  : {},
                };
                file_obj.write_json(content);

                folder.add_file(file_obj.get_meta());
                folder.save_meta();

              });
            });
            //social.init_people_file(username);
          }
        });
    });
  });
}



function show_all_people_files(){
  myuser.get_user_names(function(err, names){
    //console.log(u.isArray(names))
    //console.log(typeof names);
    //console.log(names);
    names.forEach(function(username){
      var config_folder_path = path.join(username, config_folder_location);
        s3folder.retrieve_folder(config_folder_path, function(folder){
          var folder_meta = folder.get_meta();
          if( folder.is_file_exists(people_file_name)){
            //console.log('init for : ', username);
            //console.log('file exists : %s %s ', folder_meta.path, people_file_name);
            folder.get_file_obj(people_file_name, function(file_obj){
              console.log('try to get json : %s %s ', folder_meta.path, people_file_name);
              var j = file_obj.get_json(function(j){
                console.log('before: ', j);
                //var without_null = u.without(j, 'null', null);

              });
            });
          }
        });
    });
  });
}


if (require.main === module){

  //find_and_init_people_file();

  // Be careful, this is used to convert old files, 0807
  //reset_people_files();

  show_all_people_files();
  setTimeout(function(){ process.exit(0); }, 25000);  // close the redis.
}



// vim: set et ts=2 sw=2 fdm=indent:
