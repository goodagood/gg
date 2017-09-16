
//  2016 0306

/*
 * Set a message string in query string.
 */

var querystring = require("querystring");
var u           = require("underscore");

const Msg_Name = 'ggmsg';


function add_ggmsg(msg, href){
    var obj = {'ggmsg': msg};
    var str = querystring.stringify(obj);

    if(href){
        str = `${href}?${str}`;
    }

    return str;
}
module.exports.add_ggmsg = add_ggmsg;


/*
 * Get the message added,
 * but also get flash message from connect-flash
 *
 *   
 */
function get_ggmsg(req, flash_title){
    var msgs = [];
    if(req.query){
        msgs.push(req.query[Msg_Name]);
    }
    if(flash_title){
        if(req.flash){
            msgs.push(req.flash(flash_title));
        }
    }
    return msgs;
}
module.exports.get_ggmsg = get_ggmsg;


function html_list_msgs(msgs){
    var ul = '';
    if(msgs){
        ul += '<ul class="message-list">\r\n';
        u.each(msgs, function(msg){
            if(msg){
                ul += `<li class="one-message"> ${msg} </li> \r\n`;
            }
        });
        ul += '</ul>\r\n';
    }
    return ul;
}
module.exports.html_list_msgs = html_list_msgs;


/*
 * As convenient tool to give ul list of possible messages from request object.
 */
function list_msgs(req){
    return html_list_msgs(get_ggmsg(req));
}
module.exports.list_msgs = list_msgs;

if(require.main === module){
    var p = console.log;

    p(add_ggmsg('no user found', '/login/'));
}
