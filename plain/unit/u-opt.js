
var Promise, assert, check_member_file_exists, members, p,
    path, test_folder_path, u;

var assert = require("assert");
var u = require("underscore");
var path = require("path");
var Promise = require("bluebird");

var opt = require("../aws/folder-opt.js");

//d
var people  = require("../users/people.js");
var members = require("../aws/members.js");

var p    = console.log;
var stop = function(seconds) {
    var seconds = seconds || 1;
    var milli_sec = seconds * 1000;
    setTimeout(process.exit, milli_sec);
};


var _test_folder_path = 'abc';
var _test_user_name   = 'abc';

var t1_has_or_not = function(test){
    // the test folder has the opt file or not

    var dir = _test_folder_path || 'abc/add-2';

    var opt_obj;

    return opt.get_opt_obj(dir).then(function(opto) {
        opt_obj = opto;
        test.ok( u.isObject(opt_obj), 'should be an object');
        return opt_obj.check_opt_file_exists();
    }).then(function(exists){
        test.ok( u.isBoolean(exists), 'exists state should be a boolean');
        if(!exists) return opto.init_opt_file();
    }).then(function(what) {
        return p('you got what: ', what);
    }).then(function(){
        // must retrieve folder again to include changes.
        return opt_obj.set_folder();
    }).then(function() {
        return opt_obj.check_opt_file_exists();
    }).then(function(exists) {
        return p("exists: " + exists);
    }).then(function(){
        test.done();
    });

};






module.exports.group_one = {
    setUp: function (callback) {
        callback();
    },
    tearDown: function (callback) {
        callback();
    },

    "test-1 : get the member manager" : t1_has_or_not,

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

