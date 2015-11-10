var util = require('util');

var npmlog = require('npmlog');
var fs = require('fs');
//npmlog.stream = fs.createWriteStream('/tmp/log46', {flag:'w+'});

var a = {};
//a.prototype = Array;

a[0] = 8;
a[2] = 8;
a[3] = 8;
a[1] = 8;
console.log(a.length);
console.log(a);

//npmlog.info(util.inspect(Array, {showHidden:true}));
npmlog.info(util.inspect(a, {showHidden:true}));
