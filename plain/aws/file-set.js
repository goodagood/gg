//
// todo: 0209
//
// Prepare a set of files, for html deliverring.
// Split functionalities from folder-v5, choose files, sorting, filterring,
//   put to different html element, deliver to renderring or 
//   web page assembling.
//


//var redis   = require("redis");
//var Promise = require("bluebird");
var assert  = require('assert');
var u       = require('underscore');

//var myconfig   =   require("../config/config.js");
var folder_module = require('./folder-v5.js');



//var Lock_Prefix = 'folder.lock.';

var p     = console.log;
var tutil = require("../myutils/test-util.js");


function build_default_file_set(cwd, callback){
    var Tool = {}; // obj contains exposed functions.

    var Folder , Meta;//, Uuid;


    function sort_files(key, descend) {
        var files, sorted;

        descend = descend || false;
        files = u.values(Meta.files);
        if ((files.length == null) || files.length < 1) {
            return null;
        }

        sorted = u.sortBy(files, function(element) {
            if (element[key] != null) {
                return element[key];
            } else {
                return 0;
            }
        });
        if (descend) {
            sorted.reverse();
        }
        return sorted;
    }


    function sort_files_by_date () {
        var files;
        files = sort_files('timestamp', true);
        list_files(files);
        return files;
    }


    function list_files  (file_list) {
      var ul, ulv;
      file_list = _dot_filter(file_list);
      ul = "<ul class=\"folder-list list-unstyled\">";
      ulv = "<ul class=\"folder-list list-unstyled\">";
      u.each(file_list, function(file) {
        if (file.html != null) {
          if (file.html.li != null) {
            if (file.name.indexOf(".gg") !== 0) {
              ul += file.html.li;
              return ulv += file.html.li_viewer;
            }
          }
        }
      });
      ul += "</ul>";
      ulv += "</ul>";
      _meta_.renders.ul = ul;
      return _meta_.renders.ul_for_viewer = ulv;
    };


    function dot_filter(file_list) {
        if (!u.isArray(file_list)) {
            p('fuck not array found in "dot filter"/ file set');
        }
        return file_list.filter(function(file) {
            if (file.name.indexOf(".") === 0) {
                return false;
            } else {
                return true;
            }
        });
    }

    function pattern_to_file_list(pat){
        var uuids = Folder.pattern_to_uuids(pat);
        p('uuids:', uuids);
        var list  = uuids.map(function(id){
            return Meta.files[id];
        });
        return list;
    }


    // end of functions //

    folder_module.retrieve_folder(cwd).then(function(folder){
        Folder = folder;
        Meta   = Folder.get_meta();

        assert(Meta.path === cwd,
            "In file-set, default ..Retrieved folder should has path: "+cwd);

    }).then(function(){
        Tool.sort_files = sort_files;
        Tool.sort_files_by_date = sort_files_by_date;
        Tool.list_files = list_files;
        Tool.pattern_to_file_list = pattern_to_file_list;

        callback(null, Tool);
    });
}








module.exports.build_default_file_set = build_default_file_set;


// -- do some fast checkings -- //

var test_user_name   = 'abc';
var test_folder_path = 'abc';

function first_check(){
    var test_folder_path = 'abc/add-2';
    build_default_file_set(test_folder_path, function(err, fset){
        //p(Meta.path, Meta.uuid);
        var list = fset.pattern_to_file_list(/o/);
        p(u.pluck(list, 'path'));
        tutil.stop();
    });;
}


if(require.main === module){
    var test_user_name   = 'abc';
    var test_folder_path = 'abc';

    //build_default_file_set(test_user_name);
    first_check();


    //setTimeout(function(){process.exit();}, 28000);
}

