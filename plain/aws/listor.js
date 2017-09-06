
/*
 * An 'listor' list files in a folder, there can be many listor for one
 * folder, folder should be able to set it listor: default, for owner, or 
 * for viewer, for artists.
 */

// listor options:
// {
//   default: 'listor name',
//   ??
// }

var fs = require("fs");
var path = require("path");
var handlebars = require("handlebars");

var folder_module = require("./folder-v5.js");
var lsimg = require('../hrouters/ls-img.js');

var carousel = require('../hrouters/ls-carousel.js');
var index_file = require("./index-file.js");

var user_module = require("../users/a.js");

var p = console.log;

function get_listor(listor_name){

    // selector name:
    p('listor name: ', listor_name);
    switch (listor_name){
        case 'img-value':
            p('get listor: img-value');
            return list_img;
            break;
        case 'carousel-a':
            // give art listing
            return carousel.ls_carousel_a;
            break;
        case 'user-index':
            // folder has it own index.html file?
            return index_file.read_folder_index_file_to_string;
            break;
        default:
            // give default listing
            p('get listor: default');
            return list_folder;
    }
}


var list_img = lsimg.list_img;


/*
 * List the folder by reading folder's setting: meta.listor
 * If no setting found, it will get default listing.
 */
function list_folder_by_setting(params, callback){
    user_name = params.username;
    folder_path = params.cwd;

    folder_module.retrieve_folder_meta(folder_path).then(function(meta){

        var default_listor_name;
        if(typeof meta.listor !== 'undefined'){
            if(typeof meta.listor['default'] !== 'undefined'){
                var default_listor_name = meta.listor['default'];
            }
        }
        p('default listor name ', default_listor_name);

        // 'get listor' will give default listor if name is null or unknown.
        var function_to_do_listing = get_listor(default_listor_name);

        function_to_do_listing(params, function(err, html){
            if(err) return callback(err, null);

            //p('got list: ', err, html);
            //p('got list: ', err, html.slice(0, 200));
            return callback(null, html);
        });

    }).catch(function(err){
        callback(err, null);
    });
}


// am i using this?
function get_folder_listor(folder_path, callback){
    var listor_type;
    folder_module.retrieve_folder_meta(folder_path).then(function(meta){
        if(typeof meta.listor === 'undefined'){
            listor_type = 'default';
            //return callback(null, 'default');
        }else{
            var lopt = meta.listor;
            var listor_type = lopt['default'];
        }

        var fun_do_list = get_listor(listor_type);
        callback(null, fun_do_list);
    });
}




/*
 * This is going to be default/anyway listor for any folder, of course better
 * to check membership before this function.
 *
 * not necessary to give an empty wrapper? 0625
 */
var ls_anyway = require('../hrouters/ls-anyway.js');
function list_folder(params, callback){
    p('in "list folder"');
    ls_anyway.list_folder_anyway(params, callback);
}


/*
 * Interface to the temperory solution, it MUST give a folder list.
 */
function temporary_list(username, cwd, callback){
    var params = {
        username: username,
        cwd: cwd,
    };
    list_folder(params, callback);
}


/*
 * The interface going to use for all
 */
function interface_listor(username, cwd, callback){
    //if(!cwd) cwd = '';  // get ls should do this
    var params = {
        username: username,
        cwd: cwd,
    };
    list_folder_by_setting(params, callback);
}

//module.exports.list = list_img; //d?
module.exports.get_listor = get_listor;
module.exports.list_folder_by_setting = list_folder_by_setting;
module.exports.list_folder = list_folder;

module.exports.get_folder_listor = get_folder_listor;

module.exports.temporary_list = temporary_list;

module.exports.interface_listor = interface_listor;


