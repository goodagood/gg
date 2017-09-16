
//var express = require("express");
//var router  = express.Router(); //?

var u = require("underscore");
var path = require("path");

var ggutil = require("gg-util");


var file_getter = require("../aws/get-file.js");

//var fileinfo = require("../myutils/fileinfo-a.js");

var asker = require("plain/asker/tasks.js");
var p = console.log;


var render = require("../page/render.js");
function render_file_info(username, file_path, callback){
    asker.file_meta(username, file_path, function(err, meta){
        if(err) return callback(err);

        render_meta(meta, callback);
    });
}


/*
 * fixing, 2016 0525
 */
function render_meta(meta, callback){
        var _path = meta.path; 

        var checked, context;
        if (meta.unique) {
            checked = 'checked';
        }
        context = {
           file_meta: JSON.stringify(meta, null, 4),
           full_path: _path,
           //cwd_chain: path_chain(dir),
           //username: username,
           //puuid: puuid,
           //unique_is_checked: checked
        };

        //p('context file u meta: ', context.file_meta);

        render.fill_handlebars('hbs/file-info.html', context, callback);
}


// 2016 0114
var file_tools = require("./tool.js");
function render_file_value(username, file_path, callback){
    asker.file_meta(username, file_path, function(err, meta){
    //file_getter.get_1st_file_obj_with_auxpath_by_path(file_path, function(err, fobj){})
        if(err) return callback(err);

        //var meta = fobj.get_meta();

        var checked, context;
        if (meta.unique) {
            checked = 'checked';
        }

        file_tools.file_get_tool_set(fobj, function(err, tool_set){
            if(err) return callback(err);
            var tools = u.values(tool_set).join(" \n");
            context = {
                info_list: fobj.build_file_info_list(),
                full_path: file_path,
                metas: file_tools.file_meta_for_client(fobj),
                cwd: path.dirname(file_path),
                //cwd_chain: path_chain(dir),
                //username: username,
                //puuid: puuid,
                unique_is_checked: checked,
                value: meta.value.amount,
                tools: tools,
            };

            render.fill_handlebars('hbs/file-value.html', context, callback)
        });
        //render_meta(callback);
    });
}


function kv(key, value){
    key   = key   || 'what';
    value = value || 'i dont know what';

    p(tpls.kv_tstr);

    return ggutil.tpl.return_renderred(
        tpls.kv_tstr,
        {key:key, value:value}
    );
}


module.exports.render_file_info  = render_file_info;
module.exports.render_file_value = render_file_value;



// -- fast checkings
function out(seconds){
    setTimeout(process.exit, seconds * 1000);
}

function c_get_info(file_path){
    file_path = file_path || 'abc/add-2/a.html';

    file_getter.get_1st_file_obj_with_auxpath_by_path(file_path, function(err, what){
        if(err) return out(2, p(1, err));

        p (u.isFunction(what.read_file_to_string))

        what.read_to_string(function(err, str){
            if(err) return out(2, p(2, err));
            p('read to strin:');
            p(str.slice(0, 500));

            p();
            p(what.get_meta());
            process.exit();
        });


    });
}



function c_render_file_info(username, file_path){
    file_path = file_path || 'tmp/public/a.py';
    username  = username  || 'tmp';

    //file_getter.get_1st_file_obj_with_auxpath_by_path(file_path, callback);
    render_file_info(username, file_path, function(err, what){
        p(err, what);
        out(1);
    });
}


var tpls = require("./tpl/file-info-list.js");
function c_kv_render(){
    var key   = 'what';
    var value = 'i dont know what';

    p(tpls.kv_tstr);

    ggutil.tpl.render_template_str(tpls.kv_tstr, {key:key, value:value}, function(err, renderred){
        p(err, renderred);
        out(1);
    });
    //out(1);
}


if(require.main === module){
    //c_get_info();
    c_render_file_info();
    //c_kv_render();
}



