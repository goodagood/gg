/*
 * For internet media type,
 * https://en.wikipedia.org/wiki/Internet_media_type.
 * https://www.iana.org/assignments/media-types/media-types.xhtml
 *
 * in ./ext-type.js
 * I wrote a name mapping tools to tell file type.
 *
 * Module 'mime' would be formal, it seems mapping file extension to mime
 * type. Another module, 'mmmagic'
 *    https://github.com/mscdex/mmmagic
 * should be using content sniffing.  Not going to do it now.
 *
 * 2015 0730
 */


var mime = require('mime');


var p = console.log;


function get_media_type(path_or_name){
    return mime.lookup(path_or_name);
}


module.exports.get_media_type = get_media_type;



if(require.main === module){
    p( mime.lookup('/tmp/a.md'));
    p( mime.lookup('/tmp/a.markdown'));
    p( mime.lookup('/path/to/file.txt'));
    p( mime.lookup('/tmp/a.html'));

}


