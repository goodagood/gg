
var folder_module = require("../aws/folder-v5.js");
var bucket        = require("../aws/bucket.js");

var p =  console.log;


function retrieve_promisified_folder(folder_path) {
    var Obj;
    Obj = null;
    return make_promisified_s3folder(folder_path).then(function(obj) {
        Obj = obj;
        return obj.retrieve_saved_meta_promised();
    }).then(function(o) {
        return Obj;
    });
}


function retrieve_folder(folder_path) {
    var Obj;
    Obj = null;
    return folder_module.make_s3folder(folder_path).then(function(obj_) {
        Obj = obj_;
        return Obj.promise_to_retrieve_saved_meta();
    }).then(function(meta_) {
        return Obj;
    });
}


function retrieve_folder_meta(folder_path) {
    return make_s3folder(folder_path).then(function(folder) {
        return folder.promise_to_retrieve_saved_meta();
    });
}


function is_folder_exists(path_, callback) {
    var Folder, Meta;
    Folder = null;
    Meta = null;
    return folder_module.make_s3folder(path_).then(function(folder) {
        Folder = folder;
        folder.calculate_folder_meta_s3key(path_);
        return Meta = folder.get_meta();
    }).then(function() {
        return bucket.s3_object_exists(Meta.folder_meta_s3key, function(err, aws_reply) {
            if (err) {
                return callback(err, null);
            }
            if (aws_reply.ContentLength.length > 0) {
                return callback(null, true);
            }
            return callback(err, aws_reply);
        });
    });
}


module.exports.is_folder_exists = is_folder_exists;
module.exports.retrieve_folder = retrieve_folder;



/* Do some checking in dev */
if (require.main === module) {

    function c_retrieve_folder(fp){
        fp = fp || 'abc'; // Full folder Path

        var Meta, Folder;
        retrieve_folder(fp).then(function(folder) {
            Folder = folder;
            p('looks we got folder object : ', fp);
            p(u.keys(folder).join('  \t  '));
            process.exit(p('got it?'));
        }).catch(function(e){
            p('we got err: ', e);
            process.exit();
        });
    }


    function c_folder_exist(fp){
        fp = fp || 'abc'; // Full folder Path

        var Meta, Folder;
        is_folder_exists(fp, function(e, exist) {
            p('we got err: ', e);
            p('folder path ', fp, ' exist: ', exist);
            process.exit();
        });
    }

    /* execute codes */
    c_retrieve_folder('jobs');
    //c_folder_exist('jobs');
}

