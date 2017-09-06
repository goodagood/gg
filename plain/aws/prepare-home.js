
// This is before hand action, because
// init-home can be a time consuming task, more and more settings added.
//
// we prepare home (root) which identified by id,
// then we user register, they get a root/home fastly. 
// By this, user will map to 'id', and all the mapping things will happen.
//

var path  = require('path');
var async = require("async");

var folder_module = require("./folder-v5.js");

var ihome = require('./init-home.js');
var iroot = require('./init-root.js');


var redis_basic = require("../myutils/redis-basic.js");
var rclient = redis_basic.client;

var p = console.log;

// The key used for list of 'ids' in redis:
var Key_of_prepared_ids = 'prepared-ids-0407-08:57am';

function prepare_home(callback) {
    redis_basic.serial_number_str(function(err, sid){
        p('got serial num ', err, sid);

        iroot.init_root_folder(sid).then(function(home) {
            //p('one home init-ed:', home);
            p('one home init-ed:', sid);

            init_auxiliary_files(sid, function(err, what){
                add_id_to_list(sid, function(err, what){
                    p('added id', err, what);
                    callback(err, sid);
                });
            });
        }).catch(function(err){
            return callback(err, null);
        });
    });
}


function add_id_to_list(id, callback){
  rclient.sadd(Key_of_prepared_ids, id, function(err, reply){
    if(callback) callback(err, reply);
  });
}


function list_ids(callback){
    // list prepared home ids, which is not occupied
    rclient.smembers(Key_of_prepared_ids, callback);
}


function get_one_prepared_home_id(username, callback){
    // @username would be owner of this home
    rclient.spop(Key_of_prepared_ids, function(err, home_id){
        if(err) return callback(err, home_id);
        p('getting one prepared home id: ', err, home_id);

        // user need to mark 'owner' to the room, and things likes.
        //user_occupy_room(username, home_id);
        //// this used in testing, remove to save later trouble:
        //callback(null, home_id);

        // --- --- ...
        // After callback, we do necessary check in errants here, for easy trying.
        // alternative way is to send out event, let others do the job, 
        //set_owner(home_id, username, function(err, whatever){p('set owner, err what', err, whatever);});
        set_owner(home_id, username, function(err, whatever_after_walk_through){
            if(err) return callback(err, null);
            callback(null, home_id);
        });
    });
}


//var pre_people = require("../users/pre-people-file.js");
var member2 = require("./members-v2.js");

var people = require("../users/people-v2.js");
/*
 * Files needed in the empty home folder,
 *   peopel json file, for people management
 *   member file for each folder, sub-folders
 *   default css style for file info and folder listing
 *   settings
 *   After people and member changed to v2, this changed correspondingly.
 *   2015 0728
 */
function init_auxiliary_files(home_id, callback){
    people.make_people_file_for_empty_home(home_id, function(err, s3reply){
        var muji = path.join(home_id, 'muji');
        var pub  = path.join(home_id, 'public');
        member2.add_public_viewer_to_path(muji, function(err, what){
            member2.add_public_viewer_to_path(pub, callback);
        });
    });

    //pre_people.write_people_json(home_id, null, function(err, what){
    //    open_pub_folder(home_id, function(err, novalue){
    //        if(err) return callback('open pub folder failed', null);

    //        callback(null, null);
    //    });
    //});
}


/*
 * Make every one can view 'public' folder, ie. add '*' as viewer.
 */
function open_pub_folder(home_id, callback){
    var pub_folder_path = path.join(home_id, 'public');

    folder_module.is_folder_exists(pub_folder_path, function(err, yes){
        if(err || !yes) return callback('public folder not exist?', null);

        folder_module.retrieve_folder(pub_folder_path).then(function(folder){

            member2.make_member_manager_for_folder(folder, function(err, mng){
                if(err) return callback('fail to make member manager for public folder.', null);

                mng.add_viewer('*', function(err, s3rep){
                    callback(null, null);
                });
            });

        }).catch(function(err){
            callback(err, null);
        });
    });
}


// When user check in, we need set owner for the home.
var walker = require("../aws/walk-through.js");
function set_owner(hid, owner_name, callback){

    // set a function to deal owner setting for each folder:
    function change_owner(parent_folder, folder, callback_){
        var meta = folder.get_meta();
        meta.owner = owner_name;
        p('change owner for: ', meta.path);
        folder.save_meta(function(err, whatever){
            if(err) return callback_(err, null);
            parent_folder.update_sub_folder(meta, callback_);
        });
    }

    //For one folder, set it's owner, parameters is past in by 'walk_through'
    function do_folder(parameters, callback_){
        var folder        = parameters.sub_folder_obj;
        var parent_folder = parameters.cwd_folder_obj;
        p('sub folder owner: ', parameters.sub_folder_meta.owner);
        change_owner(parent_folder, folder, callback_);
    }

    // do_file is noop:
    var funs = {
        do_folder: do_folder,
        do_file:   function(parameters, callback){ callback(null, null); }
    }

    folder_module.retrieve_folder(hid).then(function(root_folder){
        // set the owner for the root folder, the home folder.
        // It has no parent folder, we do it here, then walk into it:
        var root_meta = root_folder.get_meta();
            root_meta.owner = owner_name;
        root_folder.save_meta(function(err, whatever){
            walker.walk_through(root_folder, funs, callback);
        });
    }).catch(function(err){
        return callback(err, null);
    });
}


// send out a signal, so new room can be prepared
var job = require("../myutils/job.js");
var myutil = require("../myutils/myutil.js");
function signal_one_room_occupied(username, room_id, callback){
  var msg = {
    name : 'new-user',   // this is task/msg name
    username : username,
    roomid   : room_id,
    descrpt  : 'none',
    timestamp: Date.now(),
  };

  // pub task will add the id
  //var new_user_task_id = 'new-user-task-id' + myutil.get_uuid();
  //msg.id = new_user_task_id;

  job.pub_task(job.channel, msg, function(e, task_json){
      console.log('signal one more room... ... callback (e, task_json): ', e, task_json);
      callback(e, task_json);
  });
}


function prepare_more_home(num, callback){
    num = num || 3; // 3 or 2?

    p('in prepare home, prepare more home');
    async.whilst(
            function(){num = num - 1; return num > 0;}
            ,function(callback){
                prepare_home(function(err, sid){
                    p('-- after prepare home, err id: ', err, sid);
                    callback(err, sid);
                });
            }
            ,function(err, whatever){
                p('\n\nprepare more home, last callback, async whilst: ', err, whatever);

                if(u.isFunction(callback)) callback(err, whatever);
            });
}


module.exports.add_id_to_list = add_id_to_list; //4 test

module.exports.prepare_home   = prepare_home;
module.exports.list_ids       = list_ids;

module.exports.get_one_prepared_home_id = get_one_prepared_home_id;

module.exports.set_owner = set_owner;

module.exports.prepare_more_home = prepare_more_home;

// for testing
module.exports.redis_basic = redis_basic;
module.exports.signal_one_room_occupied = signal_one_room_occupied;



// -- internal checkings -- //

function check_open_pub_folder(root_dir){
    root_dir = root_dir || '19';

    open_pub_folder(root_dir, function(err, non){
        p('callback of "open pub_folder": ', err, non);
        require("../myutils/test-util.js").stop();
    });

}



function check_init_files(root_dir){
    root_dir = root_dir || '70';

    init_auxiliary_files(root_dir, function(err, non){
        p('callback of "init auxili files": ', err, non);
        require("../myutils/test-util.js").stop();
    });

}

if(require.main === module){
    //check_open_pub_folder();
    check_init_files();
}


