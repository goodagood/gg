
var ggfile = require("./ggfile.js");


var u = require('underscore');
var p = console.log;


module.exports.first_test = function(test){
    var file_path = 't0310y6/test0314.text';
    var owner = 't0310y6'; //name

    var info = {
        path: file_path,
    };

    ggfile.new_obj(info, function(err, obj){
        //p(err, obj);
        test.ok(!err);
        obj.calculate_meta_defaults(function(err, what){
            test.ok(!err);
            p('file meta: ', obj.get_meta());
            test.done();
        });
    });
}


module.exports.last_force_exit = function(test){
    test.ok('for exit');
    test.done();
    setTimeout(process.exit, 2000);
};

