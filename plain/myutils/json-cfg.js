
var fs   = require("fs");
var path = require("path");


/*
 * read json file as a object, only one object:
 *   { attributes ... }
 *
 * 2016 0227
 */
function read_json(full_path, callback){
    fs.readFile(full_path, 'utf-8', function(err, string){
        if(err) return callback(err);

        try{
            var obj = JSON.parse(string);
            return callback(null, obj);
        }catch(err){
            callback(err);
        }
    });
}
module.exports.read_json = read_json;


// before 0409 y2016
function s3_prefix_configure(cfg_file_path){
    cfg_file_path = cfg_file_path || path.normalize(path.join(__dirname, "../config/s3-prefix.json"));

    var prefixes;

    function read_file(callback){

        read_json(cfg_file_path, function(err, obj){
            //p(`path: ${cfg_file_path}`);
            //p(err, obj);
            if(err) return callback(err);

            //p(`folder_prefix: ${obj.folder_prefix}`);
            prefixes = obj;
            callback(null, obj);
        });
    }

    function direct(name, callback){
        if(!prefixes) return callback('no prefixes');

        var value = prefixes[name] ? prefixes[name] : null;
        callback(null, value);
    }

    /*
     * callback get value of name.
     */
    return function (name, callback){
        if(prefixes) return direct(name, callback);

        read_file(function(err, prefixes){
            if(err) return callback(err);

            return direct(name, callback);
        });
    }
}
module.exports.s3_prefix_configure = s3_prefix_configure;


var _s3_prefixes = null;

function callback_s3_prefixes(callback){
    var cfg_file_path = path.normalize(path.join(__dirname, "../config/s3-prefix.json"));

    if(_s3_prefixes) return callback(null, _s3_prefixes);

    //else:
    read_json(cfg_file_path, function(err, obj){
        if(err) return callback(err);

        _s3_prefixes = obj;
        callback(null, _s3_prefixes);
    });
}
module.exports.callback_s3_prefixes = callback_s3_prefixes;


if(require.main === module){
    var p = console.log;

    function read_test(){
        var j_file_path = "/home/ubuntu/workspace/gg/plain/config/s3-prefix.json";

        read_json(j_file_path, function(err, obj){
            p(err, obj);
            p(`folder_prefix: ${obj.folder_prefix}`);
        });
    }
    //read_test();

    function s3_prefix_test(){
        var get = s3_prefix_configure();

        get('folder_prefix', function(err, value){
            if(err) return p('err in test: ',  err);
            p(`folder prefix: ${value}`);
        });
    }
    //s3_prefix_test();


    function get_prefixes(){
        callback_s3_prefixes(function(err, prefixes){
            if(err) return p('err in test csp: ',  err);
            p(prefixes);
        });
    }
    get_prefixes();
}
