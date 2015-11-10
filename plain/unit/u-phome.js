//
// Try to test: aws/prepare-home.js, aws/init-root.js
// 0407, 2015
//

var assert  = require("assert");
var u       = require("underscore");
var async   = require("async");
var path    = require("path");
var Promise = require("bluebird");
var fs      = require("fs");

var folder_module = require("../aws/folder-v5.js");

var myconfig =   require("../config/config.js");
var config = require("../test/config.js");

var phome = require("../aws/prepare-home.js");
var iroot = require("../aws/init-root.js");

var user = require("../users/a.js");


var secrets  =  require("../config/secret-dir.js");
var aws_conf =  secrets.conf.aws;


//var bucket = require("../aws/bucket.js");
var tutil  = require ("../myutils/test-util.js");


// folders, files used in testing //
var _test_folder_path = 'abc';
var _test_file_name   = 'test-write-20';
var _test_file_path   = 'abc/test-write-20';
var _test_user_name   = 'abc';

var _gg_folder_name  = 'goodagood';
var _new_folder_name = 'test';
var _new_folder_name_in_test = 'test';


var p = console.log;

var stop = function(period) {
    var milli_seconds;
    period = period || 1;
    if (!u.isNumber(period)) {
        period = 1;
    }
    milli_seconds = period * 1000;
    return setTimeout(process.exit, milli_seconds);
};

// end of the headings //


function test_seriel_num(test){
    rbasic.serial_number(function(err, num){
        test.ok(!err);
        test.ok(u.isNumber(num));
        test.done();
    });
}


module.exports.group_one = {
    setUp: function (callback) {
        callback();
    },
    tearDown: function (callback) {
        callback();
    },

    "test 1: " : test_seriel_num,

};


module.exports.last = function(test){
    test.expect(1);
    p(' -- going to force stop --');
    test.ok(true);
    tutil.stop();
    test.done();
};


// -- some fast checkings -- //

function check_list_prepared_user_ids(){
    p('checking prepared home ids:');
    phome.list_ids(function(err, list){
        p(err, list);
        stop();
    });
}

function chk_user_roll(){
    user.get_user_names(function(err, name_list){
        if(err) return callback(err, null);

        name_list.sort();
        p('names: ', name_list.join(",\t"));
        stop();
    });
}


// after this use 'check pop' to remove the added id.
function check_add2list(home_id){
    assert(u.isString(home_id));

    phome.add_id_to_list(home_id, function(err, what){
        p(err, what);
        p('going to list the ids:');

        phome.list_ids(function(err, list){
            p(err, list);
            stop();
        });

    });
}

function check_pop(){
    // This should pop out a prepared home id, so it equal as the room used.

    // null should be user name
    phome.get_one_prepared_home_id(null, function(err, what){
        p(err, what);
        p('after pop, going to list the ids:');

        phome.list_ids(function(err, list){
            p(err, list);
            stop();
        });

    });
}


function get_serial_num(){
    phome.redis_basic.serial_number_str(function(err, sid){
        p('sns: ', err, sid, typeof sid);
        stop();
    });
}


function check_prepare_home(){
    phome.prepare_home(function(err, sid){
        p('after prepare home: ', err, sid);
        stop();
    });
}


function prepare_more_home(num){
    num = num || 3;

    async.whilst(
            function(){num = num - 1; return num > 0;}
            ,function(callback){
                phome.prepare_home(function(err, sid){
                    p('-- after prepare home, err id: ', err, sid);
                    callback(err, sid);
                });
            }
            ,function(err, whatever){
                p('\n\nlast callback, async whilst: ', err, whatever);
                stop(5);
            });
}



var member2 = require("../aws/members-v2.js");
function change_19_public(dir, o){
    dir = dir || '19/public';

    folder_module.retrieve_folder(dir).then(function(folder){
        assert(!u.isEmpty(folder));
        o.folder = folder;
        member2.make_member_manager_for_folder(folder, function(err, mng){
            o.manager = mng;
            //mng.add_viewer('*', function(err, what){
            //    p('manager get json: ', mng.get_json());
            //    //stop();
            //});
        });

    });
}


function check_set_owner(){
    phome.set_owner('33', 'ai', function(err, whatever){
        p('checking set owner: ', err, whatever);
        stop();
    });
}


function get_root_dir_info(root_dir, callback){
    root_dir = root_dir || '20';
    //o   = o   || this;
    //pdir= path.join(root_dir, 'public');

    folder_module.retrieve_folder(root_dir).then(function(folder){
        //assert(!u.isEmpty(folder));
        //o.root = folder;
        var meta = folder.get_meta();
        var sinfo = u.pick(meta, 'path', 'owner');
        p(meta.path, meta.owner);
        callback(null, sinfo);
    }).catch(function(err){
        p(' run into catch ? ', root_dir);
        callback(null, null);
    });
}

function check_a_few_root_dir_has_owner(){
    var root_dirs = ['25', '26', '27', '28', '29', '30', '31', '32', '33'];

    async.map(
            root_dirs
            ,get_root_dir_info
            ,function(err, results){
                p('ok? ', err, results);
                stop();
            });
    // end of mapping

}

function check_assign(user_name, home_id){
    user_name = user_name || 'ai';
    home_id   = home_id   || '33';
    user.assign_user_home(user_name, home_id, function(err, what){
        p('check assign user home: ', err, what);
        stop();
    });
}

function list_all_roots(){
    // list two parts: exists users and prepared root folders

    p('checking occupied AND prepared home ids:');

    user.get_user_names(function(err, name_list){
        if(err) return callback(err, null);

        p('name list length: ', name_list.length);

        var pairs = [],
            allids = [],
            i = 0;

        async.map(name_list,
            function(name, callback){
                //p('going to get user id for: ', name);
                user.get_user_id(name, function(err, id){
                    if(err) return callback(err);
                    //p( i++ , ' in: name, id: ', name, id);
                    pairs.push([name, id]);
                    allids.push(id);
                    //p('ok? ');
                    return async.nextTick(function(){
                        return callback(null, id);
                    });
                });
            },
            function(err, what){
                p('after async, err, what: ', err, typeof what, u.isArray(what));


                phome.list_ids(function(err, id_list){
                    p(22, err, typeof id_list);
                    u.union(allids, id_list); //to add
                    p('ids: ', id_list.join(",\t"));
                    stop();
                });
            }
        );
    });
}

function tasync(){
    var a = [1,2,3,4,5];
    async.map(a, function(num, callback){
        return callback(null, num*num);
    },function(err, what){
        p('hhhhh:', "\n", err, what);
        process.exit();
    });
}


function all_user_get_id(){
    // list two parts: exists users and prepared root folders

    p('checking occupied AND prepared home ids:');

    user.get_user_names(function(err, name_list){
        if(err) return callback(err, null);
        p('name list length: ', name_list.length);

        var pairs = [], i = 0;
        async.map(name_list,
            function(name, callback){
                p('going to get user id for: ', name);
                user.get_user_id(name, function(err, id){
                    if(err) return callback(err);
                    p( i++ , ' in: name, id: ', name, id);
                    pairs.push([name, id]);
                    p('ok? ');
                    return async.nextTick(function(){
                        return callback(null, id);
                    });
                });
            }, function(err, what){
                p('after async, err, what: ', err, what);
                stop();
            });
        });

}


/*
 * check the signal a new user come, so one room should already been 
 * occupied, more room need to be prepared.
 * The username and room id is not used by the following processes
 */
function check_signal(){
    var username = 'who-ever';
    var room_id  = 'what-ever';

    phome.signal_one_room_occupied(username, room_id, function(err, what){
        p('check signal: ', "\n", err, what);
        process.exit();
    });
}


if(require.main === module){
    //get_serial_num();
    //check_prepare_home();

    //check_list_prepared_user_ids();
    chk_user_roll();

    //prepare_more_home();

    //check_add2list('20');
    //check_pop();
    //
    //change_19_public('19/public', o);

    //check_set_owner();

    //list_all_roots();
    //all_user_get_id();

    //tasync();

    //check_a_few_root_dir_has_owner();
    //check_signal();
}


// -- used when drop into REPL -- //

/*
 * Drop a root folder and it sub-folder public into REPL
 */
function drop_a_root_dir(dir, o){
    // The dir must be string, even for number

    dir = dir || '20';
    o   = o   || this;
    pdir= path.join(dir, 'public');

    folder_module.retrieve_folder(dir).then(function(folder){
        assert(!u.isEmpty(folder));
        o.root = folder;
        o.mroot = folder.get_meta();
        folder_module.retrieve_folder(pdir).then(function(folder){
            assert(!u.isEmpty(folder));
            o.pub = folder;
            o.mpub= folder.get_meta();
        });
    });
}


// drop into REPL, 'init user d' in ../user/a.js, it will check name length,
// This will not.  because we use occupy_room
function drop_occupy_room(username, o){
    if(!username) return p('make sure your know the __ username __, \n' +
            'we are going to init the user, \n' +
            'with "users/a.js # init_user_d \n');

    // @user_info : hash {username:..., password:..., id:...,  referrer:...}
    var user_info = {
        username: username,
        password: 'kkkooo',
        referrer: 'andrew'
    };
    o.user_info = user_info;

    user.occupy_room(user_info, function(err, uinfo){
        if(err){
            console.log("i u d, 1106 drop init user d, err : ",err);
            o.err = err;
        }
        p('after "init user d", got: ', uinfo);

        o.ui = uinfo;
    });
}


// checking drop user: ar, id: 43, all must be string.
function repare(username, o){
    username = username || 'ar';

    user.is_name_occupied(user_info.username, function(err, name_exists){
        //console.log("11 init user c, and username: ", user_info.username);
        if(err){
            p('is name occupied get err: ', err);
            return o.ierr = err;
        }
        console.log("see, init user d, name_exists: ", name_exists);
        if(name_exists) return p('new Error("username conflict"), null');

        user.find_by_user_name(username, function(err, user_info){
            if(err){
                console.log("c a 4, 1106 k c u i 915pm   , err : ",err);
                return process.exit();
            }
            o.ui = user_info;
            p('ca4o user info: ', user_info);
        });
    });
}


//var o={}; change_19_public(null, o);
//var o={}; drop_a_root_dir('33', o);

//var o={}; drop_occupy_room('ar', o);
var o={}; repare('ar', o);
p( "ok start interact:");

