
/*
 * ask for folder listing
 * 2016 0530
 */


//var localhost5555 = require("./lh5.js");
var localhost5555 = require("./client.0707.y6.js");

var get_ask_for = require("./tasks.js").get_ask_for;

var p = console.log;



function  folder_list(who, cwd, callback){
    var info = JSON.stringify( {
        "who": who,
        //"ask-for": 'folder_list', // this is underscore
        "ask4": 'folder_list', // this is underscore
        "path": cwd,
        "timeout": 3000
    });

    localhost5555.ask(info, function(err, reply){
        if(err) return callback(err);
        p('folder list, 5555 reply: ', reply);

        //var rep = get_ask_for(reply);
        var rep = reply.output;

        callback(null, rep);
    });
}
module.exports.folder_list = folder_list;



if(require.main === module){
    //var u = require("underscore");

    function c_folder_list(){
        var username = 'tmp';
        var cwd = 'tmp/public';
        folder_list(username, cwd, function(err, res){
            p(err, res);

            setTimeout(process.exit, 5000);
        });
    }
    c_folder_list();
}
