/*
 * Weirdly, got u-slow-home failed to drop into REPL, 
 * but 'expect' and the dropping actually working.
 * 2015 1128
 */

var sh = require("./slow-home.js");
var user = require("../users/a.js");
var folder_module = require("../aws/folder-v5.js");

var u = require("underscore");
var p = console.log;


function init_the_home(user, o, callback){
    // @user is user info with username,  id and such
    callback = callback || function(){};

    p('going to init user home ', user);
    sh.init_user_home(user, function(err, folder){
        if(err) return p('init user home err: ', err, o.e2 = err);

        o.folder = folder;
        p('it should ok? 1128 1225');
    });
}


// find a way to check what's wrong
// 2015 1128
function check_init_home_again(user, callback){
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

    // This got one time not pass, it works now, don't know what. 2015 1108
    folder_module.build_root_folder_and_save(folder_opt).then(function(folder) {
        p('start to add sub folders? 1128 1108');
        //add_sub_folders(folder);
    })
    
    //.then(function(folder){
    //    callback(null, folder);
    //})
    
    .catch(callback);


    //return folder_module.build_new_folder(folder_opt).then(function(folder) {
    //    Home = folder;

    //    // debuging
    //    var hmeta = Home.get_meta();
    //    p( 'home meta: ', hmeta);

    //    // write with locking, perhaps some need retrieve it.
    //    return Home.promise_to_write_meta()
    //}).then(function(what){
    //    callback(null, Home);
    //}).catch(callback);


    ///// 'build new folder' will not save it.
    ///return folder_module.build_new_folder(folder_opt).then(function(folder) {
    ///    Home = folder;

    ///    // debuging
    ///    //var hmeta = Home.get_meta();
    ///    //p( 'home meta: ', hmeta);

    ///    // write with locking, perhaps some need retrieve it.
    ///    return Home.promise_to_write_meta()
    ///}).then(function(){
    ///    return add_sub_folders(Home);
    ///}).catch(callback);
    

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


function step_by_step_check_new_home(name){
    name = name || 'jobs';
    get_user_info(name, function(err, info){
        // do if err

        p(err);
        p(info);
        check_init_home_again(info, function(err, home){
            p(err); p(home);

            process.exit(p('exit from step . step check new home'));
        });
    });
}


// to drop:
var o = {};

function drop(name){
    name = name || 'jobs';
    p('some checking when drop not working');

    user.find_by_user_name(name, function(err, info){
        if(err) return p('find by user name err: ', err, o.e1 = err);
        o.ui = info;
        p('info, 1128 8:32am');
        p(info);

        sh.init_user_home(info, function(err, folder){
            if(err) return p('init user home err: ', err, o.e2 = err);

            o.folder = folder;
            p('it shoul populated');
        });
    });
}


//drop('jobs'); 
//p( "ok start interact:");



if (require.main === module) {

    step_by_step_check_new_home('jobs');
    //get_user_info();
    //process.exit(p('it to check'));
}

