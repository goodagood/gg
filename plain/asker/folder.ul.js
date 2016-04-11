

// try to ask for folder ul, by zmq
// 2016 0409
//


var u = require("underscore");
var zmq = require('zmq');

var localhost5555 = require("./lh5.js");

var p = console.log;

function  folder_ul(who, fopath, callback){
    var info = JSON.stringify( {
        "who": who,
        "ask-for": 'folder.ul',
        "path": fopath,
        "timeout": 3000
    });

    localhost5555.ask(info, callback);
}



process.on('SIGINT', function() {
  requester.close();
});


function check_0411(name, what){
    name = name || 'unknown';
    what = what || 'some/folder/ul';

    folder_ul(name, what, function(err, rep){
        p(err, rep);
    });
    setTimeout(process.exit, 5000);
}

if(require.main === module){
    check_0411('tmp', 'tmp/public');
}
