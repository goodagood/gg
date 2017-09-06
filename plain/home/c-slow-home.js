/*
 * copy from u-slow-home.js, but to do checking instead to drop into REPL
 * 2015 1205
 */


var sh = require("./slow-home.js");
var user = require("../users/a.js");
var folder_module = require("../aws/folder-v5.js");

var rf = require("./root-folder.js");

var u = require("underscore");

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
function build_for_user(name){
    name = name || 'intro';

    user.find_by_user_name(name, function(err, info){
        if(err) return process.exit(p('find by user name err: ', err));
        p('build, after find by username ');
        p(info);

        sh.init_user_home(info, function(err, folder){
            if(err) return process.exit(p('build, init user home    err: ', err));

            p('build, after init user ... folder? ');
            //p(u.keys(folder).sort().join("  \t  "));
            p(folder.get_meta().uuid);
            setTimeout(process.exit, 33000);
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
    //info = info || {
    //    username: 'cat-03',
    //    password: 'kkkooo',
    //    referrer: 'andrew'
    //};

    sh.new_home(info, function(err, what){
        if(err) return process.exit(p('Err, for ', info, 'add one user err: ', err));

        //p(u.keys(what).sort().join("  \t  "));
        p('have we got enough folder functions: ', u.keys(what).length);
        setTimeout(process.exit, 33000);
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


// ** to drop into repl
var o = {};

function c_drop(name){
    name = name || 'jobs';

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
                //init_root_1(info, function(err, root){})
                retrieve_a(info.path, function(err, root){
                    if(err) return p('init user home err: ', err, o.e2 = err);

                    o.root = root;
                    p('it shoul got root');
                    process.exit(p( "ok start interact:"));
                });
            }
        });

    });
}


var add = require("./add.js");

function init_root_1(ui, callback){
    // @ui: user information
    rf.make_root(ui, function(err, root){
        if(err) return callback(err, p('rf.make root err: ', err, o.e2 = err));

        var meta = root.get_meta();

        p( "ok 11:40am  meta:"); p(meta);
        root.write_meta(callback);

        //add sub: public...

        //callback(null, root);
    });
}


var retriever = require("../folder/retriever.js");

function retrieve_one(root_name){
    root_name = root_name ||      'jobs';

    retriever.retrieve_folder(root_name).then(function(folder){
        p('got folder, ', folder.get_meta().path);
        //p(folder);
        //sh.add_sub_folders(folder);
        process.exit(p('retre. folder '));
    }).catch(function(err){
        p(err);
        process.exit( p('you are in catch err:'));
    });
}


function check_home(name){
    name = name || 'jobs';

    user.find_by_user_name(name, function(err, info){
        if(err) return p('in check home, find by user name err: ', err, o.e1 = err);
        o.ui = info;
        p('info, 1128 8:32am');
        p(info);

        p('going to retrieve a        :');
        retrieve_a(info.path, function(err, root){
            if(err) return p('init user home err: ', err, o.e2 = err);

            o.root = root;
            sh.add_sub_folders(root).then(function(root){
                p('it shoul add subs');
                //process.exit(p( "ok start interact:"));
            }).then(function(){
                return sh.add_gg(root);
            }).then(function(){
                p('you got gg?');
            }).catch(function(err){
                p('catch: ', err);
                process.exit(p( "ok start interact:"));
            });
        });

    });
}

//p( "ok start interact:");

if(require.main === module){
    //c_drop('jobs');
    //retrieve_one();
    //check_home('jobs');

    add_one_user({username:'cat-07', password:'kkkooo', referrer:'andrew'});
    //build_for_user('cat-04');

    //process.exit(p('ok?, 0836am'));
}


