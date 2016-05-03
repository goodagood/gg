
var path = require("path");
var gm = require("gm");

var file_obj = require("./obj.js");

var p = console.log;


function new_obj(file_path, callback){
// There is no indent for the first wrapper:
file_obj.new_obj(file_path, function(err, _file){
    var _meta = _file.get_meta();
    var _img   = null;

    if(!_meta.name) _meta.name = path.basename(_meta.path);

    function load(){
        _img = gm(_file.read_stream(), _meta.name);
    }
    _file.load = load;


    function get_img_obj(){
        return _img;
    }
    _file.get_img_obj = get_img_obj;


    function estimate_image_file_size(callback){
        return _img.filesize({bufferStream: true}, callback);
    }
    _file.estimate_image_file_size = estimate_image_file_size;


    function resize(width, height){
        if(!width && !height) return;
        _img.resize(width, height);
    }
    _file.resize = resize;

    function save_tmp_image(ipath, callback){
        ipath    = ipath || '/tmp/imgtmp.png';
        callback = callback || function(){};
        _img.write(ipath, callback);
    }
    _file.save_tmp_image = save_tmp_image;


    return callback(null, _file);
});
}
module.exports.new_obj = new_obj;



if(require.main === module){
    var file_path = 'tmp/public/t.png';
    var owner = 'tmp';

    function c_0424(file_path, owner){

        new_obj(file_path, function(err, ifi){
            //p(err, ifi);
            ifi.make_s3key_and_meta_s3key(function(err, what){
                //p(2, err, what);
                p('gtet meta: ', ifi.get_meta());
                ifi.load();
                ifi.resize(256, 144)
                ifi.save_tmp_image('/tmp/i21.png', function(err, what){
                    p('save tmp image: err what: ', err, what);
                    setTimeout(process.exit, 2000);
                });

            });
        });
    }
    c_0424(file_path, owner);
}
