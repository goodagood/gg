//
// Testing 'users/user-icon.js'
// 0521, 2015
//


var assert  = require("assert");
var u       = require("underscore");
var path    = require("path");
var Promise = require("bluebird");
var async   = require('async');
var fs      = require('fs');

var user_icon     = require("../users/user-icon.js");

var folder_module = require("../aws/folder-v5.js");
var img_file      = require("../aws/image-file-v2.js");

var p    = console.log;
var tool = require("../myutils/test-util.js");


var _test_folder_path = 'abc/imgvid';
var _test_folder_name = 'imgvid';
var _test_user_name   = 'abc';

var _image_file_uuids = [];



module.exports.test_one = {
    setUp: function (callback) {
        //this.foo = 'bar';
        callback();
    },
    tearDown: function (callback) {
        p ('- in tearDown');
        callback();
    },

    //"test1 : prepare there will be an image file" : t1_by_image_ext_pattern_has_image,
    //"test2 : get image file, test render html " : t2_render_html,
    //"test3 : make thumb defaults " : t3_make_thum_defaults,
};


module.exports.last = function(test){
    test.expect(1);
    test.ok(true);
    tool.stop();
    test.done();
}


// -- The rest is for checking:


// a tool to get the first image, for checking.
function get_first_image_obj (folder_path){
    // Get image by patter of extension.
    // This prepare _image_file_uuids

    var pat = /\.(gif|jpg|png)$/i ;

    var Folder;
    return folder_module.retrieve_promisified_folder(folder_path).then( function(folder){
        Folder = folder;
        return folder.pattern_to_uuids(pat);
    }).then(function(list){
        assert(u.isArray(list));
        assert(list.length > 0);
        return Folder.uuid_to_file_obj_promised(list[0]);
    });
}

function check_get_1st_img(){
    get_first_image_obj(_test_folder_path).then(function(iobj){
        p('get the first image object of ', _test_folder_path);
        //p(iobj);

        //var funs = Object.keys(iobj).sort();
        //p(funs);

        var meta = iobj.get_meta();
        //var meta_keys = Object.keys(meta).sort();
        //p('keys in meta:\n', meta_keys);
        p('name:\n', meta.name);
        p('html:\n', meta.html);

        tool.stop();
    });
}

function check_mk_thumb(){
    var opt = {username: 'dog-02'};

    user_icon.find_user_icon(opt, function(err, ifile){
        p('check find icon: ', err, typeof ifile);
        ifile.make_thumb(16, 16, 100, function(err, what){
            tool.stop();
        });
    });
}

function check_find_icon(){
    var opt = {username: 'dog-02', w:32, h:32, };

    user_icon.find_user_icon(opt, function(err, ifile){
        p('check find icon: ', err, typeof ifile);
        p('is image?:', ifile.is_image_file_obj());

        ifile.callback_thumb_read_stream(opt, function(err, stream){
            p('has pipe?', u.isFunction(stream.pipe));
            tool.stop();
        });

        //ifile.make_thumb(16, 16, 100, function(err, what){
        //    tool.stop();
        //});
    });
}



// Beside testing , here do some checking:
if (require.main === module){
    //man_1st_img();
    //check_mk_thumb();
    check_find_icon();
}

//-- droppings --//

function drop521733(o, options){
    o = o || this;
    var assert = require('assert');

    options = options || {
        username: 'dog-02',
        id:       '46',
        size:     {w:16, h:16},
    };

    user_icon.find_images_in_icon_dir(options.id, function(err, meta_list, folder){
        if(err) return p('got error: ', err);

        assert(meta_list.length > 0);
        o.metas = meta_list;
        o.folder= folder;

        var m0 = meta_list[0];
        o.m0   = m0;
        o.m0thumb = m0.thumb;
        //p('m0: ', u.pick(m0, 'uuid', 'path'));

        //user_icon.checking_img_obj(folder, m0.uuid, function(err, what){
        //    p('should go to check the obj o, ', err, what);
        //});

    });
}
//var o = {}; drop521733(o); 



