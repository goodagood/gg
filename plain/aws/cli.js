var bucket = require('./bucket.js');
var folder = require('./folder.js');

var readline = require('readline'),
    rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt('s3 key > ');
rl.prompt();

rl.on('line', function(line) {
  var l = line.trim();

  switch(l) {
    case 'q':
      console.log('good bye!');
      process.exit(0);
      break;

    case '':
      console.log('See what? I might have heard `' + l + '`');
      break;

    default:
      if (l){
        if(l.indexOf('file meta') >= 0){
          show_file_meta(l);
          break;
        }

        bucket.read_file(l, function(err,data){
          if (err) console.log(err);
          console.log(data);
        });
      }else{
        console.log('I got empty thing? : `' + l + '`');
      }
  }
  rl.prompt();
}).on('close', function() {
  console.log('Have a great day!');
  process.exit(0);
});

function show_file_meta(command_line){
  var strip_off_file_meta = command_line.replace(/file meta/i, '');
  strip_off_file_meta = strip_off_file_meta.trim();
  folder.retrieve_file_meta(strip_off_file_meta, function(meta){
    console.log(meta);
  });
}

// vim: set et ts=2 sw=2 fdm=indent:
