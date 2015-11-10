
var people  = require("./people.js");
var mytemplate = require('../myutils/template.js');

var p = console.log;

function prepare_people_data(username){
    people.make_people_manager_for_user(_test_user_name).then(function(man){
        p('manager: \n', man);
        Man = man;
        return Man.get_json();
    }).then(function(j){
        p('json:\n', j);
        return Man.get_recent();

    }).then(function(r){
        p('recent:\n', r);
        stop();
    });

}


function retrieve_people_data(username){
    var Man = {};
    var Json; // date of peoples/teams

    return people.make_people_manager_for_user(username).then(function(man){
        //p('manager: \n', man);
        Man = man;
        return Man.get_json();
    }).then(function(j){
        Json = j;
        if(u.isEmpty(j.current)) return Man.get_a_few();
        return Json.current;
    }).then(function(afew){
        Json.current = afew;
        return Json
    });

}


function assemble_page_one(man_json){
    var people  = man_json.people.join(" ");
    var current = man_json.current.join(" ");

    var contexts = {
        body : {people_list: people , current_people: current,},
        //header : {username: man_json.username},
    };

    var html_elements = {
        body   : 'people-body.html',
        navbar : 'people-file-navtabs.html',
        //navbar : 'file-navbar.html',
        css    : 'people-css.html',
        script : 'people-p1-script.html',
    };

    // return the promise
    return mytemplate.assemble_html_v2(html_elements, contexts);
}


function page_one(username){

    //var test_username = 'abc';
    return retrieve_people_data(username).then(function(json){
        //p('get what?\n', json);
        return assemble_page_one(json);
    });
}

function add_people(username, another_user){
    // user add another user to list of people.

    var Man = null;
    return people.make_people_manager_for_user(username).then(function(man){
        //p('manager: \n', man);
        return Man = man;
    }).then(function(man){
        return Man.add_people(another_user);
    });

}




module.exports.page_one   = page_one;
module.exports.add_people = add_people;

// -- checkings -- //

var stop = function(seconds) {
    var seconds = seconds || 1;
    var milli_sec = seconds * 1000;
    setTimeout(process.exit, milli_sec);
};

function check_assemble_html(){
    var test_username = 'abc';
    retrieve_people_data(test_username).then(function(json){
        p('get what?\n', json);
        return assemble_page_one(json);
    }).then(function(html){
        //p('got html:\n', html);
        stop();
    });
}


if(require.main === module){
    check_assemble_html();
}


