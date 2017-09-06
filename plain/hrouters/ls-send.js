
// 
// testing to include file sending, copy and modify from ls3.js
// 0219
//

var async,
    bucket, cel, check_list_style, check_path_username_agree, css_file,
    deliver, folder_module, htool, isBlank, isEmpty, list, 
    ls_for_owner, ls_for_public, 
    markdown, meta, myconfig, mytemplate, myuser, myutil,
    path, path_chain, people, social, test_clone_default_folder_file,
    test_make_cwd_chain, tv, u, util;

var util  = require("util");
var path  = require("path");
var async = require("async");
var u     = require("underscore");

var markdown = require("markdown").markdown;
var cel = require("connect-ensure-login");

var myuser = require("../myuser.js");

var myutil = require("../myutils/myutil.js");
var myconfig =   require("../config/config.js");
var bucket = require("../aws/bucket.js");

//meta = require("../aws/meta.js"); //?

var folder_module = require("../aws/folder-v5.js");
var people        = require("../users/people.js");
var mytemplate = require("../myutils/template.js");
var css_file = require("../aws/css-file.js");
var htool = require("./html-tools.js");

//deliver = require("../aws/file-deliver.js");
//social = require("../aws/social.js");
//log28 = require("../myutils/mylogb.js").double_log("/tmp/log28");


var p    = console.log;
var stop = function(){setTimeout(process.exit, 500);};



// get small parts used in file list page
function get_parts(folder, parts, callback){
    parts = parts || {};
    var meta = folder.get_meta();
    var cwd  = meta.path;

    parts['cwd'] = cwd;
    parts['cwd_chain'] = myutil.path_chain(cwd, "/ls/");

    css_file.read_css_file_of_folder(cwd).then(function(css_as_string) {
        //p('css as string:\n', css_as_string);
        parts['folder_css'] = css_as_string;

        callback(null, parts);

    });
}

function get_people_data(username){
    // this gives promise.

    return people.make_people_manager_for_user(username).then(function(mngr){
        //p('manager:', mngr);
        return mngr.get_json();
    }).then(function(j){
        //p('json:\n', j);
        var current = j.current;
        var p100 = j.people.slice(0,100);

        var current_people_html = current.map(str2check_box).join('\n');
        var p100_html = p100.map(str2check_box).join('\n');
        return {
            'current': current,
            'p100'   : p100,
            'html-current' : current_people_html,
            'html-p100'    : p100_html
        };
    });
}

function  str2check_box(str){
    return '<label class="username"><input type="checkbox" value="' + str + 
           '" />' +
           str +
           '</label>';
}


// @cwd : the path of the current folder, it actually contains owner name:
//        owner-name/path/to/folder
// @username : who is asking for the file listing.
// @callback : will get: (err, <ul> element, json of file list)
function assemble_file_list(username, cwd, callback) {
    return folder_module.retrieve_folder(cwd).then(function(folder) {
        if (!folder) { return callback("? no folder object for: " + cwd); }

        var parts = {username: username};
        get_ul_of_files(username, folder, function(err, ul_html){
            parts['ul_of_file_list'] = ul_html;
            // a static css file for fast dev., the <link> will be in html frame(-c).
            //parts['css'] = '<link rel="stylesheet" href="/static/css/css212.css">';

            get_parts(folder, parts, function(err, parts_){
                //u.defaults(parts, parts_);

                get_people_data(username).then(function(data){
                    // add people...
                    parts['current_people'] = data['html-current'] + '\n' + data['html-p100'];
                    p ('still not crash? assemble file list: go to assemble html 3');
                    assemble_html_3(parts, function(err, html) {
                        callback(null, html, parts);
                    });
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
                p ('role: ', role);
                switch(role){
                    case "owner":
                    case "member":
                        html = list_files_for_owner(folder);
                        break;
                    case "viewer":
                        html = list_files_for_viewer(folder);
                        break;
                    default:
                        html = list_files_for_public(folder);
                        // render for public
                }
                return callback(null, html);
            });

        });
}

function list_files_for_owner(folder) {
    // @folder is object

    var meta = folder.get_meta();
    var ul = "<ul class=\"folder-list list-unstyled\">";
    u.each(meta.files, function(file) {
        if (file.html != null) {
            if (file.html.li != null) {
                if (file.name.indexOf(".gg") !== 0) {
                    return ul += file.html.li;
                }
            }
        }
    });
    ul += "</ul>";
    return ul;
};

function list_files_for_viewer(folder) {
    // @folder is object
    var meta = folder.get_meta();
    var ul;
    ul = "<ul class=\"folder-list list-unstyled\">";
    u.each(meta.files, function(file) {
        if (file.html != null) {
            if (file.html.li_viewer != null) {
                if (file.name.indexOf(".gg") !== 0) {
                    return ul += file.html.li_viewer;
                }
            }
        }
    });
    ul += "</ul>";
    return ul;
};

function list_files_for_public(folder) {
    // @folder is object

    var meta = folder.get_meta();
    var ul = "<ul class=\"folder-list list-unstyled\">";
    u.each(meta.files, function(file) {
        if (file.html != null) {
            if (file.html.li_public != null) {
                if (file.name.indexOf(".gg") !== 0) {
                    return ul += file.html.li_public;
                }
            }
        }
    });
    ul += "</ul>";
    return ul;
};

function assemble_html_3(parts, callback) {
    //(username, ul_file_list, cwd, cwd_chain, current_people, in_file_css, callback)

    var contexts, html_files;

    contexts = {
        body: {
            user_folder_ul: 'ul?',
            cwd: 'cwd?',
            cwd_chain: 'cwd_chain?',
            current_people: parts['current_people']
        },
        header: {
            username: 'username-who?'
        },
        frame: {
            in_file_css: '/*css?*/'
        }
    };

    if(parts['ul_of_file_list']) contexts.body[  'user_folder_ul'] = parts['ul_of_file_list'];
    if(parts['cwd'])             contexts.body[  'cwd'] = parts['cwd'];
    if(parts['cwd_chain'])       contexts.body[  'cwd_chain'] = parts['cwd_chain'];
    if(parts['username'])        contexts.header['username'] = parts['username'];
    if(parts['in_file_css'])     contexts.frame[ 'folder_css'] = parts['folder_css'];
    //if(parts['css'])             contexts.frame[ 'css'] = parts['css'];

    html_files = {
        body: "ls-send.html",
        header: "ls2header.html",
        css:    "ls-send-css.html",  // html file contains css links.
        navbar: "ls2nav.html",
        script: "ls-send-script.html",
        frame: "frame-3.html"
    };
    return mytemplate.assemble_html_v2(html_files, contexts).then(function(html) {
        return callback(null, html);
    });
};


// 
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


module.exports.assemble_file_list = assemble_file_list;


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


function check_219a(){
    var folder_  = 'abc';
    var username = 'abc';
    get_people_data(username);
}




if (require.main === module) {
    //check_0211a();
    check_219a();

    //setTimeout(function() { process.exit(1000); }, 3000);
}

