
var url = require("url");


function make_https_href(req, pathname){
    pathname = pathname || req.url;

    return url.format({
        protocol: 'https',
        host:     req.headers.host,
        pathname: pathname
    });
}


function make_http_href(req, pathname){
    pathname = pathname || req.url;

    return url.format({
        protocol: 'http',
        host:     req.headers.host,
        pathname: pathname
    });
}

module.exports.make_https_href = make_https_href;
module.exports.make_http_href  = make_http_href;

