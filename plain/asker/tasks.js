/*
 * Tasks can be asked for done, via zmq message.  It's using ./lh5.js,
 * on the other hand python is serving on localhost/127.0.0.1:5555
 *
 *  - folder ul, content with the html tag <ul>
 *
 * 2016 0409, 0412
 */



//var u = require("underscore");

//var localhost5555 = require("./lh5.js");
var localhost5555 = require("./client.0707.y6.js");

var p = console.log;

function  folder_ul(who, fopath, callback){
    var info = JSON.stringify( {
        "who": who,
        //"ask-for": 'folder.ul',
        "ask4": 'folder.ul',
        "path": fopath,
        "timeout": 3000
    });

    localhost5555.ask(info, function(err, reply){
        if(err) return callback(err);

        //var ul = get_ask_for(reply);
        var ul = reply.output;

        callback(null, ul);
    });
}
module.exports.folder_ul = folder_ul;


//d? 2016 0707
function get_ask_for(info){
    if(info[info['ask-for']]) return info[info['ask-for']];
    return null;
}
module.exports.get_ask_for = get_ask_for;


function file_text(who, fipath, callback){
    var info = JSON.stringify( {
        "who": who,
        //"ask-for": 'file.text',
        "ask4": 'file.text',
        "path": fipath,
        "timeout": 3000
    });

    localhost5555.ask(info, function(err, reply){
        if(err) return callback(err);
        //p('the reply: ', reply);

        //var text = get_ask_for(reply);
        var text = reply.output;
        callback(null, text);
    });
}
module.exports.file_text = file_text;


function  file_meta(who, fipath, callback){
    var info = JSON.stringify( {
        "who": who,
        //"ask-for": 'file.meta',
        "ask4": 'file.meta',
        "path": fipath,
        "timeout": 3000
    });

    p('going to ask for file meta, ', who, fipath);
    localhost5555.ask(info, function(err, reply){
        if(err) return callback(err);
        //var answer = get_ask_for(reply);
        var answer = reply.output;
        callback(null, answer);
    });
}
module.exports.file_meta = file_meta;


//d?
function tmp_thumb(who, fipath, w, h, callback){
    var info = JSON.stringify( {
        "who": who,
        //"ask-for": 'tmp.thumb',
        "ask4": 'tmp.thumb',
        "path": fipath,
        "width": w,
        "height": h,
        "timeout": 3000
    });

    localhost5555.ask(info, function(err, reply){
        if(err) return callback(err);
        //var ul = get_ask_for(reply);
        var ul = reply.output;
        callback(null, ul);
    });
}
module.exports.tmp_thumb = tmp_thumb;


function file_upload(file_info_json_stringified, callback){
    var info = JSON.stringify( {
        //"ask-for": 'file.upload',
        "ask4": 'file.upload',
        "file_info_jstr": file_info_json_stringified,
        "timeout": 3000
    });

    localhost5555.ask(info, function(err, reply){
        if(err) return callback(err);
        //var ul = get_ask_for(reply);
        var ul = reply.output;
        callback(null, ul);
    });
}
module.exports.file_upload = file_upload;



function meta_list(who, fopath, callback){
    var info = JSON.stringify( {
        "who": who,
        //"ask-for": 'meta.list',
        "ask4": 'meta.list',
        "path": fopath,
        "patstr": '.+',
        "timeout": 3000
    });

    localhost5555.ask(info, function(err, reply){
        if(err) return callback(err);
        //var ul = get_ask_for(reply);
        var ul = reply.output;
        callback(null, ul);
    });
}
module.exports.meta_list =meta_list;


function check_0411(name, what){
    name = name || 'unknown';
    what = what || 'some/folder/ul';

    folder_ul(name, what, function(err, rep){
        if(err) return p('ask for fo ul err: ', err);

        p(rep['folder.ul']);
    });
    setTimeout(process.exit, 5000);
}


function check_text(user_name, _path){
    user_name  = user_name || 'unknown';
    _path = _path || 'tmp/public/a.txt';

    file_text(user_name, _path, function(err, rep){
        if(err) return p('ask forfile txtrr: ', err);

        p(rep);
    });
    setTimeout(process.exit, 5000);
}


// 0419
function check_meta(user_name, _path){
    user_name  = user_name || 'unknown';
    _path = _path || 'tmp/public/a.txt';

    file_meta(user_name, _path, function(err, rep){
        if(err) return p('ask for file meta: ', err);

        p(rep);
    });
    setTimeout(process.exit, 5000);
}

if(require.main === module){
    var u = require("underscore");

    // 0510
    function check_meta_list(user_name, _path){
        user_name  = user_name || 'tmp';
        _path = _path || 'tmp/public';

        meta_list(user_name, _path, function(err, rep){
            if(err) return p('ask for file meta: ', err);

            p(u.keys(rep));
            setTimeout(process.exit, 5000);
        });
    }


    //check_0411('tmp', 'tmp/public');
    //check_text('tmp', 'tmp/public/a.txt');
    //check_meta('tmp', 'tmp/public/a.txt');

    check_meta_list();
}
