var Inliner = require('inliner');
var fs = require('fs');

var page = "/home/za/workspace/gg.intro/front.pages/i0212y6.html";
var page = "http://127.0.0.1:8080/i0212y6.html";

//var page = 'http://remysharp.com'


//new Inliner(page, function (error, html) {
//        // compressed and inlined HTML page
//        console.log(html.slice(0,500));
//        fs.writeFile('/tmp/a336.html', html, 'utf-8', function(err){
//            console.log('wrote? ', err);
//        });
//});

new Inliner(page, function (error, html) {
        // compressed and inlined HTML page
        console.log(html.slice(0,500));
        fs.writeFile('./inline0216.html', html, 'utf-8', function(err){
            console.log('wrote? ', err);
        });
});
