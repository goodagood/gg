// to: init one home -> ls it immediately


var assert = require("assert");
var u = require("underscore");
var path = require("path");
var Promise = require("bluebird");

var people  = require("../users/people.js");
var ihome   = require("../aws/init-home.js");
var folder_module = require("../aws/folder-v5.js");
var list    = require("../hrouters/file-list-v2.js");
//members = require("../aws/members.js");

var p    = console.log;
var stop = function(seconds) {
    var seconds = seconds || 1;
    var milli_sec = seconds * 1000;
    setTimeout(process.exit, milli_sec);
};


var _test_folder_path = 'abc';
var _test_user_name   = 'abc';

function t1_init_to_ls (test){

    var user_name = 'tmpab';
    //test.expect(1);
    ihome.init_one_home(user_name).then(function(what_ever){
        p ('step a, init one home, get: \n', what_ever);
        folder_module.retrieve_folder(user_name).then(function(folder){
            
            list.ls_for_owner(user_name, folder, function(err, html){
                p ('step b, list for owner, got: \n', err, html);
                //test.done();
                stop();
            });
        });
    });

};


module.exports.group_one = {
    setUp: function (callback) {
        //this.foo = 'bar';
        callback();
    },
    tearDown: function (callback) {
        //stop(); // stop in a second any way.
        p ('- in tearDown');
        callback();
    },

    //"test-1 : get the member manager" : t1_get_obj,

};


module.exports.last = function(test){
    test.expect(1);
    test.ok(true);
    stop();
    test.done();
};


// -- The rest is for checking:

check_init_people_file = function(){
    p('check init people file');
    people.init_people_file(_test_user_name, function(err,jj){
        p('get err jj:\n', err, jj);
        stop();
    })
};


function ls (){

    var user_name = 'tmpab';

    folder_module.retrieve_folder(user_name).then(function(folder){
        list.ls_for_owner(user_name, folder, function(err, html){
            p ('step b, list for owner, got: \n', err, html);
            //test.done();
            stop();
        });
    });

};

// This cost me a DAY. 
// The reason is after init_one_home, the job past to job schedule,
// the people file '.gg.people.v1.json' might not appear if just run 'ls' request.
// changed the way to 'get a few' people.
function init_to_ls (test){

    var user_name = 'tmpab';
    //test.expect(1);
    ihome.init_one_home(user_name).then(function(what_ever){
        p ('step a, init one home, get: \n', what_ever);
        folder_module.retrieve_folder(user_name).then(function(folder){
            assert(u.isObject(folder));
            assert(u.isFunction(folder.get_meta));

            var meta = folder.get_meta();
            p ('init to ls: after retrieve folder, meta.path: ', meta.path);
            
            list.ls_for_owner(user_name, folder, function(err, html){
                p ('step b, list for owner, got: \n', err, html);
                //test.done();
                stop();
            });
        });
    });

};


if (require.main === module){
    init_to_ls();
    //ls();
}

