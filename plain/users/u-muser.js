
//  To be tested:
var muser = require("./muser.js");
var muser_resolved_name = require.resolve("./muser.js");


var u = require('underscore');
var assert = require('assert');

var user = require("./a.js");
//var user_resolved_name = require.resolve("./a.js");

var bucket = require("../aws/bucket.js");
//var bucket_resolved_name = require.resolve("../aws/bucket.js");

var folder_module = require("../aws/folder-v5.js");
//var folder_module_resolved_name = require.resolve("../aws/folder-v5.js");

var p = console.log;


//---



// 
// 2016, 0303
//
exports = module.exports;;

exports.unit_works = function(test){
    assert ('ok');
    test.ok(true === true);
    test.done();
};

exports.exists = function(test){
    p('check name exists in mongodb');
    var username = 'abc';
    muser.name_exists(username, function(err, yes){
        p(err, yes);
        test.ok(!err);
        test.done();
    });
};


exports.find_by_id = function(test){
    var id = 'abc';

    test.expect(3);
    muser.find_by_user_id(id, function(err, uinfo){
        test.ok(!err);
        //p('test find by id: ', id, uinfo);
        test.ok(!!uinfo.userid);
        test.ok(u.isString(uinfo.userid));

        //console.trace(uinfo.userid);

        test.done();
    });
};

exports.group = {
    test1 : function(test){
        test.done();
    },

    /*
     * This should not be a good solution to tear down, 
     * 2016 0304
     */
    tearDown: function(callback){
        callback(null);
        setTimeout(function(){
            process.nextTick(process.exit);
        }, 100);
    }

}

/* var for test */
var o = {};

function  cmusera(){
    var user_id = 'abc';

    muser.getgg(function(err, gg){
        o.err = err;
        o.gg  = gg;
        p('can you get gg?');
        muser.get_user_collection(function(err, coll){
            o.cerr = err;
            o.coll = coll;
            p('can you get collection?');
            muser.find_by_user_id(user_id, function(err, user_info){
                p(err, user_info);
            });
        });
    });
}

if(require.main === module){
    //cmusera();

    function c_find_by_user_name(name){
        muser.find_by_user_name(name, function(err, info){
            p('checking find by user name: ', err, info);
        });
    }
    c_find_by_user_name('t0322y6');

    setTimeout(process.exit, 30*1000);
}
p( "ok start interact:" );
