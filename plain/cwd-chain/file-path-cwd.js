
var path  = require("path");

var chain = require("./cwd-chain.js");


function make_cwd_html(file_path, prefix){
    prefix = prefix || '/ls';
    if(!file_path) return null;

    var cwd = path.dirname(file_path);
    var file_name = path.basename(file_path);

    var cwd_html = chain.cwd_chain(cwd, prefix);

    cwd_html = cwd_html + "\n";
    cwd_html = cwd_html + '<span class="file_name">' + file_name + '</span>';
    cwd_html = cwd_html + "\n";
    return cwd_html;
}


module.exports.make_cwd_html = make_cwd_html;



// fast checkings 
var p = console.log;

function check_return_cwd_chain(){
    var cwd = 'a/b/c/d/e/f/what.md';
    var chain = make_cwd_html(cwd, '/ls');
    p('chain: '); p(chain);

    process.exit();
}


if (require.main === module){
    check_return_cwd_chain();
}


