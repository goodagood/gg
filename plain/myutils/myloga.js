
// Set up logger
var npmlog = require('npmlog');
var fs = require('fs');

var myconfig =   require("../config/config.js");
var logfile = myconfig.logfile;

//console.log(logfile);

//console.log(npmlog);
//console.log(npmlog.stream._isStdio);
//process.exit();

// This use async fs.functions, it's trouble maker.
function get_logger(){
    fs.stat(logfile, function(err, state){
        var size = state.size;
        //console.log(state);
        //console.log(size);
        //console.log(typeof size);
        if (size && size > 1000000){
            var backup_log = logfile + '.' + Date.now().toString();
            console.log("Move old logfile to : " + backup_log);
            fs.rename(logfile, backup_log, function(err){
                if(err) throw new Error(err.toString());
                set_stream();
            });
        }else{
            set_stream();
        }
        return npmlog;
    })
}

function get_logger_sync(){
    create_if_not_exists(); // This function has default file name: logfile.
    var state = fs.statSync(logfile);
    var size = state.size;
    if (size && size > 1000000){
        var backup_log = logfile + '.' + Date.now().toString();
        console.log("Move old logfile to : " + backup_log);
        fs.renameSync(logfile, backup_log);
    }
    set_stream();
    return npmlog;
}


function set_stream(){
    npmlog.stream = fs.createWriteStream(logfile, {flags:'a+'});
    //console.log("_isStdio : " + npmlog.stream._isStdio);
}


function change_log_file(filepath){
    npmlog.stream = fs.createWriteStream(filepath, {flags:'a+'});
    return npmlog;
    //console.log("_isStdio : " + npmlog.stream._isStdio);
}

function create_if_not_exists(filename){
    // get default value for log file name, which is set in ./config-mj.js
    var log_file_name = filename || logfile;
    //console.log(log_file_name);

    if( !fs.existsSync(log_file_name) ){
        // open and close to make sure the file created, not optimised way.
        var fd = fs.openSync(log_file_name, 'w+');
        //console.log(fd);
        fs.closeSync(fd);
    }
}
// test the function:
//create_if_not_exists('/tmp/abctestfile');
//create_if_not_exists();

module.exports.get_logger_sync = get_logger_sync;
module.exports.change_log_file = change_log_file;

//module.exports = get_logger_sync();
