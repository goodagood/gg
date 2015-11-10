/*
 * 2015, 0520, copy from ../aws/image.js, to manipulate images.
 */


var fs = require('fs'),
  gm = require('gm'),
  u  = require('underscore');

var path = require('path');
var uuid = require('node-uuid');
var myconfig =  require("../config/config.js");

function make_thumbnail(width, height, infile, quality, outfile, callback){
  try{
    gm(infile).thumb(width, height, outfile, quality, function (err) {
      if (err){
        console.log('err', err);
      }
      callback(err, outfile);
    });
  }catch(err){
    callback(err, null);
  }
}


function test_make_thumbnail(){
  var myimg = '/tmp/img.jpg';
  var tbimg = '/tmp/img.jpg.100x100.jpg';
  make_thumbnail(100, 100, myimg, 100, tbimg, function(err, ofile){
    if (err) console.log(err);
    console.log(typeof ofile);
    console.log(ofile);
  });

}

function make_thumbnail_from_buf(buf, in_filename, width, height, quality, local_out_filename, callback){
  gm(buf, in_filename).thumb(width, height, local_out_filename, quality, callback);
}


/*
 * use defaults, put parameters in object: opts
 */
function do_thumbnail(opts, callback){
  if (typeof opts.infile !== 'string'){
    callback( new Error('no input file'), null);
    return;
  }

  var defaults = {
    width  : 80,
    height : 80,
    quality:100,
  };
  u.defaults(opts, defaults);

  if (typeof opts.outfile !== 'string'){
    // make a name for the out file, no extension made for it.
    opts.outfile = opts.infile + '.' + opts.width + 'x' + opts.height ;
  }

  make_thumbnail(opts.width, opts.height, opts.infile, opts.quality, opts.outfile, callback);
  //console.log(opts);
}


function test_do_thumbnail(){
  var opts = {
    infile  : '/tmp/img.jpg',
    outfile : '/tmp/img.jpg.80x80.jpg',
  };

  do_thumbnail(opts, function(err, outfile_name){
    if (err) console.log(err);
    console.log(outfile_name);
  });
}

/*
 * @opts : { 
 *            ext   : file extension, // required
 *            width : number,
 *            height: number,
 */
function make_thumb_key(opts){
  // default width and height
  var defaults = {
    width  : 80,
    height : 80,
  };
  u.defaults(opts, defaults);

  var size_field = '';
  if (opts.width === opts.height){
    size_field = opts.width.toString();
  }else{
    size_field = opts.width.toString() + 'x' + opts.height.toString();
  }

  var random_name = uuid.v4() + '.' + opts.ext;

  var key = path.join(myconfig.thumbnail_prefix, size_field,  random_name);
  return key
}


function test_make_thumb_key(){
  var opts = {ext: 'jpg',};
  var out = make_thumb_key(opts);
  console.log(out);
}

function make_thumb_key_from_file_key(filekey){
  //
  // If filekey is:     file-path.ext
  // thumb_key will be: file-path.thumbnail.ext
  //
  var ext = path.extname(filekey);
  //var rstr= util.format("%s%s", ext, '$');  // to connect 2 string :)
  var rstr = ext + '$';
  var r = new RegExp(rstr);
  var thumb_key = filekey.replace(r, '.thumbnail'+ext);
  return thumb_key;
}

function test_make_thumb_key_from_file_key(){
  var tkey = make_thumb_key_from_file_key('234.gif');
  console.log(tkey);
}



module.exports.make_thumbnail = make_thumbnail;
module.exports.do_thumbnail   = do_thumbnail;
module.exports.make_thumb_key = make_thumb_key;
module.exports.make_thumb_key_from_file_key = make_thumb_key_from_file_key;

module.exports.make_thumbnail_from_buf = make_thumbnail_from_buf;

if (require.main === module){
  //test_make_thumbnail();
  //test_do_thumbnail();
  //test_make_thumb_key();

  test_make_thumb_key_from_file_key();
}

// vim: set et ts=2 sw=2 fdm=indent:
