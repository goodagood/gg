

function ce(){
  var exec = require('child_process').exec;
  var child;

  //child = exec('cat *.js bad_file | wc -l',
  //child = exec('ls -l',
  child = exec('man less | less',
    function (error, stdout, stderr) {
      console.log("stdout: \n" + stdout);
      console.log("stderr: \n" + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
  });
}

function cs(){
  var spawn = require('child_process').spawn,
      //ls    = spawn('ls', ['-lh', '/usr']);
      //ls    = spawn('ls', ['-lh', '/tmp']);
      //ls    = spawn('ls', ['-lh', '/tmp', ' | less']);
      ls    = spawn('vim', ['/tmp/lmp3']);

  ls.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  ls.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  ls.on('close', function (code) {
    console.log('child process exited with code ' + code);
  });
}
