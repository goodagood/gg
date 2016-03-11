
var adder = require("./m-add-user.js");
//var muser = require("./muser.js");
var name_password = require("../config/sample-password.js");

var uuid   = require("node-uuid");
var assert = require("assert");

var p = console.log;

/*
 * We not test adding user name, it can be checked.
 */

// We know it can't be used, it's occupied.
// 0310, y2016
module.exports.test_adder_1 = function(test){
    var test_name = 't0310y6';

    adder.user_name_can_be_used(test_name, function(err, can){
        test.ok(!err);

        test.ok(!can);

        p('can: ', can);
        test.done();
    });
};


module.exports.manual_exit = function(test){
    //test.ok(true === false);
    test.ok(true === true);
    test.done();
    setTimeout(process.exit, 500);
};



if(require.main === module){

    function new_user(name){
        name = name || 't0310y6h23m13';
        name_password.get_sample_username_password(function(err, name_password_list){
            if(err) return p(1, err);

            var test_info = {
                username : name_password_list[name].username,
                password : name_password_list[name].password
            };
            p('test_info', test_info);

            adder.user_name_can_be_used(test_info.username, function(err, yes){
                assert(!err, "There is an err when adder # check user name can..");
                if(yes){
                    adder.insert_user_info_into_mongodb(test_info, function(err, updated){
                        assert(!err, "There is an err when adder # insert user ..");
                        assert(u.isString(updated.username), "We should have user name");
                        p('updated');
                        p(updated);
                    });
                }else{
                    p('user name can NOT be used');
                }
                
            });
        });
    }
    new_user();

    setTimeout(process.exit, 15*1000);
}
