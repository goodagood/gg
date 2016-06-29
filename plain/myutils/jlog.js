

module.exports = jsonlog;

var fs = require("fs");



// change to db writer
//var json_info_accepter = console.log.bind(console);
var json_info_accepter = require("plain/dbs/mong.logger.js").log_json;

function jsonlog(req, res, next){
    //console.log('jsonlog 1');
    var j = {
        url: req_url(req),
        method: req_method(req),
        isoDateStr: isodates(),
        'status': res_statue(res),
        ip: getip(req),
        username: getusername(req)
    }
    json_info_accepter(j);
    //file_logger(j);

    next();
}


function isodates(){
  return (new Date()).toISOString()
}

function req_url (req) {
  return req.originalUrl || req.url;
}

function req_method (req) {
  return req.method;
}


function referrer(req) {
  return req.headers['referer'] || req.headers['referrer']
}

function getip (req) {
  return req.ip ||
    req._remoteAddress ||
    (req.connection && req.connection.remoteAddress) ||
    undefined
}

function getusername(req){
    if( typeof(req.user) !== 'undefined' ){
        if( typeof(req.username) === 'string' ) return req.user.username
        if( typeof(req.name) === 'string' )     return req.user.name
    }

    return '?get?no?user?';
}


function res_statue (res) {
    if(typeof(res._header) === 'undefined') return undefined

    return res._header
        ? String(res.statusCode)
        : undefined

}


function http_version (req) {
  return req.httpVersionMajor + '.' + req.httpVersionMinor
}


function user_agent (req) {
  return req.headers['user-agent']
}


function req_header (req, res, field) {
  // get header
  var header = req.headers[field.toLowerCase()]

  return Array.isArray(header)
    ? header.join(', ')
    : header
}

/**
 * response header
 */

function res_header (req, res, field) {
  if (!res._header) {
    return undefined
  }

  // get header
  var header = res.getHeader(field)

  return Array.isArray(header)
    ? header.join(', ')
    : header
}


const file_logger = (json, file_path)=>{
    file_path = file_path || '/tmp/js.flog';

    const text = JSON.stringify(json);

    fs.appendFile(file_path, "\r\n");
    fs.appendFile(file_path, text);

    console.log("\r\n");
    console.log(`${file_path} appended`);

    //var log_stream = fs.createWriteStream(file_path);
    //log_stream.write(text);
};


