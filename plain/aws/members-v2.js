
/*
 * 2015, 0419
 * Change member object structure, make it un-blocking.
 * In case member object/file not existing, folder can do normal operating.
 *
 * Member setting would be json data, it saved in extra folder,
 *
 * This file should not require 'folder module' to avoid circling.
 */

// all's changing, from pre-people-...

var make_people_manager_for_user; //d?

var u = require("underscore");
var path  = require("path");
var async = require("async");


//
//var social = require("../aws/social.js");
var Promise = require("bluebird");

//var config =   require("../config/config.js");
//config.direct_obj_prefix = 'direct_objs';
var bucket = require("../aws/bucket.js");

var user_module   = require("../users/a.js");
var folder_module = require("./folder-v5.js");

var p = console.log;


var Member_file_name = 'member.json';


/*
 * The file s3 key is calculated from folder aux path, which is based on 
 * milli-seconds and uuid
 */
function get_member_file_s3key(folder){
    if(!folder) return null;

    var aux_path = folder.get_folder_auxiliary_path();
    //p('aux path: ', aux_path);
    if(!aux_path) return null;

    var key = path.join(aux_path, Member_file_name);
    return key;
}

function callback_member_file_s3key(folder, callback){
    if(!folder) return null;

    folder.callback_folder_auxiliary_path(function(err, apath){
        if(err) return callback(err, null);

        var key = path.join(apath, Member_file_name);
        callback(null, key);
    });
}



function member_file_exists(folder, callback){
    var member_file_s3key = get_member_file_s3key(folder); 
    if(! member_file_s3key) return callback('got no member file s3key', null);

    bucket.s3_object_exists(member_file_s3key, function(err, file_info){
        if(err) return callback(err, false);

        return callback(null, true);
    });
}


/*
 * deprecated, 2015 0703
 *
 * Serielize json to s3 storage, when json is empty,
 * write empty 'members', 'viewers' list, which is empty array: []
 */
function write_member_json(key, json, callback) {
    // Write people file anyway, if json is empty or false, it gets defaults.
    // @callback: (err, s3 put object reply)

    if(u.isEmpty(json) || !json){
        json = { viewers: [],
                 members: [],

                 folder_path: 'string',
                 folder_uuid: 'string',
                 owner:   -1 };
    } 

    //var text = JSON.stringify(json, null, 4);
    //bucket.put_object(key, text, callback);

    bucket.write_json(key, json, callback);
};


function read_json(key, callback) {
    //bucket.read_file(key, function(err, text){
    //    if(err) return callback(err, null);

    //    var json = null;
    //    try{
    //        json = JSON.parse(text);
    //    }catch(e){
    //        return callback(e, null);
    //    }
    //    return callback(null, json);
    //});
    bucket.read_json(key, callback);
};

//var promise_to_read_json = Promise.promisify(read_json);



// change old things:
function make_member_manager_for_folder (folder, callback) {
    // @folder: is object of folder

    var Member_file_s3key = get_member_file_s3key(folder);

    var Json = null; // the data of members.
    var Obj = {};

    var Number_of_attempts_to_write = 0;

    /*
     * Read the json from s3 storage, if it not exists, try to write an empty
     * one and read then,
     * try 2 times.
     */
    function init(callback){
        //try to get the json file s3 key
        if(!Member_file_s3key){
            Member_file_s3key = get_member_file_s3key(folder);
        }
        if(!Member_file_s3key){
            var err = 'can not get member file s3 key for ';
                err += folder.get_meta().path;
            return callback(err, null);
        }

        //make sure the file exists, then read it
        member_file_exists(folder, function(err, yes){
            if(err || !yes ){
                // try to write the empty file , if the file not exists
                if( Number_of_attempts_to_write <= 1 ){
                    return write_empty_json(function(err, what){
                        Number_of_attempts_to_write += 1;
                        // to iterate
                        return init(callback);
                    });
                }
            }

            if(Number_of_attempts_to_write > 1){
                return callback('can not write member file', null);
            }

            // if yes file exists, read the json
            bucket.read_json(Member_file_s3key, function(err, json){
                if(err) return callback(err, null);

                Json = json;
                // The only good callback:
                callback(null, Obj);
            });

        });
    }
    Obj.init = init;

    /*
     * function 'init' might not get the Member_file_s3key when the folder
     * has not set the aux path, then we need callback_member_file_s3key to
     * get it right.
     * So, use this 'callback_init' instead of 'init' when not sure.
     */
    function callback_init(callback){
        if(!Member_file_s3key){
            callback_member_file_s3key(folder, function(err, key){
                if(err) return callback(err);

                p('the key: ', key);
                Member_file_s3key = key;
                return init(callback);
            });
        }else{
            return init(callback);
        }
    }
    Obj.callback_init = callback_init;


    function get_member_file_s3key(){
        return Member_file_s3key;
    }
    Obj.get_member_file_s3key = get_member_file_s3key;


    function write_empty_json(callback){
        p ('in _write empty member json ');
        var cwd   = folder.get_meta().path;
        var empty = { members:[], viewers:[], folder_path:cwd};
        bucket.write_json(Member_file_s3key, empty, function(err, s3replay){
            if(err) return callback(err);
            Json = empty;
            callback(null, Json);
        });
    }
    Obj.write_empty_json = write_empty_json;


    update_file = function(json, callback) {
        bucket.write_json(Member_file_s3key, json, callback);
    };
    var promise_to_update_file = Promise.promisify(update_file);
    Obj.update_file = update_file;
    Obj.promise_to_update_file = promise_to_update_file;


    function get_json() {return Json;}
    Obj.get_json = get_json;

    function save_json(callback) {return update_file(Json, callback);}
    Obj.save_json = save_json;

    var save = save_json;
    Obj.save = save;


    // for folder members
    function get_members() {
        if(typeof Json.members !== 'undefined') return Json.members;
        return null; //else
    }
    Obj.get_members = get_members;

    function add_member(user_name, callback){
        //if(typeof Json.members !=== 'array') Json.members = [];
        if(!u.isArray(Json.members)) Json.members = [];
        var mem = Json.members;
        // if not in the list add it
        if(mem.indexOf(user_name) < 0) mem.push(user_name);

        save_json(callback);
    }
    Obj.add_member = add_member;

    function del_member(user_name, callback){
        if(!u.isArray(Json.members)) Json.members = [];
        var mem = Json.members;
        // if in the list delete it
        if(mem.indexOf(user_name) >= 0) mem = u.without(mem, user_name);

        save_json(callback);
    }
    Obj.del_member = del_member;

    function add_members(user_names, callback){
        if(!u.isArray(Json.members)) Json.members = [];
        Json.members = u.union(Json.members, user_names);
        save_json(callback);
    }
    Obj.add_members = add_members;

    function has_member(member_name){
        var members = get_members();
        //p('members: ', members);
        if(!members || u.isEmpty(members)) return false;

        if(u.indexOf(members, '*') >= 0){
            //p('we has *');
            return true;
        }
        if(u.indexOf(members, member_name) >= 0) return true;

        return false;
    }
    Obj.has_member = has_member;


    // for viewers
    function get_viewers() {
        if(typeof Json.viewers !== 'undefined') return Json.viewers;
        return null; //else
    }
    Obj.get_viewers = get_viewers;

    function add_viewer(user_name, callback){
        if(!u.isArray(Json.viewers)) Json.viewers = [];
        var v = Json.viewers;
        if(v.indexOf(user_name) < 0) v.push(user_name);

        save_json(callback);
    }
    Obj.add_viewer = add_viewer;

    function add_viewers(user_names, callback){
        Json.viewers = u.union(Json.viewers, user_names);
        save_json(callback);
    }
    Obj.add_viewers = add_viewers;


    function has_viewer(viewer_name){
        var viewers = get_viewers();
        //p('viewers: ', viewers);
        if(!viewers || u.isEmpty(viewers)) return false;

        if(u.indexOf(viewers, '*') >= 0){
            //p('we has *');
            return true;
        }
        if(u.indexOf(viewers, viewer_name) >= 0) return true;

        return false;
    }
    Obj.has_viewer = has_viewer;

    //// to change
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

    //to_text = function() {
    //    get_json(function(err, j){
    //        var text = JSON.stringify(j);
    //        callback(null, text);
    //    }
    //};

    //get_json = function(callback) {
    //    read_people_json(Id, callback);
    //};

    //add_people = function(name) {
    //    return get_json().then(function(j) {
    //        if (j.people.indexOf(name) < 0) {
    //            j.people.push(name);
    //        }
    //        return j;
    //    }).then(function(j) {
    //        return promise_to_update_file(j);
    //    });
    //};
    //del_people = function(name) {
    //    return get_json().then(function(j) {
    //        var ind;
    //        ind = j.people.indexOf(name);
    //        if (ind < 0) {
    //            return j;
    //        }
    //        j.people.splice(ind, 1);
    //        return j;
    //    }).then(function(j) {
    //        return promise_to_update_file(j);
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
    //_pick_some = function(number) {
    //    var a_few;
    //    number = number || 10;
    //    a_few = [];
    //    return get_json().then(function(j) {
    //        var get_more, len, more, union;
    //        a_few = u.first(j.current, number);
    //        if ((a_few != null) && (a_few.length != null)) {
    //            len = a_few.length;
    //        } else {
    //            p('fuck, why not a few or length');
    //            len = 0;
    //        }
    //        if (len < number) {
    //            more = number - len;
    //            get_more = u.first(j.friends, more);
    //            if (!u.isEmpty(get_more)) {
    //                union = u.union(a_few, get_more);
    //                a_few = u.uniq(union);
    //                len = a_few.length;
    //            }
    //        }
    //        if ((a_few != null) && (a_few.length != null)) {
    //            len = a_few.length;
    //        } else {
    //            len = 0;
    //        }
    //        if (len < number) {
    //            more = number - len;
    //            get_more = u.first(j.people, more);
    //            if (!u.isEmpty(get_more)) {
    //                union = u.union(a_few, get_more);
    //                a_few = u.uniq(union);
    //                len = a_few.length;
    //            }
    //        }
    //        if (u.isEmpty(a_few)) {
    //            a_few.push('goodagood');
    //        }
    //        return a_few;
    //    });
    //};
    //get_a_few = function(number) {
    //    var a_few;
    //    number = number || 10;
    //    a_few = [];
    //    return is_file_initialized_async().then(function(yes_) {
    //        if (yes_) {
    //            return _pick_some(number);
    //        } else {
    //            if (u.isEmpty(a_few)) {
    //                a_few.push('goodagood');
    //            }
    //            return Promise.resolve(a_few);
    //        }
    //    });
    //};
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
    //Obj.get_a_few = get_a_few;

    ////return init_folder().then(function(f) {
    ////    Obj.Folder = f;
    ////    return Obj;
    ////});

    callback_init(callback);
    //return Obj;
};


function make_member_manager_for_path(dir, callback){
    //p('ok ', dir, callback);
    folder_module.retrieve_folder(dir).then(function(folder){
        //var key = get_member_file_s3key(folder);
        //p('member file s3 key: ', key);
        //if(!key) return callback('got no key for the member/viewer file', null);

        //p('make member mng for path: ', dir);
        make_member_manager_for_folder(folder, function(err, obj){
            async.nextTick(function(){
                callback(err, obj);
            });
        });
    }).catch(callback);
}


function add_public_viewer_to_path(dir, callback){
    make_member_manager_for_path(dir, function(err, manager){
        if(err) return callback(err);

        //p('the json: ', manager.get_json());
        manager.add_viewer('*', callback);
    });
}




module.exports.get_member_file_s3key = get_member_file_s3key;
module.exports.callback_member_file_s3key = callback_member_file_s3key;
module.exports.member_file_exists = member_file_exists;

module.exports.make_member_manager_for_folder = make_member_manager_for_folder;
module.exports.make_member_manager_for_path = make_member_manager_for_path;
module.exports.add_public_viewer_to_path = add_public_viewer_to_path;

module.exports.write_member_json = write_member_json;  //d
module.exports.read_json  = read_json;

// old exports
//module.exports.make_empty_people_file       = make_empty_people_file;


//-- some fast checking -- //
//
//var stop = process.exit;


if(require.main === module){
}


