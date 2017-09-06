
var bucket = require('./bucket.js');

function test_read_data(s3key){
  s3key = s3key || '.meta/abc/tmp';
  bucket.read_data(s3key, function(err, data){
    console.log(data);
    console.log(data.toString());
  });
}

function test_get_obj(){
  bucket.get_object('.gg.file/abc/public/45.jpg', function(err, data){
    //console.log(err, data);
    console.log(typeof data.Body, data.Body);
  });
}


if (require.main === module){
  //test_read_data();
  test_get_obj();
}

// vim: set et ts=2 sw=2 fdm=indent:
