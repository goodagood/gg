/* 
 * For each user, make directory, and move file to it during uploading
 */

var sys = require('sys');
var path = require('path');
var exec = require('child_process').exec;

var fs = require('fs');

var conf =   require("../config/config.js");
var upload_dir = conf.formidable_upload_dir;

var mv = require('mv');

var myfile = require("../myfile.js");
var myuser = require("../myuser.js");

function make_sure_dir(abspath){
    var dirname = path.dirname(abspath);
    fs.exists(dirname, function(exists){

        if(!exists){
            var cmd = "mkdir -p " + dirname;
            exec(cmd, function(err, stdout, stderr){
                if (err) throw Error(err);
            });
        }else{
            console.log("exists: " + dirname);
        }

    });
}



//function move2home(username, file){
//  // move the file to the user's home folder
//  // file : provide by `formidable` 
//
//  console.log("move2home start");
//  console.log(file);
//
//  var move2 = path.join(upload_dir, username,  file.name);
//  user_path.make_sure_dir(move2);
//
//  mv(file.path, move2, function(err){
//    if(err){ 
//      console.log("move2home move error");
//      console.log(err);
//    }else{
//      console.log("move2home moved");
//      file.tmppath = file.path;
//      file.path = move2;
//      myfile.save_file_info(file);
//      save_file_info_local(file);
//    }
//  });
//
//}

function move2folder(username, abspath, file){
  // move the file to the user's home folder
  // file : provide by `formidable` 

  //console.log("move 2folder start");
  //console.log(file);

  mv(file.path, abspath, function(err){
    if(err){ 
      console.log("move to folder - move error");
      console.log(err);
    }else{
      console.log("move to folder - moved");
      file['tmppath'] = file.path;
      //file['path'] = abspath;
      file['storage_type'] = 's3';
      myfile.save_file_info(file, function(err, file_key){
          //
          file['redis_file_key'] = file_key;
          //console.log("-- move 2 folder -- ");
          //console.log(file);
          myuser.add_file_key(username, file);
      });
      save_file_info_local(file);
    }
  });

}


function check_path_move_home(username, file){  // ?
    // use command line tool (child_process) to move uploaded file into user
    // home folder.  Where `yas3fs` running, the file will be mapped to S3
    // storage.
    var abspath = path.join(upload_dir, username,  file.name);
    var dirname = path.dirname(abspath);
    file['yas3fspath']     = abspath;
    file['s3key']     = abspath;
    file['s3dirname'] = dirname;

    fs.exists(dirname, function(exists){

        if(!exists){
            var cmd = "mkdir -p " + dirname;
            exec(cmd, function(err, stdout, stderr){
                if (err) throw Error(err);
                move2folder(username, abspath, file)
            });
        }else{
            console.log("exists: " + dirname);
            move2folder(username, abspath, file)
        }
    });
}



var localinfo = require('../myblueimp/local-info.js');
var myutil = require('../myutils/myutil.js');
function save_file_info_local(file){
  // The supposed file path after moved from tmp dir.
  //var move2 = path.join(upload_dir, files.name);
  //
  // name should be an unique id, need an crypto thing:
  var name = myutil.random_file_id_ms();
  localinfo.insert_file_info(name, 'local-uploaded', file);
}

//module.exports.make_sure_dir = make_sure_dir;
module.exports.check_path_move_home = check_path_move_home;


/* tests */
function test_make_sure_dir(){
    var tmppath = '/public/ggfsa/tmp/testmake/t0510';
    make_sure_dir(tmppath);
}


if (require.main === module){
    //console.log('ok');
    test_make_sure_dir();
}
