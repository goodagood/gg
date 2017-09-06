
var express = require('express');
var app = express();

var port = 9090;

app.get('/', function (req, res) {
    res.send('Hello World, can you connect?!');
});

var server = app.listen(port, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);

});

