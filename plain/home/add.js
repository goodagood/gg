
var path   = require("path");
var assert = require("assert");

var myutil  = require("../myutils/myutil.js");
var folder5 = require("../aws/folder-v5.js");


function add_sub_folder(folder, name){
    var meta = folder.get_meta();

    var new_folder_path = path.join(meta.path, name);

    var opt = {
        name: name,
        path: new_folder_path,
        uuid: myutil.get_uuid(),
        'parent-dir': meta.path,
        timestamp: Date.now(),
        owner: meta.owner,
        permission: {
            owner: 'rwx',
            group: '',
            other: ''
        },
        html: {}
    };

    // not for sure, when 'owner undefined' been set?
    if ((meta['owner-undefined'] != null) && meta['owner-undefined']) {
        opt['owner-undefined'] = true;
        opt['inherite-owner'] = true;
    }
    var Obj  = null;
    var Meta = null;

    return folder5.make_promisified_s3folder(opt.path).then(function(obj) {
        Obj = obj;
        Obj.init(opt);
        assert(u.isFunction(Obj.self_render_as_a_file_promised));
        return Obj.self_render_as_a_file();
    }).then(function() {
        Obj.build_file_list();
        Meta = Obj.get_meta();
        return Obj.promise_to_write_meta();
    }).then(function() {
        folder.add_file(_short_clone_of_folder_meta(Meta));
        return folder.promise_to_save_meta();
    }).then(function() {
        return Obj;
    });
}


module.exports.add_sub_folder = add_sub_folder;
