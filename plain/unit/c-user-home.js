
// check user get home folder
// with user id, we make sure, it's home folder's name

var assert = require("assert");
var u      = require("underscore");
var async  = require("async");

var user   = require("../users/a.js");
var folder_module = require("../aws/folder-v5.js");
var tutil  = require("../myutils/test-util.js");

var p      = console.log;


function check_user_roll(){
    user.get_user_names(function(err, names){
        //console.log(typeof names);
        //console.log(u.isArray(names));
        names.sort();
        console.log('length: ', names.length);
        console.log(names.join(', '));

        assert(u.isArray(names));
        //u.map(names, a.findByUsername);
        tutil.stop();
    });
}

function check_home_ids(){
  user.get_user_names(function(err, names){
    //console.log(typeof names);
    //console.log(u.isArray(names));
    //console.log(names.join(', '));

    assert(u.isArray(names));
    u.each(names, function(name){
        user.get_user_id(name, function(err, id){
            if(err) p('Error, 1, ', err, id);
            //p(name, '\t', id);
            folder_module.is_folder_exists(id, function(err, yes){
                if(err) p('Error, 2, ', err, yes);
                p(yes, name, id);
                if(yes !== true) p('wow, this one: ',name, id)
            });
        });
    });
    tutil.stop(55);
  });
}


var uhash = require("../users/hash-pass.js");
function make_salted_hash_for_all(){
  user.get_user_names(function(err, names){
      if(err) return p('get user names err: ', err);

      p('going to make it salt and hashed,');
      p(names.sort().join(" \t "));

      async.map(names, uhash.set_salted_hash_if_plain_password, function(err, results){
          p('can we set salted hash for all? ', err);
          p('the results:'); p(results);

          tutil.stop(5);
      });
  });
}


if(require.main === module){
    //check_user_roll();
    //check_home_ids();

    make_salted_hash_for_all();
}
