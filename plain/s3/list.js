
var u = require("underscore");

var folder = require("./folder.js");

var p = console.log;



// for owner during dev.
function list_y6m03(folder_path, callback){
    if(!u.isString(folder_path)) return callback('please give valid folder path');

    folder.retrieve_folder(folder_path, function(err, folder_obj){
        if(err){
            p('retrieve folder err 0318y6 e: ', err);
            return callback(err);
        }

        var meta = folder_obj.get_meta();

        if(meta.cache['folder-renders'].html.owner) return callback(null, meta.cache['folder-renders'].html.owner);

        callback('no html render for owner found');
    });
}
module.exports.list_y6m03 = list_y6m03;






var chain = require("../cwd-chain/cwd-chain.js");
var asker = require("plain/asker/tasks.js");


/*
 * This give webpage
 */
function ls_for_user(name, folder_path, callback){
    if(!u.isString(name)) return callback('please give valid user name');
    if(!u.isString(folder_path)) return callback('please give valid folder path');

    // ul is the file list in shape of <ul> tag
    // doing ...
    asker.folder_ul(name, folder_path, function(err, ul){
        var path_chain = chain.cwd_chain(folder_path, '/ls');

        var context = {ls_as_ul: ul, username: name, cwd: path_chain, title: `ls ${folder_path}`};

        render_webpage('./tpl/ls.html', context, callback);
        //return callback(null, ul); //indev

    });
}
module.exports.ls_for_user = ls_for_user;


var path = require("path");
var tpl = require("../myutils/tpl.js");
/*
 * @tpl_file_path is relative path.
 */
function render_webpage(tpl_file_path, context, callback){
    var abs_path = path.join(__dirname, tpl_file_path);
    //p('abs path: ', abs_path);    

    tpl.render_template(abs_path, context, callback);
    //callback(null, null);
}



/*
 * Permission is checked for listing.
 * This give webpage
 */
var ask_list = require("plain/asker/folder.list.js");
function folder_list_with_permission(name, folder_path, callback){
    if(!u.isString(name)) return callback('please give valid user name');
    if(!u.isString(folder_path)) return callback('please give valid folder path');

    // ul is the file list in shape of <ul> tag
    // doing ...
    ask_list.folder_list(name, folder_path, function(err, ajson){
        var path_chain = chain.cwd_chain(folder_path, '/ls');

        if(typeof(ajson.html) === 'string') return callback(null, ajson.html);

        p('here? 0603 0918am');
        var context = {ls_as_ul: ajson, username: name, cwd: path_chain, title: 'I am testing'};

        render_webpage('./tpl/ls.html', context, callback);
        //return callback(null, ajson); //indev

    });
}
module.exports.folder_list_with_permission = folder_list_with_permission;


//var lh5 = require("plain/asker/lh5.js");
var lh5 = require("plain/asker/client.0707.y6.js");
function list_file_metas(username, folder_path, callback){
    if(!u.isString(username)) return callback('please give valid user name');
    if(!u.isString(folder_path)) return callback('please give valid folder path');

    lh5.ask({
            "who": username,
            //"ask-for": 'ls_meta',
            "ask4": 'ls_meta',
            "path": folder_path,
            "timeout": 3000
        }, function(err, results){
            if(err) return callback(err);

            // results.input will be the input: '{who:...}'
            return callback(null, results.output);
        });

}
module.exports.list_file_metas = list_file_metas;



if(require.main === module){
    var p = console.log;

    function c_render(){
        render_webpage('./tpl/ls.html', {}, function(err, what){
            p('we are testing webpage, ', err, what);
            setTimeout(process.exit, 2*1000);
        });
    }
    //c_render();

    function c_webpage(name, folder_path){
        folder_path = folder_path || "t0310y6";
        name = name || 't0310y6';

        p('go to ls for user');
        ls_for_user(name, folder_path, function(err, html){
            p('c ls for user webpage, ', err, html);
            setTimeout(process.exit, 5*1000);
        });
    }
    //c_webpage();


    function c_list_y6m03(folder_path){
        folder_path = folder_path || "t0310y6";

        list_y6m03(folder_path, function(err, html){
            if(err) return p('c list y6m03 e: ', err);
            p(html);


            setTimeout(process.exit, 2*1000);
        });
    }
    //c_list_y6m03();

    setTimeout(process.exit, 22000);
}
