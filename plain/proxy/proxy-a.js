
// Under url  /link/...
// to link sharing easy.

var express = require("express");
var router  = express.Router();



var path = require("path");
var u    = require("underscore");
var querystring = require('querystring');

var request = require("request");
//var url     = require("url");

var fs = require('fs');

var p = console.log;






//router.get(/^\/proxy\/(.+)/
//        , cel.ensureLoggedIn('/login')
//        , function(req, res){
//
//    //
//    var href = req.params[0];
//
//    if(!href) return res.end("<h1>err: no href</h1>");
//
//    var reg = /^http/i;
//    if(! reg.test(href)) href = 'http://' + href;
//
//    request(href).pipe(res);
//});



// todo, 0623
/*
 * Change relative path to absolute path
 */
function absolute_path(base, relative) {
    var stack = base.split("/"),
        parts = relative.split("/");

    stack.pop(); // remove current file name (or empty string)
    // (omit if "base" is the current folder without trailing slash)
    for (var i=0; i<parts.length; i++) {
        if (parts[i] == ".")
            continue;
        if (parts[i] == "..")
            stack.pop();
        else
            stack.push(parts[i]);
    }
    return stack.join("/");
}

/*
 * Chain it, for example: /link/proxy/http://www.google.com
 * where: /link/proxy/ is the prefix, http://www.google.com is the path_
 */
function chain_path(prefix, path_){
    return prefix + path_;
}


module.exports = router;


//-- checkings
var stop = function() { return setTimeout(process.exit, 1000); };

function test_write(){
    p('hemm');
    var data = { };
    data.link       = 'www.google.com';
    data.description= 'testing _write_ *link* as note file';
    data.cwd        = 'abc/test';
    data.user       = {username:'abc', id:'abc'};

    write_link_as_note_file(data, function(err, what){
        //p('err, what ', err, what);
        p('err  ', err);
        stop();
    });
}

function make_qs(){
    // make query string
    p( querystring.stringify({cwd:'abc/test'}));
    stop();
}

function get_request(href){
    href = href || 'google.com';

    var reg = /^http/i;
    if(! reg.test(href)) href = 'http://' + href;

    request(href, function(err, response, body){
        p(err);
        //p(response);
        p(body.slice(0, 300));
        p('typeof body: ', typeof body);
        var indx = body.search('</html>');
        p('indx :', indx);
        p(body.slice(indx, 300));
    });
    //p(request);
    //p(u.keys(request));
    //p(request.pipe);
    //p(request(href));
    //p(u.keys(request(href)).sort().join(', '));
    //request(href).pipe(fs.createWriteStream('/tmp/a.html'));
}

function convert_links(href){
    href = href || 'google.com';

    var reg = /^http/i;
    if(! reg.test(href)) href = 'http://' + href;

    request(href, function(err, response, body){
        p(err);
        //p(response);
        p(body.slice(0, 300));
        p('typeof body: ', typeof body);
        var indx = body.search(/<\s*a\s+href="[^"]+"/);
        p('indx :', indx);
        p(body.slice(indx, 300));
    });
}

if(require.main === module){
    //test_write();
    //make_qs();
    convert_links();
}



