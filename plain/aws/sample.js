var fs = require('fs')
  , gm = require('gm');

var myimg = './arrowa.jpeg';
var tbimg = './arrowa.jpeg.100x100.jpg';

//// resize and remove EXIF profile data
//gm('/path/to/my/img.jpg')
//.resize(240, 240)
//.noProfile()
//.write('/path/to/resize.png', function (err) {
//  if (!err) console.log('done');
//});

// obtain the size of an image
gm(myimg)
.size(function (err, size) {
  if (!err)
    console.log(myimg);
    console.log(size.width > size.height ? 'wider' : 'taller than you');
    console.log(size.width , size.height );
});
gm(tbimg)
.size(function (err, size) {
  if (!err)
    console.log(tbimg);
    console.log(size.width > size.height ? 'wider' : 'taller than you');
    console.log(size.width , size.height );
});


//gm(myimg)
//.thumb(100, 100, tbimg, 99, function (err) {
//  if (err){
//    console.log('thumb(', tbimg, ')');
//    console.log('err', err);
//    }
//});

//// output all available image properties
//gm('/path/to/img.png')
//.identify(function (err, data) {
//  if (!err) console.log(data)
//});
//
//// pull out the first frame of an animated gif and save as png
//gm('/path/to/animated.gif[0]')
//.write('/path/to/firstframe.png', function (err) {
//  if (err) console.log('aaw, shucks');
//});
//
//// auto-orient an image
//gm('/path/to/img.jpg')
//.autoOrient()
//.write('/path/to/oriented.jpg', function (err) {
//  if (err) ...
//})
//
//// crazytown
//gm('/path/to/my/img.jpg')
//.flip()
//.magnify()
//.rotate('green', 45)
//.blur(7, 3)
//.crop(300, 300, 150, 130)
//.edge(3)
//.write('/path/to/crazy.jpg', function (err) {
//  if (!err) console.log('crazytown has arrived');
//})
//
//// annotate an image
//gm('/path/to/my/img.jpg')
//.stroke("#ffffff")
//.drawCircle(10, 10, 20, 10)
//.font("Helvetica.ttf", 12)
//.drawText(30, 20, "GMagick!")
//.write("/path/to/drawing.png", function (err) {
//  if (!err) console.log('done');
//});
//
//// creating an image
//gm(200, 400, "#ddff99f3")
//.drawText(10, 50, "from scratch")
//.write("/path/to/brandNewImg.jpg", function (err) {
//  // ...
//});
//
//vim: set et sw=2 ts=2:
