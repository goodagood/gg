
var path = require("path");

var bucket = require('../aws/bucket.js');

var file_obj = require('./ggfile.js');


/*
 * Some file has no meta.
 */
function retrieve_meta(file_path, callback){
    file_obj.new_obj({path: file_path}, function(err, obj){
        obj.set_basic_access_keys(function(err, meta){
            if(err) return callback(err);
            p('in ret.. meta: ', meta);

            obj.retrieve_meta(callback);
        });
    });
}
module.exports.retrieve_meta = retrieve_meta;


function retrieve_file_obj(file_path, callback){
    file_obj.new_obj({path: file_path}, function(err, obj){
        obj.set_basic_access_keys(function(err, meta){
            if(err) return callback(err);

            obj.retrieve_meta(function(err, meta){
                if(err) return callback(err);
                callback(null, obj);
            });
        });
    });
}
module.exports.retrieve_file_obj = retrieve_file_obj;



if(require.main === module){
    var p = console.log;

    function c_meta(){
        var file_path = 't0310y6/manssh';
        var owner = 't0310y6';

        retrieve_meta(file_path, function(err, meta){
            p(err, meta);

            setTimeout(process.exit, 2000);
        });
    }
    c_meta();
}
