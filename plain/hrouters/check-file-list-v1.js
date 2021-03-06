// Generated by CoffeeScript 1.8.0
(function() {
  var exit, file_list, folder, foo;

  folder = require('../aws/folder-v1.js');

  file_list = require('./file-list-v1.js');

  folder.retrieve_folder('abc/goodagood', function(err, folder_obj) {
    return file_list.ls_for_owner('abc', folder_obj, function(err, html) {
      console.log(err, html);
      foo();
      return exit();
    });
  });

  exit = function(time) {
    time = time || 500;
    console.log("\n --- goint to exit at " + time);
    return setTimeout(process.exit, time);
  };

  foo = function() {
    return console.log('-- foo --');
  };

}).call(this);
