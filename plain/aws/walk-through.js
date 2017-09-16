
var async = require('async');
var u     = require('underscore');

var myconfig =   require("../config/config.js");
var folder_module = require("./folder-v5.js");

var p = console.log;


/*
 * @options:
 *    {
 *      do_file:   function(parent_folder, file_uuid)
 *      do_folder: function(parent_folder, folder_uuid)
 *    }
 *
 * do_folder need not to do recursive things, only take care the folder itself.
 * It can do things like modify folder metas.
 *
 * If no do_folder given, it will not go into sub-folder.
 *
 */
function walk_through(folder, funs, callback){
    // @folder: cwd folder object
    var meta      = folder.get_meta();
    var uuid_list = u.keys(meta.files);

    async.whilst(
        function(){ return uuid_list.length > 0;}
        ,function(callback){
            process_one_uuid(folder, uuid_list.pop(), funs, callback);
        }
        ,callback
    );
}


function process_one_uuid(folder, uuid, funs, callback){
    // @folder: cwd folder object
    // @uuid:   the uuid in the cwd
    // @funs:   {do_file: function, do_folder: function}, the function get 
    //          parameter of (opt, callback) as in the following.

    funs = funs || {};
    var cwd_meta = folder.get_meta();
    var meta     = cwd_meta.files[uuid];

    var noop_callback = function(opt, callback){return callback(null, null);};
    if(!u.isFunction(funs.do_file))   funs.do_file   = noop_callback;
    if(!u.isFunction(funs.do_folder)) funs.do_folder = noop_callback;

    //p('process one: ', meta.what, meta.filetype, meta.type, meta.path);

    if(meta.what === myconfig.IamFile){
        var opt = {
            cwd_folder_obj:  folder,
            cwd_folder_meta: folder.get_meta(),
            file_uuid:       uuid,
        }
        return funs.do_file(opt, callback);
    }

    // 'do folder' need get 'funtions', which do job of the folder of uuid.
    if(meta.what === myconfig.IamFolder){
        // folder is current folder, uuid is the sub-folder:
        return do_one_sub_folder_uuid(folder, uuid, funs.do_folder, function(err, sub_folder){
            if(err) return callback(err, null);
            walk_through(sub_folder, funs, callback);
            //walk_into_sub_folder(folder, uuid, funs, callback);
        });
    }

    // shouldn't come here:
    callback('! should not come here', null);
}


/*
 * Require user support a function: 'do_folder' to do the job about sub-folder
 * of uuid, in the folder: cwd_folder.
 */
function do_one_sub_folder_uuid(cwd_folder, uuid, do_folder, callback){
    // @do_folder: the function to do the job
    var cwd_folder_meta = cwd_folder.get_meta();
    var sub_folder_meta = cwd_folder_meta.files[uuid];
    var sub_folder_path = sub_folder_meta.path;

    folder_module.retrieve_folder(sub_folder_path).then(function(sub_folder){
        var parameters = {
        cwd_folder_obj:  cwd_folder,
        cwd_folder_meta: cwd_folder_meta,
        sub_folder_uuid: uuid,
        sub_folder_meta: sub_folder_meta,
        sub_folder_path: sub_folder_meta.path,
        sub_folder_obj:  sub_folder
        }
        return do_folder(parameters, function(err, whatever){
            if(err) return callback(err, null);
            return  callback(null, sub_folder);
        });
    }).catch(function(err){
        return callback(err, null);
    });
}

//function walk_into_sub_folder(folder, uuid, options, callback){
//    var folder_meta     = folder.get_meta();
//    var sub_folder_meta = folder_meta.files[uuid];
//    var sub_folder_path = sub_folder_meta.path;
//
//    folder_module.retrieve_folder(sub_folder_path).then(function(sub_folder){
//        //walk_through sub folder
//        walk_through(sub_folder, options, callback);
//    }).catch(function(err){
//        callback(err, null);
//    });
//}



/*
 * To improve the folder walk through
 * @worker is a function to do one file or folder, it get parameters:
 *  worker(current_folder_object, uuid_of_the_file_or_folder, callback)
 */
function file_1st_walk_through(folder, worker, callback){
    // @folder: cwd folder object
    var meta      = folder.get_meta();
    var uuid_list = u.keys(meta.files);

    // Make a list of functions, those deal with file will be put ahead.
    var function_list   = [];
    u.each(uuid_list, function(uuid){
        var info = meta.files[uuid];
        if(info.what === myconfig.IamFile){
            // put to head of the list, 'unshift':
            function_list.unshift(function(callback){
                worker(folder, uuid, callback);
            });
        }else{  
            // suppose to be folder:
            // put to the end of the list, the function deal with the
            // sub-folder, will recursively walk into the sub folder.
            function_list.push(function(callback){
                worker(folder, uuid, function(err, result){
                    folder_module.retrieve_folder(info.path).then(function(sub_folder){
                        file_1st_walk_through(sub_folder, worker, callback);
                    }).catch(function(err){
                        callback(err);
                    });
                });
            });
        }
    });

    async.series(function_list, callback);
}

module.exports.walk_through = walk_through;
module.exports.file_1st_walk_through = file_1st_walk_through;


// -- do some checkings -- //



function do_file(opt, callback){
    var cwd     = opt.cwd_folder_obj;
    var mfolder = opt.cwd_folder_meta;
    var uuid    = opt.file_uuid;
    // the file meta saved in folder meta:
    var meta    = mfolder.files[uuid];

    p('got file uuid, path: ', meta.uuid, meta.path );
    callback(null, null)
    //cwd.uuid_to_file_obj(uuid, function(err, file){
    //    p('do file, ', meta.path, meta.what);
    //    callback(null, null);
    //})
}

//// for testing/checking:
//// The old way to accept parameters:
//function do_folder_uuid(cwd_obj, uuid, callback){
//    var cwd_meta =  cwd_obj.get_meta();
//    var meta     = cwd_meta.files[uuid];
//
//    //p ('- in do folder, ', meta.path);
//    folder_module.retrieve_folder(meta.path).then(function(folder){
//        var mfolder = folder.get_meta();
//        p('got folder path, uuid: ', mfolder.path, mfolder.uuid);
//        callback(null, folder);
//
//        //walk_through(folder, callback);
//
//        //folder.callback_folder_auxiliary_path(function(err, apath){
//        //    p('in folder: ', meta.path);
//        //    p('callback folder auxiliary path: err apath: ', err, apath);
//        //    walk_through(folder, callback);
//        //});
//
//        //p( 'still not walk into folder: ', meta.path, meta.what);
//        //callback(null, null);
//    });
//    //callback(null, null);
//}

function do_folder(opt, callback){
    var cwd_meta =  opt.cwd_folder_meta;
    var cwd      =  opt.cwd_folder_obj;
    var meta     =  opt.sub_folder_meta;
    var sub_folder = opt.sub_folder_obj;

    //p ('- in do folder, ', meta.path);
    var mfolder = sub_folder.get_meta();
    p('got folder uuid, path: ', mfolder.uuid, mfolder.path );
    callback(null, null);

    //folder.callback_folder_auxiliary_path(function(err, apath){
    //    p('in folder: ', meta.path);
    //    p('callback folder auxiliary path: err apath: ', err, apath);
    //    walk_through(folder, callback);
    //});

}



function check_walk_through(dir){
    dir = dir || 'abc/test';

    var opt = {
        do_file:   do_file,
        do_folder: do_folder
    };
    folder_module.retrieve_folder(dir).then(function(folder){
        walk_through(folder, opt, function(err, what){
            p('after walk through: ', err, what);
            require("../myutils/test-util.js").stop();
            //stop();
        });

    });
}


if(require.main === module){
    check_walk_through();
}
