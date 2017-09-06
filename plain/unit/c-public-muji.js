
//
// we should have 2 folders: public, muji
//
// 0725, 2015.
//

var assert  = require("assert");
var u       = require("underscore");
var async   = require("async");
var path    = require("path");
//var Promise = require("bluebird");
var fs      = require("fs");

//var bucket        = require("../aws/bucket.js");
//var file_module   = require("../aws/simple-file-v3.js");
//var file_types    = require("../aws/s3-file-types.js");
//var update        = require("../aws/file-update.js"); 
//
//var myconfig =   require("../config/config.js");
//var config = require("../test/config.js");

var folder_module = require("../aws/folder-v5.js");
var user   = require("../users/a.js");
var all_roots = require("../users/all-roots.js");

var member = require("../aws/members-v2.js");


var p    = console.log;
var stop = process.exit;


// end of the headings //





/*
 * only check sub-folder if exists:
 *      user-home-id/sub-folder
 */
function dir_exists(sub){
    sub = sub || 'public';

    all_roots.get_all_root_ids(function(err, ids){
        if(err){
            p('err: ', err);
            stop();
        }
        p(ids.join(",\t "));

        var folder_pathes = u.map(ids, function(id){
            return path.join(id, sub);
        });

        //p('pathes:  ', folder_pathes.join(', '));

        async.map(folder_pathes, folder_module.folder_exists, function(err, what){
            p('checked? ', err, typeof what);
            if(err) p('err:', "\n", err);
            stop();
        });
    });
}

/*
 *  We want folder 'muji' and 'public' can be viewed by public, it should
 *  has viewer: '*'.
 *  This will try to find all root id, for sub folders.
 */
function has_public_viewer(sub){
    sub = sub || 'public';

    all_roots.get_all_root_ids(function(err, ids){
        if(err){
            p('err: ', err);
            stop();
        }
        p(ids.join(",\t "));

        var folder_pathes = u.map(ids, function(id){
            return path.join(id, sub);
        });

        p('pathes:  ', folder_pathes.join(', '));

        var funs = u.map(folder_pathes, function(dir){
            return function(callback){
                async.nextTick(function(){
                    path_has_public_viewer(dir, callback);
                });
            };
        });

        async.series(funs, function(err, results){
            p('err ', err);

            p(results.join(",\t "));
            stop();
        });
    });
}


function path_has_public_viewer(dir, callback){
    member.make_member_manager_for_path(dir, function(err, mng){
        if(err) return callback(err);
        var has = mng.has_viewer('*');
        p(has, dir);
        callback(null, has );
    });
}


function see_member_json(dir){
    // 28, ab

    dir = dir || '28';

    var cwd = path.join(dir, 'public');
    member.make_member_manager_for_path(cwd, function(err, mng){
        if(err) return callback(err);


        var has = mng.has_viewer('*');
        p(has, cwd);
        var j   = mng.get_json();
        p(cwd, j);
        stop();
    });
}


/*
 * A tool to give all home's sub folder.
 */
function get_all_sub_pathes(sub, callback){
    sub = sub || 'public';

    all_roots.get_all_root_ids(function(err, ids){
        if(err){
            p('err in get all public path: ', err);
            return callback(err);
        }
        //p(ids.join(",\t "));

        var folder_pathes = u.map(ids, function(id){
            return path.join(id, sub);
        });

        //p('pathes:  ', folder_pathes.join(', '));

        callback(null, folder_pathes);

    });
}


//var member = require("../aws/members-v2.js");
function add_viewer_to_path(dir, callback){
    //dir = dir || 'abc/public';

    p(' going to add viewer for dir: ', dir);
    member.make_member_manager_for_path(dir, function(err, manager){
        if(err) return callback(err);

        //p('the json: ', manager.get_json());
        manager.add_viewer('*', callback);
    });
}



function add_public_viewer_to_all_sub_path(sub){
    sub = sub || 'public';
    get_all_sub_pathes(sub, function(err, dirs){
        p(1, err);
        p('got all pathes? ', dirs.join(",\t "));
        assert(u.isArray(dirs));

        //stop();
        //var less = dirs.slice(0, 5);

        var funs = u.map(dirs, function(dir){
            return function(callback){
                p('go to next tick for ', dir);
                async.nextTick(function(){
                    add_viewer_to_path(dir, callback);
                });
            };
        });

        p('num of funs: ', funs.length);

        async.series(funs, function(err, results){
            p('after series, err, typeof results: ', err, results);
            stop();
        });

    });
}

if(require.main === module){
    //dir_exists('muji');

    has_public_viewer('muji');
    //see_member_json('ab');
    //add_public_viewer_to_all_sub_path('muji');
}



// -- for drop into REPL -- //

//var o = {};


// a signal to 'expect'
console.log("ok start interact:");
