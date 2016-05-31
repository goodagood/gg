
/*
 * Render json/meta to <ul><li>...
 * 2016 0525
 */

var u = require("underscore");

var p = console.log;


function json_to_ul(j, level){
    level = level || 0;

    var lis = [];
    u.each(j, function(value, name){
        lis.push(`
            <li class="name_value">
                <span class="name"> ${name}   </span>
                <span class="value"> ${value} </span>
            </li>
        `);
    });

    var li_as_str = lis.join("");

    return `
        <ul class="name_value_list"> 
            ${li_as_str}
        </ul>
        `;
}



if(require.main === module){
    var a = {
        a:1,
        b:2,
        c: 'letter c'
    };
    u.each(a, function(a,b,c){
        p(a,b,c);
    });
}


    var aa = {
        a:1,
        b:2,
        c: 'letter c'
    };
    u.each(aa, function(a,b,c){
        p(a,b,c);
    });

var jul = json_to_ul(aa, 0);
p(jul);
