

function sample(){
    if (file) {
        file = path.resolve(file) === path.normalize(file)  ? file : path.join(pathname || '.', file);

        // Stream the file to the client
        fs.createReadStream(file, {
            flags: 'r',
            mode: 0666,
            start: startByte,
            end: startByte + (buffer.length ? buffer.length - 1 : 0)
        }).on('data', function (chunk) {
            // Bounds check the incoming chunk and offset, as copying
            // a buffer from an invalid offset will throw an error and crash
            if (chunk.length && offset < buffer.length && offset >= 0) {
                chunk.copy(buffer, offset);
                offset += chunk.length;
            }
        }).on('close', function () {
            streamFile(files, offset);
        }).on('error', function (err) {
            callback(err);
            console.error(err);
        }).pipe(res, { end: false });
    } else {
        res.end();
        callback(null, buffer, offset);
    }
}


Server.prototype.respondNoGzip = function (pathname, status, contentType, _headers, files, stat, req, res, finish) {
    var mtime           = Date.parse(stat.mtime),
        key             = pathname || files[0],
        headers         = {},
        clientETag      = req.headers['if-none-match'],
        clientMTime     = Date.parse(req.headers['if-modified-since']),
        startByte       = 0,
        length          = stat.size,
        byteRange       = this.parseByteRange(req, stat);

    /* Handle byte ranges */
    if (files.length == 1 && byteRange.valid) {
        if (byteRange.to < length) {

            // Note: HTTP Range param is inclusive
            startByte = byteRange.from;
            length = byteRange.to - byteRange.from + 1;
            status = 206;

            // Set Content-Range response header (we advertise initial resource size on server here (stat.size))
            headers['Content-Range'] = 'bytes ' + byteRange.from + '-' + byteRange.to + '/' + stat.size;

        } else {
            byteRange.valid = false;
            console.warn("Range request exceeds file boundaries, goes until byte no", byteRange.to, "against file size of", length, "bytes");
        }
    }

    /* In any case, check for unhandled byte range headers */
    if (!byteRange.valid && req.headers['range']) {
        console.error(new Error("Range request present but invalid, might serve whole file instead"));
    }

    // Copy default headers
    for (var k in this.options.headers) {  headers[k] = this.options.headers[k] }
    // Copy custom headers
    for (var k in _headers) { headers[k] = _headers[k] }

    headers['Etag']          = JSON.stringify([stat.ino, stat.size, mtime].join('-'));
    headers['Date']          = new(Date)().toUTCString();
    headers['Last-Modified'] = new(Date)(stat.mtime).toUTCString();
    headers['Content-Type']   = contentType;
    headers['Content-Length'] = length;

    for (var k in _headers) { headers[k] = _headers[k] }

    // Conditional GET
    // If the "If-Modified-Since" or "If-None-Match" headers
    // match the conditions, send a 304 Not Modified.
    if ((clientMTime  || clientETag) &&
        (!clientETag  || clientETag === headers['Etag']) &&
        (!clientMTime || clientMTime >= mtime)) {
        // 304 response should not contain entity headers
        ['Content-Encoding',
         'Content-Language',
         'Content-Length',
         'Content-Location',
         'Content-MD5',
         'Content-Range',
         'Content-Type',
         'Expires',
         'Last-Modified'].forEach(function(entityHeader) {
            delete headers[entityHeader];
        });
        finish(304, headers);
    } else {

        res.writeHead(status, headers);

        this.stream(key, files, new(buffer.Buffer)(length), startByte, res, function (e, buffer) {
            if (e) { return finish(500, {}) }
            finish(status, headers);
        });
    }
};

