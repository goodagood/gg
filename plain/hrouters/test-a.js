// -- under url  /test/...

var express = require("express");
var router  = express.Router();

var cel = require('connect-ensure-login');

var path = require("path");
var u    = require("underscore");

var css        = require('../aws/css-file.js');
var mytemplate = require('../myutils/template.js');

var filelist   = require('./file-list-v2.js');
var people_ed  = require("../users/people-edit.js");

var p = console.log;


router.get("/a", function(req, res){
    var user = 'oo';
    if(req.user) user = JSON.stringify(req.user);
    var t   = new Date();
    var now = t.toString();
    res.render( 'testa', {now: user} );
    //res.send( t.toString() );
});


// fiddle with backbone todos example:
router.get("/todo", function(req, res){
    todo_html().then(function(html){
        res.send(html);
    });
});

var post_todo = require('./post-todo.js');
router.post("/todo", function(req, res, next){
    post_todo.post_todo(req, res, next);
});

router.post("/read-json", function(req, res, next){
    // read the todo file, which path is: body.fileinfo.file_path,
    // convert to array of todo json, then send the json, 
    post_todo.post_read_json(req, res, next);
});

router.post("/set-file-meta", function(req, res, next){
    post_todo.set_file_meta(req, res, next);
});

router.post("/set-file-unique", function(req, res, next){
    post_todo.set_file_unique(req, res, next);
});

router.get("/todo-test", function(req, res){
    fiddle_html_client_test().then(function(html){
        res.send(html);
    });
});


// try to make backbone todo example use a file as data store.
// use 'post /todo' as data post
// '/todo' has been hacked a little, it works, start more hack here.
// 0315, 2015
//router.get("/ftodo", function(req, res){
router.get(/^\/ftodo(.*)/, function(req, res){
    var todo_filename = '.todo.json';

    var todo_file_path = req.params[0];
    todo_file_path = todo_file_path.trim();
    // get rid of the first '/'
    if(todo_file_path[0] = '/') todo_file_path = todo_file_path.slice(1);

    console.log('ftodo get todo_file_path: ', todo_file_path);

    // for dev. only:
    if(!todo_file_path) todo_file_path = path.join('abc/test/', todo_filename);

    var contexts = {'script':{'file_path':todo_file_path}};
    ftodo_html(contexts).then(function(html){
        res.send(html);
    });
});


/*
 * This is changing /people 
 * But I am trying to make it simple, in the following /man
 * 2015, 0712
 */
router.get("/people_a", cel.ensureLoggedIn('/login'), function(req, res){

    var username = req.user.username;

    people_ed.page_one(username).then(function(html){
        res.send(html);
    });
});


router.get('/addpeople/:name', function(req, res){

    var username = req.user.username;
    var people_name = req.params['name'];
    console.log(username, ' add ', people_name);
    people_ed.add_people(username, people_name).then(function(){
        res.json({username:username, peoplename:people_name});
    });
    //res.render('adduser', { user: req.user, message: req.flash('error') });
});

//// copy /ls
//router.get(/^\/sample\/(.*)/, 
//    //cel.ensureLoggedIn('/login'),
//    function(req, res, next){
//        var cwd  = req.params[0];
//        var username = req.user.username;
//        if( typeof cwd === 'undefined' || !cwd ) cwd = username; //dir anyway.
//
//        //log28('username, cwd in ls', [username, cwd]);
//
//        ls_for_username(username, cwd, function(err, html){
//            res.send(html);
//        });
//});

router.get("/man", cel.ensureLoggedIn('/login'), function(req, res){
    var username = req.user.username;

    // file name of the template is hard-coded, ../handlebars-views/man-people.html
    var template_path = path.join(path.dirname(__dirname), "handlebars-views/man-people.html");
    p('template path: ', template_path);

    var context = {username:username,};

    var pman = require('../users/people-v2.js');
    var lutil = require("./utils.js");
    pman.get_a_few_build_name_list(username, function(err, list){
        context.people_list = list;
        p('here, context: ', context);

        lutil.render_template(template_path, context, function(err, html){
            res.send(html);
        });
    });
});

// in dev. try to upgrade get '/msgto/', 0226-2015.
router.get("/msg2/:username", cel.ensureLoggedIn('/login'), function(req, res, next){

    var msg2 = require('./msg2.js');

    msg2.get_msg2(req, res, next, function(err, html){
        res.send(html);
    });

});

var value = require('../file-value/value.js');
router.post("/add-file-value/", function(req, res, next){
    var path_uuid = req.body['path_uuid'];
    console.log('add file value got file path uuid: ', path_uuid);
    if(!path_uuid) {return res.json({err:'no path uuid?'});};

    value.add_value(path_uuid, 1, function(err, number){
        res.json({path_uuid: path_uuid});
    });

});


var client_need_json = require('../aws/client-json-filter.js');

router.post("/file-meta-json", function(req, res, next){
    var body = req.body;

    var path_uuid = body.path_uuid;
    client_need_json.file_meta_for_client(path_uuid, function(err, json){
        if(err) return res.json({err:err});
        res.json(json);
    });
});

router.post("/file-meta-list-json", function(req, res, next){
    var body = req.body;

    var folder_path = body.folder_path;
    client_need_json.file_metas_for_client(folder_path, function(err, meta_list){
        if(err) return res.json({err: 'err when get folder or file meta list'});
        res.json(meta_list);
    });
});


// get: set folder meta
// To set attribute like listor, 0518
router.get(/^\/sfmeta\/(.+)/,
        cel.ensureLoggedIn('/login'),
        function(req, res){

    var cwd = req.params[0];
    cwd = cwd.trim();
    p('get /text/sfmeta/(.+)/, cwd: ', cwd);

    var username = req.user.username;
    var id       = req.user.id;

    var full_url = req.protocol + '://' + req.get('host') + req.originalUrl;
    p('full url: ', full_url);

    var context = {
        cwd: cwd,
        cwd_chain: cwd, //tmp solution
        username: username,
        userid  : id,
        title   : 'set some folder meta',
        action  : '/test/sfmeta',
        url     : full_url,
    };

    res.render( 'sfmeta', context );
    //res.send( t.toString() );
});


var folder_tools = require("../aws/folder-tools.js");
router.post("/sfmeta", function(req, res, next){

    p('post /sfmeta');
    p(req.body, "\n", req.user); 
    var username = req.user.username;
    var id       = req.user.id;

    var options = {};
    options.listor  = {};
    if(req.body.listor) options.listor['default'] = req.body.listor;
    if(req.body.cwd){
        folder_tools.set_folder_meta(req.body.cwd, options, function(err, whatever){
            var url = '/test/sfmeta/' + req.body.cwd;
            if(req.body.url) url = req.body.url;
            res.redirect(url);
        });
    }else{
        res.redirect('/');
    }
});


var user_icon = require("../users/user-icon.js");
router.get("/find-user-icon/:name/:w/:h", function(req, res, next){
    // user's name, icon's width and height:
    var name = req.params.name;
    var w  = req.params.w;
    var h  = req.params.h;
    //console.log('get icon: ', name, w, h);
    var opt={username:name, w:w, h:h};

    user_icon.find_user_icon(opt, function(err, icon_file){
        //console.log('1, in find user icon, err?', err?err:'no err');
        if(err) return  res.end();
        //console.log('2, in find user icon');

        var opt = {w:w, h:h};
        icon_file.callback_thumb_read_stream(opt, function(err, stream){
            if(err) return  res.end();
            //console.log('going to pipe.')
            stream.pipe(res);
        });
    });
});

router.get("/find-folder-icon", function(req, res, next){
    // folder_path, icon's width and height:
    var dir = req.query.dir;
    var w  = req.query.w;
    var h  = req.query.h;
    if(!dir){
        console.log('find folder icon?: dir w h ', dir, w, h);
        return res.end();
    }

    user_icon.find_icon_file_in_folder(dir, function(err, icon_file){
        //console.log('1, in find user icon, err?', err?err:'no err');
        if(err) return  res.end();
        //console.log('2, in find user icon');

        var opt = {w:w, h:h};
        icon_file.callback_thumb_read_stream(opt, function(err, stream){
            if(err) return  res.end();

            //console.log('folder icon, going to pipe.')
            stream.pipe(res);
        });
    });

    // in dev:
    //res.end("<h1>" +dir + ', w: ' + w + ', h: ' + h + "</h1>");
});

router.get("/find-root-or-user-icon", function(req, res, next){
    // folder_path, icon's width and height:
    var root_id = req.query.root_id;
    var w  = req.query.w;
    var h  = req.query.h;
    if(!root_id){
        console.log('find root or user icon?: root_id w h ', root_id, w, h);
        return res.end();
    }

    user_icon.find_home_or_user_icon_by_id(root_id, function(err, icon_file){
        //console.log('1, in find root or user icon, err?', err?err:'no err');
        if(err) return  res.end();
        //console.log('2, in find root or user icon');

        var opt = {w:w, h:h};
        icon_file.callback_thumb_read_stream(opt, function(err, stream){
            if(err) return  res.end();

            console.log('find root or user icon, going to pipe.')
            stream.pipe(res);
        });
    });

    // in dev:
    //res.end("<h1>" +dir + ', w: ' + w + ', h: ' + h + "</h1>");
});

//   /^\/ftodo(.*)/
router.get(/^\/run(.+)/, function(req, res, next){
    // folder_path, icon's width and height:

    var to_run_file_path = req.params[0];
    var error = null;

    try{
        var run = require("./run-js-file.js");
        run.run_js(to_run_file_path);
    }catch(err){
        if(err) error = err;
    }
    res.end("<h1>" + to_run_file_path + " </h1> <p> error: " + error + "</p>");
});




module.exports = router;



// prepare to do a page of backbone ... 0106



function  todo_html() {

    html_files = {
       header : 'empty-header.html',
       navbar : 'empty-navbar.html',
       body   : 'todo-body.html',
       footer : 'empty-footer.html',
       css    : 'todo-css.html',
       script : 'todo-script.html',
       template : 'todo-template.html',

       frame  : 'frame-backbone.html'
    };

    contexts = {
       body: { },
       header: { },
    };

    return mytemplate.assemble_html_v2(html_files, contexts);
}

function ftodo_html(contexts) {

    var html_files = {
       header : 'empty-header.html',
       navbar : 'empty-navbar.html',
       body   : 'todo-body.html',
       footer : 'empty-footer.html',
       css    : 'todo-css.html',
       script : 'ftodo-script.html',
       template : 'todo-template.html',

       frame  : 'frame-backbone.html'
    };

    var final_contexts = u.defaults(contexts, {
       body: { },
       header: { },
    });

    return mytemplate.assemble_html_v2(html_files, final_contexts);
}


function  fiddle_html_client_test() {

    html_files = {
       body   : 'todo-body.html',
       //header : 'goodheader.html',
       //navbar : 'people-file-navtabs.html',
       css    : 'todo-css-test.html',
       script : 'todo-script-test.html',
       template : 'todo-template.html',
       frame  : 'frame-backbone.html'
    };

    contexts = {
       body: { },
       header: { },
    };

    return mytemplate.assemble_html_v2(html_files, contexts);
}




