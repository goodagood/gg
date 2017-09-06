// start to use logger, npmlog, 2014 0401

var formidable = require('formidable'),
    http = require('http'),
    util = require('util');

var port = 3030;

var npmlog = require('npmlog');
var fs = require('fs');
npmlog.stream = fs.createWriteStream('/tmp/log41');
if (!npmlog.stream) console.log('logger failed to get stream');

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
            npmlog.info("on fileBegin");
            npmlog.info("name : " + util.inspect(name));
            npmlog.info("file : " + util.inspect(file));
        }).on('field', function (name, value) {
            npmlog.info("on field"); // test
            npmlog.info("name : " + util.inspect(name));
            npmlog.info("value : " + util.inspect(value));
            //if (name === 'redirect') {
            //    redirect = value;
            //}
        }).on('file', function (name, file) {
            npmlog.info("on file"); // test
            npmlog.info("name : " + util.inspect(name));
            npmlog.info("file : " + util.inspect(file));
        }).on('aborted', function () {
            npmlog.info("on aborted");
            tmpFiles.forEach(function (file) {
                npmlog.info(file);
                //fs.unlink(file);
            });
        }).on('error', function (e) {
            npmlog.info("on error");
            npmlog.info(e);
        }).on('progress', function (bytesReceived, bytesExpected) {
            npmlog.info("on progress");
            npmlog.info( " [ " + bytesReceived + "/" + bytesExpected + " ]");
        }).on('end', milisec);  //.parse(handler.req);

        form.parse(req, function(err, fields, files) {
            npmlog.info("\nform parse begin, show the form: \n");
            npmlog.warn(util.inspect(form));

            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n\n');
            // ...
            res.write(util.inspect(form));
            res.write("\n === === \n");
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
