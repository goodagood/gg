
var u = require("underscore");

/*
 * random_str will generate a string contains char from First_Last and Valid.
 *
 * To be easily readable, in the random string there is no:
 *   O: 0 vs O; big 'O'ld is not there because zero '0' hate it.
 *   l: 1 vs l; small 'l'ittle is not there because one '1' hate it.
 *
 *   no other symbol beside the two: '-.' because aws s3 keys might trouble them.
 */
const First_Last = 'abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ';
const Valid = 'abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ0123456789-.';


function random_char(candidates){
    candidates = candidates || First_Last;

    var number = candidates.length;
    var sequence = Math.floor(Math.random() * number);
    return candidates[sequence]
}

function random9(len){
    len = len || 9;

    if(!u.isNumber(len)) return null;
    if(len <= 0)         return null;
    if(len <  3) throw new Error('random9 would not generate string less than 3 chars');

    var astr = [];
    astr.push(random_char(First_Last));
    if(len >= 3){
        for(var i = 2; i < len; i++ ){
            astr.push(random_char(Valid));
        }
    }
    astr.push(random_char(First_Last));
    return astr.join('');
}


function random_str(len){
    if(!len){
        len = 3 + Math.floor(Math.random() * 7.0);
    }
    if(len < 3) len = 3;

    return random9(len);
}

module.exports.random_str = random_str;


if(require.main === module){
    var p = console.log;

    var show = [];
    for(var i = 0; i < 20; i++){
        show.push(random_char());
        show.push(random9());
        show.push(random_str());
    }
    console.log(show.join("  "));
}


