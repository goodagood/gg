
/*
 * To make a plain file, it should be utf-8 text file, this will NOT
 * use the asynchronous file collector, it's a direct done.
 *
 * 2015 0913
 *
 * todo: moved bucket.js add: write-text-file
 */


//var Promise = require("bluebird");
var path = require("path");
var u    = require("underscore");
var fs   = require("fs");

var bucket  = require("gg-credentials").bucket;


//var s3folder = require("./folder-v5.js")
var folder_module = require("../aws/folder-v5.js");
var s3file_type = require("../aws/s3-file-types.js")
var file_module = require("../aws/simple-file-v3.js")


var task     = require('../myutils/job.js');
var file_meta= require("./meta-check.js");


var p = console.log;



/*
 *  @meta must has: name, path (include file name), owner and text.
 */
function write_text_file(meta, callback) {
    var s3key;

    var text = meta.text;
    delete meta.text;

    file_meta.fix_file_meta(meta);

    //Dev.bmeta = meta;
    //p('meta: ', meta);

    //p('bucket write text file, key: ', meta.storage.key);
    ////callback(null, meta);

    return bucket.write_text_file(meta.storage.key, text, function(err, result) {
        if(err) return callback(err);

        //p('bucket write text file: '); p(err, result);
        //// output for test
        //// we need to save the meta for next use, save re-writting a lot to s3.
        //fs.writeFile('./test-meta-1.json', JSON.stringify(meta), 'utf-8', function(err, what){
        //    p('wrote');
        //});

        one_file(meta, callback);
    });
}


/*
 * Adapted from collector, which take care after file been uploaded.
 */
function one_file(meta, callback){
    //var cwd = meta["dir"];
    var username = meta.owner;
    var filename = meta.name;
    var path_uuid = meta.path_uuid;

    return folder_module.retrieve_folder(meta["dir"]).then(function(folder_obj) {
        if (!folder_obj) { return callback("not folder object", null); }
        //Dev.folder = folder_obj;

        //// If the file name need to be unique
        //if (folder_obj.is_name_unique(filename)) {
        //    p(filename, ' is unique --- , one file');
        //    return update.update_file(meta, callback);
        //}


        file_module.new_file_obj_from_meta(meta, function(err, file){
            if(err){
                //Dev.e1 = err; p('got err, 2', err);
                return callback(err);
            }

            //p('new file obj from meta, 1'); Dev.tfile = file;
            //Dev.file = file;

            callback(null, file); // in dev

        });

        //
        //return s3file_type.file_obj_from_meta(meta, function(err, file_obj) {
        //    var file_meta;
        //    if (err) {
        //        return callback(err, null);
        //    }
        //    p("file obj has function get_meta? : ", u.isFunction(file_obj.get_meta));
        //    file_meta = file_obj.get_meta();

        //    p('should go to the old way');
        //    ////return _add_file_the_old_way(username, file_meta, cwd, folder_obj, callback);
        //});
    })["catch"](callback);  // Function "catch" will get parameter error.
}




//promised_new_plain_file = Promise.promisify(write_text_file);

module.exports.write_text_file = write_text_file;



// -- checkings


function a(){
    var txt = "this\n is\n sample\n text\n2015\n0909";
    var cwd = 'abc/test';
    var name = 't0909.txt';
    var fpath= path.join(cwd, name);

    var ometa = {
        owner: 'abc',
        name:  name,
        path:  fpath,

        text: txt,
    };
    p('ometa'); p(ometa);

    write_text_file(ometa, function(e,r){

        if(e) p('got err, in a :', e);
        //p("e,r\n", e,r);

        //delete bucket;
        process.exit();
    });
}


//// scoffoldings in developping, delete afterwards.
//var Dev = {}; // Global var help drop something into REPL.
//module.exports.Dev = Dev;
//function help_drop(){
//    // parameters:
//    var txt = "this\n is\n sample\n text\n2015\n0909";
//    var cwd = 'abc/test';
//    var name = 't0909.txt';
//    var fpath= path.join(cwd, name);
//
//    var ometa = {
//        owner: 'abc',
//        name:  name,
//        path:  fpath,
//
//        text: txt,
//    };
//    Dev.ometa = ometa;
//    p('ometa'); p(ometa);
//
//    write_text_file(ometa, function(e,r){
//
//        if(e) p('got err, in a :', e);
//        //p("e,r\n", e,r);
//
//        //process.exit();
//    });
//}
//module.exports.help_drop = help_drop;
//
//
//module.exports.help_one_file = function(){
//    fs.readFile('./test-meta.json', 'utf-8', function(err, str){
//        if(err) return p('err, 1:', err);
//
//        var meta = JSON.parse(str);
//        p('meta.storage.key: ', meta.storage.key);
//        Dev.meta1=meta;
//
//        one_file(meta, function(err, what){
//            if(err) return p('err 3: ', err);
//
//            Dev.what = what;
//
//            p(u.keys(Dev));
//            p('here');
//        });
//    });
//}
//// end of scaffolding in developing.


if(require.main === module){
    a();
}


