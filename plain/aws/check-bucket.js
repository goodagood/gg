var path     = require('path');
var U        = require('underscore');

var myconfig =   require("../config/config.js");
var bucket   = require('./bucket.js');


function list_new_meta_file(username){
    username = username || 'abc';
    var prefix = path.join(username, myconfig.new_meta_folder);
    bucket.list(prefix, function(err, data){
        console.log(data);
    });
}


function list_new_meta_data(username){
    username = username || 'abc';
    var prefix = path.join(username, myconfig.new_meta_folder);
    bucket.list(prefix, function(err, file_list){
        //console.log(file_list);
        U.each(file_list, function(data){
            var key = data.Key;
            bucket.read_json(key, function(err, j){
                console.log(j);
            });
        });
    });
}



if(require.main === module){
  list_new_meta_data();
}

