
// initial root folder, the 'id' is the folder name, it's not necessarily
// be user name, it should be safe to use as folder name.


// 3rd party modules:
var u, path, assert, async;

// my modules:
var folder_module, myconfig, user;

// in files:
var p;

u    = require("underscore");
path = require("path");
assert  = require("assert");
async   = require("async");
Promise = require("bluebird");

folder_module = require("./folder-v5.js");
myconfig =   require("../config/config.js");
user = require('../users/a.js');

p = console.log;


// seems no different from the old 'init home c'? beside 'owner undefined' attr.
function init_root_folder(id) {
    //if(!id) return callback('must provide an root id', null);
    if(!id) return Promise.reject('must provide an root id');
    if(!u.isString(id)) id = id.toString();

    var Goodagood, Home, folder_opt;
    //s3key = path.join(myconfig.meta_file_prefix, username);
    //s3key = path.join(myconfig.folder_meta_prefix, id);

    folder_opt = {};
    folder_opt['path'] = id;
    folder_opt['name'] = id;
    folder_opt['parent-dir'] = '';

    folder_opt.owner = '-unknown-?';
    folder_opt['owner-undefined'] = true;
    folder_opt.permission = {
        owner: 'rwx',
        other: '',
        group: ''
    };
    folder_opt['create-timestamp'] = Date.now();
    folder_opt['timestamp'] = Date.now();

    return folder_module.build_new_folder(folder_opt).then(function(folder) {
        // 'build new folder' will not save it.
        Home = folder;

        // debuging
        //var hmeta = Home.get_meta();
        //p( 'home meta: ', hmeta);

        // write with locking, perhaps some need retrieve it.
        return Home.promise_to_write_meta()
    }).then(function(){
        return add_sub_folders(Home);
    });
    
};


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

module.exports.init_root_folder = init_root_folder;


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


