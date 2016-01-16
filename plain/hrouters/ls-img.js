
// 
// Try to give file listing good style, valued file listing.
// Now, it's not upgrade from 'file-list-v2.js', but a try to
// work on different ways.
// 0211
//

var 
    cel, 
    deliver, htool,
    ls_for_owner, ls_for_public, 
    mytemplate, myuser, myutil,
    path_chain, people, social, test_clone_default_folder_file,
    test_make_cwd_chain, tv;

var util  = require("util");
var path  = require("path");
var async = require("async");
var u     = require("underscore");
var fs    = require("fs");

var handlebars = require("handlebars");

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

//deliver = require("../aws/file-deliver.js");
//social = require("../aws/social.js");
//log28 = require("../myutils/mylogb.js").double_log("/tmp/log28");
//people = require("../users/people.js");


var p    = console.log;
var stop = function(){setTimeout(process.exit, 500);};


var Template_file_path = path.join(path.dirname(__dirname), 'aws', 'folder-template.html');
//p(path.dirname(__dirname), 'template fir: ', Template_file_path);


// get small parts used in file list page
function get_parts(folder, parts, callback){
    // @folder: folder object
    // @parts:  already gatherred parts

    parts = parts || {};
    var meta = folder.get_meta();
    //p('in get parts, meta path: ', meta.path);
    var cwd  = meta.path;

    parts['cwd'] = cwd;
    parts['cwd_chain'] = myutil.path_chain(cwd, "/ls/");

    css_file.read_css_file_of_folder(cwd).then(function(css_as_string) {
        //p('css as string in get parts:\n', css_as_string);
        parts['folder_css'] = css_as_string;

        callback(null, parts);

    });

}


var client_filter = require("../aws/client-json-filter.js");

// @cwd : the path of the current folder, it actually contains owner name:
//        owner-name/path/to/folder
//        Plan to change the 'owner-name' to 'user-id', to avoid strange name
// @username : who is asking for the file listing.
// @callback : will get: (err, <ul> element of file list, and parts)
function make_ls_img_context(username, cwd, callback) {
    // parts will be the context, which contains parts gatherred for folder listing.

    var default_parts = {
        ul_of_file_list: '<ul>ul?</ul>',
        cwd:            'cwd?',
        cwd_chain:      'cwd_chain?',
        current_people: 'current people?', //d
        username:       'username-who?',
        css:            '',
        in_file_css:    '/*css?*/',
    };

    return folder_module.retrieve_folder(cwd).then(function(folder) {
        if (!folder) {
            return callback("? no folder object for: " + cwd);
        }
        var file_list_for_client = client_filter.get_file_list_json(folder);

        var parts = {username: username};
          //parts['serielized_file_list_data'] = JSON.stringify(file_list_for_client);
          //parts['css'] = '<link rel="stylesheet" href="/static/css/css212.css">';

        //get_ul_of_files    username, folder, function(err, ul_html)
        render_files_to_ul(username, folder, function(err, ul_html){
            parts['ul_of_file_list'] = ul_html;

            get_parts(folder, parts, function(err, parts){
                p ('ls img not crash? prepare context with parts:', parts);

                u.defaults(parts, default_parts);
                callback(null, parts);
            });
        });
    }).catch(function(err){
        callback(err, default_parts);
    });
};


function get_ul_of_files(username, folder, callback){
        var html = '';
        folder.get_member_manager().then(function(mmanager){
            //p ('member manager:\n', mmanager);

            mmanager.check_user_role(username, function(err, role){
                if(err) return callback(err, role);

                //p ('in get ul of files, role: ', role);
                return render_file_list(folder, role, callback);
            });
        }).catch(function(err){
            callback(err, null);
        });
}


// replace the above 'get ul of files', 2015 0726
var get_file_list = require("../aws/get-file-list.js");
var tpl = require("./ls-img-tpl.js");
function render_files_to_ul(username, folder, callback){
    var cwd = folder.get_meta().path;
    var context = {file_list:'', user_role:'', folder_path:cwd};

    p(1.1, 'cwd, context:', "\n", cwd,context);
    get_file_list.get_file_metas_for_some_one(username, cwd, function(err, metas){
        var lis = ""; //file as li tag
        if(!err){
            p('metas.length: ', metas.length);
            u.each(metas, function(file) {
                if (file.html != null) {
                    if (file.html.li != null) {
                        if (file.name.indexOf(".gg") !== 0) {
                            return lis += file.html.li;
                        }
                    }
                }
            });
            lis += "\n";
        }
        context.file_list = lis;
        p(2, lis.length);

        get_file_list.check_role(folder, username, function(err, role){
            p(3);
            if(!err){
                context.user_role = role;
            }
            tpl.render_file_list(context, callback);
        });
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

        //p('trying to feed data');
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


/* copy from 'aws/listor', better to put it here. */
/*
 * Try to list image folder with style.
 * @parameters : 
 *   { username:
 *     user: user json/object
 *     cwd: 'the folder path to list'
 *     id:  'user id, string'
 *   }
 */
function list_img (params, callback){
    username = params.username;
    folder_path = params.cwd;
    //p('username folder path: ', username, folder_path);

    var template_path = path.join(path.dirname(__dirname), "handlebars-views/ls-img.html");
    p('list img, temp path: ', template_path);
    var temp_text = fs.readFile(template_path, {encoding:'utf-8'}, function(err, tpl_text){
        if(err) return callback(err, null);

        var renderred = null;

        make_ls_img_context(username, folder_path, function(err, context){
            if(err) renderred = "<h1>some thing wrong in list img, in ls-img.js  </h1>";
            //p('context ok? ', context);

            try {
                var template = handlebars.compile(tpl_text);
                renderred= template(context);
            } catch (_error) {
                return callback(_error, null);
            }
            callback(null, renderred);
        });

    });

}


module.exports.make_ls_img_context = make_ls_img_context;

module.exports.list_img = list_img;


// fast checkings //


function check_template(){
    p('template file path: ', Template_file_path);
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


function chk_list_img(){
    var params = {
        username : 'abc',
        cwd : 'abc/imgvid',
    };
    list_img(params, function(err, html){
        p(err, html.slice(0, 200));
        stop();
    });
}

function chk_render_files_to_ul(){
    var cwd = 'abc/public';
    var username = 'kljkl';

    folder_module.retrieve_folder(cwd).then(function(folder){
        p('typeof folder.init: ', typeof folder.init);
        // doing
        render_files_to_ul(username, folder, function(err, ul){
            p('lll ', err, ul);
            stop();
        });
    });
}


if (require.main === module) {
    //check_template();
    //check_render_folder_template();
    //check_render_file_list();

    chk_list_img();

    //chk_render_files_to_ul();
}

