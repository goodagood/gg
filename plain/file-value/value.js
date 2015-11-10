
//
// Adding values to file, it can be concurrent, handreds or more adding can
// happens on one file.
//
// 0309, 2015
//

var path   = require('path');
var assert = require('assert');
var u      = require('underscore');

var myconfig      =   require("../config/config.js");
var file_module   = require('../aws/simple-file-v3.js');
var folder_module = require('../aws/folder-v5.js');
var sjson         = require('../aws/simple-json.js');

var p = console.log;

//
// Put new value file to     user-id/goodagood/.gg.value.new/
// Put new comments file to  user-id/goodagood/.gg.comment.new/
// Thus we can collect all new value/comment easily.
//

var New_value_dir   = 'goodagood/.gg.value.new';
var New_comment_dir = 'goodagood/.gg.comment.new';



function add_value_file(path_uuid, value, info, callback){
    // @path_uuid: The file to get values.
    // @value: value * base = amount

    folder_module.retrieve_file_by_path_uuid(path_uuid, function(err, file){
        var file_meta = file.get_meta();
        var uuid      = file_meta.uuid;
        //assert(muuid === uuid, 'uuid should equal though get from different ways.');
        var username  = file_meta.owner;

        //var va_file_name = myconfig.value_adding_file_name;
        //var va_file_path = path.join(username, myconfig.value_folder, uuid, va_file_name);
        var va_file_name = 'for-' + uuid;
        var va_file_path = path.join(username, New_value_dir, va_file_name);

        var value_json = {
            'for' : path_uuid,
            'value' : value,
            'timestamp' : info.timestamp ? info.timestamp : Date.now()
        };
        u.defaults(value_json, info);

        p('in "add value" to make json file: ', value_json, username, va_file_path);
        sjson.make_json_file(value_json, username, va_file_path, function(err, vfile){
            p('err, vfile: ', err, vfile);
            callback(null, vfile);
        });
    });
}


function add_value_directly(path_uuid, value, callback){
    // @path_uuid: of the file.
    // @value: value * base = amount

    folder_module.retrieve_file_by_path_uuid(path_uuid, function(err, file){
        var file_meta = file.get_meta();
        var uuid      = file_meta.uuid;
        //assert(muuid === uuid, 'uuid should equal though get from different ways.');
        var username  = file_meta.owner;

        // Lock should be added first ...
        make_sure_value_exists(file_meta);
        file_meta.value.amount += value;

        file.render_html_repr();
        file.save_file_to_folder().then(function(rep){
            // The callback get different from 'add value'.
            callback(null, file_meta.value.amount);
        });
    });
}


function make_sure_value_exists(meta){
    // make sure meta has 'value' attribute, if not, set it to {'amount':0,}.
    // if already set elsewhere, value should be: {'amount': number, 'unit': unit,...}

    if(typeof meta.value === 'undefined') meta.value = {};
    if(! u.isObject(meta.value) ) meta.value = {};
    if(typeof meta.value.amount === 'undefined') meta.value.amount = 0;

    var v = meta.value.amount;
    if(!u.isNumber(v)){
        try{
            v = parseInt(v);
        }catch(err){
            v = 0;
        }
        meta.value.amount = v;
    }
    return meta;
}


function add_comment(path_uuid, comment, info, callback){
    // @comment: json, {
    //    comment: text/markdown text
    //    timestamp: epoch milli-seconds
    //    username:  who give the comment
    //    path_uuid: which file get the comment
    // }

    var path_uuid = comment.path_uuid;
    var commenter = comment.username;

    folder_module.retrieve_file_by_path_uuid(path_uuid, function(err, file){
        var file_meta = file.get_meta();
        var uuid      = file_meta.uuid;
        //assert(muuid === uuid, 'uuid should equal though get from different ways.');
        var listener  = file_meta.owner;

        var comment_file_name = 'comment-' + uuid + '.json';
        var comment_file_path = path.join(username, New_comment_dir, comment_file_name);

        var value_json = {
            'for' : path_uuid,
            'value' : value,
            'timestamp' : info.timestamp ? info.timestamp : Date.now()
        };
        u.defaults(value_json, info);

        p('in "add value" to make json file: ', value_json, listener, comment_file_path);
        sjson.make_json_file(j, listener, comment_file_path, function(err, jfile){
            p('err, jfile: ', err, jfile);
            callback(null, jfile);
        });
    });
}


function collect_value_files(file_path_uuid, callback){
    // collect value file for a file, 
    // The value files are json file, which is:
    //     user-id/goodagood/.gg.value/file-uuid/value-adding.json

    folder_module.retrieve_file_by_path_uuid(path_uuid, function(err, file){
        var file_meta = file.get_meta();
        var uuid      = file_meta.uuid;
        //assert(muuid === uuid, 'uuid should equal though get from different ways.');
        var username  = file_meta.owner;

        var va_file_name = myconfig.value_adding_file_name;
        var va_file_path = path.join(username, myconfig.value_folder, uuid, va_file_name);
        var va_folder_path = path.join(username, myconfig.value_folder, uuid);

        folder_module.retrieve_folder(va_folder_path).then(function(folder){
            folder.get_file_objs(va_file_name, function(err, files){
                // lock folder when add/rm files
                // todo
            });
        });
    });
}


function add_value(file_path_uuid, value, callback){
    // Try to add value to file meta directly, if can't, add a value adding
    // file.  This is suppose to be simple interface to add value.

    value = value || 1;

    add_value_directly(file_path_uuid, value, function(err, s3reply){
        p('add value, 1, 0311, (err s3reply):\n ', err, s3reply);
        callback(err, s3reply);
    });

    //folder_module.retrieve_file_by_path_uuid(path_uuid, function(err, file){
    //    var file_meta = file.get_meta();
    //    var uuid      = file_meta.uuid;
    //    //assert(muuid === uuid, 'uuid should equal though get from different ways.');

    //    var owner = file_meta.owner;

    //    var va_file_name   = myconfig.value_adding_file_name;
    //    var va_folder_path = path.join(owner, myconfig.value_folder, uuid);
    //    var va_file_path   = path.join(va_folder_path, va_file_name);

    //    folder_module.retrieve_folder(va_folder_path).then(function(folder){
    //        folder.get_file_objs(va_file_name, function(err, files){
    //            // lock folder when add/rm files
    //        });
    //    });
    //});
}

// Each file/folder can have comments, value improvement.  If to has it, the
// file will get an extra folder in user-name/goodagood/.value/file-uuid, in
// the folder, value.uuid, comment.uuid will be any value/comment changes.

function make_folder_for_file_value(username, file_path_uuid, callback){
    // make the folder for the file if needed, to add value, comments for it.
    // @username : by where the file located.
    // @file_path_uuid : path_uuid of the file.

    //var dir  = path.dirname(file_path_uuid);
    var uuid = path.basename(file_path_uuid);

    var value_folder_path = path.join(username, myconfig.value_folder);
    p('value folder: ',  value_folder_path);

    folder_module.retrieve_file_by_path_uuid(file_path_uuid, function(err, file){
        var file_meta = file.get_meta();
        var muuid      = file_meta.uuid;
        assert(muuid === uuid, 'uuid should equal though get from different ways.');
        var owner     = file_meta.owner;

        var Vfolder;
        folder_module.retrieve_folder(value_folder_path).then(function(folder){
            Vfolder = folder;

            if(Vfolder.file_exists(uuid)){
                p(uuid, ' already exists');
                return Vfolder.get_folder(uuid);
            }else{
                return Vfolder.add_folder(uuid);
            }
        }).then(function(ffolder){
            //p( typeof ffolder.get_folder);
            //assert(u.isFunction(ffolder.add_file));

            var ffmeta = ffolder.get_meta();
            p('meta path, of ffolder', ffmeta.path);

            var config_file_name = 'config.json';
            var config_file_path = path.join(value_folder_path, uuid, config_file_name);
            if(ffolder.file_exists(config_file_name)){ 
                callback(null, null);
                return p('file exists: ', config_file_name);
            }
            var j = {
                'for' : file_path_uuid,
                'current_value' : 1,
                'base_value'    : 1,  // how much to add each time.
            };
            p('to make json file: ', j, owner, config_file_path);
            sjson.make_json_file(j, owner, config_file_path, function(err, jfile){
                p('err, jfile: ', err, jfile);
                callback(null, null);
            });
        });
    });
}


function add_value_folder(username, callback){
    // the folder should be: user-name/goodagood/.gg.value, 
    // it save value/comments info for file/folders.

    var name = '.gg.value';
    var dir = path.join(username, 'goodagood');
    return folder_module.retrieve_folder(dir).then(function(folder){
        //p('folder\n', folder);
        assert(u.isObject(folder));
        assert(u.isFunction(folder.file_exists));

        if(folder.file_exists(name)){
            return p(name, ' already exists');
        }else{
            return folder.add_folder(name);
        }
    }).then(function(vfolder){
        callback(null, vfolder);
    });
}


module.exports.add_value_file = add_value_file;
module.exports.add_value_directly = add_value_directly;
module.exports.add_value = add_value;


// fast checkings

var tutil = require("../myutils/test-util.js");

function check_add_value_folder(){
    var name = 'abc';

    add_value_folder(name, function(err, what){
        p('what:\n', what);
        tutil.stop();
    });
}

function check_b(){
    var name = 'abc';
    var username = name;

    var folder_path = path.join(name, myconfig.value_folder);

    folder_module.retrieve_files_by_pattern('abc/imgvid', /gc-550-2.*/, function(err, files){
        //p(err, files.length);
        var f0 = files[0];
        var m0 = f0.get_meta();
        var p0 = m0.path;
        var u0 = m0.uuid;
        var pu0= m0.path_uuid;
        //p(m0, p0);
        p(p0, u0, pu0);

        p('going to make folder for file value: ', username, pu0);
        make_folder_for_file_value(username, pu0, function(err, what){
            p('err, what, ', err, what);
            tutil.stop();
        });

    });
    //folder_module.retrieve_folder(folder_path).then(function(folder){
    //})

}


function check_file_has_extra(){

    // get the folder
    var ff_path = 'abc/goodagood/.gg.value/f55f69da-9f80-4353-babb-7125c8c3a079';
    folder_module.retrieve_folder(ff_path).then(function(folder){
        var meta = folder.get_meta();
        p('file uuids', meta.file_uuids);
        p('meta', meta);
        tutil.stop();
    });
}

function change_file_meta(){
    var file_path = 'abc/imgvid/gc-550-2.jpg';
    folder_module.retrieve_file_objs(file_path, function(err, files){
        //p('err, files: ', err, files);
        var f0 = files[0];
        var m  = f0.get_meta();

        p('meta path: ', m.path);
        m['unique-in-folder'] = true;

        var username = m.owner;
        var uuid     = m.uuid;
        p('owner, uuid: ', username, uuid);
        
        var value_folder_path = path.join(username, myconfig.value_folder, uuid);
        p('value folder path: ', value_folder_path);
        m['value-folder-path'] =  value_folder_path;

        f0.save_meta_file(function(err, s3reply){
            p('save meta file get: ', err, s3reply);
            tutil.stop();
        });

    });
}

function get_a_path_uuid(file_path, callback){
    file_path = file_path || 'abc/imgvid/gc-550-22.jpg';

    p('file path: ', file_path);
    folder_module.retrieve_file_objs(file_path, function(err, files){
        //p('err, files: ', err, files);
        if(err) return callback(err, null);
        assert(files.length > 0);
        var f0 = files[0];
        var m  = f0.get_meta();
        var pu = m.path_uuid;
        assert(u.isString(pu));
        callback(null, pu);
    });
}


function check_add_value_direct(){
    var file_path = null;
    get_a_path_uuid(file_path, function(err, path_uuid){
        p('file path uuid: ', path_uuid);
        add_value(path_uuid, 1, function(err, s3reply){
            p('after add value: (err reply)\n', err, s3reply);
            tutil.stop();
        });
    });
}

if(require.main === module){
    //check_a();
    //check_b();
    //check_file_has_extra();
    //change_file_meta();

    check_add_value_direct();
}

