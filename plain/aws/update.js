


function update_folder(cwd_obj, sub_folder_meta) {
    var Meta, Sub, opt_;

    var opt_ = sub_folder_meta;
    var Meta = sub_folder_meta;
    var sub_folder_path = sub_folder_meta.path;


    p('parent doings');
    add_file(_short_clone_of_folder_meta(Meta));
    return cwd_obj.promise_to_save_meta();
};
