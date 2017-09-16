
var fs = require('fs');
var path = require('path');

var mime = require('mime');
var glob = require('glob');


function stream(filename, req, res, next){
    filename = path.join('/tmp', filename);

    if(filename.includes('*')){
        glob(filename, function(err, names){
            if(err) return next(err);

            var file_path = names[0];
            send(file_path, req, res, next);
        });
    }else{
        send(filename, req, res, next);
    }
}
module.exports.stream = stream;


/*
 * suppose we don't need to do file name glob now.
 */
function send(file_path, req, res, next){
    var mime_type = mime.lookup(file_path);
    if(!mime_type.includes('image')) return next(Error('file mime type err'));

    console.log('going to send: ', file_path, mime_type);

    var headers = {server: 'goodagood/goodogood tmp server'};
    headers['Content-Type']   = mime_type;
    fs.stat(file_path, function(err, s){
        if(err) return next(err);

        var size = s.size;
        headers['Content-Length'] = size;
        res.writeHead(200, headers);

        fs.createReadStream(file_path).pipe(res);
    });
}

