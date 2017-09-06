
// for todo app testing, backbone,
// for post data to /test/todo
// 0315

var u      = require('underscore');
var assert = require('assert');
var path   = require('path');

var folder_module  = require('../aws/folder-v5.js');
var simple_json    = require("../aws/simple-json.js");

var Todo_file_name = '.todo.json';
//  for debuging:
var p              = console.log;
var tutil          = require("../myutils/test-util.js");


function post_todo(req, res, next){
    var body = req.body;

    console.log('in post todo, got body: ', body);
    var fileinfo = JSON.parse(body.fileinfo);
    var json      = JSON.parse(body.jdata);

    var file_path = fileinfo.file_path;

    update_json_file(file_path, json, function(err, reply){
        res.json({ });
    });
}


function update_json_file(file_path, json, callback){
    var cwd = file_path;
    var file_name = path.basename(file_path);
    var dir_name  = path.dirname(file_path);
    if(file_name === Todo_file_name) cwd = dir_name;
    p('in update json file, cwd=', cwd);

    get_todo_file_anyway(cwd, function(err, file){
        if(err){
            p('get todo  file anyway, (err, file) is:\n', err, file);
            return callback(err, {err: err});
        }
        p('going to update json in post todo/update json file:', json);
        file.update_json(json, function(err, s3reply){
            if(err) return callback(err, {'error': 'write err, s3',});
            callback(null, {});
        });
    });
}


function get_todo_file_anyway(cwd, callback){
    // give a folder path, get todo file, .todo.json, or create it.
    // callback get: (err, file-object)
    if(!u.isString(cwd)) return callback('no path given to get todo file, anyway?', null);

    var json_file_path = path.join(cwd, Todo_file_name);

    var pat = new RegExp(Todo_file_name);

    folder_module.retrieve_folder(cwd).then(function(folder){
        if(folder.file_exists(Todo_file_name)){

            uuids = folder.pattern_to_uuids(pat);
            assert(uuids.length === 1);
            u0 = uuids[0];
            return folder.uuid_to_file_obj(u0, callback);
        }else{
            var user_name = guess_user_name(cwd);
            var json      = {
                //name : '.todo.json',
                //descript : 'a simple json file to serve as todo list.',
            };
            simple_json.make_json_file(json, user_name, json_file_path, callback);
        }
    });
}

function guess_user_name(cwd){
    assert(u.isString(cwd));
    cwd = cwd.trim();
    var parts = cwd.split('/');
    assert(u.isString(parts[0]));
    return parts[0];
}


// for get the json file, it's for post('/read-json')
function post_read_json(req, res, next){
    var body = req.body;

    console.log('in post get json, got body: ', body);
    if(!body.fileinfo) return res.json({});

    var fileinfo = JSON.parse(body.fileinfo);

    var file_path = fileinfo.file_path;

    read_todo_file(file_path, function(err, j){
        if(err) return res.json({err:err});
        res.json(j);
    });
}


function read_todo_file(file_path, callback){
    var cwd = file_path;
    var file_name = path.basename(file_path);
    var dir_name  = path.dirname(file_path);
    if(file_name === Todo_file_name) cwd = dir_name;
    p('in read todo file, cwd=', cwd);

    get_todo_file_anyway(cwd, function(err, file){
        if(err){
            p('in read todo, get todo  file anyway, (err, file) is:\n', err, file);
            return callback(err, {err: err});
        }
        file.retrieve_json(function(err, json){
            if(err){
                p('in read todo, retrieve, (err, file) is:\n', err, file);
                return callback(err, {err: err});
            }
            callback(null, json);
        });
    });
}


var value = require("../file-value/value.js");
function add_value(req, res, next){
    var body = req.body;

    console.log('in set file meta, got body: ', body);
    //var fileinfo = JSON.parse(body.fileinfo);
    //var json     = JSON.parse(body.jdata);

    var path_uuid = body['path_uuid'];
    if(!u.isString(path_uuid)) return res.json({err: 'path uuid not a string.'});
    value.add_value(path_uuid, 1, function(err, s3reply){
        if(err) return res.json({err: 'value add_value err.'});

        // give required attrs, {name, value, path_uuid...}
        res.json({added:value});
    });
}

//todo:
function set_file_meta(req, res, next){
    // req.body should contain post data:
    // {
    //   'path_uuid':    file path uuid,
    //   'attribute-1':  string,
    //   // all string for attributes and it's value.
    //   ......
    // }
    var body = req.body;

    console.log('in set file meta, got body: ', body);
    //var fileinfo = JSON.parse(body.fileinfo);
    //var json     = JSON.parse(body.jdata);

    var path_uuid = body['path_uuid'];
    if(!u.isString(path_uuid)) return res.json({err: 'path uuid not a string.'});
    delete body['path_uuid'];

    folder_module.retrieve_file_by_path_uuid(path_uuid, function(err, file){
        if(err) return res.json({err: 'can not get file:' + path_uuid});
        file.update_meta(body, function(err, meta_for_client){
            if(err) return res.json({err: 'can not set meta for file:' + path_uuid});
            res.json({});
        });
    });
}


// this is a kind of duplicated, just for setting the unique
function set_file_unique(req, res, next){
    // req.body should contain post data:
    // {
    //   'path_uuid': file path uuid,
    //   'unique':    true/false, it can be string 'true'/'false'
    //   ......
    // }
    var body = req.body;

    console.log('in set file unique, got body: ', body);

    var path_uuid = body['path_uuid'];
    if(!u.isString(path_uuid)) return res.json({err: 'path uuid not a string.'});
    delete body['path_uuid'];

    if(typeof body.unique === 'undefined') return res.json({err: 'give me value of unique'});
    var unique = body.unique;
    if(unique === 'true')  unique = true;
    if(unique === 'false') unique = false;

    var update = {unique: unique};

    folder_module.retrieve_file_by_path_uuid(path_uuid, function(err, file){
        if(err) return res.json({err: 'can not get file:' + path_uuid});
        file.update_meta(update, function(err, meta_for_client){
            if(err) return res.json({err: 'can not set meta for file:' + path_uuid});
            res.json(meta_for_client);
        });
    });
}

//function up


module.exports.post_todo       = post_todo;
module.exports.read_todo_file  = read_todo_file;
module.exports.post_read_json  = post_read_json;
module.exports.set_file_meta   = set_file_meta;
module.exports.set_file_unique = set_file_unique;
module.exports.add_value       = add_value;


// fast checkings

function get_or_make(){
    //var cwd = 'abc/test/.todo.json';
    var cwd = 'abc/test';
    get_todo_file_anyway(cwd, function(err, file){
        p('get or make:\n', err, file);
        file.read_to_string(function(err, str){
            p(err, str);
            tutil.stop();
        });
    });
}


function check_read_jfile(){
    var file_path = 'abc/test/.todo.json';

    read_todo_file(file_path, function(err, json){
        p('get or make:\n', err, json);
        tutil.stop();
    });
}

if (require.main === module){
    //get_or_make();
    check_read_jfile();
}

