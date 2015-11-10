
var sh = require("./slow-home.js");
var user = require("../users/a.js");
var folder_module = require("../aws/folder-v5.js");

var u = require("underscore");
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
    })
    .then(function(home){
        p('.gg should be added');
        process.exit();
    })
    .catch(function(e){
        p('catch: ', e);
        process.exit();
    });;
}


if(require.main === module){
    //test_get_user_info_for_intro();
    //get_user();

    //build();
    c_add_gg();
}


// ** to drop into repl
var o = {};

function drop(name){
    name = name || 'intro';

    user.find_by_user_name(name, function(err, info){
        if(err) return p('find by user name err: ', err, o.e1 = err);
        o.ui = info;
        p('info, 1108');
        p(info);

        sh.init_user_home(info, function(err, folder){
            if(err) return p('init user home err: ', err, o.e2 = err);

            o.folder = folder;
            p('it shoul populated');
        });
    });
}


//drop(); p( "ok start interact:");
