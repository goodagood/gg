/*
 * Trying to move things off from ../aws/folder-v5.js(coffee)
 * duplicated with slow-home?
 * 2015 1202
 */

var folder5 = require("../aws/folder-v5.js");

var p = console.log;


function make_root_folder(opt) {
    return folder5.make_s3folder(opt.path).then(function(folder) {
        folder.init(opt);
        return folder;
    });
    
    //.then(function(folder) {
    //    //p("after init? 1128 1:53pm");
    //    //p('start to add sub folders? 1128 1108');
    //    //add_sub_folders(folder);
    //    return folder;
    //});
}


function make_root_folder_options(user, callback) {
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

    p('goint to buidl n f a s, 1128 1006'); p(folder_opt);

    // This got one time not pass, it works now, don't know what. 2015 1108
    make_root_folder(folder_opt).then(function(folder) {
        p('start to add sub folders? 1202 10:08pm');
        //callback(null, folder);
        return add_sub_folders(folder);
    }).then(function(folder){
        callback(null, folder);
    }).catch(callback);

}


function add_sub_folders(home){
    // @home: user's home folder, the root, name is user-id
    //
    //    home/public
    //    home/muji
    //    home/goodagood
    //    home/goodagood/etc
    //    home/goodagood/message

    var Goodagood;

    p('to add public');
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


function make_root(user_info, callback){
    var opt = make_root_folder_options(user_info);
    make_root_folder(opt).then(function(folder) {
        callback(null, folder);
        //return folder;
    }).catch(callback);
}


module.exports.init_user_home = init_user_home;
module.exports.add_sub_folders = add_sub_folders;
module.exports.make_root_folder_options = make_root_folder_options;
module.exports.make_root_folder = make_root_folder;
module.exports.make_root = make_root;
