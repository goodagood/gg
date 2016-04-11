/*
 * Require a js config file, convert it to json file.
 */

var fs = require("fs");

var  in_file = "./pages.js"
var out_file = "./pages.json"

//var conf = require("./config.js");
var conf = require(in_file);

//console.log(conf);

var jstr = JSON.stringify(conf, null, 4);

console.log(conf);
fs.writeFile(out_file, jstr);
