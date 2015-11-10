var util = require('util');

var npmlog = require('npmlog');
var fs = require('fs');
//npmlog.stream = fs.createWriteStream('/tmp/log46', {flag:'w+'});

// object and prototype:
var obj = new Object(); // not a functional object
//obj.prototype.test = function() { console.log('Hello?'); }; // this is wrong!

function MyObject() {} // a first class functional object
MyObject.prototype.test = function() { console.log('OK'); } // OK


console.log(a.length);
console.log(a);

//npmlog.info(util.inspect(Array, {showHidden:true}));
npmlog.info(util.inspect(a, {showHidden:true}));
