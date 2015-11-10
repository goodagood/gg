// Generated by CoffeeScript 1.8.0
(function() {
  var Promise, chech_a, delayed, p, promised_delay, stop;

  Promise = require("bluebird");

  p = console.log;

  stop = function(time) {
    time = time || 500;
    return setTimeout(process.exit, time);
  };

  chech_a = function() {
    var pa;
    return pa = new Promise(function(resolve, reject) {
      return setTimeout(resolve, 500);
    });
  };

  delayed = function(time, callback) {
    var bar, err;
    time = time || Math.random() * 500;
    err = null;
    if (time > 600) {
      err = time;
    }
    bar = function() {
      p('timed: ', time);
      return callback(err, time);
    };
    return setTimeout(bar, time);
  };

  promised_delay = Promise.promisify(delayed);

  promised_delay(100).then(function(what) {
    return promised_delay(200);
  }).then(function(what) {
    p('2  ', what);
    return promised_delay(300);
  }).then(function(what) {
    p('got what: ', what);
    return promised_delay(what);
  })["catch"](function(e) {
    return p("got one: ", e);
  });

}).call(this);
