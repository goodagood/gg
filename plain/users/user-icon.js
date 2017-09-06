/*
 * icon would be image files in folder:
 *     user-id/goodagood/icon.jpg/png
 *     user-id/goodagood/my-icon/icon.jpg/png any image good for icon
 *
 * Default icon file would be: user-id/goodagood/User_icon_dir_name/.icon.png
 *  
 * The icon folder name is set by: User_icon_dir_name
 */


var u       = require("underscore");
var path    = require("path");

var user_module   = require("./a.js");
var folder_module = require("../aws/folder-v5.js");

var p = console.log;

//  user icons dir should be: user-id/goodagood/icon-dir-name
var User_icon_dir_name = 'my-icon';  //d
var Icon_file_name     = 'icon.png'; //d // more extension?
var Icon_file_extension= 'png'; //d

var Goodagood_dir_name = 'goodagood'; // not necessary?

//var Relative_icon_path = path.join(Goodagood_dir_name, User_icon_dir_name, Icon_file_name);

var Icon_file_pattern  = /icon\.[^.]+$/;
var Icon_file_patterns = {
    easy: 'icon.png',
    easy_array: ['icon.png', 'icon.jpeg', 'icon.jpg'],
    multiple_ext: Icon_file_pattern,
    patterns : [/^.+\.png$/i, /^.+\.jp[e]?g$/i, /^.+\.svg$/i],

    // not start from '.',
    // end with png, jpg, jpeg, gif, svg, 
    // case in-sensitive
    nearly_all: /^[^.].+\.(png|jpe?g|gif|svg)$/i,
};


/*
 * Try to find user icon, in user-id/goodagood/my-icon/
 * icon file is get by regex pattern: Icon_file_pattern: icon.extension, it can be 'git', 'jpep'...
 * @options: {
 *  username: string,
 *  id:       string not number!,
 *  size:     {w:number of pixels, h:number of pixels},
 * }
 *
 */
function find_user_icon(options, callback){
    var username = options.username;
    if(!username) return callback('give me username, in find user icon', null);
    if(username === 'anonymous') return callback('username is anonymous, in find user icon', null);

    user_module.get_user_id(username, function(err, id){
        if(err) return callback(err, null);

        find_icon_file_by_user_id(id, callback);
    });
}

function find_icon_file_by_user_id(id, callback){
        var icon_path = get_icon_folder_path(id);

        find_icon_file_in_folder(icon_path, callback);

        //folder_module.retrieve_folder(icon_path).then(function(folder){
        //    var uuids = folder.pattern_to_uuids(Icon_file_pattern);
        //    //p(uuids);
        //    if(uuids.length > 0){
        //        return folder.uuid_to_file_obj(uuids[0], callback);
        //        //return callback(null, uuids[0]);
        //    }else{
        //        return callback('no file found');
        //    }
        //}).catch(function(err){
        //    p('err in retrieve folder in find user icon', err);
        //    return callback(err);
        //});
}


function find_icon_file_in_folder(fpath, callback){
    folder_module.retrieve_folder(fpath).then(function(folder){
        var uuids = folder.pattern_to_uuids(Icon_file_pattern);
        //p(uuids);
        if(uuids.length > 0){
            return folder.uuid_to_file_obj(uuids[0], callback);
            //return callback(null, uuids[0]);
        }else{
            return callback('no file found');
        }
    }).catch(function(err){
        p('err in retrieve folder in find icon file in folder: ', err);
        return callback(err);
    });
}


function find_home_or_user_icon(username, callback){
    if(!username) return callback('give me username, in find user icon', null);

    user_module.get_user_id(username, function(err, id){
        if(err) return callback(err, null);

        find_home_or_user_icon_by_id(id, callback);
    });
}

function find_home_or_user_icon_by_id(id, callback){
    if(!u.isString(id)) return callback('give me id, in find home or user icon by id', null);

    find_icon_file_in_folder(id, function(err, ifile){
        if(!err && ifile) return callback(err, ifile);

        //p('2, here, find home or user icon by id, user-icon.js');
        find_icon_file_by_user_id(id, callback);
    });
}


function find_username_from_id(id, callback){
    folder_module.retrieve_folder(id).then(function(folder){
        var meta = folder.get_meta();
        if(u.isString(meta.owner)){
            return callback(null, meta.owner);
        }else{
            return callback('it (folder meta owner) not a string', null);
        }
    }).catch(function(err){
        return callback(err,  null);
    });

}


function goodagood_path(id){
    return path.join(id, 'goodagood');
}

/*
 * Change the icon folder from: id/goodagood/User_icon_dir_name 
 * to: id/goodagood
 * save a folder building
 */
function get_icon_folder_path(id){
    //return path.join(id, 'goodagood', User_icon_dir_name);
    return path.join(id, 'goodagood');
}

function get_icon_file_full_path_name(options){
    var user_id = options.id;
    var icon_dir = get_icon_folder_path(user_id);
    
    var size_str = options.size.w.toString() + 'x' + options.size.h.toString();
    var file_name = Icon_file_name + '.' + size_str + '.' + Icon_file_extension;
    var full_path_name = path.join(icon_dir, file_name);
    return full_path_name;
}


function get_goodagood_folder_path(username, callback){
    //var username = options.username;
    user_module.get_user_id(username, function(err, id){
        if(err) return callback(err, null);

        var dir = path.join(id, 'goodagood');
        callback(null, dir);
    });
}

function get_goodagood_folder(username, callback){
    get_goodagood_folder_path(username, function(err, dir){
        folder_module.retrieve_folder(dir).then(function(folder){
            return callback(null, folder);
        }).catch(function(err){
            return callback(err,  null);
        });
    });
}

function build_icon_dir(options, callback){
    var username = options.username;

    get_goodagood_folder(username, function(err, goodagood){
        if(err) return callback(err, null);
        if(goodagood.file_exists(User_icon_dir_name)) return callback(null, null);

        goodagood.add_folder(User_icon_dir_name).then(function(icon_folder){
            callback(null, 'testing');
        }).catch(function(err){
            callback(err, 'testing');
        });

        //goodagood.add_folder(User_icon_dir_name)
    });
}

function get_icon_folder(id, callback){

    var dir = get_icon_folder_path(id);
    folder_module.retrieve_folder(dir).then(function(icon_folder){
        callback(null, icon_folder);
    }).catch(callback);
}


/*
 * Find images in the icon folder, callback get image metas, it's sorted.
 */
function find_images_in_icon_dir(user_id, callback){
    get_icon_folder(user_id, function(err, folder){
        if(err) return callback(err, null);

        var uuids = folder.pattern_to_uuids( Icon_file_patterns.near_all );
        //p('uuid list: ', uuids);

        var folder_meta = folder.get_meta();
        var file_metas  = folder_meta.files;

        var img_metas = u.map(uuids, function(uuid){return file_metas[uuid];});

        var sorted = u.sortBy(img_metas, function(meta){
            return 1 - meta.timestamp;
        });

        callback(null, sorted, folder);
    });
}

function find_the_newest_image(user_id, callback){
    find_images_in_icon_dir(user_id, function(err, image_metas, folder){
        callback(null, image_metas[0], folder);
    });
}


//g now
function checking_img_obj(folder, uuid, callback){
    folder.uuid_to_file_obj(uuid, function(err, ifile){
        if(err) return callback(err);

        var meta = ifile.get_meta();

        make_sure_aux_path_ready(ifile, function(err, apath){
            trying_351(ifile, callback);

            //p('apath: ', apath);
            //callback(null, 'apath ready?');
        });
    });
}

function make_sure_aux_path_ready(file_obj, callback){
        var apath = file_obj.get_file_auxiliary_path();

        if(apath) return callback(null, apath);
        //p('should RETURNED');

        file_obj.callback_file_auxiliary_path(function(err, apath){
            if(err) return callback(err, null);

            callback(null, apath);
        });
}

function trying_351(ifile, callback){
    p('IN trying 351 :');
    // do some tryings
    //ifile.calculate_thum_name(8, 8)
    //ifile.make_thumb(16, 16);
    var names = ifile.calculate_thum_name(16, 16);
    p('trying 351, calculated names:', names);
    ifile.make_thumb(16, 16, 100, callback);
    //callback(null, 'trying351');
}


/*
 * suppose to find backup image, when user didn't upload any one.
 */
function find_more_images(){
}

function sort_by_timestamp(){
}//?


module.exports.find_user_icon = find_user_icon;
module.exports.find_icon_file_by_user_id = find_icon_file_by_user_id;
module.exports.find_home_or_user_icon = find_home_or_user_icon;
module.exports.find_home_or_user_icon_by_id = find_home_or_user_icon_by_id;

module.exports.find_icon_file_in_folder = find_icon_file_in_folder;
module.exports.find_username_from_id = find_username_from_id;

module.exports.find_images_in_icon_dir = find_images_in_icon_dir;
module.exports.find_the_newest_image = find_the_newest_image;

//debugging:
module.exports.checking_img_obj = checking_img_obj;


//-- checkings --//

var stop = function(period) {
    var milli_seconds;
    period = period || 1;
    if (!u.isNumber(period)) {
        period = 1;
    }
    milli_seconds = period * 1000;
    return setTimeout(process.exit, milli_seconds);
};


function chk_get_user_icon(){
    var options = {
        username : 'dog-02',
              id : '46',
    };

    get_user_icon(options, function(err, whatever){
        p(err, whatever);
        stop();
    });
}

function check_build_icon_dir(){
    var        username = 'dog-02';
    var        id = '46';

    var options = {
        username : username,
    };

    build_icon_dir(options, function(err, what){
        p(err, what);
        stop();
    });
}

function check_get_icon_file_name(){
    var options = {
        username: 'dog-02',
        id:       '49',
        size:     {w:16, h:16},
    };
    var iffpn = get_icon_file_full_path_name(options);
    p('the icon file path name: ', iffpn);
    stop();
}


function check_find_uuids(){
    var options = {
        username: 'dog-02',
        id:       '46',
        size:     {w:16, h:16},
    };

    find_images_in_icon_dir(options.id, function(err, meta_list){
        if(err) p('got error: ', err);

        var shorts = u.map(meta_list, function(meta){
            return u.pick(meta, 'path', 'size', 'timestamp');
        });
        p('the short list: ', shorts);

        stop();
    });
}


function check_find_newest(){
    var options = {
        username: 'dog-02',
        id:       '46',
        size:     {w:16, h:16},
    };

    find_the_newest_image(options.id, function(err, meta){
        if(err) p('got error: ', err);
        var shorts = u.pick(meta, 'path', 'size');
        p('the newest: ', shorts);

        stop();
    });
}


// start to do with the image object.
function start_image_obj(){
    var assert = require('assert');

    var options = {
        username: 'dog-02',
        id:       '46',
        size:     {w:16, h:16},
    };

    find_images_in_icon_dir(options.id, function(err, meta_list, folder){
        if(err) p('got error: ', err);

        assert(meta_list.length > 0);

        var m0 = meta_list[0];
        //p('m0: ', u.pick(m0, 'uuid', 'path'));

        checking_img_obj(folder, m0.uuid, function(err, what){
            p('in start to get image obj, ', err, what);
            stop();
        });

    });
}

function chk_find_home_or_user_icon(){
    // username: 'aq', id: '47'

    var id = '47';
    find_home_or_user_icon_by_id('47', function(err, ifile){
        p(err, ifile);
        stop();
    });
}


if(require.main === module){
    //chk_get_user_icon();
    //check_build_icon_dir();
    //check_get_icon_file_name();
    //check_find_uuids();
    //check_find_newest();
    //start_image_obj();
    chk_find_home_or_user_icon();
}



