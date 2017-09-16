
var path = require('path');
var u    = require('underscore');
var util = require('util');

var s3file   = require('./file.js');
var s3folder = require('./folder.js');
var json_file= require('./json-file.js');


// relative location of people list file
var people_file_name       = '.gg.people.json';
var config_folder_location = 'goodagood';
var people_file_location   = 'goodagood/.gg.people.json';

var log28  = require('../myutils/mylogb.js').double_log('/tmp/log28');

function init_people_file(username){

  //var content = [];
  var content = {
    current : [],
    all     : [],
    people  : [],
    teams   : [],
    groups  : {},
  };

  var config_folder_path = path.join(username, config_folder_location);
  s3folder.retrieve_folder(config_folder_path, function(folder){
    var meta = folder.get_meta();
    if(meta.owner && meta.owner.username) content.all.push(meta.owner.username);
    if(typeof meta.owner === 'string') content.all.push(meta.owner);

    //var file_name = path.join(username, people_file_location);
    if( !folder.is_file_exists(people_file_name)){
      console.log('init people file : ', username);
      folder.new_json_file(people_file_name, content);
    }
  });
}


/*
 * Refit to use ../user/people.coffee(js)
 */
function add_people(me, who){
  // I (me) add another user (who)

  var config_folder_path = path.join(me, config_folder_location);

  s3folder.retrieve_folder(config_folder_path, function(folder){
    folder.get_file_obj(people_file_name, function(pfile){
      pfile.get_json(function(j){
        //console.log(j);
        if( j.all.indexOf(who) < 0 ) j.all.push(who);
        if( j.current.indexOf(who) < 0 ) j.current.push(who);
        //console.log(j);
        //console.log(pfile.get_meta());
        pfile.write_json(j);
        folder.add_file(pfile.get_meta());
        folder.save_meta();
      });
    });
  });
}

function add_people_batch(username, user_list){
  // user add list of users to people.

  var config_folder_path = path.join(username, config_folder_location);

  s3folder.retrieve_folder(config_folder_path, function(folder){
    folder.get_file_obj(people_file_name, function(pfile){
      pfile.get_json(function(j){
        //console.log(j);
        user_list.forEach(function(new_user){
          if( j.all.indexOf(new_user) < 0 ) j.all.push(new_user);
          if( j.current.indexOf(new_user) < 0 ) j.current.push(new_user);
        });
        console.log(j);
        //console.log(pfile.get_meta());
        pfile.write_json(j);
        folder.add_file(pfile.get_meta());
        folder.save_meta();
      });
    });
  });
}

function get_people_file_obj(username, callback){
  var config_folder_path = path.join(username, config_folder_location);

  s3folder.retrieve_folder(config_folder_path, function(folder){
    folder.get_file_obj(people_file_name, function(pfile){
      callback(pfile);
    });
  });
}

function write_people_file_obj(username, people_file_obj, callback){
  // @callback will get (err, folder_meta) from folder.save_meta
  var config_folder_path = path.join(username, config_folder_location);

  s3folder.retrieve_folder(config_folder_path, function(folder){
    var meta = people_file_obj.get_meta();
    folder.add_file(meta);
    folder.save_meta(callback);
  });
}

// not tested. 0814
function delete_peoples(username, list_to_delete, callback){
  // This is not optimised, both get_people_file_obj and
  // write_people_file_obj will retrieve it's own folder object. 0814.
  get_people_file_obj(username, function(pfile){
    pfile.get_json(function(j){
      j.all = u.difference(j.all, list_to_delete);
      j.current = u.difference(j.current, list_to_delete);
      pfile.write_json(j, function(){
        write_people_file_obj(username, pfile, callback);
      });
    });
  });
}

function get_people_list(username, callback){
  // get the list of all people, it's array

  var config_folder_path = path.join(username, config_folder_location);

  s3folder.retrieve_folder(config_folder_path, function(folder){
    //log28('config_folder_path',  config_folder_path);
    //log28('folder',  folder);
    folder.get_file_obj(people_file_name, function(pfile){
      if(!pfile) return callback(null);
      pfile.get_json(function(j){
        callback(j.all);
      });
    });
  });
}


function get_people_data(username, callback){
  // get data of people

  var config_folder_path = path.join(username, config_folder_location);

  s3folder.retrieve_folder(config_folder_path, function(folder){
    //log28('config_folder_path',  config_folder_path);
    //log28('folder meta',  folder.get_meta());
    folder.get_file_obj(people_file_name, function(pfile){
      if(!pfile) return callback(null);
      pfile.get_json(function(j){
        callback(j);
      });
    });
  });
}


function get_current_people(username, callback){
  get_people_data(username, function(data){
    if(!data) return callback(null);
    callback(data.current);
  });
}

function add_current_people(username, another_user, callback){
  // user add another user to list of people.

  var config_folder_path = path.join(username, config_folder_location);

  s3folder.retrieve_folder(config_folder_path, function(folder){
    folder.get_file_obj(people_file_name, function(pfile){
      pfile.get_json(function(j){
        //console.log(j);
        if( j.current.indexOf(another_user) < 0 ) j.current.push(another_user);
        console.log(j);
        //console.log(pfile.get_meta());
        pfile.write_json(j);
        folder.add_file(pfile.get_meta());
        folder.save_meta(function(){
          callback(j.current);
        });
      });
    });
  });
}

function add_current_people_batch(username, names, callback){
  // user add names (array) to list of people.

  var config_folder_path = path.join(username, config_folder_location);

  s3folder.retrieve_folder(config_folder_path, function(folder){
    folder.get_file_obj(people_file_name, function(pfile){
      pfile.get_json(function(j){
        //console.log(j);
        var together = u.union(j.current, names);
        j.current = together;
        //console.log(j);
        //console.log(pfile.get_meta());
        pfile.write_json(j);
        folder.add_file(pfile.get_meta());
        folder.save_meta(function(){
          callback(j.current);
        });
      });
    });
  });
}


function delete_current_people(username, p_name, callback){
  // @callback get data from upstream.
  get_people_file_obj(username, function(pfobj){
    var json_data = pfobj.get_json();
    var without = u.without(json_data.current, p_name);
    json_data.current = without;
    pfobj.write_json(json_data);
    write_people_file_obj(username, pfobj, callback);
    //callback(data.current);
  });
}

function delete_current_people_batch(username, names, callback){
  // @callback get data from upstream.
  get_people_file_obj(username, function(pfobj){
    //var json_data = pfobj.get_json();
    pfobj.get_json(function(json_data){
      var without = u.difference(json_data.current, names);
      json_data.current = without;
      pfobj.write_json(json_data);
      write_people_file_obj(username, pfobj, callback);

    });
    //callback(data.current);
  });
}



function get_current_people_list_ul(username, callback){
  var ul = '<ul class="usernames list-inline">';
  get_current_people(username, function(people){
    u.each(people, function(name){
      //var li = '<input type="checkbox" name="users[]" value="' + name + '" />&nbsp;' ;
      var li = util.format('<li class="username">\n<input type="checkbox" name="users[]" value="%s"  />%s &nbsp</li>\n', name, name) ;
      ul += li;
    });
    ul += '</ul>';
    callback(ul);
  });
}

function get_people_list_ul(username, callback){
  var ul = '<ul class="usernames list-inline">';
  get_people_list(username, function(people_data){
    u.each(people_data, function(name){
      //var li = '<input type="checkbox" name="users[]" value="' + name + '" />&nbsp;' ;
      var li = util.format('<li class="username">\n<input type="checkbox" name="users[]" value="%s"  />%s&nbsp</li>\n', name, name) ;
      ul += li;
    });
    ul += '</ul>';
    callback(ul);
  });
}


module.exports.init_people_file = init_people_file;
module.exports.add_people = add_people;
module.exports.add_people_batch = add_people_batch;
module.exports.add_current_people = add_current_people;
module.exports.add_current_people_batch = add_current_people_batch;
module.exports.delete_current_people = delete_current_people;
module.exports.delete_current_people_batch = delete_current_people_batch;

module.exports.get_people_file_obj = get_people_file_obj;
module.exports.get_people_data = get_people_data;
module.exports.write_people_file_obj = write_people_file_obj;
module.exports.get_people_list = get_people_list;
module.exports.get_people_list_ul = get_people_list_ul;
module.exports.get_current_people_list_ul = get_current_people_list_ul;
module.exports.get_current_people = get_current_people;


if (require.main === module){
  init_people_file('ee');
  //add_people('pptok', 'andrew');
  //get_people_list('tmp', function(j){ console.log(j); });
  //add_people('abc', 'andrew');
  //
  //get_people_data('dd', function(j){ console.log(j); });
  //get_current_people('dd', function(men){console.log(men);});
  //get_current_people_list_ul('tmpd', function(ul){console.log(ul);});
  //add_current_people_batch('tmpd', ['abc', 'pptok'], function(json){console.log(json);});
  //delete_current_people_batch('tmpd', ['abc', ], function(what, who){console.log(what, who);});
}

// vim: set et ts=2 sw=2 fdm=indent:
