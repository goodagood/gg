//
// Testing 'aws/image-file-v2.coffee(js)'
// 0313, 2015
//


var assert  = require("assert");
var u       = require("underscore");
var path    = require("path");
var Promise = require("bluebird");
var async   = require('async');
var fs      = require('fs');

var folder_module = require("../aws/folder-v5.js");
var img_file      = require("../aws/image-file-v2.js");
var get_file      = require("../aws/get-file.js");

var p    = console.log;
var tool = require("../myutils/test-util.js");


var _test_folder_path = 'abc/imgvid';
var _test_pic_path    = 'abc/imgvid/26.jpg';

var _test_folder_name = 'imgvid';
var _test_user_name   = 'abc';

var _image_file_uuids = [];


function t1_by_image_ext_pattern_has_image (test){
    var pat = /\.(gif|jpg|png|svg)$/i ;

    folder_module.retrieve_promisified_folder(_test_folder_path).then( function(folder){
        return folder.pattern_to_uuids(pat);
    }).then(function(list){
        _image_file_uuids = list;
        test.ok(u.isArray(_image_file_uuids));
        test.ok(_image_file_uuids.length > 0);
        p('get the list: \n', list);
    }).then(function(whatever){
        test.done();
    });
}


// change to 't2..' ==> 't2 1 ..'
var t2_render_html = function(test){
    assert(_image_file_uuids.length > 0);

    var image_uuid = _image_file_uuids[0];

    //test.expect(1);

    // Get image file:
    folder_module.retrieve_folder(_test_folder_path).then(function(folder){
        folder.uuid_to_file_obj(image_uuid, function(err, ifile){
            test.ok(!err);
            var html = ifile.render_html_repr();
            p('html: ', html.length);
            test.ok(u.isString(html));
            test.ok(html.length > 3);
            test.done();
        });
    });
};


// to test, 2015 1005
var t2_1_render_html = function(test){
    get_file.get_1st_file_obj_by_path(_test_pic_path, function(err, ifile){
        test.ok(!err);
        var html = ifile.render_html_repr();
        p('html: ', html.length);
        test.ok(u.isString(html));
        test.ok(html.length > 3);
        test.done();
    });
};


var t3_1_make_thum_defaults = function(test){
    //test.expect(1);
    get_file.get_1st_file_obj_by_path(_test_pic_path, function(err, ifile){
            test.ok(!err);
            p('version: ', ifile.version);
            var meta_thumb = ifile.make_thumb_defaults();
            p('meta thumb: ', meta_thumb);
            test.ok(u.isObject(meta_thumb));
            test.done();
    });
};

module.exports.test_one = {
    setUp: function (callback) {
        //this.foo = 'bar';
        callback();
    },
    tearDown: function (callback) {
        p ('- in tearDown');
        callback();
    },

    "test1 : prepare there will be an image file" : t1_by_image_ext_pattern_has_image,
    "test2 : get image file, test render html " : t2_1_render_html,
    //"test3 : make thumb defaults " : t3_make_thum_defaults,
};


module.exports.last = function(test){
    test.expect(1);
    test.ok(true);
    tool.stop();
    test.done();
}


// -- The rest is for checking:

function prepare_image_uuid_list (folder_path){
    // Get image by patter of extension.
    // This prepare _image_file_uuids

    folder_path = folder_path || _test_folder_path;
    var pat = /\.(gif|jpg|png)$/i ;

    var Folder;
    return folder_module.retrieve_promisified_folder(folder_path).then( function(folder){
        Folder = folder;
        return folder.pattern_to_uuids(pat);
    }).then(function(list){
        p('get the list: \n', list);
        return _image_file_uuids = list;
    });
}

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


function man_1st_img(){
    get_first_image_obj(_test_folder_path).then(function(iobj){
        p('got the first image object of ', _test_folder_path);
        var meta = iobj.get_meta();

        p('name/path: ', meta.path);

        iobj.read_in_template(function(err, template){
            p('got from read in template: err, template: ', err, template);
            //p('dir: ', __dirname);

            //p('client json: \n', iobj.get_client_json());
            iobj.render_template(function(err, html){
                p('renderred template: (err, html):\n', err, html);
                tool.stop();
            });
        });

    });
}


function check_delete_image(){
    // This need to bypass the delete method of folder object

    var folder_path = _test_folder_path;
    //var pat = /th.jpg/;
    var pat = /cat.+gif$/;
    var Folder;

    folder_module.retrieve_folder(folder_path).then(function(folder){
        Folder = folder;

        var uuids = Folder.pattern_to_uuids(pat)
        p ('got uuid list:', uuids);
        var u0 = uuids[0];

        get_image_by_pat(folder_path, pat, function(err, images){
            var i0 = images[0]; // the zero
            //p ('got image 0:', i0);
            var meta = i0.get_meta();
            p ('image path:', meta.path);
            //i0.delete_s3_storage(function(err, del_res){ });
            
            Folder.delete_file_by_uuid(u0, function(err, res){
                p ('del res:', err, res);
                tool.stop();
            });
        });
    });
}


function check_get_image_uuid_by_pattern (pat){
    // Get image by patter of extension.
    // This prepare _image_file_uuids

    pat = pat || /\.(gif|jpg|png)$/i ;

    folder_module.retrieve_promisified_folder(_test_folder_path).then( function(folder){
        return folder.pattern_to_uuids(pat);
    }).then(function(list){
        _image_file_uuids = list;
        p('get the list: \n', list);
    }).then(function(whatever){
        tool.stop();
    });
}


function get_image_by_pat(folder_path, pattern, callback){
    // Get image by patter of extension.
    // This prepare _image_file_uuids

    folder_path = folder_path || _test_folder_path;
    pattern = pattern || /\.(gif|jpg|png)$/i ;

    var Folder;
    folder_module.retrieve_promisified_folder(folder_path).then( function(folder){
        Folder = folder;
        return Folder.pattern_to_uuids(pattern);
    }).then(function(list){
        async.map(list, Folder.uuid_to_file_obj, callback);
    });
}

function check_get_image_by_pat(){
    //var folder_path = _test_folder_path;
    var folder_path = 'abc/imgvid';
    //var pat = /th.jpg/;
    var pat = /gc.+jpg$/;
    get_image_by_pat(folder_path, pat, function(err, images){
        //p('got images:\n', images);
        p('number of images:\n', images.length);
        assert(u.isArray(images));

        var i0 = images[0];
        var meta = i0.get_meta();
        p('meta.path of the first image:\n', meta.path);
        tool.stop();
    });
}


function check_it_is_promise(){
    // it forgot to return, so it become undefined.
    var a = prepare_image_uuid_list();
    p( 'typeof a: ', typeof a);
    p( 'a: ', a);
    tool.stop();
}


function check_b(){
    // This need the 'check by image ext pattern' run first.
    var image_uuid, meta;
    prepare_image_uuid_list().then(function(uuid_list){
        assert(uuid_list.length > 0);
        image_uuid = uuid_list[0];
    }).then(function(image_uuid){
        return folder_module.retrieve_folder(_test_folder_path)
    }).then(function(folder){
        folder.uuid_to_file_obj(image_uuid, function(err, ifile){
            meta = ifile.get_meta();
            p(meta);
            tool.stop();
            //p('2, err, image-file\n', err, ifile);
        });
    });

}

check_1_get_one_file_by_name = function(file_path){
    file_path = file_path || 'abc/cat_music.gif';

    var folder_path = 'abc';

    p('in "check get one file by name", ', __filename);
    folder_module.retrieve_first_file_obj(file_path, function(err, file){
        var meta = file.get_meta();
        p ('retrieved first file obj:', meta);
        tool.stop();

    });
}


// should be recent, Oct. 2015
function check_meta_to_image(){

    var sample =
    { 
        meta: {
            originalname: 'dsc08881.jpg',
            size: 581695,
            mimetype: 'image/jpeg',
            encoding: '7bit',
            type: 'image/jpeg',
            name: 'dsc08881.jpg',
            local_file: '/tmp/d13cd446ed3edca47de6d5f08ac0dd82',
            path: 'abc/test/tindex/dsc08881.jpg',
            dir: 'abc/test/tindex',
            owner: 'abc',
            creator: 'abc',
            timestamp: 1443425000985,
            uuid: '93a10b89-d9ff-4531-a55b-fb9080c2049a',
            path_uuid: 'abc/test/tindex/93a10b89-d9ff-4531-a55b-fb9080c2049a',
            new_meta_s3key: '.gg.new/abc/test/tindex/93a10b89-d9ff-4531-a55b-fb9080c2049a',
            storage: 
            { type: 's3',
                key: '.gg.file/abc/test/tindex/93a10b89-d9ff-4531-a55b-fb9080c2049a' 
            },
            redis_task_id: 'task.a.93a10b89-d9ff-4531-a55b-fb9080c2049a' },
        job: {
            task_id: 'task.a.93a10b89-d9ff-4531-a55b-fb9080c2049a',
            new_meta_s3key: '.gg.new/abc/test/tindex/93a10b89-d9ff-4531-a55b-fb9080c2049a',
            name: 'new-file-meta',
            username: 'abc',
            folder: 'abc/test/tindex',
            id: 'task.a.93a10b89-d9ff-4531-a55b-fb9080c2049a' }
    };

    //img_file.new_uploaded_img_file_obj(sample, function(err, file){});

    img_file.new_image_file_obj(sample.meta, function(err, img){
        p(err, img.version);
        img.calculate_meta_defaults();
        //img.make_default_thumb_to_s3(function(err, what){
        //});
        process.exit();
    });

}


/* simply, get the image file object by _test_pic_path */
function check_1005(){
    get_file.get_1st_file_obj_by_path(_test_pic_path, function(err, ifile){
        assert(!err);
        p(ifile);
        process.exit();
    });
}


// Beside testing , here do some checking:
if (require.main === module){
    //check_1_get_one_file_by_name();

    //check_get_image_uuid_by_pattern();
    //check_get_image_uuid_by_pattern(/^th/);
    //check_get_image_by_pat();

    //prepare_image_uuid_list();
    //check_it_is_promise();
    //check_b();

    //check_delete_image();
    //check_get_1st_img();
    //man_1st_img();

    //check_meta_to_image();
    check_1005();
}


/* For dropping into repl */


/* 
 * To drop into REPL with usable informations and objects, we use
 * o : to hold all objects/attributes, default to 'this'
 * fp: the file path, with would be setting up file object, default to _test_pic_path
 */
function drop_2015_1005(o, fp){
    o  = o || this;
    fp = fp|| _test_pic_path;
    p('file path: ', fp);

    //With aux path, or set it this way:
    get_file.get_1st_file_obj_with_auxpath_by_path(fp, function(err, ifile){
        //p('g f.g 1 f o w a b p: ', err, ifile);
        //assert(!err);
        o.err      = err;
        o.file     = ifile;
        o.meta     = o.file.get_meta();
        o.filepath = fp;

        p(u.keys(o.file).sort().join("\t"));
    });
}


var myconfig =   require("../config/config.js");
function drop_meta_to_image(){

    var sample =
    { 
        meta: {
            originalname: 'dsc08881.jpg',
            size: 581695,
            mimetype: 'image/jpeg',
            encoding: '7bit',
            type: 'image/jpeg',
            name: 'dsc08881.jpg',
            local_file: '/tmp/d13cd446ed3edca47de6d5f08ac0dd82',
            path: 'abc/test/tindex/dsc08881.jpg',
            dir: 'abc/test/tindex',
            owner: 'abc',
            creator: 'abc',
            timestamp: 1443425000985,
            uuid: '93a10b89-d9ff-4531-a55b-fb9080c2049a',
            path_uuid: 'abc/test/tindex/93a10b89-d9ff-4531-a55b-fb9080c2049a',
            new_meta_s3key: '.gg.new/abc/test/tindex/93a10b89-d9ff-4531-a55b-fb9080c2049a',
            storage: 
            { type: 's3',
                key: '.gg.file/abc/test/tindex/93a10b89-d9ff-4531-a55b-fb9080c2049a' 
            },
            redis_task_id: 'task.a.93a10b89-d9ff-4531-a55b-fb9080c2049a' },
        job: {
            task_id: 'task.a.93a10b89-d9ff-4531-a55b-fb9080c2049a',
            new_meta_s3key: '.gg.new/abc/test/tindex/93a10b89-d9ff-4531-a55b-fb9080c2049a',
            name: 'new-file-meta',
            username: 'abc',
            folder: 'abc/test/tindex',
            id: 'task.a.93a10b89-d9ff-4531-a55b-fb9080c2049a' }
    };

    //img_file.new_uploaded_img_file_obj(sample, function(err, file){});

    img_file.new_image_file_obj(sample.meta, function(err, img){
        p(err, img.version);
        //img.calculate_meta_defaults();

        o.sample = sample;
        o.img = img; o.err = err;
        o.meta = o.img.get_meta();

        //img.make_default_thumb_to_s3(function(err, what){
        //});
    });

}


var myutil = require("../myutils/myutil.js")
var bucket = require("../aws/bucket.js")
var image  = require("../aws/image.js")
function make_default_thumb_to_s3 (meta, callback) {
    var uniq = myutil.get_uuid();
    var local_thumb_file_name = path.join("/tmp", uniq);

    return bucket.get_object(meta.storage.key, function(err, s3reply) {
        var image_buf;
        if (err) {
            return callback(err, null);
        }
        image_buf = s3reply.Body;
        return image.make_thumbnail_from_buf(
            image_buf,
            meta.name,
            meta.thumb.defaults.width,
            meta.thumb.defaults.height,
            meta.thumb.defaults.quality,
            local_thumb_file_name,
            function(err) {
                return bucket.put_one_file(local_thumb_file_name, meta["thumbnail-s3key"], function(err, s3reply) {
                    if (!err) {
                        fs.unlink(local_thumb_file_name);
                    }else{
                        return callback(err);
                    }
                    delete meta.local_thumb_file_name;
                    return callback(err, meta["thumbnail-s3key"]);
                });
            });
    });
}

function aa(){
    o.img.make_thumb_defaults();
    make_default_thumb_to_s3(o.meta, function(e,r){
        p('in make default thumb to s3, callback: ', e,r);
    });
}

//var o = {}; drop_meta_to_image();
var o = {}; drop_2015_1005(o);

