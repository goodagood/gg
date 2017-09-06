var formidable = require('formidable'),
    http = require('http'),
    util = require('util');

var port = 3030;

function milisec(){
    console.log(Date.now());
}

function  check(o){
    console.log(util.inspect(o));
}

var tmpFiles = [];
var map = {};

http.createServer(function(req, res) {
    if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
        // parse a file upload
        var form = new formidable.IncomingForm();

        form.on('fileBegin', function (name, file) {
            console.log("on fileBegin");
            console.log("name : " + util.inspect(name));
            console.log("file : " + util.inspect(file));
        }).on('field', function (name, value) {
            console.log("on field"); // test
            console.log("name : " + util.inspect(name));
            console.log("value : " + util.inspect(value));
            //if (name === 'redirect') {
            //    redirect = value;
            //}
        }).on('file', function (name, file) {
            console.log("on file"); // test
            console.log("name : " + util.inspect(name));
            console.log("file : " + util.inspect(file));
        }).on('aborted', function () {
            console.log("on aborted");
            tmpFiles.forEach(function (file) {
                console.log(file);
                //fs.unlink(file);
            });
        }).on('error', function (e) {
            console.log("on error");
            console.log(e);
        }).on('progress', function (bytesReceived, bytesExpected) {
            console.log("on progress");
            console.log( " [ " + bytesReceived + "/" + bytesExpected + " ]");
        }).on('end', milisec);  //.parse(handler.req);

        form.parse(req, function(err, fields, files) {
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n\n');
            // ...
            res.write(util.inspect(form));
            res.write(" === === \n");
            res.end(util.inspect({fields: fields, files: files}));
        });

        return;
    }

    // show a file upload form
    res.writeHead(200, {'content-type': 'text/html'});
    res.end(
            '<form action="/upload" enctype="multipart/form-data" method="post">'+
            '<input type="text" name="title"><br>'+
            '<input type="file" name="upload" multiple="multiple"><br>'+
            '<input type="submit" value="Upload">'+
            '</form>'
           );
}).listen(port);
