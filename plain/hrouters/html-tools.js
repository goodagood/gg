
var util = require('util');

function name_list_to_checkbox(names){
  var checkboxs = names.map(function(name){
    return util.format( 
      //'<input type="checkbox" name="users[]" checked="checked" value="%s"  /> ' + 
      '<input type="checkbox" name="users[]"  value="%s"  /> ' + 
      '<span class="username"> %s &nbsp</span>\n', 
      name, name) ;
  });
  var str_checkboxs = checkboxs.join(' ');
  //console.log('check boxs :\n', str_checkboxs);
  return str_checkboxs;
}

module.exports.name_list_to_checkbox = name_list_to_checkbox;


