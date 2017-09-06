//Serving files under a directory

//To serve files under a directory, simply call the serve method on a Server instance, passing it the HTTP request and response object:

var static = require('node-static');
var folder = '/home/za/Pictures';

var fileServer = new static.Server(folder);
var sys = require('sys');

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response).addListener('error', function (err) {
            sys.error("Error serving " + request.url + " - " + err.message);
            response.writeHead(err.status, err.headers);
            response.write(err.status + err.headers);
            response.end();
        });
;

    }).resume();
}).listen(8080);

/*
 *
require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response, function (e, res) {
            if (e && (e.status === 404)) { // If the file wasn't found
                fileServer.serveFile('/not-found.html', 404, {}, request, response);
            }
        });
    }).resume();
}).listen(8080);
*/
