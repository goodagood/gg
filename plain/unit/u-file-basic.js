// 
// to make file checking easy.
// 2015, 0805
//
// but really got a lot video file thing, because i am doing it, 2015, 0814
//

var assert = require("assert");
var u = require("underscore");
var async = require("async");
var path = require("path");
var Promise = require("bluebird");

var folder_module = require("../aws/folder-v5.js");
var get_file      = require("../aws/get-file.js");

var myconfig =   require("../config/config.js");
var config = require("../test/config.js");

var bucket = require("../aws/bucket.js");

var folder_path = 'abc';
var user_name = 'abc';
var gg_folder_name = 'goodagood';
var new_folder_name = 'test';


var fs = require('fs');
var tb = require("../video/thumbnail.js");

var p = console.log;
var stop = process.exit;






function get_file_objs_by_path(file_path, callback){
    if (!u.isString(file_path)) return callback('give file path string');

    var name = path.basename(file_path);
    var cwd  = path.dirname (file_path);

    folder_module.retrieve_folder(cwd).then(function(folder){
        folder.get_file_objs(name, callback);
    });
}

// d, use get-file.js
function get_1st_file_obj_by_path(file_path, callback){
    get_file_objs_by_path(file_path, function(err, objs){
        if(err){
            p(' --- we got err, in get first file obj ... path');
            return callback(err);
        }

        p('-- got here? get 1st file obj by path?');
        callback(err, objs[0]);
    });
}


// tmp solution to give file obj of 'sun.mp4'
function get_sun_mp4  (callback){
    var file_path = 'abc/test/sun.mp4';

    get_file_objs_by_path(file_path, function(err, objs){
        callback(err, objs[0]);
    });
}



function save_file_to_local(meta, callback){
    var s3key = meta.storage.key;

    var info  = tb.prepare_thumb_file_info(meta);
    p('info: ', info);

    var tmp_name     = meta.uuid + '-' + meta.name;
    var tmp_filename = path.join('/tmp', tmp_name);
    p('s3 key       : ', s3key);
    p('tmp file name: ', tmp_filename);


    bucket.read_data(s3key, function(err, data){
        if(err){
            p('1, err: ', err);
            return callback(err);
        }
        
        p('2,  typeof data: ', typeof data);
        //return callback(err, data);

        fs.writeFile(tmp_filename, data, function(err, what){
            if(err){
                p('1.1, err: ', err);
                return callback(err);
            }
            return callback(err, what);
        });
    });

    //stop();
}

var vp = require("../aws/plugin-ft/video-file-p.js");
function c_video_sun_mp4(){
    assert(u.isFunction(vp.new_file_obj));

    get_sun_mp4(function(err, obj){
        var m = obj.get_meta();
        //p(m);
        save_file_to_local(m, function(err, data){
            stop();
        });
    });
}


// check with an small mp4 video file
function check_video(){
    var file_path = 'abc/test/small3.mp4';

    get_file.get_1st_file_obj_by_path(file_path, function(err, file){
        if(err) return p('check video got err: ', err);

        var m = file.get_meta();
        p('meta path: ', m.path);
        tb.do_test(m, function(err, data){
            p('inside do test           : ', err, typeof data);
            p('check video got data: ', "\n", data);
            stop();
        });

    });
}


function process_local_thumbnails(){
    var previous = {
        uuid: '3b0ec354-b2dc-4a85-b98a-e527155c4544',
        output_dir: '/tmp',
        output_filename_pattern: '%b-%i.png',
        local_video_name: '3b0ec354-b2dc-4a85-b98a-e527155c4544small3.mp4',
        local_file_path: '/tmp/3b0ec354-b2dc-4a85-b98a-e527155c4544small3.mp4',
        filenames: [
            '3b0ec354-b2dc-4a85-b98a-e527155c4544small3-1.png',
            '3b0ec354-b2dc-4a85-b98a-e527155c4544small3-2.png',
            '3b0ec354-b2dc-4a85-b98a-e527155c4544small3-3.png',
            '3b0ec354-b2dc-4a85-b98a-e527155c4544small3-4.png' 
            ]
    };
    //p(previous);

    //make_thumbnail_s3keys(previous);
    //stop();

    p('start to get the file, small3 now');
    var file_path = 'abc/test/small3.mp4';
    get_file.get_1st_file_obj_by_path(file_path, function(err, file){
        if(err){
            p('1 1743, check video got err: ', err);
            return stop();
        }

        var meta = file.get_meta();
        var info = tb.prepare_thumb_file_info(meta);

        p('the info', "\n", info);


        p('go to get aux path, callback way');
        file.callback_file_auxiliary_path(function(err, auxpath){
            if(err) return p('oh err, : ', err);

            p('got aux path: ', auxpath);

            tb.do_test(meta, function(err, infob){
                p(3.1302);
                infob.auxpath = auxpath;
                tb.make_thumbnail_s3keys(infob);
                p('infob');
                p( infob );
                stop();
            });

        });
    });

}



function put_to_s3(info, callback){
    // The input `info` must has `s3keys` and corresponding 
    // `local_thumbnail_file_pathes`
    //var info = 
    //{ 
    //    s3keys: [
    //        'file_aux/1439001597882/3b0ec354-b2dc-4a85-b98a-e527155c4544/small3-1.png',
    //        'file_aux/1439001597882/3b0ec354-b2dc-4a85-b98a-e527155c4544/small3-2.png',
    //        'file_aux/1439001597882/3b0ec354-b2dc-4a85-b98a-e527155c4544/small3-3.png',
    //        'file_aux/1439001597882/3b0ec354-b2dc-4a85-b98a-e527155c4544/small3-4.png' ],
    //    local_thumbnail_file_pathes: [
    //        '/tmp/3b0ec354-b2dc-4a85-b98a-e527155c4544small3-1.png',
    //        '/tmp/3b0ec354-b2dc-4a85-b98a-e527155c4544small3-2.png',
    //        '/tmp/3b0ec354-b2dc-4a85-b98a-e527155c4544small3-3.png',
    //        '/tmp/3b0ec354-b2dc-4a85-b98a-e527155c4544small3-4.png' ]
    //};

    var pairs   = u.zip(info.local_thumbnail_file_pathes, info.s3keys);
    var workers = u.map(pairs, function(one){
        p('local file path: ', one[0], ' --- ', 's3key: ', one[1]);
        return function(callback){
            bucket.put_one_file(one[0], one[1], callback);
        };
    });

    async.parallel(workers, callback);
}


function check_put_to_s3(){
    var info = 
    { uuid: '3b0ec354-b2dc-4a85-b98a-e527155c4544',
        output_dir: '/tmp',
        output_filename_pattern: '%b-%i.png',
        local_video_name: '3b0ec354-b2dc-4a85-b98a-e527155c4544small3.mp4',
        local_file_path: '/tmp/3b0ec354-b2dc-4a85-b98a-e527155c4544small3.mp4',
        filenames: [
            '3b0ec354-b2dc-4a85-b98a-e527155c4544small3-1.png',
            '3b0ec354-b2dc-4a85-b98a-e527155c4544small3-2.png',
            '3b0ec354-b2dc-4a85-b98a-e527155c4544small3-3.png',
            '3b0ec354-b2dc-4a85-b98a-e527155c4544small3-4.png' ],
        auxpath: 'file_aux/1439001597882/3b0ec354-b2dc-4a85-b98a-e527155c4544',
        shorted_thumbnail_filenames: [ 'small3-1.png', 'small3-2.png', 'small3-3.png', 'small3-4.png' ],

        // must has:
        s3keys: [
            'file_aux/1439001597882/3b0ec354-b2dc-4a85-b98a-e527155c4544/small3-1.png',
            'file_aux/1439001597882/3b0ec354-b2dc-4a85-b98a-e527155c4544/small3-2.png',
            'file_aux/1439001597882/3b0ec354-b2dc-4a85-b98a-e527155c4544/small3-3.png',
            'file_aux/1439001597882/3b0ec354-b2dc-4a85-b98a-e527155c4544/small3-4.png'
            ],
        local_thumbnail_file_pathes: [
            '/tmp/3b0ec354-b2dc-4a85-b98a-e527155c4544small3-1.png',
            '/tmp/3b0ec354-b2dc-4a85-b98a-e527155c4544small3-2.png',
            '/tmp/3b0ec354-b2dc-4a85-b98a-e527155c4544small3-3.png',
            '/tmp/3b0ec354-b2dc-4a85-b98a-e527155c4544small3-4.png'
                ]
    };

    put_to_s3(info, function(err, what){
        p('after check put to s3, err what', "\n",  err, what);
        stop();
    });
}


function rm_local_files(info, callback){
    var all_files = u.union([info.local_file_path,], info.local_thumbnail_file_pathes );
    p("got all files\n", all_files);

    assert(u.isArray(all_files));

    async.map(all_files, fs.unlink, callback);
}


var sample_info = 
    { uuid: '3b0ec354-b2dc-4a85-b98a-e527155c4544',
        output_dir: '/tmp',
        output_filename_pattern: '%b-%i.png',
        local_video_name: '3b0ec354-b2dc-4a85-b98a-e527155c4544small3.mp4',
        local_file_path: '/tmp/3b0ec354-b2dc-4a85-b98a-e527155c4544small3.mp4',
        filenames: [
            '3b0ec354-b2dc-4a85-b98a-e527155c4544small3-1.png',
            '3b0ec354-b2dc-4a85-b98a-e527155c4544small3-2.png',
            '3b0ec354-b2dc-4a85-b98a-e527155c4544small3-3.png',
            '3b0ec354-b2dc-4a85-b98a-e527155c4544small3-4.png' ],
        auxpath: 'file_aux/1439001597882/3b0ec354-b2dc-4a85-b98a-e527155c4544',
        shorted_thumbnail_filenames: [ 'small3-1.png', 'small3-2.png', 'small3-3.png', 'small3-4.png' ],

        // must has:
        s3keys: [
            'file_aux/1439001597882/3b0ec354-b2dc-4a85-b98a-e527155c4544/small3-1.png',
            'file_aux/1439001597882/3b0ec354-b2dc-4a85-b98a-e527155c4544/small3-2.png',
            'file_aux/1439001597882/3b0ec354-b2dc-4a85-b98a-e527155c4544/small3-3.png',
            'file_aux/1439001597882/3b0ec354-b2dc-4a85-b98a-e527155c4544/small3-4.png'
            ],
        local_thumbnail_file_pathes: [
            '/tmp/3b0ec354-b2dc-4a85-b98a-e527155c4544small3-1.png',
            '/tmp/3b0ec354-b2dc-4a85-b98a-e527155c4544small3-2.png',
            '/tmp/3b0ec354-b2dc-4a85-b98a-e527155c4544small3-3.png',
            '/tmp/3b0ec354-b2dc-4a85-b98a-e527155c4544small3-4.png'
                ]
    };


/*
 * Check remove the local files got during thumbnail making, before checking
 * be sure the sample_info is valid
 */
function check_rm_all_files(){
    rm_local_files(sample_info, function(err){
        p('err:')
        p(err);
        stop();
    });
}




function chk_add_thumbnails(){
    var file_path = 'abc/test/small3.mp4';
    get_file.get_1st_file_obj_by_path(file_path, function(err, file){
        if(err){
            p('1 , check add thumbnails got err: ', err);
            return stop();
        }

        var meta = file.get_meta();

        p('go to get aux path, callback way');
        file.callback_file_auxiliary_path(function(err, auxpath){
            if(err) return p('oh err, : ', err);

            p('got aux path: ', auxpath);

            tb.add_thumbnails(meta, function(err, info){
                p('err ', err);
                p('info');
                p( info );
                stop();
            });

        });
    });
}


function check_mk_info(){
    var info = {
        uuid: '3b0ec354-b2dc-4a85-b98a-e527155c4544',
        output_dir: '/tmp',
        output_filename_pattern: '%b-%i.png',
        local_video_name: '3b0ec354-b2dc-4a85-b98a-e527155c4544small3.mp4',
        local_file_path: '/tmp/3b0ec354-b2dc-4a85-b98a-e527155c4544small3.mp4',
        filenames: [
            '3b0ec354-b2dc-4a85-b98a-e527155c4544small3-1.png',
            '3b0ec354-b2dc-4a85-b98a-e527155c4544small3-2.png',
            '3b0ec354-b2dc-4a85-b98a-e527155c4544small3-3.png',
            '3b0ec354-b2dc-4a85-b98a-e527155c4544small3-4.png' 
            ]
    };

    // must give this attr.
    info.auxpath = '---i-am-aux-path---';
    //p(info);

    tb.make_thumbnail_s3keys(info);

    p('sample info');
    p(info);
    stop();
}



function chk_meta_setting(){
    var file_path = 'abc/test/small3.mp4';
    get_file.get_1st_file_obj_with_auxpath_by_path(file_path, function(err, file){
        p('meta.path, 519');
        p(file.get_meta().path);

        var meta = file.get_meta();
        meta.description = 'i am testing save the video file meta, 18';

        tb.save_file_meta(meta, function(err, what){
            p('after save file meta, err, what?');
            p(err, what);
            stop();
        });
    });
}



/////////////////////////////////////////////////////////////////////////////

// files, not folders.
function get_true_file_metas(folder_path){
    // This works as a tool, it try to give a list of files in the folder.

    return folder_module.retrieve_folder(folder_path).then(function(folder) {
        Meta = folder.get_meta();
        var files = Meta.files;

        //u.each(files, function(f){
        //    p(f.what, f.name, f.timestamp);
        //});
        var true_files = u.filter(files, function(f){return f.what === myconfig.IamFile;});
        return true_files; //metas
    });
}

function get_true_file_uuids(folder_path){
    // return a promise, which carry the list of uuids, all files, not folder.

    return get_true_file_metas(folder_path).then(function(metas){
        var uuids = u.map(metas, function(m){return m.uuid;});
        return uuids;
    });
}





function t3_read_file_by_name(test){
    var filename = 'folder.css',
        folder_path = 'abc';

    folder_module.retrieve_folder(folder_path).then(function(folder){
        //p('check t3 rfbn ', folder);
        //folder.get_file_objs_by_name(filename, function(err, objs){
        //});
        return folder.read_file_by_name(filename);
    }).then(function(str){
        p(2, str);
        test.ok(u.isString(str));

    }).then(function(){
        test.done();
    });
}


// checkings //

function check_get_file_objs_by_name  (){

    get_sun_mp4( function(err, objs){
            //p ('2, ', err, objs);
            var oa = objs;
            var ma = oa.get_meta()
            p (3, ma.path);
            p (4, ma);
            stop()
    });
}



check_get_first_file_by_name = function(){
    var file_path = 'abc/folder.css',
        folder_path = 'abc';

    p('in "check get first file by name": ');
    folder_module.retrieve_first_file_obj(file_path, function(err, file){
        var meta = file.get_meta();
        p ('retrieved first file obj:', meta);
        stop();
    });
}

check_delete_a_file_by_uuid = function(){
    // checking delete a file
    var file_path = 'abc/txt-15',
        folder_path = 'abc';

    p('in "check get first file by name": ');
    folder_module.retrieve_first_file_obj(file_path, function(err, file){
        var meta = file.get_meta();
        //p ('retrieved first file obj:', meta);
        var uuid = meta.uuid;
        p ('uuid: ', uuid);
        folder_module.retrieve_folder(folder_path).then(function(folder){
            folder.uuid_to_file_obj(uuid, function(err, file){
                //p('file object:\n', file);
                var meta2 = file.get_meta();
                //p('file meta2:\n', meta2);
                //bucket.s3_object_exists(meta2.storage.key, function(err, aws_reply){
                //    //p('s3 reply: \n', err, aws_reply);
                //    file.delete_s3_storage(function(err,reply){
                //        p('dele reply: \n', err, reply);
                //        stop();
                //    });
                //});

                folder.delete_file_by_uuid(uuid, function(err, rep){
                        p('delete file by uuid reply: \n', err, rep);
                        stop();
                });

            });
        });
    });
}

check_retrieve_folder_meta = function(){
    folder_module.retrieve_folder_meta(folder_path).then(function(meta){
        p ('meta: \n', meta);
        stop();
    });
}

check_read_a = function(){
    folder_module.retrieve_folder(folder_path).then(function(folder){
        folder.read_text('.gg.members.json', function(err, what){
            //p ('err, what: \n', err, what);
            stop();
        });
    });
    //.then(function(text){
    //    p ('text a\n', text);
    //});

}


check_read_b = function(){
    var path_ = 'tmpab/goodagood';
    var file_name_   = '.gg.people.v1.json';

    folder_module.retrieve_folder(path_).then(function(folder){
        folder.read_text_file(file_name_).then(function(what){
            p ('what: \n',  what);
            p ('isString what: \n',  u.isString(what));
            stop();
        });
    });
    //.then(function(text){
    //    p ('text a\n', text);
    //});

}


check_read_member_file_text = function(){
    folder_module.retrieve_folder(folder_path).then(function(folder){
        return folder.read_text_file('.gg.members.json')
    }).then(function(str){
        p('get to try again?\n', str);
        p('get to try again?\n', str);
    }).then(function(whatever){
        stop();
    });
};


uniq_member_file_uuid = function(){
    folder_path = 'abc';
    members_file_name = '.gg.members.json';
    var Folder, Meta;
    folder_module.retrieve_folder(folder_path).then(function(folder){
        Folder = folder;
        Meta = folder.get_meta();
        return Folder.get_uuids(members_file_name);
    }).then(function(uuid_list){
        p ('uuid list: \n', uuid_list);
        Meta.file_names[members_file_name] = u.uniq(uuid_list);
        p('meta file names get :', Meta.file_names[members_file_name]);
        return Folder.promise_to_save_meta();
    }).then(function(){
        stop();
    });
};


var write_a_txt_file = function(){

    // settings of the test:
    var folder_path = 'abc/test';
    var file_name = "txt-" + (new Date()).getDate();
    var file_text = "this is a text file\n" +
        (new Date()).toString() + '\n' + 
        "this is the 3rd line\n" +
        " -- to wriet this file, and check something --\n" +
        " -- now, save meta will locker first, it unlock after saving \n" +
        "this is the time: " + new Date() ;

    // global vars:
    var Meta, Folder;

    folder_module.retrieve_promisified_folder(folder_path).then(function(folder) {
        Folder = folder;
        return folder.write_text_file(file_name, file_text);
    }).then(function(what){
        p ('what got:\n', what);
        stop();
    });
};

function get_a_file(_file_path){
    //_file_path =  _file_path || 'abc/public/txt-15';
    _file_path =  _file_path || 'tmpab/highlight.md';
    folder_module.retrieve_file_objs(_file_path, function(err, files){
        p(err, files);
        var file = files[0];
        //p (Object.keys(file));
        //file.get_meta();
        var meta = file.get_meta();
        p ('meta.html', meta.html);
        stop();
    });
}

function rebuild_all_file(path_){
    path_ = path_ || 'tmpab';
    folder_module.retrieve_folder(path_).then(function(folder){
        var meta = folder.get_meta();
        var keys = Object.keys(meta.files);

        keys = keys.filter(function(uuid){
            var info = meta.files[uuid];
            return info.what !== myconfig.IamFolder;
        });

        async.map(keys, folder.uuid_to_file_obj, function(err, files){
            //p ('err, files: ', err, files);

            var funs  = files.map(function(f){
                // f : file
                return function(callback){
                    rebuild_file(f, function(err, rf){
                        var m = f.get_meta();
                        folder.add_file_save_folder(m, callback);
                    });
                }
            });
            //p('funs:\n', funs);
            //stop();

            async.series(funs, function(err, async_res){
                p('err, async res:\n', err, async_res);
                folder.list_files_and_save(function(){
                    stop();
                });
            })

        });



        //p ('keys: \n', keys);
    });
}

function rebuild_file(file, callback){
    // @file : file object
    file.calculate_meta_defaults();
    file.render_html_repr();
    file.save_meta_file(function(err, what){
        file.save_file_to_folder().then(function(after){
            p ('set time out');
            setTimeout(callback, 5000);
            //callback(null, null);
        });
    });
}


//0519
function check_retrieve_file_pu(){
    var path_uuid = 'abc/bacc688a-0daf-4fd3-80ef-15fd79fd0df6';
    folder_module.retrieve_file_by_path_uuid(path_uuid, function(err, file){
        var meta = file.get_meta();
        p(meta.path);
        stop();
    });
    //.catch(function(err){
    //    p("<h1>Err to retrieve, with file path uuid: "+ path_uuid +"</h1>");
    //    stop();
    //});
}

function for_blue(){
    var folder_path = 'abc/imgvid';

    // global vars:
    var Meta, Folder;

    folder_module.retrieve_folder(folder_path).then(function(folder) {
        Folder = folder;
        p('folder is empty?:', u.isEmpty(Folder)?'yes':'no');
        Meta = Folder.get_meta();
        var files = Meta.files;

        var list = Folder.build_blueimp_pic_gallery_list();
        p('the list: ', list);
        stop();
    });
}

function exists(dir){
    dir = dir || 'tmp';
    folder_module.folder_exists(dir, function(err, what){
        p('exists? ', "\n", err, what);
        stop();
    });
}


if(require.main === module){
    //check_retrieve_file_pu();
    //for_blue();

    //exists('akdlsjfk');
    //exists('abc');
    //check_get_file_objs_by_name  ();

    //c_video_sun_mp4();
    //check_video();
    //process_local_thumbnails();

    //check_put_to_s3();
    //check_rm_all_files();

    chk_add_thumbnails();
    //check_mk_info();
    //chk_meta_setting();
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



function drop_a_video_file_into_repl(o, file_path){
    o   = o   || this;
    file_path =  file_path || 'abc/test/small3.mp4';

    get_file.get_1st_file_obj_with_auxpath_by_path(file_path, function(err, file){
        if(err) return p('You got err when dropping: ', err);

        var meta = file.get_meta();
        o.file = file;
        o.meta = meta;

        o.tb   = tb;

        p('object should be populated');
    });
}


function drop_file_into_repl(o, file_path){
    o   = o   || this;
    file_path =  file_path || 'abc/test/index.html';

    get_file.get_1st_file_obj_with_auxpath_by_path(file_path, function(err, file){
        if(err) return p('You got err when dropping: ', err);

        var meta = file.get_meta();
        o.file = file;
        o.meta = meta;

        p( file_path, ', file object should be populated');
    });
}


//var o = {}; drop_a_video_file_into_repl(o);
var o = {}; drop_file_into_repl(o);


// a signal to 'expect'
console.log("ok start interact:");
