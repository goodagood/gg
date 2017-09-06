// Easy to work in node.js REPL

var fs = require('fs');
var uuid = require('uuid');

// Set up logger
var npmlog = require('npmlog');
var logfile = '/tmp/logfile';
//npmlog.stream = fs.createWriteStream(logfile);


if(typeof util === 'undefined'){
  var util = require('util');
  //console.log("Oh, I had required `util` again\n");
}

if(typeof clog === 'undefined'){
  var mylog = console.log;
  var see  = util.inspect;
}

function check(what){
  mylog( see(what) );
}


function testlog(){
    var streama = fs.createWriteStream(logfile);
    npmlog.info('first');
    npmlog.info('second');
    npmlog.stream = streama;
    npmlog.info('first in file');
    npmlog.info('second in file');
}

function mujilog(fileName){
  //fs.open(fileName, "w+", function(err, fd){});
  var fsobj = util.inspect(fs);
  fs.writeFile(fileName, fsobj, function(err){
    if (err) throw err;
    console.log(fileName +  " writed.");
  });
}

//module.exports.check = check;

// 3 functions, each do a lot useless calculation to waste time.

function sqrtmm(number){
  // waste thousand time more than sqrt_million.
  number = number * 1000;
  for(var i =2; i < number; i++){
    sqrt_million(i)
  }
}

function sqrt_million(number){
  // Do a lot calculation according to `number`, to waste time;
  // Multiply by a million
  number = number * 1000000;
  for(var i =2; i < number; i++){
    sqrt_to_1(i)
  }
}
var waste_time = sqrt_million;

function sqrt_to_1(number){
  // calculate square root till it's 1.
  while(number > 1.0001){
    number = Math.sqrt(number);
  }
  //return number;
}


// hash
//var crypto = require('crypto');
//var name = 'braitsch';
//var hash = crypto.createHash('md5').update(name).digest('hex');
//console.log(hash); // 9b74c9897bac770ffc029102a200c5de

// random string:
// http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
//
// Explanation:
//
//     Pick a random number in the range [0,1), 
//     Convert the number to a base-36 string, i.e. using characters 0-9 and a-z.
//     Pad with zeros (solves the first issue).
//     Slice off the leading '0.' prefix and extra padding zeros.
//     Repeat the string enough times to have at least N characters in it 
//       (by Joining empty strings with the shorter random string used as the delimiter).
//     Slice exactly N characters from the string.
//
// Further thoughts:
//
// This solution does not use uppercase letters, but in almost all cases (no
// pun intended) it does not matter.
//
// All returned strings have an equal probability of being returned, at least
// as far as the results returned by Math.random() are evenly distributed (this
// is not cryptographic-strength randomness, in any case).
// 
// Not all possible strings of size N may be returned. In the second solution
// this is obvious (since the smaller string is simply being duplicated), but
// also in the original answer this is true since in the conversion to base-36
// the last few bits may not be part of the original random bits. Specifically,
// if you look at the result of Math.random().toString(36), you'll notice the
// last character is not evenly distributed. Again, in almost all cases it does
// not matter, but we slice the final string from the beginning rather than the
// end of the random string so that short strings (e.g. N=1) aren't affected.
//
function random_string(length){
    // default length: 8
    if (typeof length === 'undefined' || !length) length = 8;
    var N = length;
    return new Array(N+1).join((Math.random().toString(36)+'00000000000000000').slice(2, 18)).slice(0, N);
}


function make_random_string(length, possible)
{
    //var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    length = length || 8;
    possible = possible || "abcdefghijklmnopqrstuvwxyz0123456789";

    var possible_length = possible.length;
    var text = [];

    for( var i=0; i < length; i++ )
        text[i] = possible.charAt(Math.floor(Math.random() * possible_length));

    return text.join('');
}

function random_file_id_ms(){
    var milliseconds = Date.now().toString();
    var random_string8 = make_random_string(8); // 8 chars randomly
    return 'f' + milliseconds + random_string8;
}

function get_uuid(){
    return uuid.v4();
}

exports.mylog = module.exports.mylog = mylog;
exports.see = module.exports.see = see;
exports.check = module.exports.check = check;
exports.sqrt_million = module.exports.waste_time = sqrt_million;
exports.random_string = module.exports.random_string = random_string;

exports.make_random_string = module.exports.make_random_string = 
                             make_random_string;

exports.random_file_id_ms = module.exports.random_file_id_ms = 
                             random_file_id_ms;

exports.get_uuid = module.exports.get_uuid = get_uuid;
