
/*
 * Walk through all user and homes, to check muji folder's setting.
 */

var async = require("async");
var u     = require("underscore");
var path  = require("path");


var walker = require("../aws/walk-through.js");
var allid  = require("../users/all-roots.js");
var dirmd  = require("../aws/folder-v5.js");
var getter = require("../aws/get-file.js");


const GgName = 'gg';
var p = console.log;

function c_get_all_user_ids_and_build_tasks_for_it(){
    allid.get_all_root_ids(function(err, ids){
        if(err) return p('got root id list err: ', err);
        if(!u.isArray(ids)) return p('give me array of id, i want check array of user ids.');

        var tasks = build_task_list(ids);
        async.series(tasks, function(err, finished){
                p('all ids finished');
                if(err) p(err, finished);
                p('gong to exit in 5s', setTimeout(process.exit, 5000));
            }
        );
    });
}


function build_task_list(ids){
    return u.map(ids, function(id){
        return function(callback){
            check_home(id, callback);
        };
    });
}


function check_home(id, callback){
    // the id should be same string as user's home folder name.
    dirmd.retrieve_folder(id).then(function(folder) {
        var meta = folder.get_meta();
        console.log(`path: , ${meta.path}; \t owner:  ${meta.owner}`);
        if(meta.listor) console.log('listor: ', meta.listor);
        callback(null, null);
    }).catch(callback);
}


/* check all muji folder has correct 'listor' */
function check_all_muji(){
    allid.get_all_root_ids(function(err, ids){
        if(err) return p('got root id list err: ', err);
        if(!u.isArray(ids)) return p('give me array of id, i want check array of user ids.');

        var tasks = build_task_list_for_muji(ids);
        async.series(tasks, function(err, finished){
                p('all ids finished');
                if(err) p(err, finished);
                p('gong to exit in 5s', setTimeout(process.exit, 5000));
            }
        );
    });
}

function build_task_list_for_muji(ids){
    return u.map(ids, function(id){
        return function(callback){
            check_muji(id, callback);
        };
    });
}


function check_muji(id, callback){
    // the id should be same string as user's home folder name.
    var mujipath = path.join(id, 'muji');
    //p(`\r\n==, For path ${mujipath}:`);
    getter.file_path_exists(mujipath, function(err, yes){
        if(err || !yes){
            if(err) p('getter file p e: ', mujipath, err);
            if(!yes) p('getter not yes : ', mujipath, err);
            return callback(err);
        }

        if(!err && yes){
            dirmd.retrieve_folder(mujipath).then(function(folder) {
                var meta = folder.get_meta();
                //if(meta.listor){
                //    console.log(`path: , ${meta.path}; \t owner:  ${meta.owner}`);
                //    if(meta.listor) console.log('listor: ', meta.listor);
                //}
                if(!meta.listor){
                    console.log(`path: , ${meta.path}; \t owner:  ${meta.owner}`);
                    console.log('going to set listor: ');
                    return folder.set_attr('listor', {'default': 'img-value'}, callback);
                }
                callback(null, null);
            }).catch(callback);
        }
    });
}


/* goint to check:
 * All user has 'gg' folder, and it's sub-folders
 */


function check_all_gg(){
    allid.get_all_root_ids(function(err, ids){
        if(err) return p('0126, got root id list err: ', err);
        if(!u.isArray(ids)) return p('0126, give me array of id, i want check array of user ids.');

        var tasks = build_task_list_for_gg(ids);
        async.series(tasks, function(err, finished){
                if(err) p(err, finished);
                p('0126, gong to exit in 5s', setTimeout(process.exit, 5000));
            }
        );
    });
}

function build_task_list_for_gg(ids){
    return u.map(ids, function(id){
        return function(callback){
            check_gg(id, callback);
        };
    });
}


function check_gg(id, callback){
    // the id should be same string as user's home folder name.
    var ggpath = path.join(id, GgName);
    p(`\r\n==, For path ${ggpath}:`);

    var Home, GG;
    dirmd.retrieve_folder(id).then(function(home) {
        Home = home;
        return build_gg_folder(Home);
    }).then(function(gg){
        GG = gg;
        p('after build gg folder, u.keys(gg).sort().join("  "): ', u.keys(gg).sort().join("  "));
        return callback(null, Home, GG);
    }).catch(callback);
}

var getadd = require("./get_or_add.js");
function build_gg_folder(home){
    if(!home) return p('no home');
    if(!u.isString(home.get_meta().uuid)) return 'no uuid';

    var GG;
    p('-- in build gg folder,  to add if not exists :', GgName);
    //home.add_folder(GgName).then(function(g) {});
    return getadd.add_if_not_exists(home, GgName).then(function(g) {
        GG = g;

        // debugging
        var gm = g.get_meta();
        var cwd = gm.path;
        p('meta of cwd: ', cwd);
        p('to add message folder');

        return getadd.add_if_not_exists(GG, 'message');
        //return GG.add_folder('message');
    }).then(function(msg) {
        p('to add etc');
        return getadd.add_if_not_exists(GG, 'etc');
    }).then(function() {
        p('to GG file listing, changed to write meta, 2015 1205');
        GG.build_file_list();
        return GG.promise_to_write_meta();
    }).then(function() {
        p('home build file list');
        home.build_file_list();
        return home.promise_to_write_meta();
    }).then(function(){
        p('return GG');
        return GG;
    });
}


function check_abc_gg(user_id){
    user_id = user_id || 'abc';

    // the id should be same string as user's home folder name.
    var ggpath = path.join(user_id, GgName);

    p(`\r\n==, For path ${ggpath}:`);
    getter.file_path_exists(ggpath, function(err, yes){
        if(err){
            if(err)  p('getter file p e: ', ggpath, err);
            return setTimeout(function(){p('err, exit now'); process.exit();}, 5000);
        }
        //if(yes){
        //    if(yes) p('it exists, yes : ', ggpath, yes);
        //    return setTimeout(function(){p('yes, exists, exit now'); process.exit();}, 5000);
        //}

        var Home, GG;
        dirmd.retrieve_folder(user_id).then(function(home) {
            Home = home;
            p('got folder home, ', Home.get_meta().path);
            return build_gg_folder(Home);
        }).then(function(gg){
            GG = gg;
            p('-- gg got? ', typeof gg,  u.keys(gg).sort().join("  "));
            if(GG.get_meta){
                var mgg = GG.get_meta();
            }else{
                p("!! -- why no got GG, mgg ...");
            }

            return setTimeout(function(){
                if(mgg) p('gg meta path, pathuuid', mgg.path, mgg.pathuuid);
                process.exit();
            }, 5000);
        }).catch(function(whaterr){
            p('you caught what err: ', whaterr);
        });
    });
}




if(require.main === module){
    //c_get_all_user_ids_and_build_tasks_for_it();
    //check_all_muji();
    //check_abc_gg();
    check_all_gg();
}
