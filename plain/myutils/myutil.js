// Easy to work in node.js REPL

var path = require('path');
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


/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @param obj1
 * @param obj2
 * @returns obj3 a new object based on obj1 and obj2
 */
function merge_options(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}


// This change obj1
function merge_to_first_one_recursively(obj1, obj2) {
    //var obj3 = {}
    for (var p in obj2) {
        try {
            //Property in destination object set; update its value.
            if ( obj2[p].constructor === Object ) {
                obj1[p] = MergeRecursive(obj1[p], obj2[p]);

            } else {
                obj1[p] = obj2[p];

            }

        } catch(e) {
            // Property in destination object not set; create it and set its value.
            obj1[p] = obj2[p];

        }
    }

    return obj1;
}


var merge = function() {
    var obj = {},
        i = 0,
        len = arguments.length,
        key;
    for (; i < len; i++) {
        for (key in arguments[i]) {
            if (arguments[i].hasOwnProperty(key)) {
                obj[key] = arguments[i][key];
            }
        }
    }
    return obj;
};


function split_path_to_hrefs(path_string){
    if (typeof path_string !== 'string') return;

    var parts = path_string.split('/');

    var all_path = [];
    var tmp = '';
    for (var i = 0; i < parts.length; i++){
        tmp = path.join(tmp, parts[i]);
        all_path.push(tmp);
    }

    var href = [];
    var one = '';
    for (var j = 0; j < all_path.length; j++){
        one = one + '<a href="' + all_path[j] + '">' + parts[j] + '</a>/\n';
    }
    return one;

}


function test_split_path_to_hrefs(){
    var a = split_path_to_hrefs('abc/de-f/gh.f/aa.gif');
    console.log(a);
}


function split_path_to_dirs(path_string){
    if (typeof path_string !== 'string') return;

    var parts = path_string.split('/');

    var all_dirs = [];
    var tmp = '';
    for (var i = 0; i < parts.length; i++){
        tmp = path.join(tmp, parts[i]);
        all_dirs.push(tmp);
    }

    return all_dirs;
}


function test_split_path_to_dirs(){
    var a = split_path_to_dirs('abc/de-f/gh.f/aa.gif');
    console.log(a);
}


/** 
 * Check out the sub-tree object, pointed out by 'cwd'.
 * User home folder is a tree structue, it's represented by an nested
 * js object. 
 *
 * ?The json of the object is stored in 'userhome/goodagood/etc/...'
 *
 * @cwd : parameter, as example: goodagood/public/image 
 * @tree: object, as example: {goodagood: {...}, 'my-folder':{...}}
 * @return : {subtree: sub-tree object,
 *            cwd:     might be pruned from input}
 */
function check_out_cwd_tree(cwd, tree){
  var ret = {cwd:'', tree:tree};
  if (typeof cwd !== 'string') return ret;
  if (cwd === '') return ret;

  var path_components = cwd.split('/');
  // filter out empty string ''
  path_components = path_components.filter(function(e){return e!== '';});

  // Prepare the loop, check the tree according the path components.
  var first, keys;
  var subtree = tree;
  var number = path_components.length;
  for (var i = 0; i < number; i++){

    first = path_components.shift(); // the first path in the some/path/str
    keys = Object.keys(subtree); // the current keys, it's folder names
    //console.log(1); console.log(first); console.log(keys);

    if (keys.indexOf(first) != -1){
      // Now we have the folder, go down to it:
      subtree = subtree[first];
      // make the current result:
      ret.cwd = path.join(ret.cwd, first);
      ret.tree= subtree;
      //console.log(2); console.log(ret); console.log(subtree);
    } else {
      return ret;
    }
  }
  return ret;
}


function test_check_out_cwd_tree(){
  var structure = {
    'goodagood' : {
      'etc'    : {},
      'public' : {},
      'friends': {},
    },
    'afolder' : {
      'www'    : {
        'subfolder' : {
          'tmp'    : {},
          'public' : {},
          'friends': {},
        },
      },
      'pub' : {},
      'tonight': {},
    },
    //...
  };

  //var r = check_out_cwd_tree('afolder/www', structure);
  //var r = check_out_cwd_tree('afolder/www/subfolder', structure);
  var r = check_out_cwd_tree('afolder/www/subfolder/tmp', structure);
  console.log('result'); console.log(r);
}

function all_date_parts_from_milli(miliseconds_or_string){
    //
    // Return a string as simple date: 
    // (year)-(month)-(day)-(hours):(minutes):(seconds).(milli seconds)
    //
    var milli = miliseconds_or_string;
    if (!milli) return '----------[--:--:--.---]?';
    if(typeof miliseconds_or_string === 'string') milli = parseInt(miliseconds_or_string);

    var d = new Date(milli);

    var year = d.getFullYear().toString(); 
    var month= (d.getMonth() + 1).toString(); // getMonth return 0-11
    var day = d.getDate().toString(); 

    var hours = d.getHours().toString(); 
    var minutes = d.getMinutes().toString(); 
    var seconds = d.getSeconds().toString(); 
    var mili = d.getMilliseconds().toString(); 
    var result = year + '-' + 
        month + '-' +
        day + '[' +
        hours + ':' + minutes + ':' + seconds +
        '.' + mili + ']';
    return result;
}

function path_chain(path_string, prefix){
    // make links for path, a/b/c => [a](href_link)/[b](href_link)/[c](href_link)/

    if (typeof path_string !== 'string') return;

    var parts = path_string.split('/');
    parts = parts.filter(function(e){return e !== '';}); //no empty ''

    var all_path = [];
    var tmp = '';
    for (var i = 0; i < parts.length; i++){
        tmp = path.join(tmp, parts[i]);
        all_path.push(tmp);
    }

    var href = [];
    var chain = '\n';
    var one_path = '';
    for (var j = 0; j < all_path.length; j++){
      one_path = path.join(prefix, all_path[j]);
      chain = chain + '\n<a class="path_part" href="' + one_path + '"> ' + parts[j] + ' </a>/';
    }
    //chain = '<a href="/treeview/">Home</a>/' + chain;
    return chain;

}

function uuid_file_name(filename){
    var fid  = get_uuid();
    var uuid_name = fid + path.extname(file.name); 
    return uuid_name;
}

function uuid_file_name_for_username(filename, username){
    // make a name contains uuid, for user. 
    // This is according to how goodagood save file contents, 
    // it been put under: username/.files/uuid.file_extension
    var uuid  = get_uuid();
    var uuid_ext = uuid + path.extname(filename); 
    var key = path.join(username, '.files', uuid_ext);
    return key;
}

function array_to_checkbox_list(arr, value_name){
    value_name = value_name || "check-box-name";
    //var ul = '<ul class="list-inline">';
    var result = '\n';
    arr.forEach(function(element){
      var li = util.format(
          '<li> <input type="checkbox" name="%s" value="%s"  />%s &nbsp</li>\n',
          value_name, element, element) ;
      result += li;
    });
    //ul = ul + "</ul>\n";
    return result;
}

function username_to_list(arr, class_name){
    class_name = class_name || "user-name";
    //var ul = '<ul class="list-inline">';
    var result = '\n';
    arr.forEach(function(element){
      var li = util.format(
          '<li class="%s"> %s &nbsp</li>\n',
          class_name, element) ;
      result += li;
    });
    //ul = ul + "</ul>\n";
    return result;
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
exports.merge_options = module.exports.merge_options = merge_options;

exports.merge_to_first_one_recursively = module.exports.merge_to_first_one_recursively = 
                            merge_to_first_one_recursively;

exports.merge = module.exports.merge = merge;
exports.split_path_to_hrefs = module.exports.split_path_to_hrefs = split_path_to_hrefs;
exports.split_path_to_dirs = module.exports.split_path_to_dirs = split_path_to_dirs;
exports.check_out_cwd_tree = module.exports.check_out_cwd_tree = check_out_cwd_tree;
exports.all_date_parts_from_milli = module.exports.all_date_parts_from_milli = all_date_parts_from_milli;
exports.path_chain = module.exports.path_chain = path_chain;
exports.uuid_file_name = module.exports.uuid_file_name = uuid_file_name;
exports.array_to_checkbox_list = module.exports.array_to_checkbox_list = array_to_checkbox_list;
exports.username_to_list = module.exports.username_to_list = username_to_list;


if (require.main === module){
    //test_split_path_to_hrefs();
    //test_split_path_to_dirs();
}
