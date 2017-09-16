
var fs    = require("fs");
var path  = require("path");
var https = require("https");


var sdir = require("../config/secret-dir.js")
var cdir = sdir.locations.credential_dir;


//var keyFile  = path.join(cdir, 'my-certs', 'key-0109-2016.pem');
//var certFile = path.join(cdir, 'my-certs', 'cert-0109-2016.pem');

var keyFile  = path.join(cdir, 'my-certs', 'comodo0903.2016/ggkey09042016.key');
var certFile = path.join(cdir, 'my-certs', 'comodo0903.2016/goodogood_me.crt');
var bundleFile = path.join(cdir, 'my-certs', 'comodo0903.2016/COMODORSADomainValidationSecureServerCA.crt');

// /home/ubuntu/workspace/gg-credentials/my-certs/comodo0903.2016/COMODORSADomainValidationSecureServerCA.crt


var p = console.log;
//p(keyFile, certFile); p(bundleFile);


//tmp 2016 0902
var options = {
  ca:  fs.readFileSync(bundleFile),
  key:  fs.readFileSync(keyFile),
  cert: fs.readFileSync(certFile),
};


function make_https_server (app){
    var httpsServer = https.createServer(options, app);
    //var httpsServer = https.createServer(app);
    return httpsServer;
}


module.exports.make_https_server = make_https_server;


if(require.main === module){
    p('require main === module');
}
