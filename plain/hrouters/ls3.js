
// 
// Try to give file listing good style, valued file listing.
// Now, it's not upgrade from 'file-list-v2.js', but a try to
// work on different ways.
//
// 2015 0211; 2015 0428;
//

var htool,
    ls_for_owner, ls_for_public, 
    mytemplate, myuser, myutil,
    path, path_chain, test_clone_default_folder_file,
    test_make_cwd_chain, tv, u, util;

var util  = require("util");
var path  = require("path");
var async = require("async");
var u     = require("underscore");
var fs    = require("fs");

var markdown = require("markdown").markdown;
var cel = require("connect-ensure-login");

var myuser = require("../myuser.js");

var myutil = require("../myutils/myutil.js");
var myconfig =   require("../config/config.js");
var bucket = require("../aws/bucket.js");


var folder_module = require("../aws/folder-v5.js");
var mytemplate = require("../myutils/template.js");
var css_file = require("../aws/css-file.js");
var htool = require("./html-tools.js");


var p    = console.log;
var stop = function(){setTimeout(process.exit, 500);};


// ../aws/folder-template.html
var Template_file_path = path.join(path.dirname(__dirname), 'aws', 'folder-template.html');
//p(path.dirname(__dirname), 'template fir: ', Template_file_path);

//var Ls3_template = path.join(__dirname, 'templates', 'ls3-basic.html');

// get small parts used in file list page
function get_parts(folder, parts, callback){
    // @folder: folder object
    // @parts:  already gatherred parts

    parts = parts || {};
    var meta = folder.get_meta();
    p('in get parts, meta path: ', meta.path);
    var cwd  = meta.path;

    parts['cwd'] = cwd;
    parts['cwd_chain'] = myutil.path_chain(cwd, "/ls/");

    // a static css file for fast dev., the <link> will be in html frame(-c).
    parts['css'] = '<link rel="stylesheet" href="/static/css/css212.css">';
    css_file.read_css_file_of_folder(cwd).then(function(css_as_string) {
        p('css as string in get parts:\n', css_as_string);
        parts['folder_css'] = css_as_string;

        callback(null, parts);

    });

}


// @cwd : the path of the current folder, it actually contains owner name:
//        owner-name/path/to/folder
//        Plan to change the 'owner-name' to 'user-id', to avoid strange name
// @username : who is asking for the file listing.
// @callback : will get: (err, <ul> element of file list, and parts)
function assemble_file_list(username, cwd, callback) {
    return folder_module.retrieve_folder(cwd).then(function(folder) {
        if (!folder) {
            return callback("? no folder object for: " + cwd);
        }

        var parts = {username: username};
        get_ul_of_files(username, folder, function(err, ul_html){
            parts['ul_of_file_list'] = ul_html;

            get_parts(folder, parts, function(err, parts_){
                //u.defaults(parts, parts_);

                p ('ls211 not crash? assemble file list: go to assemble html 3');
                assemble_html_3(parts, function(err, html) {
                    p('after assemble html 3, err, html', err, html);
                    callback(null, html, parts);
                });
            });
        });
    });
};


function get_ul_of_files(username, folder, callback){
        var html = '';
        folder.get_member_manager().then(function(mmanager){
            //p ('member manager:\n', mmanager);

            mmanager.check_user_role(username, function(err, role){
                p ('in get ul of files, role: ', role);
                return render_file_list(folder, role, callback);
            });
        }).catch(function(err){
            callback(err, null);
        });
}

function list_files_for_owner(folder) {
    // @folder is object

    var meta = folder.get_meta();
    var ul = '<ul class="folder-list list-unstyled list-for-member" data-cwd="' + meta.path + '>';
    ul += make_owner_li_tags(folder);
    ul += "</ul>";
    return ul;
};

function make_owner_li_tags(folder) {
    // @folder is object

    var meta = folder.get_meta();

    var lis = ""; //file as li tag
    u.each(meta.files, function(file) {
        if (file.html != null) {
            if (file.html.li != null) {
                if (file.name.indexOf(".gg") !== 0) {
                    return lis += file.html.li;
                }
            }
        }
    });
    lis += "\n";
    return lis;
};


function make_owner_sorted_li_tags(folder) {
    // @folder is object

    var meta = folder.get_meta();
    var lis = ""; //file as li tags

    var files = u.values(meta.files);
    var sorted_files = u.sortBy(files, function(file_meta){
        if(!file_meta.timestamp) return 0;

        return 1 - file_meta.timestamp;
    });

    u.each(sorted_files, function(file) {
        if (file.html != null) {
            if (file.html.li != null) {
                if (file.name.indexOf(".gg") !== 0) {
                    return lis += file.html.li;
                }
            }
        }
    });
    lis += "\n";
    return lis;
};

function list_files_for_viewer(folder) {
    // @folder is object

    var ul = '<ul class="folder-list list-unstyled for-viewer" data-cwd="' + meta.path + '>\n';
    var list = make_viewer_li_tags(folder);
    ul += list + "</ul>";
    return ul;
};

function make_viewer_li_tags(folder){
    var meta = folder.get_meta();
    var lis = '';
    u.each(meta.files, function(file) {
        if (file.html != null) {
            if (file.html.li_viewer != null) {
                if (file.name.indexOf(".gg") !== 0) {
                    lis += file.html.li_viewer;
                }
            }
        }
    });
    return lis + '\n';
}

function list_files_for_public(folder) {
    // @folder is object

    var ul = '<ul class="folder-list list-unstyled for-public" data-cwd="' + meta.path + '>\n';
    ul += make_public_li_tags(folder) + "</ul>";
    return ul;
};

function make_public_li_tags(folder){
    var meta = folder.get_meta();
    var lis = '';
    u.each(meta.files, function(file) {
        if (file.html != null) {
            if (file.html.li_public != null) {
                if (file.name.indexOf(".gg") !== 0) {
                    lis += file.html.li_public;
                }
            }
        }
    });
    return lis + '\n';
}

function make_ul_for_user(username, folder_path, callback){
}

function assemble_html_3(parts, callback) {
    //(username, ul_file_list, cwd, cwd_chain, current_people, in_file_css, callback)

    var contexts, html_files;

    contexts = {
        body: {
            user_folder_ul: 'ul?',
            cwd: 'cwd?',
            cwd_chain: 'cwd_chain?',
            current_people: 'current people?' //d
        },
        header: {
            username: 'username-who?'
        },
        frame: {
            in_file_css: '/*css?*/'
        },
        script: {cwd: ''}
    };

    if(parts['ul_of_file_list']) contexts.body['user_folder_ul'] = parts['ul_of_file_list'];
    if(parts['cwd'])             contexts.body['cwd'] = parts['cwd'];
    if(parts['cwd'])             contexts.script['cwd'] = parts['cwd'];
    if(parts['cwd_chain'])       contexts.body['cwd_chain'] = parts['cwd_chain'];
    if(parts['username'])        contexts.header['username'] = parts['username'];
    if(parts['in_file_css'])     contexts.frame['folder_css'] = parts['in_file_css'];
    if(parts['css'])             contexts.frame['css'] = parts['css'];

    html_files = {
        body    : "ls3.html",
        header  : "ls2header.html",
        navbar  : "ls2nav.html",
        script  : "ls3-script.html",
        frame   : "ls3-frame.html",
        template: "ls3-template.html"
    };
    return mytemplate.assemble_html_v2(html_files, contexts).then(function(html) {
        return callback(null, html);
    });
};


//d
function get_file_list(folder, options){
    //@folder : object ready to use.
    //@options: 
    //  { 
    //    dot : default false to include dot files, '.gg.*' never.
    //    pattern : pattern for file names, regexp.
    //    metas   : [ name[, uuid[, size... ]]]
    //              array of names of file info attributes, such as:
    //              name, uuid, ...
    //              if this array appears not empty, only these 
    //              attribute will be offerred.
    //  }

    var meta = folder.get_meta();
    var files= meta.files;
}


// template renderrring

function read_in_template(file_path, callback) {
    file_path = file_path || Template_file_path;

    return fs.readFile(Template_file_path, function(err, buf) {
        if (err) {
            return callback(err, buf);
        }
        var str = buf.toString();
        //p('folder template string: ', err, str);

        callback(null, str);
    });
}

function make_template_data  (folder) {
    // folder: object
    var meta = folder.get_meta();
    var d = {};
    d.folder_path = meta.path;
    d.file_list   = make_owner_li_tags(folder);
    return d;
}

function render_file_list_template(template_file_path, data, callback) {
    // render folder file list, according to the template file.
    // @template_file_path: where to get template file, default to Template_file_path.
    // @data:               file list string, <li> tags.  It will be different
    //                      for users.
    // @callback:           (err, html-string)

    template_file_path = template_file_path || Template_file_path;

    var template;
    read_in_template(template_file_path, function(err, str){
        if(err) return callback(err, null);
        //p('read the template file string:', str);

        // make underscore template function:
        try {
            template = u.template(str);
        } catch (_error) {
            p('in "render file list template", caught err:', _error);
            template = null;
            return callback(_error, null);
        }

        //p(template);
        if(!template) return callback(null, null);

        p('trying to feed data');
        try_template(template, data, callback);
    });
}


function try_template  (template, data, callback) {
    // @template: prepared underscore template function.
    // @data:     hash of data for template.
    // @callback: (err, html), renderred html string.

    var err, html;
    try {
        html = template(data);
        return callback(null, html);
    } catch (_error) {
        err = _error;
        return callback(err, null);
    }
}


function make_file_list_data(folder, user_role){
    // make <li> tags of files, without <ul> tag.
    // @folder: object
    // @user_role: 'owner', member, viewer, 

    var meta = folder.get_meta();
    var d = {};
    d.folder_path = meta.path;
    d.user_role   = user_role;

    switch(user_role){
        case "owner":
        case "member":
            d.file_list   = make_owner_li_tags(folder);
            break;
        case "viewer":
            d.file_list   = make_viewer_li_tags(folder);
            break;
        default:
            d.file_list   = make_public_li_tags(folder);
            break;
    }
    return d;
}

function render_file_list(folder, user_role, callback){
    var data = make_file_list_data(folder, user_role);
    render_file_list_template(Template_file_path, data, callback);
}

//function render_file_list_for_owner(folder, callback){
//    var data = make_file_list_data_for_owner(folder);
//    render_file_list_template(Template_file_path, data, callback);
//}
//
//function render_file_list_for_viewer(folder, callback){
//    var data = make_file_list_data_for_viewer(folder);
//    render_file_list_template(Template_file_path, data, callback);
//}
//
//function render_file_list_for_public(folder, callback){
//    var data = make_file_list_data_for_public(folder);
//    render_file_list_template(Template_file_path, data, callback);
//}

module.exports.assemble_file_list = assemble_file_list;

module.exports.make_owner_sorted_li_tags = make_owner_sorted_li_tags;

// fast checkings //

check_0211a = function() {
    var name, path_;
    name = 'abc';
    path_ = 'abc';
    assemble_file_list(name, path_, function(err, what) {
        //return console.log(err, html.slice(0, 100));
        console.log(err, what);
        stop();
    });
};


function check_template(){
    read_in_template(Template_file_path, function(err, str){
        p(err, 'template file: ', str);
        stop();
    });
}


//d
function check_render_folder_template(cwd) {
    cwd = cwd || 'abc/imgvid';

    folder_module.retrieve_folder(cwd).then(function(folder) {
        if (!folder) {
            return callback("? no folder object for: " + cwd);
        }

        //p(u.keys(make_template_data(folder)));
        var data = make_template_data(folder);
        render_file_list_template(Template_file_path, data, function(err, what){
            p('after render forlder template: (err, what)\n', err, what);
            stop();
        });
    });
}

function check_render_file_list(cwd,  user_name) {
    cwd       = cwd || 'abc/imgvid';
    user_name = user_name || 'abc';

    folder_module.retrieve_folder(cwd).then(function(folder) {
        if (!folder) {
            return callback("? in 'check render file list', no folder object for: " + cwd);
        }

        var data = make_file_list_data(folder, 'who-known');
        p('the data has keys: ', u.keys(data));
        render_file_list_template(Template_file_path, data, function(err, html_str){
            p('after render forlder template: (err, what)\n', err, html_str.substr(0,100));
            stop();
        });
    });
}


function check_sorted(cwd) {
    cwd = cwd || 'abc/imgvid';

    folder_module.retrieve_folder(cwd).then(function(folder) {
        if (!folder) {
            return console.log("? no folder object for: " + cwd);
        }

        var sorted = make_owner_sorted_li_tags(folder);
        p(sorted);
        stop();
    });
}


if (require.main === module) {
    //check_0211a();

    //check_template();
    //check_render_folder_template();
    //check_render_file_list();
    check_sorted();
}

