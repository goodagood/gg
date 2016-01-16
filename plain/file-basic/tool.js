/*
 * Make up tool set for file, do file path first
 *
 * 2016 0115
 */

var path   = require("path");


var getter = require("../aws/get-file.js");
var pages  = require("../config/pages.js");


var p = console.log;
var Tool_Set_Name = 'tools';


function build_tool_set(path_uuid, callback){
    getter.get_file_by_path_uuid(path_uuid, function(err, file){
        if(err) return callback(err);
        
        file_build_tool_set(file, callback);
    });
}


function file_build_tool_set(file, callback){
        var meta = file.get_meta();
        if(!meta[Tool_Set_Name]) meta[Tool_Set_Name] = {};

        make_remove_url(meta);
        make_view_url  (meta);
        make_stream_url(meta);
        make_value_url (meta);

        //callback(null, meta[Tool_Set_Name]);// indev
        file.save_file_to_folder().then(function(file){ //file obj?
            callback(null, meta[Tool_Set_Name]);
        }).catch(callback);
}


function file_get_tool_set(file, callback){
    var meta = file.get_meta();

    if(meta[Tool_Set_Name]){
        return callback(null, meta[Tool_Set_Name]);
    }else{
        file_build_tool_set(file, callback);
    }
}


function make_remove_url(meta){
    //p('-- make del rul');
    var href = path.join(pages.remove_file, meta.path_uuid);
    var anchor = '<a class="file-tool del-file" href="' + href + '" > Remove </a>';
    meta[Tool_Set_Name].remove = anchor;
    return anchor;
}


function make_view_url(meta){
    //p('-- make view rul');
    var href = path.join(pages.view_file, meta.path_uuid);
    var anchor = '<a class="file-tool view-file" href="' + href + '" > ViewTxt </a>';
    meta[Tool_Set_Name].view = anchor;
    return anchor;
}


function make_stream_url(meta){
    //p('-- make stream rul');
    var href = path.join(pages.stream_file, meta.path_uuid);
    var anchor = '<a class="file-tool stream-file" href="' + href + '" > Download </a>';
    meta[Tool_Set_Name].stream = anchor;
    return anchor;
}


function make_value_url(meta){
    //p('-- make value rul');
    var href = path.join(pages.info_value, meta.path); // not uuid!
    var anchor = '<a class="file-tool value-file" href="' + href + '" > Value </a>';
    meta[Tool_Set_Name].value = anchor;
    return anchor;
}


var keeper = require("../myutils/keep.js");
var html_ul= require("../myutils/mk-ul.js");
function file_meta_for_client(file) {
    //var file_info_ul, meta_ul, util_ul;
    //meta_ul = convert_meta_to_ul();
    //file_info_ul = "<h2 class=\"util-list-name\"> File tools </h2>\n\n" + util_ul + "\n\n<h2 class=\"util-list-name\"> File information </h2>\n\n" + meta_ul;
    //return file_info_ul;

    var meta = file.get_meta();

    var attr_names = [
        'name',       'path',      'owner',
        'type',       'timestamp', 'size',
        'permission', 'tools',     'value' ];

    var client_metas  = keeper.keep(meta, attr_names);
    return html_ul.to_ul( client_metas );
}




module.exports.file_get_tool_set = file_get_tool_set;
module.exports.file_meta_for_client = file_meta_for_client;



// -- fast checkings

function check_build_tools(full_path){
    getter.get_1st_file_obj_by_path(full_path, function(err, f){
        if(err) return p('o o, err: ', err);

        var m = f.get_meta();
        if(m && m.path) p('file path: ', m.path, m.path_uuid);

        build_tool_set(m.path_uuid, function(error, file){
            if(error) return p(1, error, file);

            p(file.get_meta()[Tool_Set_Name]);
            process.exit();
        });
    });
}

function check_get_tools(full_path){
    getter.get_1st_file_obj_by_path(full_path, function(err, f){
        if(err) return p('o o, err: ', err);

        var m = f.get_meta();
        if(m && m.path) p('file path: ', m.path, m.path_uuid);

        file_get_tool_set(f, function(error, tools){
            if(error) return p(1, error, tools);

            p(tools);
            process.exit();
        });
    });
}

if(require.main === module){
    //check_build_tools('abc/add-2/a.html');
    check_get_tools('abc/add-2/a.html');
}

