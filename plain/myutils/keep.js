/*
 * 2016 0115
 */

var u = require("underscore");


function keep(hash, names){
    if(u.isEmpty(names)) return hash ;

    var kept = {};
    u.each(names, function(n){
        kept[n] = hash[n];
    });
    return kept;
}
module.exports.keep = keep;

