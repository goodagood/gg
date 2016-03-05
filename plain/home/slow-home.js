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
var Promise = require("bluebird");

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


/*
 * At least we need 'username' and 'password' as string.
 */
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
 * User name as user id.
 */
function init_user_home(user, callback) {
    var folder_opt = make_root_folder_options(user);
    if(!folder_opt) return callback('failed to get home folder opt, when init user home');
    p('goint to build new folder, after set home folder opt  n f a s, 1128 1208 1006'); p(folder_opt);

    var Home;

    // This got one time not pass, it works now, don't know what. 2015 1108
    folder_module.build_new_folder(folder_opt).then(function(folder) {
        Home = folder;

        // If we don't write down the home folder, it can not be locked
        // to add more folder? save_meta not work because it need lock.
        Home.promise_to_write_meta(); 
    }).then(function(){
        p('start to add sub folders? 1208 03:30pm');
        add_sub_folders(Home);
    }).then(function(){
        p('start to add gg');
        add_gg(Home);
    }).then(function(){  // no parameters
        p('before callback from init user home');
        callback(null, Home);
    }).catch(callback);

}

// indev
function init_user_home_root_part(user, callback) {
    var folder_opt = make_root_folder_options(user);
    if(!folder_opt) return callback('failed to get home folder opt, when init user home');
    p('goint to build new folder, after set home folder opt  n f a s, 1128 1208 1006'); p(folder_opt);

    var Home;

    // This got one time not pass, it works now, don't know what. 2015 1108
    folder_module.build_new_folder(folder_opt).then(function(folder) {
        Home = folder;

        // If we don't write down the home folder, it can not be locked
        // to add more folder? save_meta not work because it need lock.
        Home.promise_to_write_meta(); 
    }).then(function(){  // no parameters
        p('user home should be initialized and written? 05:30');
        callback(null, Home);
    }).catch(callback);


}


function make_root_folder_options(user){
    var id = user.id;
    if(!id){
        p('must provide an root id, in init root');
        //throw new Error('must provide an root id, in init root');
        return null;
    }

    var name = user.username;
    if(!name){
        p('must provide an root name, in init root');
        //throw new Error('must provide an root name, in init root');
        return null;
    }

    opt = {};
    opt['path'] = id;
    opt['name'] = id;
    opt['parent-dir'] = '';

    opt.owner = name;
    opt.permission = {
        owner: 'rwx',
        other: '',
        group: ''
    };
    opt['create-timestamp'] = Date.now();
    opt['timestamp'] = Date.now();

    return opt;
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
    }).then(function(muji) {
        var set_muji_listor = Promise.promisify(function(callback){
            muji.set_attr('listor', {'default': 'img-value'}, callback);
        });
        return set_muji_listor();
    }).then(function(){
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
        p('to goodagood file listing, changed to write meta, 2015 1205');
        Goodagood.build_file_list();
        return Goodagood.promise_to_write_meta();
    }).then(function() {
        home.build_file_list();
        return home.promise_to_write_meta();
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


/*
 * Build a new home from user info, where id will be username.
 * 2015 1122
 * not throughly work. The strange thing is it not finished when callback.
 * 1209
 */
function new_home(user_info, callback){
    take_in_user_info(user_info, function(err, user_hash){
        if(err) return callback(err);
        p('we got user hash in trying "new home", 2015 1128 ', user_hash);

        init_user_home(user_hash, callback);
    });
}



module.exports.take_in_user_info = take_in_user_info;
module.exports.new_home          = new_home;


// export for debug
module.exports.init_user_home = init_user_home;
module.exports.add_gg = add_gg;
module.exports.add_sub_folders = add_sub_folders;



/*
 * no files prepared for the new home
 * 2015 1208
 */




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





if (require.main === module) {
}


