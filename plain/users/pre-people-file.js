
// prepare empty people data for unknown user.
// Before hand operations, to set up root dir for users, when we don't
// know who will use the root dir, so we don't know: owner.
// 2015, 0417.

var config_folder_name, folder_module,
    init_people_manager, make_people_manager_for_user,
    promise_to_init_people_manager, social;

var u = require("underscore");
var path = require("path");

folder_module = require("../aws/folder-v5.js");

//
social = require("../aws/social.js");
var Promise = require("bluebird");

var config =   require("../config/config.js");
//config.direct_obj_prefix = 'direct_objs';
var bucket = require("../aws/bucket.js");

var user_module = require("./a.js");

var p = console.log;


config_folder_name = 'goodagood'; //d


var People_file_name = 'people.json';

function make_people_file_s3key(home_id){
    if(!home_id) return null;
    if(!u.isString(home_id)) return null;

    return path.join(config.direct_obj_prefix, home_id, People_file_name);
}


function file_exists(home_id, callback){
    var people_file_s3key = make_people_file_s3key(home_id);
    //var people_file_s3key = '8998998998';//testing

    bucket.s3_object_exists(people_file_s3key, callback);
}


/*
 * To do things as 'make empty people file', give empty json
 */
function write_people_json(home_id, json, callback) {
    // Write people json to file anyway, the json represent peoples under
    // owner's management.
    //
    // if json is empty or false, it gets defaults.
    // @callback: (err, s3 put object reply)

    if(u.isEmpty(json) || !json){
        json = { current: [], friends: [], people: [],
                 teams:   [], groups:  {}, all: [],
                 id:      home_id,
                 owner:   -1 };
    }

    var text = JSON.stringify(json, null, 4);
    var people_file_s3key = make_people_file_s3key(home_id);

    bucket.put_object(people_file_s3key, text, callback);
};


// When we prepare an home folder, when it's owner unknown.
// This is just a naming convenience, simply write a empty people for home_id.
function make_empty_people_file_for_home_dir (home_id, callback){
    write_people_json(home_id, null, callback);
}

function read_people_json(home_id, callback) {
    var people_file_s3key = make_people_file_s3key(home_id);

    bucket.read_file(people_file_s3key, function(err, text){
        if(err) return callback(err, json);

        var json = null;
        try{
            json = JSON.parse(text);
        }catch(e){
            return callback(e, null);
        }
        return callback(null, json);
    });
};

var promise_to_read_people_json = Promise.promisify(read_people_json);



// changing old things:
// This is for user.
//
// Not necessary:
// It should be able to make empty people manager for empty room, where 
// owner not check in.
//
function make_people_manager_for_user (Opt, callback) {

    //var Empty_content, Folder, Folder_path, Obj, add_people, add_recent,
    //    del_people, get_a_few, get_json, get_people_file_obj, get_recent,
    //    get_text, init_folder, is_file_initialized, is_file_initialized_async,
    //    know, promise_to_update_file, recognize, update_file, _pick_some;

    //d
    //Folder_path = path.join(Username, config_folder_name);
    //Folder = null;


    // Id is user id, Json is json of people datas.
    var Username = Opt.username;
    var Id = null;
    var Json = null; // the data of people.
    var Obj = {};

    // From Username, build up necessary data, call this before final callback.
    function init(callback){
        user_module.get_user_id(Username, function(err, id){
            if(err) return callback(err, null);

            Id = id;
            file_exists(Id, function(err, finfo){
                if(err || !finfo) return _write_empty_people_file_then_init_again(callback)

                read_people_json(Id, function(err, json){
                    if(err) return callback(err, null);

                    Json = json;
                    callback(null, Obj);
                });

            });
        });
    }
    Obj.init = init;

    function _write_empty_people_file_then_init_again(callback){
        p ('in _write empty people file then init again ');
        write_people_json(Id, {}, function(err, what){
            if(err) return callback(err, null);

            init(callback);
        });
    }

    //// need?
    //is_file_initialized = function(callback) {
    //    return file_exists(Id, callback);
    //}
    //is_file_initialized_async = Promise.promisify(is_file_initialized);


    update_file = function(json, callback) {
        write_people_json(Id, json, callback);
    };
    promise_to_update_file = Promise.promisify(update_file);

    Obj.update_file = update_file;
    Obj.promise_to_update_file = promise_to_update_file;


    function get_json() {return Json;}
    Obj.get_json = get_json;

    function save_json(callback) {return update_file(Json, callback);}
    Obj.save_json = save_json;


    function get_people() {
        if(typeof Json.people !== 'undefined') return Json.people;
        return null; //else
    }
    Obj.get_people = get_people;


    function get_friends() {
        if(typeof Json.friends !== 'undefined') return Json.friends;
        return null; //else
    }
    Obj.get_friends = get_friends;


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

    init(callback);
};


// ?
init_people_manager = function(username, callback) {
    return make_people_manager_for_user(username).then(function(manager) {
        return manager.is_file_initialized(function(err, yes_) {
            if (yes_) {
                return callback(null, null);
            }
            p('In "init people manager", start to init people file for ', username);
            return make_empty_people_file(username, callback);
        });
    });
};


promise_to_init_people_manager = Promise.promisify(init_people_manager);


module.exports.write_people_json = write_people_json;
module.exports.read_people_json  = read_people_json;

// old exports
module.exports.make_people_manager_for_user = make_people_manager_for_user;
//module.exports.make_empty_people_file       = make_empty_people_file;
module.exports.init_people_manager          = init_people_manager;
module.exports.promise_to_init_people_manager = promise_to_init_people_manager;



//-- some fast checking -- //
function stop(period) {
    var milli_seconds;
    period = period || 1;
    if (!u.isNumber(period)) {
        period = 1;
    }
    milli_seconds = period * 1000;
    return setTimeout(process.exit, milli_seconds);
};


function check_people_exists(){
    var homeid = '17';
    file_exists(homeid, function(err, what){
        p('file exists? ', err, what);
        stop();
    })

}

function check_people_mnger(){
}

if(require.main === module){
    check_people_exists();
}



