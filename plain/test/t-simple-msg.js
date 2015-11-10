// Generated by CoffeeScript 1.8.0
(function() {
  var Promise, assert, file_module, file_name, folder_module, folder_name, msg, myconfig, myutil, p, path, prepare_testing_msg, sample_msg_text, stop, test_msg_file_name, u, user_name;

  assert = require("assert");

  u = require("underscore");

  path = require("path");

  Promise = require("bluebird");

  folder_module = require("../aws/folder-v5.js");

  file_module = require("../aws/simple-file-v2.js");

  msg = require("../aws/simple-msg.js");

  myutil = require('../myutils/myutil.js');

  myconfig = require("../config/config.js");

  user_name = 'abc';

  folder_name = 'abc';

  file_name = 'txt22';

  sample_msg_text = "hello, this is simle, msg, in testing, stupid as it is";

  test_msg_file_name = 'test-msg';

  p = console.log;

  stop = function() {
    return setTimeout(process.exit, 500);
  };

  prepare_testing_msg = function() {
    var dir, fname, json, owner, text;
    json = {
      from: user_name,
      to: user_name,
      text: sample_msg_text,
      uuid: myutil.get_uuid(),
      timestamp: Date.now()
    };
    text = JSON.stringify(json, null, 4);
    owner = json.to;
    dir = path.join(owner, myconfig.message_folder);
    fname = test_msg_file_name;
    return file_module.write_text_file(owner, dir, fname, text).then(function() {
      owner = json.from;
      dir = path.join(owner, myconfig.message_folder);
      fname = fname;
      return file_module.write_text_file(owner, dir, fname, text);
    }).then(function(what) {
      return what;
    });
  };

  describe("t-simple-msg.js, 1", function() {
    return it("prepare a msg,", function(done) {
      this.timeout(35 * 1000);
      return prepare_testing_msg().then(function(what) {}).then(stop);
    });
  });

}).call(this);
