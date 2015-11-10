
// trying to separate folder adding out from 'folder-v5'
// 2015, 0409

var u = require("underscore");

var folder_module = require("../aws/folder-v5.js");
var myutil  = require("../myutils/myutil.js");

var p       = console.log;


function add_folder(folder, name) {
    // @folder: the folder object.

    var Meta, Obj, new_folder_path, opt_;
    var _meta_ = folder.get_meta();

    new_folder_path = path.join(_meta_.path, name);
    opt_ = {
        name: name,
        path: new_folder_path,
        uuid: myutil.get_uuid(),
        'parent-dir': _meta_.path,
        timestamp: Date.now(),
        owner: _meta_.owner,
        permission: {
            owner: 'rwx',
            group: '',
            other: ''
        },
        html: {}
    };
    if ((_meta_['owner-undefined'] != null) && _meta_['owner-undefined']) {
        opt_['owner-undefined'] = true;
        opt_['inherite-owner'] = true;
    }
    Obj = null;
    Meta = null;
    return make_promisified_s3folder(opt_.path).then(function(obj) {
        Obj = obj;
        Obj.init(opt_);
        assert(u.isFunction(Obj.self_render_as_a_file_promised));
        return Obj.self_render_as_a_file();
    }).then(function() {
        Obj.build_file_list();
        Meta = Obj.get_meta();
        return Obj.save_meta_promised();
    }).then(function() {
        folder.add_file(_short_clone_of_folder_meta(Meta));
        return folder.promise_to_save_meta();
    }).then(function() {
        return Obj;
    });
}


function add_root_folder(opt, callback){
    //
    // without parent dir, owner can be unknown.
    // @opt must contains at least:
    //   { name: , }
    //

    // prepare default meta as opt_
    var opt_ = u.defaults({}, opt);

    if (!u.isString(opt_.name)) return callback('give a name, and be string', null);

    var name = opt.name;
    if(!opt_.path)          opt_.path = name;

    opt_['parent-dir'] = '';

    if (!opt_.owner) {
        opt_.owner = null;
        opt_['owner-undefined'] = true;
    }
    // end of preparring folder metas:

    p('opt_ : ', opt_)
    folder_module.make_s3folder(name).then( function(folder){
        p('make s3 folder got:', folder);
        //if(err) return callback(err, folder);

        folder.init(opt_);
        p('after init , folder meta: ', folder.get_meta());
        folder.write_meta(function(err, s3_rep){
            if(err) return callback(err, s3_rep);
            p('after write meta: ', s3_rep);
            callback(null, folder);
        });
    });
}


module.exports.add_folder = add_folder;
module.exports.add_root_folder = add_root_folder;
