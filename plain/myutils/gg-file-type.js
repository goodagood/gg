
/*
 * Put goodagood/goodogood file extensons here, currently they are marked by
 * extension.
 *
 */


var path = require('path');


var p = console.log;



function check_gg_file_type_by_name(filename){
  var ext = path.extname(filename);

  return check_gg_file_type_by_ext(ext);
}


function check_gg_file_type_by_ext(ext){
  var lext = ext.toLowerCase(ext);
  switch(lext){
    case '.gglink':
      return 'goodagood link file';

    case '.ggmsg':
      return 'goodagood-message-json';

    case '.ggn':
    case '.ggnote':
      return 'goodagood-note';
    default:
      return null;
  }
}


function get_low_case_extension(path_or_name){
  var ext  = path.extname(filename);
  if(!u.isString(ext)) return null;

  var lext = ext.toLowerCase(ext);
  return lext;
}


module.exports.check_gg_file_type_by_name = check_gg_file_type_by_name;



if(require.main === module){
    p(check_gg_file_type_by_name('abc/def/kk.gglink'));
    p(check_gg_file_type_by_name('abc/def/kk.ggooolink'));
}


