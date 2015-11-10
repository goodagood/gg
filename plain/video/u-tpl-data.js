/*
 *  Check tpl-data.js
 */


var tpl_data = require("./tpl-data.js");

var tags = require("./tags.js");

var p = console.log;


function get_file_info(){
    var meta = require("./sample-meta.js").data;

    var data = tpl_data.get_file_info(meta);
    p(data);
}


function tags_a(){
    var meta = require("./sample-meta.js").data;

    var data = tpl_data.get_file_info(meta);

    //var a = tags.kv_li('name', 'value');
    //p(a);

    var b = tpl_data.make_file_info_tags(data);
    p(b);
}


if(require.main === module){
    //get_file_info();
    tags_a();
}
