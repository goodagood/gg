
/*
 * Should be moved to ../myutils/
 * 2015, 0726
 */


var fs         = require("fs");
var handlebars = require("handlebars");


/*
 * Render handlebars template, template file read from @abs_template_path.
 */
function render_template(abs_template_path, context, callback){
    fs.readFile(abs_template_path, {'encoding':'utf-8'}, function(err, tpl_text){
        if(err) return callback(err, null);

        try {
            var template  = handlebars.compile(tpl_text);
            var renderred = template(context);
        } catch (_error) {
            return callback(_error, null);
        }
        callback(null, renderred);
    });
}


function render_template_str(str, context, callback){
    try {
        var template  = handlebars.compile(str);
        var renderred = template(context);
    } catch (_error) {
        return callback(_error, null);
    }
    callback(null, renderred);
}


module.exports.render_template     = render_template;
module.exports.render_template_str = render_template_str;

