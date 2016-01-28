
/*
 * tools such as add user to people manager, remove, add team, etc.
 *
 * 2016 0128
 */


var people = require("./people.js");
//var user   = require("./a.js");

var u      = require("underscore");
var path   = require("path");
//var Promise= require("bluebird");

var p      = console.log;


function add_people(me, who, callback){
    if(!u.isString(me) || !u.isString(who)) return callback('user name must both be string');

    people.get_people_manager_any_way(me, function(err, pman){
        pman.add_people(who).then(function(){
            callback(null, pman);
        }).catch(callback);
    });
}


var mkul = require("../myutils/mk-ul.js");
var tpl  = require("../myutils/tpl.js");
var tpl_file = path.resolve("../handlebars-views/people-list-2016-0128.html");

function render_people_list(username, callback){
    if(!u.isString(username)) return callback('user name must both be string');
    p('render peopel list for : ', username);

    people.get_people_manager_any_way(username, function(err, pman){
        if(err) return callback(err);
        pman.get_json().then(function(j){

            var context = {};
            context['metas'] = mkul.to_ul(j);
            //p(context);
            tpl.render_template(tpl_file, context, function(err, html){
                if(err) return callback(err);
                p('gont to callback with html: ', html);
                callback(null, html)
            });
        }).catch(callback);
    });
}


module.exports.add_people = add_people;
module.exports.render_people_list = render_people_list;
