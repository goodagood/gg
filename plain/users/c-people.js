
/*
 * It's looks good to put coffee and test close to it's target.  2016 0128.
 *
 * Check people.coffee/js, and people-tool.js
 */

var people = require("./people.js");
var user   = require("./a.js");
var pt     = require("./people-tool.js");

var u      = require("underscore");
var Promise= require("bluebird");
var fs     = require("fs");

var p      = console.log;


//var promise_to_get_user_id = Promise.promisify(user.get_user_id);


function get_people_manager_any_way(username){
    username = username || 'abc';

    people.get_people_manager_any_way(username, function(err, pman){
        if(err) return p(err);

        p(err, u.keys(pman).sort().join("  \t  "));
        pman.add_people('cat-01').then(function(what){
            p('after add people we got, what?   \t  ');
            p(u.keys(what).sort().join("  \t  "));
        }).catch(function(err){
            p('we caught err');
            p(err);
        });
    });
}


function shellDrop(username){
    if(u.isObject(this.o)) this.oldo = this.o;
    this.o = {};
    username = username || 'abc';

    people.get_people_manager_any_way(username, function(err, pman){
        if(err) return p(err);

        p(err, u.keys(pman).sort().join("  \t  "));
        this.o.man = pman;
    });
}

function add(me, who){
    me = me || 'abc';
    who= who|| 'cat-02';

    pt.add_people(me, who, function(err, man){
        p(err, man);
    });
}

function render(who){
    who= who|| 'cat-02';
    pt.render_people_list(who, function(err, html){
        if(err) return p(err);
        if(u.isString(html)){
            p('is string; ', u.isString(html), html.length);
            fs.writeFile("/tmp/pl.html", html, function(){p('wrote?');});
        }
    })
}


function get_id(who){
    who = who || 'abc';

    people.promise_to_get_user_id(who).then(function(user_id){
        p('user id: ', user_id);
    }).catch(function(err){
        p(err);
    });
}

if(require.main === module){
    //get_people_manager_any_way();

    //add('abc', 'cat-02');
    render('abc');
    //get_id();
    setTimeout(function(){
        p('process.exit.');
        process.exit();
    }, 15*1000);
}

//shellDrop('cat-01');
p('ok start interact:');
