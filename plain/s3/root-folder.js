
function build_new_folder (opt, callback) {
    return make_s3folder(opt.path).then(function(folder) {
        folder.init(opt);
        return folder;
    });
};
