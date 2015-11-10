
/*
 * Change the people file, put it to aux path, as member file of folder.
 * It is prefix of s3 storage.
 * The file is simple serielized json file.
 *
 * To save trouble, not change in people.js, rename to people-v2.js
 *
 * 2015, 0705
 * make a people list
 */




var u = require("underscore");
var path = require("path");

var folder_module = require("../aws/folder-v5.js");

//social = require("../aws/social.js");

var Promise = require("bluebird");

var bucket = require("../aws/bucket.js");

var user = require("./a.js");

var p = console.log;

var People_file_name = '.gg.people.v1.json';

//var config_folder_name = 'goodagood'; //d


function calculate_people_file_s3key(username, callback){
    user.get_user_id(username, function(err, id){
        //p('err, id: ', err, id);
        calculate_people_file_s3key_by_id(id, callback);
    });
}


function calculate_people_file_s3key_by_id(id, callback){
    // the 'id' is the root folder of the user
    folder_module.retrieve_folder(id).then(function(folder){
        //var meta = folder.get_meta(); p('path: ', meta.path);
        //p(meta);
        //p(u.omit(meta, 'files', 'file_names', 'file_uuids', 'renders'));

        var aux_path = folder.get_folder_auxiliary_path();
        //p('aux path: ', aux_path);

        if(aux_path){
            var s3key = path.join(aux_path, People_file_name);
            return callback(null,  s3key);
        }else{
            p('no aux path direct');
            folder.callback_folder_auxiliary_path(function(err, aux_path){
                if(err) return callback('err callback aux path for the people file', null);
                if(!aux_path) return callback('callback no aux path for the people file', null);
                var s3key = path.join(aux_path, People_file_name);
                return callback(null,  s3key);
            });
        }
    }).catch(callback);
}

function people_file_exists(username, callback){
    calculate_people_file_s3key(username, function(err, people_file_s3key){
        if(! people_file_s3key) return callback('got no people file s3key', null);

        bucket.s3_object_exists(people_file_s3key, function(err, file_info){
            // err means not exists.
            if(err) return callback(err);

            return callback(null, true);
        });
    }); 
}


var Empty_content = {
    current: [],
    friends: [],
    people:  [],
    teams:   [],
    groups:  {}
};


function init_people_file (username, callback) {
    var content = Empty_content;

    calculate_people_file_s3key(username, function(err, s3key){
        if(err) return callback(err);

        bucket.write_json(s3key, content, callback);
    });
}

function init_people_file_if_not_exists (username, callback) {
    people_file_exists(username, function(err, yes){
        if(err){ 
            p('p f exist? err: ', err);
            //return callback(err);
        }

        if(err || !yes){
            p('going to init: ');
            return init_people_file(username, callback);
        }else{
            p('yes, it exists: ', yes);
            return callback(null, null);
        }
    });
}


/*
 * When the room not occupied by any user, we prepare for it.
 */
function make_people_file_for_empty_home(id, callback){
    var content = Empty_content;

    calculate_people_file_s3key_by_id(id, function(err, s3key){
        if(err) return callback(err);
        p('the key: ', s3key);

        bucket.write_json(s3key, content, callback);
    });
}

// do we need this?
function read_people_json(s3key, callback){
        bucket.read_json(s3key, callback);
}
//function write_people_json(s3key, callback){
//}



// to do:
function make_people_manager_for_user(Username, callback) {

    var Obj = {}; // The manager object

    // The user id, s3key for the people json file, and the json.
    var Uid, S3key, Json;

    /*
     * Calculate user id, people file s3key, and read the json file.
     */
    function prepare(callback){
        user.get_user_id(Username, function(err, id){
            if(err) return callback(err);

            Uid = id;
            calculate_people_file_s3key_by_id(Uid, function(err, key){
                if(err) return callback(err);

                S3key = key;
                bucket.read_json(S3key, function(err, j){
                    if(err) return callback(err);

                    Json = j;
                    callback(null, Json);
                });
            });
        });
    }
    Obj.prepare = prepare;

    function get_uid(){ return Uid; };
    Obj.get_uid   = get_uid;

    function get_s3key(){ return S3key; };
    Obj.get_s3key = get_s3key;

    function get_json(){ return Json; };
    Obj.get_json  = get_json;

    function update(callback){
        bucket.write_json(S3key, Json, callback);
    }
    Obj.update    = update
    Obj.promise_to_update = Promise.promisify(update);

    /*
     * Get a few people for user, no more then 10 by default,
     * if no one found, 'goodagood' will be added.
     *
     */
    _pick_some = function(number) {
        number = number || 10;
        var afew = [];
        var atleast = [ 'goodagood', 'andrew', ];

        if (u.isEmpty(Json)) return atleast;

        var get_more, len, more, union;
        afew = u.first(Json.current, number);

        if ((afew != null) && (afew.length != null)) {
            len = afew.length;
        } else {
            p('fuck, why not a few or length');
            len = 0;
        }

        if (len < number) {
            more = number - len;
            get_more = u.first(Json.friends, more);
            if (!u.isEmpty(get_more)) {
                union = u.union(afew, get_more);
                afew = u.uniq(union);
                len = afew.length;
            }
        }

        if ((afew != null) && (afew.length != null)) {
            len = afew.length;
        } else {
            len = 0;
        }
        if (len < number) {
            more = number - len;
            get_more = u.first(Json.people, more);
            if (!u.isEmpty(get_more)) {
                union = u.union(afew, get_more);
                afew = u.uniq(union);
                len = afew.length;
            }
        }
        if (u.isEmpty(afew)) {
            afew.push('goodagood');
        }
        return afew;
    };
    Obj._pick_some = _pick_some;

    /*
     * Get a few people for user, no more then 10 by default,
     * if no one found, 'goodagood' will be added.
     */
    Obj.get_a_few = _pick_some;


    function add_people (name, callback) {
        var j = get_json();
        if(!j || u.isEmpty(j)) return callback('get no json');

        if (j.people.indexOf(name) < 0) {
            j.people.push(name);
            update(callback)
        }else{
            callback(null,null);
        }
    };

    function del_people (name, callback) {
        var j = get_json();
        if(!j || u.isEmpty(j)) return callback('get no json');

        var ind;
        ind = j.people.indexOf(name);
        if (ind < 0) {
            // The name not in the list, do nothing
            return callback(null,null);
        }

        // delete the name
        j.people.splice(ind, 1);
        update(callback);
    };
    Obj.add_people = add_people;
    Obj.del_people = del_people;

    return callback(null, Obj);

    //Folder_path = path.join(Username, config_folder_name);
    //Folder = null;
    //init_folder = function() {
    //    return folder_module.retrieve_folder(Folder_path).then(function(folder) {
    //        Folder = folder;
    //        return Folder;
    //    });
    //};
    //is_file_initialized = function(callback) {
    //    return folder_module.retrieve_folder(Folder_path).then(function(folder) {
    //        var exists, meta;
    //        meta = folder.get_meta();
    //        exists = folder.file_exists(People_file_name);
    //        return callback(null, exists);
    //    });
    //};
    //is_file_initialized_async = Promise.promisify(is_file_initialized);
    //get_people_file_obj = function() {
    //    var config_folder_path;
    //    config_folder_path = path.join(Username, config_folder_name);
    //    return Folder.promise_to_one_file_obj(People_file_name);
    //};
    //update_file = function(json, callback) {
    //    var text;
    //    text = JSON.stringify(json);
    //    return get_people_file_obj().then(function(file) {
    //        var meta;
    //        meta = file.get_meta();
    //        return bucket.write_text_file(meta.storage.key, text, function(err, reply) {
    //            meta.timestamp = Date.now();
    //            return Folder.add_file_save_folder(meta, callback);
    //        });
    //    });
    //};
    //promise_to_update_file = Promise.promisify(update_file);
    //
    //know = function(some_name) {
    //    return false;
    //};
    //recognize = function(name) {
    //    return get_json().then(function(j) {
    //        var ind;
    //        ind = j.people.indexOf(name);
    //        if (ind < 0) {
    //            return false;
    //        } else {
    //            return true;
    //        }
    //    });
    //};
    //get_text = function() {
    //    if (!Folder) {
    //        throw 'no folder? when "get text"';
    //    }
    //    return Folder.read_text_file(People_file_name);
    //};
    //get_json = function() {
    //    return get_text().then(function(text) {
    //        var json;
    //        return json = JSON.parse(text);
    //    });
    //};
    //add_recent = function(name) {
    //    return get_json().then(function(j) {
    //        j.current.splice(0, 0, name);
    //        j.current = u.unique(j.current);
    //        return j;
    //    }).then(function(j) {
    //        return promise_to_update_file(j);
    //    });
    //};
    //get_recent = function(number) {
    //    number = number || 1;
    //    if (!u.isNumber(number)) {
    //        number = 1;
    //    }
    //    if (number < 1) {
    //        number = 1;
    //    }
    //    return get_json().then(function(j) {
    //        return u.first(j.current, number);
    //    });
    //};
    //Obj.init_folder = init_folder;
    //Obj.Folder = Folder;
    //Obj.is_file_initialized = is_file_initialized;
    //Obj.get_people_file_obj = get_people_file_obj;
    //Obj.know = know;
    //Obj.recognize = recognize;
    //Obj.get_json = get_json;
    //Obj.add_people = add_people;
    //Obj.del_people = del_people;
    //Obj.add_recent = add_recent;
    //Obj.get_recent = get_recent;
    //Obj.get_afew = get_afew;
    //return init_folder().then(function(f) {
    //    Obj.Folder = f;
    //    return Obj;
    //});
}

/*
 * prepare it, not only manager, but fetch the json file.
 */
function prepare_people_manager(username, callback){
    make_people_manager_for_user(username, function(err, obj){
        if(err) return callback(err);

        obj.prepare(function(err, what){
            callback(err, obj);
        });
    });
}

function build_name_list(names){
    if(u.isEmpty(names)) return '';

    var name_items = u.map(names, function(name){
        var str = '<li class="user-name-item">';
        str += '<span class="username">' + name + '</span>';
        str += '<button class="del-user" data-user-name="' + name + '"> <i class="fa fa-remove"></i></button>';
        str += '</li>';
        return str;
    });

    var ul = "<ul>";
    ul += name_items.join("\n");
    ul += "</ul>";
    return ul;
}

function get_a_few_build_name_list(username, callback){
    prepare_people_manager(username, function(err, manager){
        if(err) return callback(err, '');

        var names = manager.get_a_few();
        var list  = build_name_list(names);
        callback(null, list);
    });
}


module.exports.calculate_people_file_s3key = calculate_people_file_s3key;

module.exports.init_people_file_if_not_exists = init_people_file_if_not_exists;

module.exports.make_people_manager_for_user = make_people_manager_for_user;
module.exports.prepare_people_manager = prepare_people_manager;

module.exports.build_name_list = build_name_list;
module.exports.get_a_few_build_name_list = get_a_few_build_name_list;

module.exports.make_people_file_for_empty_home = make_people_file_for_empty_home;

//// old

//
//old_make_people_manager_for_user = function(Username) {
//    var Empty_content, Folder, Folder_path, Obj, add_people, add_recent,
//        del_people, get_afew, get_json, get_people_file_obj, get_recent,
//        get_text, init_folder, is_file_initialized, is_file_initialized_async,
//        know, promise_to_update_file, recognize, update_file, _pick_some;
//
//
//    Obj = {};
//    Folder_path = path.join(Username, config_folder_name);
//    Folder = null;
//    Empty_content = {
//        current: [],
//        friends: [],
//        people: [],
//        teams: [],
//        groups: {}
//    };
//    init_folder = function() {
//        return folder_module.retrieve_folder(Folder_path).then(function(folder) {
//            Folder = folder;
//            return Folder;
//        });
//    };
//    is_file_initialized = function(callback) {
//        return folder_module.retrieve_folder(Folder_path).then(function(folder) {
//            var exists, meta;
//            meta = folder.get_meta();
//            exists = folder.file_exists(People_file_name);
//            return callback(null, exists);
//        });
//    };
//    is_file_initialized_async = Promise.promisify(is_file_initialized);
//    get_people_file_obj = function() {
//        var config_folder_path;
//        config_folder_path = path.join(Username, config_folder_name);
//        return Folder.promise_to_one_file_obj(People_file_name);
//    };
//    update_file = function(json, callback) {
//        var text;
//        text = JSON.stringify(json);
//        return get_people_file_obj().then(function(file) {
//            var meta;
//            meta = file.get_meta();
//            return bucket.write_text_file(meta.storage.key, text, function(err, reply) {
//                meta.timestamp = Date.now();
//                return Folder.add_file_save_folder(meta, callback);
//            });
//        });
//    };
//    promise_to_update_file = Promise.promisify(update_file);
//    know = function(some_name) {
//        return false;
//    };
//    recognize = function(name) {
//        return get_json().then(function(j) {
//            var ind;
//            ind = j.people.indexOf(name);
//            if (ind < 0) {
//                return false;
//            } else {
//                return true;
//            }
//        });
//    };
//    get_text = function() {
//        if (!Folder) {
//            throw 'no folder? when "get text"';
//        }
//        return Folder.read_text_file(People_file_name);
//    };
//    get_json = function() {
//        return get_text().then(function(text) {
//            var json;
//            return json = JSON.parse(text);
//        });
//    };
//    add_people = function(name) {
//        return get_json().then(function(j) {
//            if (j.people.indexOf(name) < 0) {
//                j.people.push(name);
//            }
//            return j;
//        }).then(function(j) {
//            return promise_to_update_file(j);
//        });
//    };
//    del_people = function(name) {
//        return get_json().then(function(j) {
//            var ind;
//            ind = j.people.indexOf(name);
//            if (ind < 0) {
//                return j;
//            }
//            j.people.splice(ind, 1);
//            return j;
//        }).then(function(j) {
//            return promise_to_update_file(j);
//        });
//    };
//    add_recent = function(name) {
//        return get_json().then(function(j) {
//            j.current.splice(0, 0, name);
//            j.current = u.unique(j.current);
//            return j;
//        }).then(function(j) {
//            return promise_to_update_file(j);
//        });
//    };
//    get_recent = function(number) {
//        number = number || 1;
//        if (!u.isNumber(number)) {
//            number = 1;
//        }
//        if (number < 1) {
//            number = 1;
//        }
//        return get_json().then(function(j) {
//            return u.first(j.current, number);
//        });
//    };
//    _pick_some = function(number) {
//        var afew;
//        number = number || 10;
//        afew = [];
//        return get_json().then(function(j) {
//            var get_more, len, more, union;
//            afew = u.first(j.current, number);
//            if ((afew != null) && (afew.length != null)) {
//                len = afew.length;
//            } else {
//                p('fuck, why not a few or length');
//                len = 0;
//            }
//            if (len < number) {
//                more = number - len;
//                get_more = u.first(j.friends, more);
//                if (!u.isEmpty(get_more)) {
//                    union = u.union(afew, get_more);
//                    afew = u.uniq(union);
//                    len = afew.length;
//                }
//            }
//            if ((afew != null) && (afew.length != null)) {
//                len = afew.length;
//            } else {
//                len = 0;
//            }
//            if (len < number) {
//                more = number - len;
//                get_more = u.first(j.people, more);
//                if (!u.isEmpty(get_more)) {
//                    union = u.union(afew, get_more);
//                    afew = u.uniq(union);
//                    len = afew.length;
//                }
//            }
//            if (u.isEmpty(afew)) {
//                afew.push('goodagood');
//            }
//            return afew;
//        });
//    };
//    get_afew = function(number) {
//        var afew;
//        number = number || 10;
//        afew = [];
//        return is_file_initialized_async().then(function(yes_) {
//            if (yes_) {
//                return _pick_some(number);
//            } else {
//                if (u.isEmpty(afew)) {
//                    afew.push('goodagood');
//                }
//                return Promise.resolve(afew);
//            }
//        });
//    };
//    Obj.init_folder = init_folder;
//    Obj.Folder = Folder;
//    Obj.is_file_initialized = is_file_initialized;
//    Obj.get_people_file_obj = get_people_file_obj;
//    Obj.know = know;
//    Obj.recognize = recognize;
//    Obj.get_json = get_json;
//    Obj.add_people = add_people;
//    Obj.del_people = del_people;
//    Obj.add_recent = add_recent;
//    Obj.get_recent = get_recent;
//    Obj.get_afew = get_afew;
//    return init_folder().then(function(f) {
//        Obj.Folder = f;
//        return Obj;
//    });
//};
//
//init_people_manager = function(username, callback) {
//    return old_make_people_manager_for_user(username).then(function(manager) {
//        return manager.is_file_initialized(function(err, yes_) {
//            if (yes_) {
//                return callback(null, null);
//            }
//            p('In "init people manager", start to init people file for ', username);
//            return init_people_file(username, callback);
//        });
//    });
//};
//
//promise_to_init_people_manager = Promise.promisify(init_people_manager);
//
//module.exports.old_make_people_manager_for_user = old_make_people_manager_for_user;
//
//module.exports.init_people_file = init_people_file;
//
//module.exports.init_people_manager = init_people_manager;
//
//module.exports.promise_to_init_people_manager = promise_to_init_people_manager;


// fast checkings

var test_util = require("../myutils/test-util.js");

function chk_people_file_exists(){
    var name = 'tmp';
    people_file_exists(name, function(err, what){
        p(err, what);
        if(err) p('haha err');
        test_util.stop();
    });
}

function chk_init_people_file(){
    var name = 'tmp';
    init_people_file(name, function(err, what){
        p(err, what);
        if(err) p('haha err');
        test_util.stop();
    });
}

function chk_init_people_file_if_not(){
    var name = 'tmp';
    init_people_file_if_not_exists(name, function(err, what){
        p('if not exists...', err, what);
        if(err) p('haha err');
        test_util.stop();
    });
}

function chk_mk_mngr(){
    var username = 'tmp';
    make_people_manager_for_user(username, function(err, what){
        p('mk mngr...', err, what);
        if(err) p('haha err');
        test_util.stop();
    });
}

function chk_bld_name_list(){
    var names = ['abc', 'def', 'kk'];
    var list  = build_name_list(names);
    p('list: ', list);
    test_util.stop();
}


if(require.main === module){
    //chk_people_file_exists();
    //chk_init_people_file();
    //chk_init_people_file_if_not();
    //chk_mk_mngr();
    chk_bld_name_list();
}
