// 
// To check video-file.js
// copy from u-folder-basic.js
// 2015, 0717
//

var assert = require("assert");
var u = require("underscore");
var async = require("async");
var path = require("path");
var Promise = require("bluebird");

var folder_module = require("../aws/folder-v5.js");

var myconfig =   require("../config/config.js");
var config = require("../test/config.js");

var bucket = require("../aws/bucket.js");

var folder_path = 'abc';
var user_name = 'abc';
var gg_folder_name = 'goodagood';
var new_folder_name = 'test';


var p = console.log;

var stop = function(period) {
    period = period || 1;
    if (!u.isNumber(period)) {
        period = 1;
    }
    var milli_seconds = period * 1000;
    return setTimeout(process.exit, milli_seconds);
};






//// This test assume there are files in the folder, with sub-folders or not.
//t5_finding_files = function(test){
//
//    // settings of the test:
//    var folder_path = 'abc';
//
//    // global vars:
//    var Meta, Folder;
//
//    folder_module.retrieve_folder(folder_path).then(function(folder) {
//        Folder = folder;
//        test.ok(! u.isEmpty(Folder));
//        Meta = Folder.get_meta();
//        var files = Meta.files;
//
//        //u.each(files, function(f){
//        //    p(f.what, f.name, f.timestamp);
//        //});
//        var true_files = u.filter(files, function(f){return f.what === myconfig.IamFile;});
//        test.ok(u.size(files) >= u.size(true_files));
//        //u.each(true_files, function(f){
//        //    p(f.what, f.name, f.timestamp);
//        //});
//        test.ok(u.isObject(files))
//        test.ok(! u.isEmpty(Meta));
//        test.ok(u.isString(Meta.name));
//    }).then(function(){
//        //stop();
//        test.done();
//    });
//}


module.exports.group_one = {
    setUp: function (callback) {
        callback();
    },
    tearDown: function (callback) {
        callback();
    },

    //"test-1 : get file objects, folder.css  " : t1_test_get_file_objs_by_name,
    //"test-2 : get folder meta, 'abc'" : test_retrieve_folder_meta,
    //"test-3 : read file by name, 'abc'" : t3_read_file_by_name,
    //"test-4 : write and get uuid " : t4_write_and_get_uuid,
    //"test-5 : finding files " : t5_finding_files,
};


module.exports.last = function(test){
    test.expect(1);
    p(' -- going to force stop --');
    test.ok(true);
    stop();
    test.done();
};


function get_1st_file_by_pattern(dir, pattern, callback){
    folder_module.retrieve_folder(dir).then(function(folder){
        //p('check gfobn ', folder);
        var uuids = folder.pattern_to_uuids(pattern);
        assert(uuids.length > 0);

        //p('uuids: ', uuids);
        folder.uuid_to_file_obj(uuids[0], callback);
    }).catch(callback);
}

function chk_get_1st_file(){
    var dir = 'abc/public';
    var pat = /VID.+mp4/;

    get_1st_file_by_pattern(dir, pat, function(err, file){
            p ('2, ', err, file);
            var mf = file.get_meta();
            p (3, mf);
            stop()
        });
}

var vf  = require("../aws/video-file.js");
var vft = require("../aws/video-file-tpl.js");
function chk_vid(){
    var dir = 'abc/public';
    var pat = /VID.+mp4/;

    get_1st_file_by_pattern(dir, pat, function(err, file){
        if(err) {p('err: ', err); return stop();}

        p ('2, ', err, typeof file.get_meta);
        var mf = file.get_meta();
        p('mf.path, type: ', mf.path, mf.type);

        vf.new_video_file_obj_from_meta(mf, function(err, vfile){
            p('n v f o f m: ', err, typeof vfile.render_html_repr);
            vfile.render_html_repr();

            var vmeta = vfile.get_meta();
            p("vmeta html li: \n", vmeta.html.li);
            //stop();
            vfile.save_file_to_folder().then(function(what){
                p('s f t f : ', what);
                stop()
            }).catch(function(what){
                p('catch s f t f : ', what);
                stop()
            });
        });

        //p('html.li: ', mf.html.li);
        //file.save_file_to_folder().then(function(what){
        //    p('s f t f : ', what);
        //    stop()
        //}).catch(function(what){
        //    p('catch s f t f : ', what);
        //    stop()
        //});
        //p(li);

        //p (3, mf);
    });
}


if(require.main === module){
    //check_retrieve_file_pu();
    //for_blue();
    //chk_get_1st_file();
    chk_vid();
}



//-- dropping to REPL --//

// helpers in checking
function pick_file_attr(folder_meta, attr_name){
    attr_name = attr_name || 'path';

    var ofiles = u.values(folder_meta.files);  
    var oattrs = ofiles.map(function(file_meta){return file_meta[attr_name]});

    return oattrs;
}

function re_render(folder, o){
    if(!o) p('not o');
    o = o || this;
    var uuids = folder.pattern_to_uuids(/j7.+json/);
    assert(uuids.length > 0, 'should get a few uuids');

    o.fo = []; // array of file objects
    o.fm = []; // array of file meta
    uuids.forEach(function(uuid){
        p('uuid: ', uuid);

        folder.uuid_to_file_obj(uuid, function(err, file){
            assert(!err, 'there should be no err when uuid to file obj');
            o.fo.push(file);
            var m = file.get_meta();
            o.fm.push(m);
            p('f path ', m.path);
        });
    });
}


function drop_into_repl(o, dir){
    // drop variable/objects into REPL, o is the object to save variables
    o   = o   || {};
    dir = dir || 'abc/imgvid';

    folder_module.retrieve_folder(dir).then(function(folder){
        o.folder = folder;
        o.mfolder= folder.get_meta();
        o.shorts = u.omit(o.mfolder, 'files', 'html', 'renders', 'file_uuids', 'file_names');

        //o.is     = o.folder.is_name_in_meta_files('26.jpg');
        //p('?: ', o.folder.is_name_in_meta_files('26.jpg'));
        //walk_through(folder, function(err, what){
        //    p('after walk through: ', err, what);
        //    stop();
        //});

    });
}

function drop_json_file_into_repl(o, dir){
    // drop variable/objects into REPL, o is the object to save variables
    o   = o   || {};
    dir = dir || 'abc/imgvid';

    folder_module.retrieve_folder(dir).then(function(folder){
        o.folder = folder;
        o.mfolder= folder.get_meta();
        o.shorts = u.omit(o.mfolder, 'files', 'html', 'renders', 'file_uuids', 'file_names');

        re_render(o.folder, o);

    });
}

// dog-02 has id: 46
//var o = {}; drop_into_repl(o, '46/public'); o.shorts;
//var o = {}; drop_into_repl(o, 'abc/add-2/img2'); o.shorts;

//var o = {}; drop_json_file_into_repl(o, 'abc/test');



// a signal to 'expect'
//console.log("ok start interact:");
