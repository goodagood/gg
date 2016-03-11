
/*
 * test the m-hash-pass.js, which make salted hash for password in mongodb.
 *
 * 2016 0307
 */


var mhp = require("./m-hash-pass.js");
var name_password = require("../config/sample-password.js");

var u = require("underscore");

var p = console.log;



exports = module.exports;;

exports.find_check = function(test){
    var test_name = 'abc'

    name_password.get_sample_username_password(function(err, name_password_list){
        test.ok(!err);
        p(name_password_list);

        var username = name_password_list[test_name].username;
        var password = name_password_list[test_name].password;

        test.ok(u.isString(username));
        test.ok(u.isString(password));

        mhp.find_and_check(username, password, function(err, result){
            p('in u-m-hash-pass.js, test find and check: ', err, result);
            test.done();
            setTimeout(function(){
                process.exit();
            }, 2000);
        });

    });
}
