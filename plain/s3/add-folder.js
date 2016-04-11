
var path = require("path");


var folder = require("./folder.js");
var folder_writter = require('./folder-writter.js');
var tool   = require("./folder-tool.js");

var p = console.log;


/*
 * @info: {path: string, ...}
 */
function add_path(info, callback){
    folder_path = info.path;
    owner = info.owner || folder_path.split('/')[0];
    p(14.7, folder_path, owner);

    var parent_path = path.dirname(folder_path);

    folder.retrieve_folder(parent_path, function(err, parent){
        p('parent meta: ', parent.get_meta());

        folder.new_obj(folder_path, function(err, obj){
            //p(err, obj);
            //p(obj.get_meta());
            obj.set_meta(info);
            obj.set_owner(owner);
            obj.calculate_basic_meta(function(err, meta){
                p('after calculate_basic_meta, ', err, meta);
                p(obj.get_meta());
                obj.save_meta(function(err, s3rep){
                    p('save meta: ', err, s3rep);
                    folder_writter.intern_file(parent, obj, callback);
                });
            });
        });
    });
}
module.exports.add_path = add_path;


function add_path_if_not_exists(info, callback){
    if(!info.path) return callback('We need to know the folder path to add a sub folder');

    tool.is_folder_exists(info.path, function(err, exists){
        if(exists){
            p(`folder: ${info.path} EXISTS.`);
            return folder.retrieve_folder(info.path, callback);
        }else{
            p(`build new folder: ${info.path}.`);
            add_path(info, callback);
        }
    });
}
module.exports.add_path_if_not_exists = add_path_if_not_exists;


/*
 * @pfolder: parent folder object
 */
function add_sub_folder(pfolder, name, callback){
    var pmeta = pfolder.get_meta();
    var parent_path = pmeta.path || pmeta.name;
    var folder_path = path.join(parent_path, name);

    folder.new_obj(folder_path, function(err, obj){
        obj.calculate_basic_meta(function(err, meta){
            //p('after calculate_basic_meta, ', err, meta);
            //p(obj.get_meta());
            obj.save_meta(function(err, s3rep){
                p('save meta, in add sub folder: ', err, s3rep);
                folder_writter.intern_file(pfolder, obj, function(err, s3reply){
                    if(err) callback(err);
                    callback(null, obj);  // give created obj of sub folder.
                });
            });
        });
    });
}
module.exports.add_sub_folder = add_sub_folder;


function add_sub_folder_if_not_exists(parent_folder, name, callback){
    var pmeta = parent_folder.get_meta();
    var parent_path = pmeta.path || pmeta.name; //?

    var folder_path = path.join(parent_path, name);
    if(!folder_path) return callback('folder path? to add a sub folder when NOT exists');

    tool.is_folder_exists(folder_path, function(err, exists){
        if(exists){
            p(`folder: ${folder_path} EXISTS, retrieve it.`);
            return folder.retrieve_folder(folder_path, callback);
        }else{
            p(`build new folder: ${folder_path}.`);
            add_sub_folder(parent_folder, name, callback);
        }
    })
}
module.exports.add_sub_folder_if_not_exists = add_sub_folder_if_not_exists;


if(require.main === module){
    function check_add_sub(the_path, callback){
        var the_name = path.basename(the_path);

        tool.get_parent_folder(the_path, function(err, parent){
            p('parent meta: ', parent.get_meta());
            add_sub_folder(parent, the_name, function(err, sub){
                p('after add sub , the err: ', err);
                p('what should get sub folder, and the meta is: ', sub.get_meta());
                setTimeout(process.exit, 3*1000);
            });
        });
    }
    //check_add_sub('t0322y6/muji');


    function check_add_if_not_exist(the_path, callback){
        var the_name = path.basename(the_path);

        tool.get_parent_folder(the_path, function(err, parent){
            p('1.1 parent meta: ', parent.get_meta());
            add_sub_folder_if_not_exists(parent, the_name, function(err, sub){
                p('1.2 after add sub , the err: ', err);
                p('1.3 what should get sub folder, and the meta is: ', sub.get_meta());
                setTimeout(process.exit, 3*1000);
            });
        });
    }
    check_add_if_not_exist('t0322y6/muji');
}


