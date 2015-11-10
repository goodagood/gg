
var ftp = require("../aws/file-type-plugin.js");


var p = console.log;


function check_with_video_meta(){
    var get_file      = require("../aws/get-file.js");

    var file_path = 'abc/test/small3.mp4';

    get_file.get_1st_file_obj_by_path(file_path, function(err, file){
        if(err) return p('0814 1122, get 1st file... got err: ', err);

        var m = file.get_meta();
        p('meta path: ', m.path);

        var plug = ftp.find_plugin(m);

        if(plug){
            p('the got plugin got keys: ', u.keys(plug))
            plug.get_file_obj(m, function(err, file){
                if(err) p('5:51am, ', err);

                p(u.keys(file).sort().join(",\t "));
                p(file.version);

                process.exit();
            });
        }

    });
}


if(require.main === module){
    check_with_video_meta();
}



