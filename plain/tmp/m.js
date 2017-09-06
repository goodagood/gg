var fs = require("fs");
var util = require("util");
var fileName = '/tmp/tmpfn';

function testfs(fileName){
  if (typeof fileName === 'undefined' || !fileName) fileName = '/tmp/tmpfn';

  fs.exists(fileName, function(exists) {
    if (exists) {
      fs.stat(fileName, function(error, stats) {
        fs.open(fileName, "r", function(error, fd) {
          var buffer = new Buffer(stats.size);

          fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
            var data = buffer.toString("utf8", 0, buffer.length);

            console.log(data);
            fs.close(fd);
          });
        });
      });
    }
  });
}

function testwrite(fileName){
  //fs.open(fileName, "w+", function(err, fd){});
  var fsobj = util.inspect(fs);
  fs.writeFile(fileName, fsobj, function(err){
    if (err) throw err;
    console.log(fileName +  " writed.");
  });
}

// vim: set et ts=2 sw=2:
