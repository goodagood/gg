// Generated by CoffeeScript 1.8.0
(function() {
  var Promise, assert, check_init_folder, check_member_file_exists, members, p, path, test_folder_path, u;

  assert = require("assert");

  u = require("underscore");

  path = require("path");

  Promise = require("bluebird");

  members = require("../aws/members.js");

  p = console.log;

  test_folder_path = 'abc';

  check_member_file_exists = function(dir) {
    dir = dir || test_folder_name;
    return members.promised_member_obj(dir).then(function(mobj) {
      return mobj.check_members_file_exists();
    }).then(function(exists) {
      return p("exists: " + exists);
    }).then(stop);
  };

  check_init_folder = function(dir) {
    return members.promised_member_obj(dir).then(function(mobj) {
      p('1 member object: ', mobj);
      return mobj;
    }).then(function(mobj) {
      return mobj.init_folder();
    }).then(function(folder) {
      p('3 folder:');
      return folder;
    }).then(function(f) {
      var fm;
      fm = f.get_meta();
      p('name: ', fm.name);
      return p('uuid: ', fm.uuid);
    }).then(stop);
  };

}).call(this);
