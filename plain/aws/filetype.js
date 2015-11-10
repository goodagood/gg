/*
 * hook to process file types.  
 * todo: To make it plugins.
 *
 * Image file need to prepare thumbnails.
 */


/*
 * @file_info : object contains most information we need to prepare
 *              thumbnails.
 *              Before, I use `file` object from formidable, 
 *              After, plan to make a specific `file` object.
 *
 */
function prepare_thumbnail(file_info){
  // to do 0602

  // get from file_info:
  var s3key = file_info['s3key']; 
  var cwd   = path.dirname(s3key);

  bucket.process_image_by_ext(files[f], function(err, out_file_info){
    console.log('image process callback, out_file_info\n');
    console.log(out_file_info);  // wrong!!
    var thumb_folder = path.join(cwd, '/.thumbnails/');
    console.log('thumb_folder: ', thumb_folder);
    bucket.folder_exists( thumb_folder, function(exists){
      if (exists){ 
        bucket.put_file(out_file_info, thumb_folder);
      }else{
        console.log('folder not exists');
        bucket.make_thumbnail_folder(thumb_folder, function(err){
          console.log(out_file_info, thumb_folder);
          bucket.put_file(out_file_info, thumb_folder);
        });
      }
    });

  });
}



// vim: set et ts=2 sw=2:
