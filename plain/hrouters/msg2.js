
// in dev. try to upgrade '/msgto/', 0228-2015.

var util  = require('util');

var msg_module = require('../aws/simple-msg.js');
var people     = require("../users/people.js");
var mytemplate = require('../myutils/template.js');

function get_msg2(req, res, next, callback){

    // get from: app.get('/msgto/:who?', 

    var username = req.user.username;
    var towhom   = req.params.who;
    if (!towhom) towhom = username;

    var towhom_checkbox = util.format( 
        '<input type="checkbox" name="users[]" checked="checked" value="%s"  />' + 
        ' <span class="username"> %s </span>\n', 
        towhom, towhom) ;


    people.make_people_manager_for_user(username).then(function(man){
        return man.get_a_few();
    }).then(function(name_list){
        var msg_list = '';  // make the list laster.?

        if(! u.isArray(name_list)) name_list = [];
        name_list.push(towhom);
        names = u.uniq(name_list);
        check_boxs = names_to_checkbox(names);

        var body_context = { 
            messageList : msg_list,
            username    : username, 
            towhom      : towhom,
            towhom_checkbox  : '',
            hidden_names:'',
            message     : '', 
            people_list : check_boxs,
        };

        var contexts = {
            frame  : {css : '<link rel="stylesheet" href="/static/css/msg2.css">\n', },
            header : {username: username,},
            body   : body_context,
            script : {towhom : towhom},
        };

        var html_elements = {
            body   : 'msg2-body.html',
            //header : 'empty-header.html',
            header: "ls2header.html",
            navbar : 'empty-navbar.html',
            script : 'msg2-script.html',
            frame  : 'frame-jqm.html',
        };

        mytemplate.assemble_html_v2(html_elements, contexts).then(function(html){
            //res.send(html);
            callback(null, html);
        });

    });

}


function post_msg2(req, res, next){
}

function names_to_checkbox(names){
  var checkboxs = names.map(function(name){
    return util.format( 
      '<label> <input type="checkbox" name="users[]"  value="%s"  /> ' + 
      '<span class="username"> %s &nbsp</span></label>' + "\n", 
      name, name) ;
  });
  var str_checkboxs = checkboxs.join(' ');
  //console.log('check boxs :\n', str_checkboxs);
  return str_checkboxs;
}



module.exports.get_msg2  = get_msg2;
module.exports.post_msg2 = post_msg2;




