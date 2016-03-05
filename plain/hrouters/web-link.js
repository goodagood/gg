// Under url  /link/...
// to link sharing easy.

var express = require("express");
var router  = express.Router();


var cel = require('connect-ensure-login');

var path = require("path");
var u    = require("underscore");
var querystring = require('querystring');

var request = require("request");
//var url     = require("url");

var cwdChain = require("../cwd-chain/cwd-chain.js");
var p = console.log;

router.get("/a"
        , cel.ensureLoggedIn('/login')
        , function(req, res){

    var t   = new Date();
    var now = t.toString();
    p(req.query);
    var cwd = typeof req.query.cwd !== 'undefined' ? req.query.cwd : '';
    cwdChain.make_cwd_chain(cwd, function(err, cwd_chain){
        cwd_chain = cwd_chain || '';
        res.render( 'linka', {now:now, cwd:cwd, cwd_chain:cwd_chain} );
    });

});


/*
 * A web link, an href, and a description.
 * use note file to make 2 links: and direct <a> tag and /i-want-read?url=... 
 */
router.post("/put-a-link"
        , cel.ensureLoggedIn('/login')
        , function(req, res, next){

            p('req body: ', req.body);

    var data        = {};
    data.link       = req.body['web-link'];
    data.description= req.body['description'];
    data.cwd        = req.body.cwd;
    data.user       = req.user;
    p('data: ', data);
    if(!data.cwd || !data.user || !data.user.username) return res.end('no cwd or user or  username');

    p(data);
    var to = '/link/a?' + querystring.stringify({cwd:data.cwd});

    write_link_as_note_file(data, function(err, note_file){
        if(err) return  res.end(err.toString());
        res.redirect(to);
    });
});


/*
 * required by note file:
 * meta: {
 *   title    : 
 *   text     :
 *   username : 
 *   userid   :
 *   cwd      :
 * }
 */
var note        = require("../aws/note-file.js");
function write_link_as_note_file(data, callback){
    p('write link as note got data: ', data);
    var title    = short_string(data.description) || '??title??';
    var username = data.user.username;
    if(!username) return callback('no username', null);

    // should change to /tec-doc/(data.link) 2016 0222
    var pipe_href = '/i-want-read?' + querystring.stringify({url: data.link});
    var short_link_str = short_string(data.link) || '??short-link-str??';

    var text = title + '<br>';
    text    += "\n";
    // link
    text    += 'Link <a class="button" target="_blank" href="' + data.link + '"> '; 
    text    += '<i class="fa fa-link"></i> : ' + short_link_str +'</a> <br>' ;
    text    += "\n";
    // pipe
    text    += 'Pipe <a target="_blank" href="' + pipe_href + '"> '; 
    text    += '<i class="fa fa-clone"></i>of the link</a> <br>';
    text    += "\n";

    _meta = u.defaults(data,  {
        title   : title
        , text  : text
        , username: username
    });
    //p('the meta: ', _meta);
    //return callback(null, _meta); //in dev.

    note.write_note_0514(_meta, function(err, note_obj){
        if(err) return callback(err, null);

        callback(null, note_obj);
    });

}


router.get(/^\/proxy\/(.+)/
        , cel.ensureLoggedIn('/login')
        , function(req, res){

    //
    var href = req.params[0];

    if(!href) return res.end("<h1>err: no href</h1>");

    var reg = /^http/i;
    if(! reg.test(href)) href = 'http://' + href;

    request(href).pipe(res);
});


router.get(/^\/double\/(.+)/
        , cel.ensureLoggedIn('/login')
        , function(req, res){

    //
    var href = req.params[0];

    if(!href) return res.end("<h1>err: no href</h1>");

    //var reg = /^http/i;
    //if(! reg.test(href)) href = 'http://' + href;

    //request(href);

    var context = {src:href, };

    res.render('link-double.html', context);
});

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

/*
 *
 */
function short_string(str){
    var txt;

    if(!u.isString(str)){
        txt = str.toString();
    }else{
        txt = str;
    }

    if(!txt) return str;
    if(!u.isString(txt)) return str;

    if(txt.length < 31) return txt;

    txt = txt.slice(0, 25) + ' ...';

    return txt;
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

if(require.main === module){
    //test_write();
    make_qs();
}
