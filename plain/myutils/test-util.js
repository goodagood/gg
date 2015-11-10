
Promise = require("bluebird");
u       = require("underscore");

//var test   = require('nodeunit');
var myutil = require('./myutil.js');


exports = module.exports;

exports.p  = console.log;


exports.stop = function(period) {
    var milli_seconds;
    period = period || 1;
    if (!u.isNumber(period)) {
        period = 1;
    }
    milli_seconds = period * 1000;
    return setTimeout(process.exit, milli_seconds);
};


var sleep = function(seconds, callback){
    var seconds = seconds || 1;
    var milli_sec = seconds * 1000;

    setTimeout(function(){
        callback(null, seconds);
    }, milli_sec);
};

exports.sleep = sleep;
exports.promise_to_sleep = Promise.promisify(sleep);


var sleep_again = function(seconds){
  if(! u.isNumber(seconds)) seconds = 1
  seconds = seconds || 1;

  var milli = seconds * 1000;

  return new Promise(function(resolve){
    setTimeout(resolve, milli);
  });
}
exports.sleep_again = sleep_again;
// It's actually not sleep, the process get all other events firing, 
// This is setTimeout hack for all 'sleep' like things.
exports.idle_out    = sleep_again;



function is_string_or_null(what){

    if(what === null) return true;
    if(typeof what === 'string') return true;
    return false;
}

exports.is_string_or_null = is_string_or_null;


if(require.main === module){
}


// vim: set et ts=4 sw=4 fdm=indent:
