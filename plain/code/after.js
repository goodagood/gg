
/*
 * Run user's code after file get upload
 *
 * In the vm, it will get the uploaded file object, so the file meta can be get
 * by:
 *      meta = file.get_meta();
 *
 *      # after some running
 *      file.save_file_to_folder()
 *      .then (function(file){//...})
 *      .catch(function(err ){//...});
 *
 * 2016 0116
 */

var path = require("path");
var u    = require("underscore");
var VM   = require('vm2').VM;


var getter = require("../aws/get-file.js");
var txt    = require("../file-basic/append-txt.js");


var User_code_name = ".after.upload.js";
var Log_file_name  = "code.hook.log";

var p = console.log;



/*
 * Run user's code in the folder, after file uploading into the folder.
 */
function run_folder_code_after_upload(file){
    if(!u.isFunction(file.get_meta)) return callback(err);

    var meta = file.get_meta();

    var cwd  = path.dirname(meta.path);
    var log_file_path = path.join(cwd, Log_file_name);
    //p('cwd: ',cwd);

    load_code(cwd, function(err, code){
        if(err) return callback(err);

        p('- preparing vm, the code is: ', code);
        p('- preparing vm, log file path: ', log_file_path);

        var log = get_logger(log_file_path);

        var vm = new VM({
            sandbox:{
                file: file,
                log:  log
            }
        });

        vm.run(code);
    });
}


/*
 * @name must be: 'adder', 'keeper'
 */
function get_logger(full_log_file_path){

    var Log = "";

    function add_log(msg){
        if(!msg) return;
        if(u.isFunction(msg.toString)) msg = msg.toString();
        if( !u.isString(msg))          return;

        Log += msg;
        Log += "\r\n";
        return Log;
    }

    function save_log(callback){
        fn = callback || function(){};

        p('keep log, full file path: ', full_log_file_path);
        Log += `log saved at: ${Date().toString()} \r\n`; 
        txt.append_txt(full_log_file_path, Log, fn);
    }

    //if(adder_or_keeper === 'adder')  return add_log;
    //if(adder_or_keeper === 'keeper') return save_log;
    return {
        add:   add_log,
        save: save_log
    }
}



function load_code(cwd, callback){
    //var dir = path.dirname(file_path);
    //var dir = cwd;

    var code_file_name = path.join(cwd, User_code_name);

    getter.get_1st_file_obj_by_path(code_file_name, function(err, code_file){
        if(err) return callback(err);

        code_file.read_to_string(callback);
        //function(err, code_string){
        //});
    });
}



// -- fast checkings

function chk_load(cwd){
    //cwd = cwd || 'abc/add-2';
    cwd = cwd || 'abc/tadd';

    load_code(cwd, function(err, code){
        p(err, code);
        process.exit();
    });
}

function chk_log(cwd, msg){

    cwd = cwd || 'abc/tadd';
    msg = msg || 'going to chkec log add and save, keep, ' + Date().toString();

    var log_file_path = path.join(cwd, Log_file_name);

    var log  = get_logger(log_file_path);
    //var save_log = get_logger('keeper', log_file_path);

    log.add('add in chk log, ' + Date.now());
    log.save(function(err, saved){
        p(err, saved);
        setTimeout(function(){
            p('after 30*1000, run after...');
            process.exit();
        }, 30*1000);
    });
}


function chk_run(full_path){
    //full_path = 'abc/add-2/a.html';
    full_path = full_path || 'abc/tadd/test.log';

    getter.get_1st_file_obj_by_path(full_path, function(err, file){
        if(err) return p('err: ', err);
        p('-- file get meta then path uuid: ', file.get_meta().path_uuid);

        run_folder_code_after_upload(file);
        setTimeout(function(){
            p('after 30*1000, run after...');
            process.exit();
        }, 30*1000);

        //function(err, what){
        //    if(err) return p('run after uploading, err: ', err);

        //    p(what);

        //    process.exit();
        //});

    });
}



if(require.main === module){
    //chk_load('abc/tadd');
    //chk_log();

    chk_run();
}


