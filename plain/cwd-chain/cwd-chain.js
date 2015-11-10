/*
 * Build the html tag pieces for cwd.
 * 2015, 0527
 *
 * Data structure:
 * [
 *   {
 *     name:  'one'
 *     path:  '55/sub/one'
 *     tag:
 *     icon:
 *     is_root: 1/0
 *     owner:
 *   }...
 * ]
 */

var path = require('path');
var fs   = require('fs');
var async= require('async');

var p    = console.log;


/*
 * Modified: 2015 0922
 */
function cwd_chain(path_string, prefix){
    // make links for path, a/b/c => [a](href_link)/[b](href_link)/[c](href_link)/

    if (typeof path_string !== 'string') return null;

    var parts = path_string.split('/');
    var names = parts.filter(function(e){return e !== '';}); //no empty ''
    //  names should be: [a, b, c]

    var pathes = [];
    var tmp = '';
    for (var i = 0; i < names.length; i++){
        tmp = path.join(tmp, names[i]);
        pathes.push(tmp);
    }
    // Now pathes should be: [a, a/b, a/b/c]
    //p('pathes'); p(pathes); 

    var chain = "\n";
    var one_path = '';
    for (var j = 0; j < pathes.length; j++){
      one_path = path.join(prefix, pathes[j]);
      chain = chain + '<a class="path_part folder_link cwd_part" href="' + one_path + '"> ' + names[j] + ' </a>/';
      chain+= "\n"
    }
    return chain;
}


function make_cwd_chain(path_string, callback){
    if (typeof path_string !== 'string') return callback('path must be string');

    var parts = path_string.split('/');
    var names = parts.filter(function(e){return e !== '';}); //no empty ''

    var all_path = [];
    var tmp = '';
    for (var i = 0; i < names.length; i++){
        tmp = path.join(tmp, names[i]);
        all_path.push(tmp);
    }
    //p(all_path);


    var tags = "\n";
    make_root_dir_tag(all_path[0], function(err, tag0){

        async.map(all_path.slice(1), make_dir_tag, function(err, tags){
            if(err) return callback(err, null);

            var html = tag0 + "\n" + tags.join("\n");
            callback(null, html);
        });
    });
}


/*
 * <span class="cwd path root-dir">
 *   <span class="icon">cwd icon</span>
 *   <span>
 *     <a href="ls the root dir">
 *       user name
 *     </a>
 *   </span>
 * </span>
 */
var user_icon = require("../users/user-icon.js");
//var user_module   = require("../users/a.js");

function make_root_dir_tag(id, callback){

    user_icon.find_username_from_id(id, function(err, username){
        if(err) return callback(err, null);

        read_in_template('home-dir-tpl.html', function(err, tpl){
            if(err) return callback(err, null);

            var data = {
                cwd : id,
                username: username,
                ls_root_href: path.join('/ls', id),
                root_or_user_icon: src_of_root_or_user_icon(id, 32, 32),
            };

            try_template(tpl, data, callback);
        });
    });
}


function make_dir_tag(dir, callback){
        var folder_name = path.basename(dir);

        read_in_template('dir-tpl.html', function(err, tpl){
            if(err) return callback(err, null);

            var data = {
                folder_path : dir,
                folder_name : folder_name,
                ls_folder_href: path.join('/ls', dir),
                folder_icon_src: src_folder_icon(dir, 32, 32),
            };

            try_template(tpl, data, callback);
        });
}


function src_of_root_or_user_icon(id, w, h){
    var url = '/test/find-root-or-user-icon';
    var data= {
        root_id: id,
        w:w,
        h:h,
    };
    var qs = encode_query_string(data);

    var src = url + '?' + qs;
    return src;
}

function src_folder_icon(dir, w, h){
    var url = '/test/find-folder-icon';
    var data= {
        dir: dir,
        w:w,
        h:h,
    };
    var qs = encode_query_string(data);

    var src = url + '?' + qs;
    return src;
}


function encode_query_string(data)
{
    var ret = [];
    for (var d in data)
        ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return ret.join("&");
}


// templates

function read_in_template (tpl_file_name, callback) {
    var abs_name = path.join(__dirname, tpl_file_name);
    //p('file path: ', abs_name);
    return fs.readFile(abs_name, {encoding:'utf-8'}, function(err, str) {
        if (err) {
            return callback(err, str);
        }

        //p('folder template string: ', err, str);

        var template;
        try {
            template = u.template(str);
        } catch (_error) {
            err = _error;
            return callback(err, null);
        }
        callback(null, template);
    });
};


//d
function render_template (callback) {
    var data, template;
    data = make_template_data();
    if ((_meta_.html != null) && (_meta_.html.template != null)) {
        template = _meta_.html.template;
        return try_template(template, data, callback);
    }
    return read_in_template(function(err, template) {
        data = get_client_json();
        return try_template(template, data, callback);
    });
};


function try_template (template, data, callback) {
    var html;
    try {
        html = template(data);
        return callback(null, html);
    } catch (_error) {
        return callback(_error, null);
    }
}


exports.make_cwd_chain = module.exports.make_cwd_chain = make_cwd_chain;
exports.callback_cwd_chain = module.exports.callback_cwd_chain = make_cwd_chain;

exports.cwd_chain = module.exports.cwd_chain = cwd_chain;


//-- checkings --//


function chk_mk(){
    //var path_str = '47/vid/test';
    var path_str = '47/vid';
    make_cwd_chain(path_str, function(err, what){
        p(err, what);
        stop();
    });
}


function stop(period) {
    var milli_seconds;
    period = period || 1;
    if (!u.isNumber(period)) {
        period = 1;
    }
    milli_seconds = period * 1000;
    return setTimeout(process.exit, milli_seconds);
}


function chk_make_root_tag(){
    var root_dir_name = '47';
    make_root_dir_tag(root_dir_name, function(err, what){
        p(Date.now(), err, what);
        stop();
    });
}


function check_return_cwd_chain(){
    var cwd = 'a/b/c/d/e/f/';
    var chain = cwd_chain(cwd, '/ls');
    p('chain: '); p(chain);

    process.exit();
}


if (require.main === module){
    //chk_mk();    
    //chk_make_root_tag();

    check_return_cwd_chain();
}


