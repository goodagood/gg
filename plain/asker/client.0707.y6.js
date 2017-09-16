
// 2016 0409
//


var u = require("underscore");
var zmq = require('zmq');


var ADDR = "tcp://localhost:5555";
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

    //## Set time out if specified
    var timeout_mark = null;
    if(u.isNumber(info.timeout)){
        //p('set time out to ', info.timeout);
        timeout_mark = setTimeout(function(){
            p('time out');
            requester.close();
        }, info.timeout);
    }


    //## On 'message' event, callback with json contains output, and close.
    requester.on("message", function(reply) {
        if(timeout_mark) clearTimeout(timeout_mark);
        try{
            var j = JSON.parse(reply.toString());
            callback(null, j);
        }catch(err){
            callback(err);
        }

        requester.close();
    });

    //## connect and send the info, which should be 'input'
    //requester.connect("tcp://localhost:5555");
    if(info.address){
        ADDR = info.address;
        delete info.address;
    }
    requester.connect(ADDR);

    try{
        var strdata = JSON.stringify(info);
        //p('str data to send request: ', strdata);
        requester.send(strdata);
    }catch(err){
        callback(err);
    }
}
module.exports.ask = ask;




if(require.main === module){

    process.on('SIGINT', function() {
        p('SIGINT');
        process.exit();
    });



    function check_0410(){
        ask({"ask-for": 'what.4:34', path:'tmp/public', timeout:3000}, function(err, rep){
            p(err, rep);
        });
    }
    function check_0526(){
        ask(JSON.stringify({
            "who": 'any one',
            "ask-for": 'two_n_two',
            "path":'tmp/public',
            "timeout":3000
        }),
        function(err, rep){
            p('any?');
            p(err, rep);
        });
    }


    function check_0701(){
        ask({"ask4": 'foo', path:'tmp/public', timeout:3000}, function(err, rep){
            err ? p(err) : p(rep);
            p(typeof(rep)); p(Object.keys(rep));
            process.exit();
        });
    }

    //check_0410();
    //check_0526();
    check_0701();
}
