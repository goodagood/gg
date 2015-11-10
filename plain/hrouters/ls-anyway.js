
/*
 * To list folder anyway, no more errors, exceptions and attentions.
 * Follow style of 'ls-img.js', using handlebar template
 *
 * 2015 0428.
 */


var path = require("path");
var fs   = require("fs");
var assert = require('assert');

var handlebars = require("handlebars");

var folder_module = require("../aws/folder-v5.js");
var myutil        = require("../myutils/myutil.js");
var css_file      = require("../aws/css-file.js");
var user_module   = require("../users/a.js");

//  local utils:
var lutil         = require("./utils.js");


var p = console.log;


/*
 * @parameters : 
 *   { username:
 *     user: user json/object
 *     cwd: 'the folder path to list'
 *     id:  'user id, string'
 *   }
 *   re-doing, 0507
 */
function list_folder_anyway (parameters, callback) {

    // file name of the template is hard-coded, ../handlebars-views/ls-anyway.html
    var template_path = path.join(path.dirname(__dirname), "handlebars-views/ls-anyway.html");

    if(parameters.username) parameters.user_name = parameters.username;

    p('before give folder listing parts 0601, in hrouters/ls-anyway.js');
    give_folder_listing_parts_0601(parameters, function(err, context){
        //p('hrouters/ls-anyway.js list folder anyway ', err, context);
        if(err) return callback('err in give folder listing parts', null);
        //p('context ok? ', context);
        //p('context ok? ');

        lutil.render_template(template_path, context, callback);
    });
}

function ref_to_write_ls_anyway (params, callback){
    username = params.username;
    folder_path = params.cwd;
    p('username folder path: ', username, folder_path);

    //var template_path = "../handlebars-views/ls-img.html";
    var template_path = path.join(path.dirname(__dirname), "handlebars-views/ls-img.html");
    //p('temp path: ', template_path);
    var temp_text = fs.readFile(template_path, function(err, buf){
        if(err) return callback(err, null);
        var text = buf.toString(); //default utf-8

        var temp = handlebars.compile(text);
        var html_string = '';

        lsimg.make_ls_img_context(username, folder_path, function(err, context){
            if(err) html_string = "<h1>some thing wrong in hand written list style.</h1>";

            //p('context ok? ', context);

            html_string = temp(context)

            //callback(null, buf.toString());
            callback(null, html_string);
            //return html_string;
            //res.render('ls-img', context)
        });

    });
}


/*
 * @parameters : 
 *   { username:
 *     id:  'user id, string'
 *     cwd: 'the folder path to list'
 *   }
 */
var chain = require("../cwd-chain/cwd-chain.js");
function give_folder_listing_parts (parameters, callback) {

    // old code compatible:
    var username = parameters.username || 'who-known';
    var cwd      = parameters.cwd      || '/';

    // defaults:
    var parts = {
        username:  null,
        user_id:   null,
        user_role: null,

        file_list_ul:   '<ul><li> No file list filled yet </li></ul>',
        cwd:            '/',
        cwd_chain:      '',
        current_people: '',
        css_links:      '',
        in_file_css:    '/*css?*/',
        folder_tool_set:'',
    };
    u.extend(parts, parameters);

    // We pass 'parts' to callback even err occurs,
    // try to give parts anyway.
    user_module.get_user_id(parts.username, function(err, id) {
        if(!err) parts.user_id = id;
        p('get user id: ', id, parts.username);

        return folder_module.retrieve_folder(cwd).then(function(folder) {
            if (!folder) { return callback("? no folder object for: " + cwd, parts); }

            // need to check user role
            parts.file_list_ul = folder.get_ul_renderring();
            //get_ul_of_files(username, folder, function(err, ul_html){
            //    parts['file_list_ul'] = ul_html;
            //});

            //var current_people = '<p class="err">not added in tmp solution 0417</p>';
            return css_file.read_css_file_of_folder(cwd);
        }).then(function(css_as_string) {
            parts.in_file_css = css_as_string;

            chain.make_cwd_chain(cwd, function(err, chain_tag){
                if(err) return callback(null, parts);
                parts.cwd_chain = chain_tag;
                return callback(null, parts);
                //parts.cwd_chain = myutil.path_chain(cwd, "/ls/");
                //p("parameters: username, cwd, cwd_chain, current_people \n", username, cwd, cwd_chain, current_people);
            });
        }).catch(function(err){
            return callback(err, '<h1 class="err"> Can not get the folder: ' + cwd + '</h1>', parts);
        });
    });
}


/*
 * @parameters : 
 *   { username:                       *must
 *     id:  'user id, string'           
 *     cwd: 'the folder path to list'  *must
 *   }
 */
function give_folder_listing_parts_0601 (parameters, callback) {

    // defaults:
    var parts = {
        user_name: null,
        user_id:   null,
        user_role: null,

        file_list_ul:   '<ul><li> No file list filled yet </li></ul>',
        cwd:            '/',
        cwd_chain:      '',
        current_people: '',
        css_links:      '',
        in_file_css:    '/*css?*/',
        folder_tool_set:'',

        errors:         [],
    };
    u.extend(parts, parameters);

    assert(u.isString(parts.cwd));
    //assert(u.isString(parts.user_name));

    //p('hrouters/ls-anyway.js give folder listing parts 0601, parts: ', parts);

    // to clear codes
    return folder_module.retrieve_folder(parts.cwd).then(function(folder) {
        if (!folder) { return callback("? no folder object for: " + cwd, parts); }

        parameters.folder_obj = folder;
        //p('0943am 0720, ', u.omit( parameters, 'folder_obj'));
        //p('before : after get folder obj, 0748am 0720, ', typeof parameters);
        add_user_id(parameters, parts, callback);
    }).catch(callback);
}


function add_user_id(parameters, parts, callback){

    if(parts.user_id) return add_file_list(parameters, parts, callback);
    if(!u.isString(parts.user_name)) return add_file_list(parameters, parts, callback);

    user_module.get_user_id(parts.user_name, function(err, id) {
        if(!err){
            parts.user_id = id;
            //p('get user id: ', id, parts.user_name);
        }else{
            parts.errors.push(err);
        }
        add_file_list(parameters, parts, callback);
    });
}


//var ls3 = require("./ls3.js");
var list_a = require("../aws/get-file-list.js");
function add_file_list(parameters, parts, callback){
    //p('in get file list, parameters: ', parameters);
    //p('in get file list, parameters omit folder obj: ', u.omit( parameters, 'folder_obj'));
    list_a.list_files(parameters.username, parameters.cwd, function(err, html_ul){
        if(err) return callback(err);

        parts.file_list_ul = html_ul;
        add_folder_css(parameters, parts, callback);
    });
}


function add_folder_css(parameters, parts, callback){
    //p('agfl', parts.errors);

    // Read css file of the folder
    css_file.read_css_file_of_folder(parts.cwd).then(function(css_as_string){
        parts.in_file_css = css_as_string;
        //p('go to add cwd chain');
        add_cwd_chain(parameters, parts, callback);
    }).catch(function(err){
        parts.errors.push(err);
        add_cwd_chain(parameters, parts, callback);
    });
}


function add_cwd_chain(parameters, parts, callback){
    //p('agfc', parts.errors);

    chain.make_cwd_chain(parts.cwd, function(err, chain_tag){
        if(err){
            p('make cwd chain: err: ', err);
            parts.errors.push(err);
            return add_tool_set(parameters, parts, callback);
        }

        parts.cwd_chain = chain_tag;
        //p('go to add tool set');
        add_tool_set(parameters, parts, callback);
    });
}

var folder_tools = require("../aws/folder-tools.js");
function add_tool_set(parameters, parts, callback){

    // to make folder tools
    folder_tools.get_folder_tool_set(parts.cwd, {}, function(err, tool_set){
        if(err){
            p('get folder tool set: ', err);
            parts.errors.push(err);
            return add_more(parameters, parts, callback);
        }

        parts.folder_tool_set = tool_set; // html tag string
        add_more(parameters, parts, callback);
    });
}


function add_more(parameters, parts, callback){
    callback(null, parts);
}


//d?
// get small parts used in file list page
function get_parts(folder, callback){
    // @folder: folder object
    // @parts:  already gatherred parts

    parts = {};
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

module.exports.list_folder_anyway = list_folder_anyway;

// change to give parts anyway?
module.exports.give_folder_listing_parts = give_folder_listing_parts_0601;  // 

//testing:
module.exports.give_folder_listing_parts_0601 = give_folder_listing_parts_0601;  // 


// -- checkings -- //

function check_list_folder_anyway(){
    var parm = {
        username: 'abc',
        cwd:      'abc/test'
    }

    list_folder_anyway(parm, function(err, html){
        if(err) return p('ls folder anyway err: ', err);

        //p(err, html);
        fs.writeFile('/tmp/la.html', html, function(e,r){
            p('write file: ', e,r);
            require ("../myutils/test-util.js").stop();
        });
    });
}

function check_parts(cwd){
    cwd = cwd || 'abc/test';

    var params = {
        username: "abc",
        cwd : cwd,
    };
    give_folder_listing_parts(params, function(err, parts){
        p('got listing parts: ', err, parts);
        require ("../myutils/test-util.js").stop();
    });
}


function check_parts0601(cwd){
    cwd = cwd || 'abc/test';

    var params = {
        user_name: "abc",
        cwd : cwd,
    };
    give_folder_listing_parts_0601(params, function(err, parts){
        p('got listing parts: ', err, u.keys(parts));
        if (u.isString(parts.file_list_ul)){
            p(parts.file_list_ul.slice(0,300));
        }

        require ("../myutils/test-util.js").stop();
    });
}


if (require.main === module) {
    check_list_folder_anyway();
    //check_parts();
    //check_parts0601();
}

