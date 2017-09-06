/*
 * Render markdown text to html
 */


//function render_file_content(callback){
//    var path_chain = myutil.path_chain(Meta.dir, "/ls/"); // '/ls/' is start of the href
//    path_chain += Meta.name;
//    var path_html = '<div class="path_chain"> <span> File: </span>' + path_chain + '</div><hr />\n';
//    md_to_html(function(err, html){
//        var content = path_html + html;
//        callback(null, content);
//    });
//}



var marked = require('marked');
var color  = require('highlight.js');
/*
 * Convert markdown to html, not whole html page, but tags.
 */
// need test, 11 10
function md_to_html(markdown_string, callback){

    marked.setOptions({
        highlight : function(code){
            return color.highlightAuto(code).value;
        },
        //... more options
    });

    var html_string;
    try{
        html_string = marked(markdown_string);
        return callback(null, html_string);
    }catch(err){
        return callback(err);
    }
}


module.exports.md_to_html = md_to_html;
