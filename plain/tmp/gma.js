
var gm = require('gm');
var path = require('path');

var dir = '/home/ubuntu/workspace/muji/plain/static/tmp/522/';

var p = console.log;

var src_dir = '/home/ubuntu/workspace/muji/plain/static/tmp/522/';

var src_img = path.join(dir, 'sa.jpg');

var image2name = path.join(dir, '2.jpg');

// creating an image
function a(){
    gm(200, 400, "#ddff99f3")
    .drawText(10, 50, "from scratch")
    .write("/tmp/gma.jpg", function (err) {
        if(err) console.log(err);
        // ...
    });
}


function b(){
    var image_name = path.join(dir, 'home-200-100.jpg');
    var in32_16    = path.join(dir, 'home-32-16.jpg');

    gm(200, 100, "#ddff99f3")
        .fontSize(60)
    .drawText(25, 65, "home")
    .write(image_name, function (err) {
        if(err){
            console.log(err);
        }else{
            console.log('should ok, ', image_name);
        }
        // ...
    });
}

function c(){
    var image_name = path.join(dir, 'home-200-100.jpg');
    var in64_32    = path.join(dir, 'home-64-32.jpg');
    var in32_16    = path.join(dir, 'home-32-16.jpg');
    var quality = 100;

    gm(image_name)
    .thumb(64, 32, in64_32, quality, function(err, stdout, stderr, command){
           p('64, 32 thumb: ', err, stdout, stderr, command); 
        })
    .thumb(32, 16, in32_16, quality, function(err, stdout, stderr, command){
           p('32, 16 thumb: ', err, stdout, stderr, command); 
        });

}


if(require.main === module){
    c();
}


