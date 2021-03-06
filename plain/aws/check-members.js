// Generated by CoffeeScript 1.8.0
(function() {
  var check_basic, check_the_file, members, p, stop, test_dir;

  p = console.log;

  stop = function() {
    return setTimeout(process.exit, 500);
  };

  members = require("./members.js");

  test_dir = 'abc';

  check_basic = function() {
    var members_obj;
    members_obj = members.make_members_obj(test_dir);
    members_obj.init_members_file().then(function(what) {
      return p("what? ", what);
    });
    return stop();
  };

  check_the_file = function() {
    var members_obj;
    members_obj = members.make_members_obj(test_dir);
    members_obj.show_members_file();
    return stop();
  };

  if (require.main === module) {
    check_the_file();
  }

}).call(this);
