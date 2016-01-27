/*
 * redo the msg webpage, get.
 * based on ../hrouters/msg2.js
 *
 * Trying to give clear page assembling.
 *
 *
 * 2016 0125
 */

var path = require("path");


var Tpl_dir     = path.resolve(path.join(__dirname, "./msg3"));
var Tpl_dir_old = path.resolve(path.join(__dirname, "../handlebars-views/"));


var tpl  = require("../myutils/tpl.js");
var html_tools  = require("../myutils/html-tools.js");
var find_a_few = require("../users/find-a-few.js");
var list_a = require("../aws/get-file-list.js");

var foot = require("../page/foot.js");
var head = require("../page/head.js");
var tpl_parts = require("./msg3/tpl-parts.js");
var myconfig      = require("../config/config.js");

var p = console.log;

//const Msg_folder  = 'gg/message';
const Msg_folder  = myconfig.message_folder;

function get_message_editing_page(req, callback){
    if(!req.user) return callback('we can not find user info. login might be required');

    var user_name = req.user.username;
    var user_id   = req.user.id;
    var towhom    = req.params.who;
    if (!towhom) towhom = user_name;

    var cwd = path.join(user_id, Msg_folder);

    var full_tpl_path = Html_parts.frame;
    p(full_tpl_path);

    //  context: to_whom_checkbox, people_list, message_list, 
    prepare_context(user_name, user_id, cwd, function(err, context){
        tpl.render_template(full_tpl_path, context, callback);
    });
}


/*
 * HTML parts moved to ./msg3/*.html
 */
var Html_parts = {
    frame  : path.join(Tpl_dir_old, 'frame-jqm.html'),
    editing: 'input.html',

    header : "ls2header.html",
    navbar : 'empty-navbar.html',
    script : 'msg2-script.html',
};


/* we might hardwire most at first, 2016 0126 */
function prepare_context(user_name, user_id, cwd, callback){

    var context = {};

    make_body(user_name, user_id, cwd, function(err, body){
        if(err) return callback(err);

        context["body"] = body;
        context["header"] = head.render_header_ls2({username: user_name});
        context["footer"] = foot.foot_with_buttons;
        context["css"]  = '<link rel="stylesheet" href="/static/css/msg3.css">\n';
        context["script"] = tpl_parts.script_srcs;

        context["title"] = "msg page, v20160127";

        callback(null, context);
    });
}


function make_body(user_name, user_id, cwd, callback){
    list_acceptor(user_name, function(err, acceptor_checkboxs){
        if(err) return callback(err);

        var context = {};

        context["acceptor_checkboxs"] = acceptor_checkboxs;
        var editor_form = text_area(context);

        list_a.list_files(user_id, cwd, function(err, html_ul){
            if(err) return callback(err);

            //context["message_list"] = html_ul;

            var all = editor_form + "\r\n\r\n" + html_ul;

            callback(null, all);
        });

    });
}

/*
 * Same functionalities as make_editing_form, this will not read template from
 * html files, but from 'multiline', and render and return it without using 
 * callback.
 * 2016 0127
 */
function text_area(context){
    return tpl.render_str(tpl_parts.editor_form, context);
}


/* This use template in html file */
function make_editing_form(callback){
    var full_tpl_path = path.join(Tpl_dir, Html_parts.editing);

    //  context: to_whom_checkbox, people_list, message_list, 
    var context = {};
    tpl.render_template(full_tpl_path, context, callback);
}


function list_acceptor(user_name, callback){
    find_a_few.known_names(user_name).then(function(names){
        // make the name list
        var checkboxs = html_tools.names_to_checkbox(names);
        callback(null, checkboxs);
    }).catch(callback);
}


module.exports.get_message_editing_page = get_message_editing_page;


/* fast checkings */

function c_ed_form(){
    make_editing_form(function(err, html){
        if(err) p(err);
        p(html);
    });
}

function c_text(){
    p(text_area({}));
}

function c_frame(){
    get_message_editing_page(null, null, null, function(err, html){
        if(err) p(err);
        p(html);
    });
}

function c_acceptors(){
    list_acceptor('abc', function(err, listed){
        p(err, listed);
        process.exit();
    });
}

function c_m_body(name, id, cwd){
    name = name || 'abc';
    id   = id   || 'abc';
    cwd  = cwd  || path.join(id, Msg_folder);

    make_body(name, id, cwd, function(err, html){
        p(err, html);
        process.exit();
    });
}

if(require.main === module){
    //p(Html_parts);
    //c_ed_form();

    //c_frame();
    //c_text();
    //c_acceptors();
    c_m_body();
}
