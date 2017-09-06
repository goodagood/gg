/*
 * Give tool list of the folder
 * 2015 0516
 */

var path = require("path");
var fs   = require("fs");
var u    = require("underscore");

var handlebars  = require("handlebars");
var querystring = require('querystring');


var folder5     = require("./folder-v5.js");
var user_module = require("../users/a.js");

var p = console.log;

var _template_file_ = path.join(__dirname, 'folder-tool.html')
var _handlebars_tpl_file_path = path.join(path.dirname(__dirname), "handlebars-views");

// put it inside current folder:
var _template_dir_ = path.join(__dirname, 'tpl');

/*
 * ?
 * [
 *  {
 *      name: uploader 
 *      href: upfile/cwd...
 *      cwd : current path
 *      li  : the renderred li tag
 *      a   : as: <a href="..."> tool name </a>
 *  },
 *  ...... 
 * ]
 */

function get_folder_tool_set(cwd, options, callback){

    var template_file_name = 'old-list.html';
    var abs_tpl_path = path.join(_template_dir_, template_file_name);

    var cwd_query_string = querystring.stringify({cwd:cwd});
    var context = {
        cwd: cwd,
        cwd_query_string: cwd_query_string
    };
    render_hb_tpl(abs_tpl_path, context, callback);

}

function old_folder_tool_list(cwd, callback){
    var template_file_name = 'old-list.html';
    var abs_tpl_path = path.join(_template_dir_, template_file_name);

    var context = {
        cwd: cwd,
    };
    render_hb_tpl(abs_tpl_path, context, callback);
}

/*
 * Build the ui piece that can be used in web page.
 */
function build_uploador_ui_piece(folder, options, callback){
    var meta = folder.get_meta();

    var name = 'uploador ' + meta.path + ', ' + meta.uuid;
    var href = 'upfile/' + meta.path;
    var cwd  = meta.path;

    var Template_file_path = path.join(_handlebars_tpl_file_path, 'folder-tools-uploador.html');
    p(Template_file_path);

    var context = {
        name: name,
        cwd : cwd,
        href: href,
    }

    render_hb_tpl(Template_file_path,  context, callback);
}


/*
 * Let user can select listor?
 */
function select_listor(folder, options, callback){
    var meta = folder.get_meta();

    var name = 'uploador ' + meta.path + ', ' + meta.uuid;
    var href = 'upfile/' + meta.path;
    var cwd  = meta.path;

    var Template_file_path = path.join(_handlebars_tpl_file_path, 'folder-tools-listor-selector.html');
    p(Template_file_path);

    var context = {
        name: name,
        cwd : cwd,
        href: href,
    }

    render_hb_tpl(Template_file_path,  context, callback);
}


// todo, 0516
function make_new_folder(folder, options, callback){
    var meta = folder.get_meta();

    var name = 'uploador ' + meta.path + ', ' + meta.uuid;
    var href = 'upfile/' + meta.path;
    var cwd  = meta.path;

    var Template_file_path = path.join(_handlebars_tpl_file_path, 'folder-tools-uploador.html');
    p(Template_file_path);

    var context = {
        name: name,
        cwd : cwd,
        href: href,
    }

    render_hb_tpl(Template_file_path,  context, callback);
}


// _ template, copied here and need redo
function read_in_template(abs_file_path, callback) {
    return fs.readFile(_template_file_, {'encoding':'utf-8'}, function(err, buf) {
        var str;
        if (err) {
            return callback(err, buf);
        }
        //str = buf.toString();
        str = buf;
        p('folder template string: ', err, str);

        if (_meta_.html == null) {
            _meta_.html = {};
        }

        try {
            _meta_.html.template = u.template(str);
        } catch (_error) {
            err = _error;
            _meta_.html.template = null;
            return callback(err, null);
        }
        callback(null, _meta_.html.template);
        return _meta_.html.template;
    });
}


/*
 * handlebars template
 */
function render_hb_tpl(abs_file_path, context, callback) {
    return fs.readFile(abs_file_path, {'encoding':'utf-8'}, function(err, str) {
        if (err) {
            return callback(err, str);
        }
        //p('folder template string: ', err, str);

        var renderred;
        try {
            var template = handlebars.compile(str);
            renderred= template(context);
        } catch (_error) {
            return callback(_error, null);
        }
        callback(null, renderred);
    });
}

function deep_extend(origin, new_obj){

    var keys = u.keys(new_obj);
    if(u.isEmpty(keys)) return origin;

    u.each(keys, function(key){
        if(typeof origin[key] === 'undefined') return origin[key] = new_obj[key];

        // This will cause origin been over-ridden when new_obj[key] is NOT object:
        if( u.isObject(origin[key]) && u.isObject(new_obj[key])){
            return deep_extend(origin[key], new_obj[key]);
        }else{
            return origin[key] = new_obj[key];
        }
    });
}

function set_folder_meta(cwd, options, callback){
    folder5.retrieve_folder(cwd).then(function(folder){
        var meta = folder.get_meta();
        //u.extend(meta, options);
        deep_extend(meta, options);

        //var keys = u.keys(options);
        //u.map(keys, function(key){
        //    meta[key] = options[key];
        //    //p(key, '\t', options[key]);
        //});

        folder.save_meta(callback);
    }).catch(function(err){
        // When err caught:
        callback(err, null);
    });
}



module.exports.get_folder_tool_set = get_folder_tool_set;

module.exports.set_folder_meta = set_folder_meta;

// export for testings:
//module.exports.render_hb_tpl = render_hb_tpl;


// -- fast checkings -- //

function stop(seconds){
    seconds = seconds || 1;
    setTimeout(process.exit, seconds*1000);
}


function check_hb(){
    var file_name = "test.html";
    var abs_path  = path.join(_handlebars_tpl_file_path, file_name);

    var context = {
        some_thing: 'SoM& %>ing',
        something:  'SoM& %>ing'
    }

    render_hb_tpl(abs_path, context, function(err, what){
        p('af read in hb tpl: ', err, what);
        stop();
    });
}

function check_mk_uploador(){
    var username = 'ap';
    var cwd = '39/public';

    folder5.retrieve_folder(cwd).then(function(folder){
        build_uploador_ui_piece(folder, {}, function(err, str){
            p('after mk up meta: ', err, str);
            stop();
        });
    }).catch(function(err){
        p('got err: ', err); stop();
    });
}

function aa(){
    var cwd = '39/public';

    folder5.retrieve_folder(cwd).then(function(folder){
        build_uploador_ui_piece();
        stop();
    });
}

function empty_check(){
    var cwd = '39/public';

    folder5.retrieve_folder(cwd).then(function(folder){
        build_uploador_ui_piece();
        stop();
    });
}

function chk_set_meta(){
    var cwd = 'abc/test';

    var options = { };
    var name1 = 'i_am_name_1';
    var name2 = 'i_am_name_2';
    options[name1] = {aa:'i am testing again', b:'ok now?'};
    options[name2] = 'name two';

    folder5.retrieve_folder(cwd).then(function(folder){
        var meta = folder.get_meta();
        (typeof meta[name1] !== 'undefined') ? p('name1', name1, meta[name1]) : p(name1, ' undefined');
        (typeof meta[name2] !== 'undefined') ? p('name2', name2, meta[name2]) : p(name2, ' undefined');

        set_folder_meta(cwd, options, function(err, what){
            p('after set folder meta:', err, what);
            stop();
        });
    });
}

function chk_deep_extend(){
    var origin = {
        a : 1,
        b : {
            ba : 3,
            bb : {
                bba: 1,
                bbb: 2,
            },
        },
    };
    var obj = {
        b: {
            'new': 'i am new',
            bb: { 
                'bb-new': 'hi',
            },
        },
        c: 'i am c',

    };
    deep_extend(origin, obj);
    p('after extend:\n', origin);
}

function chk_render_old(){
    var cwd = 'abc';
    
    old_folder_tool_list(cwd, function(err, what){
        p('in chk old: ', err, what);
        stop();
    });
}



if(require.main === module){
    p(_template_file_, _handlebars_tpl_file_path);
    //check_hb();
    //check_mk_uploador();
    //chk_set_meta();
    //chk_deep_extend();

    chk_render_old();
}


