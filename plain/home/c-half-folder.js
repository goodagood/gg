/*
 * Wrong with: Init home folder slow way
 * Try to build a home half way and check it.
 * 2015 1129
 */

var sh = require("./slow-home.js");
var user = require("../users/a.js");
var folder_module = require("../aws/folder-v5.js");

var rfolder = require("./root-folder.js");
var shome   = require("./slow-home.js");


var u = require("underscore");

var p = console.log;




// find a way to check what's wrong
// 2015 1128
function catcher_in_middle_home_building(user, callback){
    var id = user.id;

    if(!id) return callback('must provide an root id, in init root');
    //if(!u.isString(id)) id = id.toString();

    var Goodagood, Home, folder_opt;
    //s3key = path.join(myconfig.meta_file_prefix, username);
    //s3key = path.join(myconfig.folder_meta_prefix, id);

    folder_opt = {};
    folder_opt['path'] = id;
    folder_opt['name'] = id;
    folder_opt['parent-dir'] = '';

    folder_opt.owner = user.username;
    folder_opt.permission = {
        owner: 'rwx',
        other: '',
        group: ''
    };
    folder_opt['create-timestamp'] = Date.now();
    folder_opt['timestamp'] = Date.now();

    p('c p o n h b, goint to buidl n f a s, 1128 1006'); p(folder_opt);

    // really it not save, we catch and check in middle
    rfolder.make_root_folder(folder_opt).then(function(folder) {
        p('start to add sub folders? 1128 1108');

        return callback(null, folder);
        //add_sub_folders(folder);
    }).catch(callback);
    
    //.then(function(folder){
    //    callback(null, folder);
    //})
    
}


function get_user_info(name, callback){
    //p('some helper when dodrop not working');
    name = name || 'jobs';
    callback = callback || function(){};

    user.find_by_user_name(name, function(err, info){
        if(err){
            p('find by user name err: ', err, o.e1 = err);
            return callback(err);
        }

        //p('info, 1128 8:32am');
        //p(info);

        return callback(null, info);
        //process.exit(p('get user info exit in dev.'));
    });
}


function step_by_step_check_new_home(name, o){
    name = name || 'jobs';
    o    = o    || {};

    get_user_info(name, function(err, info){
        // do if err

        p(err); p(info);
        o.ui = info;
        o.uerr = err;

        catcher_in_middle_home_building(info, function(err, home){
            p(err); p(home);
            o.cerr = err;
            o.home = home;
            p('keys of home folder: ', u.keys(home).sort());

            p('you can get o'); p( "ok start interact:");
            //process.exit(p('exit from step . step check new home'));
        });
    });
}


// to drop:
var o = {};
step_by_step_check_new_home('jobs', o);



//p( "ok start interact:");



if (require.main === module) {
    step_by_step_check_new_home('jobs');
}

//setTimeout(function(){process.exit(p('going to exit'));}, 1000);
