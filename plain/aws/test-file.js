
var s3file   = require('./file.js');
var s3folder = require('./folder.js');

function test_copy_file_to_user(){
    var file_path = 'abc/14110247507.jpg';
    s3folder.retrieve_file(file_path, function(src_obj){
        var src_meta = src_obj.get_meta();
        console.log(src_obj.get_meta());

        src_obj.copy_to_user('test', 'test', function(copied_meta){
            console.log(copied_meta);
        });

    });
}


if (require.main === module){
    test_copy_file_to_user();
}
