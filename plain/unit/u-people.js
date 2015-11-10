// Generated by CoffeeScript 1.8.0


var Promise, assert, check_member_file_exists, members, p,
    path, test_folder_path, u;

assert = require("assert");
u = require("underscore");
path = require("path");
Promise = require("bluebird");

people  = require("../users/people.js");
members = require("../aws/members.js");

p    = console.log;
stop = function(seconds) {
    var seconds = seconds || 1;
    var milli_sec = seconds * 1000;
    setTimeout(process.exit, milli_sec);
};


var _test_folder_path = 'abc';
var _test_user_name   = 'abc';

t1_get_obj = function(test){
    //test.expect(1);
    people.make_people_manager_for_user(_test_user_name).then(function(man){

        test.ok(u.isObject(man));
        test.ok(u.isFunction(man.know));
        //test.ok(true);
        test.done();
    });

};


t2_is_file_initialized = function(test){
    //test.expect(4);
    people.make_people_manager_for_user(_test_user_name).then(function(man){
        test.ok(u.isObject(man));
        test.ok(u.isFunction(man.is_file_initialized));
        man.is_file_initialized(function(err,yes){
            test.ok(!err);
            if(yes){ p ('initialized');}
            else   { p ('not initialized');}
            
            test.ok(u.isBoolean(yes));
            test.done();
        });

    });

    //test.ok(true);

};


t3_1_initialize = function(test){
    //test.expect(4);
    //var man = people.make_people_manager_for_user(_test_user_name);
    people.init_people_file(_test_user_name, function(err, jj){
            p('get jj:\n', jj);
            test.ok(!err);
            test.ok(u.isObject(jj));
            test.done();
    });
}


t3_get_people_file_obj = function(test){
    //test.expect(1);
    people.make_people_manager_for_user(_test_user_name).then(function(man){

        test.ok(u.isObject(man));
        test.ok(u.isFunction(man.get_people_file_obj));
        man.get_people_file_obj().then(function(obj){
            //p('get p f obj:\n', obj);
            var meta = obj.get_meta();
            //p('the meta:\n', meta);
            test.ok(!u.isNull(obj));
            test.ok(u.isObject(obj));
            test.ok(u.isObject(meta));
            test.done();
        });
        //test.ok(true);
    });
};


t4_get_json = function(test){
    //test.expect(1);
    people.make_people_manager_for_user(_test_user_name).then(function(man){

        return man.get_json();
    }).then(function(j){
        p('json:\n', j);
        test.ok(u.isArray(j.friends));
        test.ok(u.isArray(j.teams));
        test.ok(u.isArray(j.people));
        test.done()
    });
};

t5_add_one = function(test){
    //test.expect(1);
    var Man;
    people.make_people_manager_for_user(_test_user_name).then(function(man){
        Man = man;
        return man.add_people('goodagood');
    }).then(function(what){
        //p('after add:', what);
        return Man.get_json()
    }).then(function(j){
        //p('json:\n', j);
        test.ok(u.isArray(j.friends));
        test.ok(u.isArray(j.teams));
        test.ok(u.isArray(j.people));
        test.done()
    });
};


t6_del_one = function(test){
    //test.expect(1);
    var tmp_user_name = 'who-know-me';
    var Man;
    people.make_people_manager_for_user(_test_user_name).then(function(man){
        Man = man;
        return man.add_people(tmp_user_name);
    }).then(function(what){
        p('return from add p:\n', what);
        return Man.get_json();
    }).then(function(j){
        p('after add:', j);
    }).then(function(){
        return Man.recognize(tmp_user_name);
    }).then(function(yes){
        test.ok(yes);
    }).then(function(){
        return Man.del_people(tmp_user_name);
    }).then(function(){
        return Man.recognize(tmp_user_name);
    }).then(function(yes){
        test.ok(!yes);
        test.done();
    });
}


module.exports.group_one = {
    setUp: function (callback) {
        this.foo = 'bar';
        //members.retrieve_member_obj(_test_folder_path).then( function (obj){
        //    Mobj = obj;
        //    setTimeout(callback, 500);
        //    //callback();
        //});

        callback();
    },
    tearDown: function (callback) {
        //stop(); // stop in a second any way.
        p ('- in tearDown');
        callback();
    },

    "test-1 : get the member manager" : t1_get_obj,
    "test-2 : check people manager initialized" : t2_is_file_initialized,
    //"test-3-1 : initialize people file" : t3_initialize,
    "test-3 : get people file obj" : t3_get_people_file_obj,
    "test-4 : get json" : t4_get_json,
    "test-5 : add people, goodagood" : t5_add_one,
    "test-6 : del people, " : t6_del_one

};


module.exports.last = function(test){
    test.expect(1);
    test.ok(true);
    stop();
    test.done();
};


// -- The rest is for checking:

check_init_people_file = function(){
    var _user_name_ = 'tmpab';
    p('check init people file');
    people.init_people_file(_user_name_, function(err,jj){
        p('get err jj:\n', err, jj);
        stop();
    })
};

// tocheck
function p2init_pm(name){
    // check promise to init people manager
    people.promise_to_init_people_manager(name).then(function(what){
        p('p2 i pm: ', what);
        stop();
    });
}

function get_a_people_manager(){
    var Man = null;
    people.make_people_manager_for_user(_test_user_name).then(function(man){
        p('manager: \n', man);
        Man = man;
        return Man.get_json();
    }).then(function(j){
        p('json:\n', j);
        return Man.get_recent();

    }).then(function(r){
        p('recent:\n', r);
        stop();
    });
}

function get_afew(name){
    name = name || _test_user_name;
    var Man = null;
    people.make_people_manager_for_user(name).then(function(man){
        p('manager: \n', man);
        Man = man;
        return man.get_a_few(5);
    }).then(function(afew){
        p('can you get a few?\n', afew);
        stop();
    });
}


function add_people(owner){
    owner = owner || 'abc';
    var guy = 'tmpab';

    var Man;
    people.make_people_manager_for_user(owner).then(function(man){
        Man = man;
        return man.add_people(guy);
    }).then(function(what){
        p('after add:', what);
        return Man.get_json()
    }).then(function(j){
        p('json:\n', j);
        stop();
    });
};


if (require.main === module){
    //check_init_people_file();
    //get_a_people_manager();
    //get_afew('tmpab');

    add_people();
}

