
// 2016 0409
//


var u = require("underscore");
var zmq = require('zmq');

var p = console.log;



/*
 * @info is object of key-values, such as:
 {
    "ask-for": 'folder.ul',
    "path": fopath,
    "timeout": 238,
    ...
 }
 */
function  ask(info, callback){
    var requester = zmq.socket('req');

    var timeout_mark = null;
    if(u.isNumber(info.timeout)){
        //p('set time out to ', info.timeout);
        timeout_mark = setTimeout(function(){
            //p('time out');
            requester.close();
        }, info.timeout);
    }

    requester.on("message", function(reply) {
        if(timeout_mark) clearTimeout(timeout_mark);
        try{
            var j = JSON.parse(reply.toString());
            callback(null, j);
        }catch(err){
            callback(err);
        }

    });

    requester.connect("tcp://localhost:5555");

    var strdata = JSON.stringify(info);
    requester.send(strdata);
}
module.exports.ask = ask;



process.on('SIGINT', function() {
    p('SIGINT');
    process.exit();
});


function check_0410(){
    ask({"ask-for": 'what.4:34', path:'tmp/public', timeout:3000}, function(err, rep){
        p(err, rep);
    });
}

if(require.main === module){
    check_0410();
}
