
/*
 * Run codes in a vm (vm2)
 *
 * 2016 0120
 */

var path = require("path");
var u    = require("underscore");
var VM   = require('vm2').VM;


var code_reader = require("./reader.js");
var vmenv = require("./env-folder.js");


var Log_file_name  = "code.hook.log";

var p = console.log;



/*
 * Run user's code in the folder,
 *   full file path of code, it can extract to: cwd, file name
 * 
 * the sandbox get:
 *   folder object
 *   ability to get file object
 *   ability to write folder, file and it's meta data in the cwd
 *   ability to do logging
 */
function run(file_full_path, callback){
    callback = callback || function(){};

    var cwd  = path.dirname(file_full_path);
    var name = path.basename(file_full_path);

    code_reader.read(file_full_path, function(err, codes){
        if(err) return callback(err);
        p('codes: '); p(codes);

        vmenv.mk_env(cwd, function(err, sandbox){
            if(err) return callback(err);
            p('u.keys sandbox: '); p(u.keys(sandbox));
            var vm = new VM({
                sandbox: sandbox
            });

            var runned = vm.run(codes);
            return callback(null, runned);
        });
    });
}


module.exports.run = run;


//todo
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

function chk_run(full_path){
    full_path = full_path || 'abc/tadd/test.js';

    run(full_path, function(err, out){
        if(err) return p('err: ', err);

        p('out');
        p(out);
        setTimeout(function(){
            p('after 15*1000, run after...');
            process.exit();
        }, 30*1000);
    });
}



if(require.main === module){
    chk_run();
}


