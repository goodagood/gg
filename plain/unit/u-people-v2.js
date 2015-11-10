
var assert = require("assert");
var async  = require("async");

//u = require("underscore");
//path = require("path");
//Promise = require("bluebird");

var people2  = require("../users/people-v2.js");

var user = require("../users/a.js");

var test_util = require("../myutils/test-util.js");


var p = console.log;


function check_the_s3key(){
    var username = 'tmp';

    people2.calculate_people_file_s3key(username, function(err, key){
        p(err, key);

        test_util.stop();
    });

}

function init_all_user_people_file(){
    user.get_user_names(function(err, name_list){
        if(err) return callback(err, null);

        async.map(name_list, function(name, callback){
            people2.init_people_file_if_not_exists(name, function(err, what){
                p('one user: ', name, err, what);
                callback(err, name);
            });

        }, function(err, results){
            p('results: ', err, results.join(', '));
            test_util.stop();
        });

        //name_list.sort();
        //p('names: ', name_list.join(",\t"));
    });
}


function chk_mk_mngr(username){
    username = username || 'abc';
    people2.make_people_manager_for_user(username, function(err, obj){
        if(err) p('haha err');
        //p('mk mngr...', err, obj);

        obj.prepare(function(err, what){
            p('after prepare: ', err, what);
            var j = obj.get_json();
            p('json: ', j);
            test_util.stop();
        });
    });
}

function chk_pick(username){
    username = username || 'abc';
    people2.make_people_manager_for_user(username, function(err, obj){
        if(err) p('haha err');
        //p('mk mngr...', err, obj);

        obj.prepare(function(err, what){
            //p('after prepare: ', err, what);
            var j = obj.get_json();
            p('json: ', j);
            p('pick some: ');
            p(obj._pick_some());
            test_util.stop();
        });
    });
}

function chk_add(username, to_add_name){
    username = username || 'abc';
    to_add_name = to_add_name || 'goodagood';

    people2.make_people_manager_for_user(username, function(err, obj){
        if(err) p('haha err');
        //p('mk mngr...', err, obj);

        obj.prepare(function(err, what){
            p('after prepare: ', err, what);

            obj.add_people(to_add_name, function(err, what){
                p('got: ', err, what);
                p('after add, the json: ', obj.get_json());
                p('pick some: ');
                p(obj._pick_some());
                test_util.stop();
            });
        });
    });
}

function chk_del(username, to_del_username){
    username = username || 'abc';
    to_del_username = to_del_username || 'goodagood';

    people2.make_people_manager_for_user(username, function(err, obj){
        if(err) p('haha err');
        //p('mk mngr...', err, obj);

        obj.prepare(function(err, what){
            p('after prepare: ', err, what);

            obj.del_people(to_del_username, function(err, what){
                p('got: ', err, what);
                p('after del, the json: ', obj.get_json());
                p('get a few : ');
                p(obj.get_a_few());
                test_util.stop();
            });
        });
    });
}


function chk_empty_home(){
    var home_id = '69';
    people2.make_people_file_for_empty_home(home_id, function(err, what){
        p('c e h: ', err, what);
        process.exit();
    });
}


if(require.main === module){
    //check_the_s3key();
    //chk_mk_mngr();
    //chk_pick();

    //chk_add(null, 'andrew');
    //chk_del(null, 'andrew');
    //init_all_user_people_file();

    chk_empty_home();
}


// to test the drop
function drop_into_repl(o, username){
    // o : is the object to contain variables we want check in REPL.
    o = o || this;
    username = username || 'tmp';

    people2.make_people_manager_for_user(username, function(err, what){
        p('mk mngr...', err, what);
        if(err) p('haha err');
        test_util.stop();
    });
}

var o = {};



// a signal to 'expect'
//drop_into_repl(o);
//console.log("ok start interact:");
