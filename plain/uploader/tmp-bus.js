
var path = require("path");
var fs   = require("fs");

var uuid   = require("node-uuid");
var Busboy = require("busboy");
var u      = require("underscore");
var sm     = require("stream-meter");

var p = console.log;


var inspect = require("util").inspect;

function setup(cfg){
    var _cfg = {
        'size_limit': 800 * 1000 * 1000 , // 800M
        'dir': '/tmp'
    };
    u.extend(_cfg, cfg);

    function parse_form(req, callback){
        if(!u.isFunction(callback)) callback = function(){};

        var busboy = new Busboy({ headers: req.headers });
        req.busboy = {'files':[], 'fields':{}, 'field_infos':{}};

        // each 'file' event will add 1
        var job_counter = 1;

        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            job_counter += 1;
            console.log('File [' + fieldname + ']: filename: ' + filename);

            var tmp_file_path = path.join(_cfg['dir'], uuid.v4());
            var meter;
            if(_cfg['size_limit']){
                meter = sm(_cfg['size_limit']);
            }else{
                meter = sm();
            }

            meter.on('error', function(e){
                return callback('meter err: ' + e);
            });

            file.pipe(meter).pipe(fs.createWriteStream(tmp_file_path)).on('finish', function(){
                job_counter -= 1;
                p('-- pip to meter to tmp file path on finish');
                req.busboy.files.push({
                    fieldname: fieldname,
                    filename:  filename,
                    originalname:  filename,
                    encoding:  encoding,
                    mimetype:  mimetype,
                    size:      meter.bytes,
                    path:      tmp_file_path
                });
                //p(req.busboy.files);
                if(job_counter == 0) callback(null, req.busboy.files);
            }).on('error', function(e){
                console.log('pipe error');
                return callback('err: ' + e);
            });
        });
        busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
            console.log('Field [' + fieldname + ']: value: ' + inspect(val));
            req.busboy.fields[fieldname] = val;
            req.busboy.field_infos[fieldname] = {
                fieldname: fieldname,
                value:  val,
                fieldnameTruncated:  fieldnameTruncated,
                valTruncated:  valTruncated
            };
        });

        busboy.on('error', function(err) {
            console.log('err: ', err);
            return callback(err);
        });

        req.pipe(busboy).on('finish', function() {
            job_counter -= 1;
            console.log('Done parsing form! busboy on finish event');
            //if(callback) callback(null, req.busboy.files)

            //res.writeHead(303, { Connection: 'close', Location: '/' });
            //res.end();

            //redirect(res, '/16.1423.html');
        });


    }

    return parse_form;
}

module.exports.setup = setup;
