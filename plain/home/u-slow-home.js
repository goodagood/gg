
var u = require("underscore");

var sh = require("./slow-home.js");
var user = require("../users/a.js");
var folder_module = require("../aws/folder-v5.js");

var rf = require("./root-folder.js");
var retriever = require("../folder/retriever.js");

var p = console.log;


/*
 * This is for real
 * 2015 1108
 */
function test_get_user_info_for_intro(){
    var ui = {
        username: 'intro',
        password: 'kkkooo',
    };

    sh.take_in_user_info(ui, function(err, rep){
        if(err) p('247am err: ', err);

        p('rep should be user hash:');
        p(rep);
        process.exit();
    });
}


function get_user(name){
    name = name || 'intro';

    user.find_by_user_name(name, function(err, info){
        p(info);
        process.exit();
    });
}


/*
 * This is somehow when the user has been put into redis.
 * 2015 1128
 */
function build(name){
    name = name || 'intro';

    user.find_by_user_name(name, function(err, info){
        if(err) return process.exit(p('find by user name err: ', err));
        p(info);

        sh.init_user_home(info, function(err, folder){
            if(err) return process.exit(p('init user home    err: ', err));

            p('folder? ');
            p(u.keys(folder).sort().join("  \t  "));
            process.exit();
        });
    });
}


/*
 *
 */
function c_add_gg(cwd){
    cwd = cwd || 'intro';

    folder_module.retrieve_folder(cwd).then(function(folder){
        //p(u.keys(folder).sort().join("   \t   "));
        return sh.add_gg(folder);
    }).then(function(home){
        p('.gg should be added');
        process.exit();
    }).catch(function(e){
        p('catch: ', e);
        process.exit();
    });
}


/*
 * To check and used when we need add a new user. 
 * 2015 1128
 */
function add_one_user(info){
    info = info || {
        username: 'jobs',
        password: 'kkkooo',
        referrer: 'andrew'
    };

    sh.new_home(info, function(err, what){
        if(err) return process.exit(p('add one user err: ', err));

        p('what? ');
        p(u.keys(what).sort().join("  \t  "));
        process.exit();
    });
}




// ** to drop into repl
var o = {};

function drop(name){
    name = name || 'intro';

    user.find_by_user_name(name, function(err, info){
        if(err) return p('find by user name err: ', err, o.e1 = err);
        o.ui = info;
        p('info, 1128 8:32am');
        p(info);

        // should not init two times!
        //var name_validate = require("../users/validate-name.js");
        //name_validate.user_name_could_be_used_as_id(info.username, function(err, yes){})
        folder_module.is_folder_exists(info.id, function(err, yes){
            if(err) p('got err when check "is folder exists" for the id, ', info.id, err)
            if(yes){
                p('return, we got ', yes)
                return;
            }
            p('the home folder of user "', info.username,  '" exists: ', yes);
            if(err && !yes){
                p('going to do the root folder:');
                rf.make_root(info, function(err, root){
                    if(err) return p('init user home err: ', err, o.e2 = err);

                    o.root = root;
                    p('it shoul populated');
                    p( "ok start interact:");
                });
            }
        });

    });
}


function init_root_1(ui, callback){
    // @ui: user information
    rf.make_root(ui, function(err, root){
        if(err) return p('init user home err: ', err, o.e2 = err);

        o.root = root;
        p('it shoul populated');
        p( "ok start interact:");
    });
}


function retrieve_a(folder_name, callback){
    folder_name = folder_name ||      'jobs';

    retriever.retrieve_folder(folder_name).then(function(folder){
        p('a, got folder, ', folder.get_meta().path);
        callback(null, folder);
        //p(folder);
    }).catch(function(err){
        p('a, ', err);
        callback(err);
    });
}


function folder_exists(fpath){
    folder_module.is_folder_exists(fpath, function(err, yes){
        if(err){
            p('got err when check "is folder exists" for the path, ', fpath, err);
            return;
        }
        if(yes){
            p('return, we got ', yes)
        return;
        }
        p('the folder "',  '" exists: ', yes);
        if(err && !yes){
            p('not err, and not yes');
        }
        process.exit();
    });
}

function drop_home(name){
    name = name || 'jobs';

    user.find_by_user_name(name, function(err, info){
        if(err) return p('in check home, find by user name err: ', err, o.e1 = err);
        o.ui = info;
        p('info, 1128 8:32am');
        p(info);

        p('going to retrieve a        :');
        retrieve_a(info.id, function(err, root){
            if(err) return p('drop home err: ', err, o.e2 = err);

            o.root = root;
            o.meta = root.get_meta();
            p('it shoul got root');
            p( "ok start interact:");
            //process.exit(p( "ok start interact:"));
        });

    });
}


//drop('jobs'); 
//drop_home('cat-03');
//p( "ok start interact:");

if(require.main === module){
    //test_get_user_info_for_intro();
    //get_user();

    //build('jobs');
    //c_add_gg();

    //add_one_user();
    //
    folder_exists('cat-03');
    //process.exit(p('ok?, 0836am'));
}

