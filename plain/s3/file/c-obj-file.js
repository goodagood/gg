
var o = require("./obj.js"); // file object
var getter = require("./getter.js");

var p = console.log;


//var file_path = 't0310y6/test0314.text';
//var owner = 't0310y6';

function c_a_0520(){
    var file_path = 'tmp/gg/gg.public.key';
    var owner = 'tmp';

    o.new_obj(file_path, function(err, obj){
        if(err){
            p(1, err);
            return setTimeout(process.exit, 2000);
        }
        p(err, obj);
        obj.cal_s3key_and_meta_s3key(function(err, what){
            p(2, err, what);
            p('file meta: ', obj.get_meta());

            obj.read_to_string(function(err, str){
                p('err str: ', err, str);
                setTimeout(process.exit, 2000);
            });

        });
    });
}


function gt(){
    var file_path = 'tmp/gg/gg.public.key';
    var owner = 'tmp';

    getter.getfile(file_path, function(err, f){
        f.read_to_string(function(err, str){
            p('err str: ', err, str);
            setTimeout(process.exit, 2000);
        });
    });
}

if(require.main === module){
    //c_a_0520();
    gt();
}
