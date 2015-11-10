/*
 *  When user name can be used as id, some would like to make it same.
 *  Then we need to build the new 'home' with the id for user, this is slow.
 *
 *  Do this from 'init home.js', 
 *  I forgot which is the latest version of  doing home initialization,
 *  follow 'init home.js' anyway.
 *
 *  2015 1108
 *
 */



var u    = require("underscore");
var path = require("path");
var assert  = require("assert");
var async   = require("async");
//var Promise = require("bluebird");

var folder_module = require("../aws/folder-v5.js");
//var myconfig =   require("../config/config.js");

var user   = require('../users/a.js');
var nameid = require('../users/validate-name.js');

var secrets  =  require("../config/secret-dir.js");
var aws_conf =  secrets.conf.aws;

var p = console.log;


// @user_info : hash {username:..., password:..., referrer:...}
function take_in_user_info(user_info, callback){
    if(!enough_user_info(user_info)) return callback('not enough user info');
    var un = user_info.username;

    nameid.user_name_could_be_used_as_id(un, function(err, yes, reason){
        if(err)  return callback(err);
        if(!yes) return callback(un + ' not good for user id', reason);

        user_info['id'] = un; // The name can be used as id.
        fill_in_user_info(user_info);
        p('after fill in user info: ', user_info);

        // This also will hash the password and delete the plain password:
        user.save_user_to_redis(user_info, callback);
        //callback(null,null);//indev
    });
}


function enough_user_info(ui){
    if(ui.username && u.isString(ui.username)){
        if(ui.password && u.isString(ui.password)){
            return true;
        }
    }

    return false;
}


function fill_in_user_info(info){
    info['what'] = "user_information";
    info['storage'] = "s3";
    info['s3-bucket'] = aws_conf.root_bucket;
}


/*
 * User name is user id.
 */
function init_user_home(user, callback) {
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

    //p('goint to buidl n f a s'); p(folder_opt);

    // This got one time not pass, it works now, don't know what. 2015 1108
    folder_module.build_new_folder_and_save(folder_opt).then(function(folder) {
        add_sub_folders(folder);
    }).then(function(folder){
        callback(null, folder);
    }).catch(callback);

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


/*
 * If  we want to change 'goodagood' to '.gg', add '.gg' first.  
 * Remove 'goodagood' only after '.gg' works.
 * 2015 1109
 */
function add_sub_folders(home){
    // @home: user's home folder, the root, name is user-id
    //
    //    home/public
    //    home/muji
    //    home/goodagood
    //    home/goodagood/etc
    //    home/goodagood/message

    var Goodagood;

    return home.add_folder('public').then(function(){
        p('to add muji');
        return home.add_folder('muji');
    }).then(function() {
        p('to add goodagood');
        return home.add_folder('goodagood');
    }).then(function(g) {
        Goodagood = g;

        // debugging
        var gm = g.get_meta();
        var cwd = gm.path;
        //p('meta of cwd: ', cwd, gm);
        p('to add goodagood/message');
        //return Goodagood;

        return Goodagood.add_folder('message');
    }).then(function(msg) {
        p('to add etc');
        return Goodagood.add_folder('etc');
    }).then(function() {
        p('to goodagood file listing');
        return Goodagood.promise_to_list_files_and_save();
    }).then(function() {
        return home.promise_to_list_files_and_save();
    });
}


/*
 *  To add sub-folder in user home, @home is folder object, note the folder
 *  '.gg' will not be list out by default.
 *
 *    user home/.gg
 *             /.gg/message
 *             /.gg/etc
 *
 *  2015 1109
 */
function add_gg(home){
    var gg; // folder object of '.gg'

    return home.add_folder('.gg')
    .then(function(g) {
        gg = g;

        // debugging
        //var gm = g.get_meta();
        //var cwd = gm.path;
        //p('meta of cwd: ', cwd, gm);
        //p('to add .gg/message');
        //return gg;

        return gg.add_folder('message');
    })
    .then(function(msg) {
        //p('to add etc');
        return gg.add_folder('etc');
    })
    .then(function() {
        //p('to .gg file listing');
        return gg.promise_to_list_files_and_save();
    })
    .then(function() {
        return home.promise_to_list_files_and_save();
    });
}


module.exports.take_in_user_info = take_in_user_info;


// export for debug
module.exports.init_user_home = init_user_home;
module.exports.add_gg = add_gg;




// the old before 2015 1108

// seems no different from the old 'init home c'? beside 'owner undefined' attr.

// add default files:
//   folder.css
//   file.css
// add people/member.json
// ...

var pre_people = require("../users/pre-people-file.js");
function init_people_file(root_id, callback){
    // @root_id : is user id, also home id.

    // wite an empty people file the the home id, before it get user check in.
    pre_people.write_people_json(root_id, {}, callback);
}

function init_member_file(folder_path){
}

//module.exports.init_root_folder = init_root_folder;


// do some fast checkings

function stop(period) {
    var milli_seconds;
    period = period || 1;
    if (!u.isNumber(period)) {
        period = 1;
    }
    milli_seconds = period * 1000;
    return setTimeout(process.exit, milli_seconds);
};


function check_init_root(){
    var folder_id_or_name = '5';

    init_root_folder(folder_id_or_name).then(function(what){
        //p('after init root folder  ', Object.keys(what));
        p('after init root folder  ', typeof what);
        p("checking 'init root folder': ", folder_id_or_name);
        stop();
    });
}



if (require.main === module) {
    check_init_root();
}


