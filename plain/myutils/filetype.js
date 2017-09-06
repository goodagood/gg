//
// This is going to be deperated, use 'ext-type.js' instead.
// The name 'file type' is mis-leading.  0908.
//

var path = require('path');

var bucket = require('../aws/bucket.js');

var myconfig =   require("../config/config.js");
var s3_stream_prefix = myconfig.s3_stream_prefix;
var folder_list_prefix = myconfig.folder_list_prefix;


function check_file_type_by_name(filename){
  var ext = path.extname(filename);
  return check_file_type_by_ext(ext);
}


function check_file_type_by_ext(ext){
  var lext = ext.toLowerCase(ext);
  switch(lext){
    case '.gglink':
      return 'goodagood link file';
    case '.ggmsg':
      return 'goodagood-message-json';

    case '.json':
      return 'json';
    case '.md':
      return 'markdown';
    case '.markdown':
      return 'markdown';

    case '.tex':
      return 'text';
    case '.txt':
      return 'text';
    case '.text':
      return 'text';

      //Text Files
    case '.doc':
      return '?text';
    case '.docx':
      return '?text';
    case '.log':
      return '?text';
    case '.msg':
      return '?text';
    case '.odt':
      return '?text';
    case '.pages':
      return '?text';
    case '.rtf':
      return '?text';
    case '.wpd':
      return '?text';
    case '.wps':
      return '?text';

      //Data Files
    case '.csv':
      return 'data';
    case '.dat':
      return 'data';
    case '.gbr':
      return 'data';
    case '.ged':
      return 'data';
    case '.ibooks':
      return 'data';
    case '.key':
      return 'data';
    case '.keychain':
      return 'data';
    case '.pps':
      return 'data';
    case '.ppt':
      return 'data';
    case '.pptx':
      return 'data';
    case '.sdf':
      return 'data';
    case '.tar':
      return 'data';
    case '.tax2012':
      return 'data';
    case '.vcf':
      return 'data';
    case '.xml':
      return 'data';

      //Audio Files
    case '.aif':
      return 'audio';
    case '.iff':
      return 'audio';
    case '.m3u':
      return 'audio';
    case '.m4a':
      return 'audio';
    case '.mid':
      return 'audio';
    case '.mp3':
      return 'audio';
    case '.mpa':
      return 'audio';
    case '.ra':
      return 'audio';
    case '.wav':
      return 'audio';
    case '.wma':
      return 'audio';

      //Video Files
    case '.3g2':
      return 'video';
    case '.3gp':
      return 'video';
    case '.asf':
      return 'video';
    case '.asx':
      return 'video';
    case '.avi':
      return 'video';
    case '.flv':
      return 'video';
    case '.m4v':
      return 'video';
    case '.mov':
      return 'video';
    case '.mp4':
      return 'video';
    case '.mpg':
      return 'video';
    case '.rm':
      return 'video';
    case '.srt':
      return 'video';
    case '.swf':
      return 'video';
    case '.vob':
      return 'video';
    case '.wmv':
      return 'video';

      //3D Image Files
    case '.3dm':
      return 'image';
    case '.3ds':
      return 'image';
    case '.max':
      return 'image';
    case '.obj':
      return 'image';

      //Raster Image Files
    case '.bmp':
      return 'image';
    case '.dds':
      return 'image';
    case '.gif':
      return 'image';
    case '.jpeg':
      return 'image';
    case '.jpg':
      return 'image';
    case '.png':
      return 'image';
    case '.psd':
      return 'image';
    case '.pspimage':
      return 'image';
    case '.tga':
      return 'image';
    case '.thm':
      return 'image';
    case '.tif':
      return 'image';
    case '.tiff':
      return 'image';
    case '.yuv':
      return 'image';

      //Vector Image Files
    case '.ai':
      return 'image';
    case '.eps':
      return 'image';
    case '.ps':
      return 'image';
    case '.svg':
      return 'image';

      //Page Layout Files
    case '.indd':
      return 'page layout';
    case '.pct':
      return 'page layout';
    case '.pdf':
      return 'page layout';

      //Spreadsheet Files
    case '.xlr':
      return 'spreadsheet';
    case '.xls':
      return 'spreadsheet';
    case '.xlsx':
      return 'spreadsheet';

      //Database Files
    case '.accdb':
      return 'db';
    case '.db':
      return 'db';
    case '.dbf':
      return 'db';
    case '.mdb':
      return 'db';
    case '.pdb':
      return 'db';
    case '.sql':
      return 'db';

      //Executable Files
    case '.apk':
      return 'exe';
    case '.app':
      return 'exe';
    case '.bat':
      return 'exe';
    case '.com':
      return 'exe';
    case '.exe':
      return 'exe';
    case '.gadget':
      return 'exe';
    case '.jar':
      return 'exe';
    case '.pif':
      return 'exe';
    case '.vb':
      return 'exe';
    case '.wsf':
      return 'exe';

      //Game Files
    case '.dem':
      return 'game';
    case '.gam':
      return 'game';
    case '.nes':
      return 'game';
    case '.rom':
      return 'game';
    case '.sav':
      return 'game';

      //CAD Files
    case '.dwg':
      return 'cad';
    case '.dxf':
      return 'cad';

      //GIS Files
    case '.gpx':
      return 'gis';
    case '.kml':
      return 'gis';
    case '.kmz':
      return 'gis';

      //Web Files
    case '.asp':
      return 'web';
    case '.aspx':
      return 'web';
    case '.cer':
      return 'web';
    case '.cfm':
      return 'web';
    case '.csr':
      return 'web';
    case '.css':
      return 'web';
    case '.htm':
      return 'web';
    case '.html':
      return 'web';
    case '.js':
      return 'web';
    case '.jsp':
      return 'web';
    case '.php':
      return 'web';
    case '.rss':
      return 'web';
    case '.xhtml':
      return 'web';

      //Plugin Files
    case '.crx':
      return 'plugin';
    case '.plugin':
      return 'plugin';

      //Font Files
    case '.fnt':
      return 'font';
    case '.fon':
      return 'font';
    case '.otf':
      return 'font';
    case '.ttf':
      return 'font';

      //System Files
    case '.cab':
      return 'sys';
    case '.cpl':
      return 'sys';
    case '.cur':
      return 'sys';
    case '.deskthemepack':
      return 'sys';
    case '.dll':
      return 'sys';
    case '.dmp':
      return 'sys';
    case '.drv':
      return 'sys';
    case '.icns':
      return 'sys';
    case '.ico':
      return 'sys';
    case '.lnk':
      return 'sys';
    case '.sys':
      return 'sys';

      //Settings Files
    case '.cfg':
      return 'setting';
    case '.ini':
      return 'setting';
    case '.prf':
      return 'setting';

      //Encoded Files
    case '.hqx':
      return 'encoded';
    case '.mim':
      return'encoded';
    case '.uue':
      return'encoded';

      //Compressed Files
    case '.7z':
      return 'compressed';
    case '.cbr':
      return 'compressed';
    case '.deb':
      return 'compressed';
    case '.gz':
      return 'compressed';
    case '.pkg':
      return 'compressed';
    case '.rar':
      return 'compressed';
    case '.rpm':
      return 'compressed';
    case '.sitx':
      return 'compressed';
    case '.tar.gz':
      return 'compressed';
    case '.zip':
      return 'compressed';
    case '.zipx':
      return 'compressed';

      //Disk Image Files
    case '.bin':
      return 'disk image';
    case '.cue':
      return 'disk image';
    case '.dmg':
      return 'disk image';
    case '.iso':
      return 'disk image';
    case '.mdf':
      return 'disk image';
    case '.toast':
      return 'disk image';
    case '.vcd':
      return 'disk image';

      //Developer Files
    case '.c':
      return 'programming';
    case '.class':
      return 'programming';
    case '.cpp':
      return 'programming';
    case '.cs':
      return 'programming';
    case '.dtd':
      return 'programming';
    case '.fla':
      return 'programming';
    case '.h':
      return 'programming';
    case '.java':
      return 'programming';
    case '.lua':
      return 'programming';
    case '.m':
      return 'programming';
    case '.pl':
      return 'programming';
    case '.py':
      return 'programming';
    case '.sh':
      return 'programming';
    case '.sln':
      return 'programming';
    case '.swift':
      return 'programming';
    case '.vcxproj':
      return 'programming';
    case '.xcodeproj':
      return 'programming';
    case '.cgi':
      return 'programming';
    //case '.cgi':
    //  return 'exe';

      //Backup Files
    case '.bak':
      return 'backup';
    case '.tmp':
      return 'backup';

      //Misc Files
    case '.crdownload':
      return 'misc';
    case '.ics':
      return 'misc';
    case '.msi':
      return 'misc';
    case '.part':
      return 'misc';
    case '.torrent':
      return 'misc';

    default :
      return 'unknow';
  }
}


var ext = function () {
  //
  // ext would be an object has two methods: 
  //   getExt(path)   ==> ext of the path
  //   getContentType ==> content type
  //

  var extTypes = { 
    "3gp"   : "video/3gpp"
      , "a"     : "application/octet-stream"
      , "ai"    : "application/postscript"
      , "aif"   : "audio/x-aiff"
      , "aiff"  : "audio/x-aiff"
      , "asc"   : "application/pgp-signature"
      , "asf"   : "video/x-ms-asf"
      , "asm"   : "text/x-asm"
      , "asx"   : "video/x-ms-asf"
      , "atom"  : "application/atom+xml"
      , "au"    : "audio/basic"
      , "avi"   : "video/x-msvideo"
      , "bat"   : "application/x-msdownload"
      , "bin"   : "application/octet-stream"
      , "bmp"   : "image/bmp"
      , "bz2"   : "application/x-bzip2"
      , "c"     : "text/x-c"
      , "cab"   : "application/vnd.ms-cab-compressed"
      , "cc"    : "text/x-c"
      , "chm"   : "application/vnd.ms-htmlhelp"
      , "class"   : "application/octet-stream"
      , "com"   : "application/x-msdownload"
      , "conf"  : "text/plain"
      , "cpp"   : "text/x-c"
      , "crt"   : "application/x-x509-ca-cert"
      , "css"   : "text/css"
      , "csv"   : "text/csv"
      , "cxx"   : "text/x-c"
      , "deb"   : "application/x-debian-package"
      , "der"   : "application/x-x509-ca-cert"
      , "diff"  : "text/x-diff"
      , "djv"   : "image/vnd.djvu"
      , "djvu"  : "image/vnd.djvu"
      , "dll"   : "application/x-msdownload"
      , "dmg"   : "application/octet-stream"
      , "doc"   : "application/msword"
      , "dot"   : "application/msword"
      , "dtd"   : "application/xml-dtd"
      , "dvi"   : "application/x-dvi"
      , "ear"   : "application/java-archive"
      , "eml"   : "message/rfc822"
      , "eps"   : "application/postscript"
      , "exe"   : "application/x-msdownload"
      , "f"     : "text/x-fortran"
      , "f77"   : "text/x-fortran"
      , "f90"   : "text/x-fortran"
      , "flv"   : "video/x-flv"
      , "for"   : "text/x-fortran"
      , "gem"   : "application/octet-stream"
      , "gemspec" : "text/x-script.ruby"
      , "gif"   : "image/gif"
      , "gz"    : "application/x-gzip"
      , "h"     : "text/x-c"
      , "hh"    : "text/x-c"
      , "htm"   : "text/html"
      , "html"  : "text/html"
      , "ico"   : "image/vnd.microsoft.icon"
      , "ics"   : "text/calendar"
      , "ifb"   : "text/calendar"
      , "iso"   : "application/octet-stream"
      , "jar"   : "application/java-archive"
      , "java"  : "text/x-java-source"
      , "jnlp"  : "application/x-java-jnlp-file"
      , "jpeg"  : "image/jpeg"
      , "jpg"   : "image/jpeg"
      , "js"    : "application/javascript"
      , "json"  : "application/json"
      , "log"   : "text/plain"
      , "m3u"   : "audio/x-mpegurl"
      , "m4v"   : "video/mp4"
      , "man"   : "text/troff"
      , "mathml"  : "application/mathml+xml"
      , "mbox"  : "application/mbox"
      , "mdoc"  : "text/troff"
      , "me"    : "text/troff"
      , "mid"   : "audio/midi"
      , "midi"  : "audio/midi"
      , "mime"  : "message/rfc822"
      , "mml"   : "application/mathml+xml"
      , "mng"   : "video/x-mng"
      , "mov"   : "video/quicktime"
      , "mp3"   : "audio/mpeg"
      , "mp4"   : "video/mp4"
      , "mp4v"  : "video/mp4"
      , "mpeg"  : "video/mpeg"
      , "mpg"   : "video/mpeg"
      , "ms"    : "text/troff"
      , "msi"   : "application/x-msdownload"
      , "odp"   : "application/vnd.oasis.opendocument.presentation"
      , "ods"   : "application/vnd.oasis.opendocument.spreadsheet"
      , "odt"   : "application/vnd.oasis.opendocument.text"
      , "ogg"   : "application/ogg"
      , "p"     : "text/x-pascal"
      , "pas"   : "text/x-pascal"
      , "pbm"   : "image/x-portable-bitmap"
      , "pdf"   : "application/pdf"
      , "pem"   : "application/x-x509-ca-cert"
      , "pgm"   : "image/x-portable-graymap"
      , "pgp"   : "application/pgp-encrypted"
      , "pkg"   : "application/octet-stream"
      , "pl"    : "text/x-script.perl"
      , "pm"    : "text/x-script.perl-module"
      , "png"   : "image/png"
      , "pnm"   : "image/x-portable-anymap"
      , "ppm"   : "image/x-portable-pixmap"
      , "pps"   : "application/vnd.ms-powerpoint"
      , "ppt"   : "application/vnd.ms-powerpoint"
      , "ps"    : "application/postscript"
      , "psd"   : "image/vnd.adobe.photoshop"
      , "py"    : "text/x-script.python"
      , "qt"    : "video/quicktime"
      , "ra"    : "audio/x-pn-realaudio"
      , "rake"  : "text/x-script.ruby"
      , "ram"   : "audio/x-pn-realaudio"
      , "rar"   : "application/x-rar-compressed"
      , "rb"    : "text/x-script.ruby"
      , "rdf"   : "application/rdf+xml"
      , "roff"  : "text/troff"
      , "rpm"   : "application/x-redhat-package-manager"
      , "rss"   : "application/rss+xml"
      , "rtf"   : "application/rtf"
      , "ru"    : "text/x-script.ruby"
      , "s"     : "text/x-asm"
      , "sgm"   : "text/sgml"
      , "sgml"  : "text/sgml"
      , "sh"    : "application/x-sh"
      , "sig"   : "application/pgp-signature"
      , "snd"   : "audio/basic"
      , "so"    : "application/octet-stream"
      , "svg"   : "image/svg+xml"
      , "svgz"  : "image/svg+xml"
      , "swf"   : "application/x-shockwave-flash"
      , "t"     : "text/troff"
      , "tar"   : "application/x-tar"
      , "tbz"   : "application/x-bzip-compressed-tar"
      , "tcl"   : "application/x-tcl"
      , "tex"   : "application/x-tex"
      , "texi"  : "application/x-texinfo"
      , "texinfo" : "application/x-texinfo"
      , "text"  : "text/plain"
      , "tif"   : "image/tiff"
      , "tiff"  : "image/tiff"
      , "torrent" : "application/x-bittorrent"
      , "tr"    : "text/troff"
      , "txt"   : "text/plain"
      , "vcf"   : "text/x-vcard"
      , "vcs"   : "text/x-vcalendar"
      , "vrml"  : "model/vrml"
      , "war"   : "application/java-archive"
      , "wav"   : "audio/x-wav"
      , "wma"   : "audio/x-ms-wma"
      , "wmv"   : "video/x-ms-wmv"
      , "wmx"   : "video/x-ms-wmx"
      , "wrl"   : "model/vrml"
      , "wsdl"  : "application/wsdl+xml"
      , "xbm"   : "image/x-xbitmap"
      , "xhtml"   : "application/xhtml+xml"
      , "xls"   : "application/vnd.ms-excel"
      , "xml"   : "application/xml"
      , "xpm"   : "image/x-xpixmap"
      , "xsl"   : "application/xml"
      , "xslt"  : "application/xslt+xml"
      , "yaml"  : "text/yaml"
      , "yml"   : "text/yaml"
      , "zip"   : "application/zip"
  }
  return {
    getExt: function (path) {
      var i = path.lastIndexOf('.');
      return (i < 0) ? '' : path.substr(i);
    },
    getContentType: function (ext) {
      return extTypes[ext.toLowerCase()] || 'application/octet-stream';
    }
  };
}();


function test_check_file_type_by_ext(){
  console.log(check_file_type_by_ext('.gIF'));
  console.log(check_file_type_by_ext('.pnG'));
  console.log(check_file_type_by_ext('.c'));
}


function make_presentation_html(file_info){
  //file_info['file-selector'] = '<input type="checkbox" name="filepath[]" value="' + file_info['file-s3key'] + '" />' ;
  var ftype = 'folder';
  if (file_info.type === 'file'){
    ftype = check_file_type_by_name(file_info['file-s3key']);
    file_info['file-type'] = ftype;
  }
  console.log(222, ftype, file_info);
  switch (ftype){
    case 'image':
      prepare_image_html_element(file_info);
      break;
    case 'folder':
      //file_info['file-selector'] = '';
      prepare_folder_link(file_info);
      break;
    case 'goodagood file link':
      ;
    case 'goodagood msg file':
      prepare_msg_html(file_info);  // this contains s3 API callback, it's asyn
      ;
    default:
      assemble_html_element(file_info);
      break;
  }
}


function prepare_msg_html(fi){
  bucket.read_file(fi['file-s3key'], function(err, data){
    var j = JSON.parse(data);
    var he = '<li> Message from: ' + j.from  + '<br />';
    he += j.message + '<br />';
    he += j.time;
    he += '</li>';
    fi['li-element'] = he;
    bucket.write_file_meta(fi['file-s3key'], fi, function(){});
  });
}


function prepare_image_html_element(file_info){
  file_info['file-selector'] = '<input type="checkbox" name="filepath[]" value="' + file_info['file-s3key'] + '" />' ;
  var href_download = path.join(s3_stream_prefix, file_info['file-s3key'] );
  file_info['anchor'] = '<a href="' + href_download + '" >' + file_info['short-name'] + '</a>' ;
  var thumb = file_info['thumbnails'][0].s3key;
  var img_src = path.join(s3_stream_prefix, thumb) ;
  //file_info['thumb-img'] = '<img src="' + img_src + '" alt="' + file_info['short-name'] +'"  height=60 />';
  file_info['thumb-img'] = '<img src="' + img_src + '" alt="' + file_info['short-name'] +'"  />';

  var he = '<li>';  // html element
  he += file_info['thumb-img'] + '<br />';
  he += file_info['file-selector']; // + '<br />';
  he += file_info['anchor'] + '</li>\n';
  file_info['li-element'] = he;
  bucket.write_file_meta(file_info['file-s3key'], file_info, function(){});
}


function prepare_folder_link(file_info){
  var he = '<li>';
  he = he + '<a href="';
  he += path.join(folder_list_prefix, file_info['file-s3key']); 
  he += '">';

  var folder_glyphicon = '<span class="glyphicon glyphicon-folder-close"></span>';
  he += folder_glyphicon;

  he = he + file_info['short-name'];
  he = he + '</a></li>\n';
  file_info['folder-link'] = he;
  file_info['li-element'] = he;
  bucket.write_file_meta(file_info['file-s3key'], file_info, function(){});
}


function assemble_html_element(file_info){
  if (typeof file_info['li-element'] !== 'undefined') return;
  var he = '<li>';
  file_info['file-selector'] = '<input type="checkbox" name="filepath[]" value="' + file_info['file-s3key'] + '" />' ;
  he += file_info['file-selector'];

  var href_download = path.join(s3_stream_prefix, file_info['file-s3key'] );
  file_info['anchor'] = '<a href="' + href_download + '" >' + file_info['short-name'] + '</a>' ;

  //if (typeof file_info['thumb-img'] !== 'undefined')  he += file_info['thumb-img'];
  //if (typeof file_info['folder-link'] !== 'undefined') he += file_info['folder-link'];

  he += file_info['anchor'];

  he += '</li>\n';
  file_info['li-element'] = he;
  bucket.write_file_meta(file_info['file-s3key'], file_info, function(){});
}


module.exports.check_file_type_by_ext  = check_file_type_by_ext ;
module.exports.check_file_type_by_name  = check_file_type_by_name ;
module.exports.make_presentation_html  = make_presentation_html ;


if (require.main === module){
  test_check_file_type_by_ext();
}



// vim: set et ts=2 sw=2 fdm=indent:
