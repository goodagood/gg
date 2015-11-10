

var assert = require("assert");
var u = require("underscore");
var async = require("async");
var path = require("path");
var Promise = require("bluebird");

var folder_module = require("../aws/folder-v5.js");

var config = require("../test/config.js");

var ttool  = require ("../myutils/test-util.js");

var _folder_path    = 'abc';
var _user_name      = 'abc';
var _gg_folder_name = 'goodagood';
var _new_folder_name= 'test';


var p = console.log;

var stop = function(period) {
    var milli_seconds;
    period = period || 1;
    if (!u.isNumber(period)) {
        period = 1;
    }
    milli_seconds = period * 1000;
    return setTimeout(process.exit, milli_seconds);
};


test_get_all_uuid = function(test){
    test.expect(1);
    folder_module.retrieve_promisified_folder(_folder_path).then(function(folder) {
        meta = folder.get_meta();
        uuid_list = Object.keys(meta.files);
        return uuid_list;
    }).then(function(list){
        //p('list: ', list);
        test.ok(u.isArray(list));
        test.done();
    });
};


test_get_text_of_the_1st = function(test){
    _folder_path = 'abc/goodagood/message';
    var Folder;
    test.expect(9);
    folder_module.retrieve_promisified_folder(_folder_path).then(function(folder) {
        Folder = folder;
        meta = folder.get_meta();
        uuid_list = Object.keys(meta.files);
        return uuid_list;
    }).then(function(list){
        //p('list: ', list);
        test.ok(u.isArray(list)); //1
        test.ok(list.length > 0); //2
        return list[0];
    }).then(function(first){
        // 'first' is the first uuid of msg file.
        //p('the first uuid: ', first);
        test.ok(u.isString(first)); //3

        Folder.uuid_to_file_obj(first, function(err, file){
            //p('get the file obj: \n',err,  file);
            test.ok(u.isObject(file)); //4
            test.ok(u.isFunction(file.delete_s3_storage)); //5

            var info = file.get_meta();
            test.ok(u.isObject(info)); //6
            p('the first file name: ', info.name);
            test.ok(u.isString(info.name));

            file.fetch_msg_json(function(err,json){
                p('json: ', json);
                test.ok(u.isString(json.to));
                test.ok(u.isString(json.from));
                //file.get_msg_text(function(err, txt){
                //    p ('text of the msg: ', txt);
                //    //test.ok(u.isString(txt));
                //    //test.done();
                //});
                test.done();
            });
        });

    });
};


test_del_first_msg = function(test){
    msg_folder = 'abc/goodagood/message';

    var Mfolder;
    test.expect(2);
    folder_module.retrieve_promisified_folder(msg_folder).then(function(folder) {
        Mfolder = folder;
        meta = folder.get_meta();
        uuid_list = Object.keys(meta.files);
        return uuid_list;
    }).then(function(list){
        p('list got in "test del first":\n', list);
        test.ok(u.isArray(list));
        //test.done();
        return list;
    }).then(function(list){
        var la = list[0];
        p('the first in "test del first":\n', la);
        test.ok(u.isString(la));
        Mfolder.delete_uuid(la, function(err, reply){
            p('delete one? err, rep: ', err, reply);
            test.done();
        });
    });

};

check_to_get_file_obj = function(test){
    msg_folder = 'abc/goodagood/message';
    //delete uuid:  5095f6ac-94ad-467c-a619-5917073db1cf
    //name is To_aa_1416917760452.ggmsg

    uuid = "5095f6ac-94ad-467c-a619-5917073db1cf";
    folder_module.retrieve_promisified_folder(msg_folder).then(function(folder) {
        //var folder_meta = folder.get_meta();

        //p ("folder meta\n", folder_meta);
        //p ("file meta in folder\n", folder_meta.files[uuid]);

        //folder.get_file_obj_by_uuid(uuid).then(function(file){
        //    var file_meta = file.get_meta();
        //    p ('file meta\n', file_meta);
        //    test.done();
        //});

        folder.delete_uuid(uuid, function(err, reply){
            p('delete one got : err, rep: ', err, reply);
            test.done();
        });
    })
}



test_write_and_get_uuid = function(test){

    // settings of the test:
    var folder_path = 'abc';
    var file_name = "test-write-and-get-uuid";
    var file_text = "this is a test\n" +
        "this is the second line\n" +
        " -- to wriet this file, and check to get it by uuid --" +
        "this is the time: " + new Date() ;

    // global vars:
    var Meta, Folder;

    folder_module.retrieve_promisified_folder(folder_path).then(function(folder) {
        Folder = folder;
        test.expect(5); // number of tests:
        test.ok(u.isObject(Folder));
        return folder.write_text_file(file_name, file_text);
    }).then(function(what){
        p('Going to sleep 30 secs. We should already wrote the file: ', file_name);
        return config.promise_to_wait(30);
    }).then(function(){
        return Folder.promise_to_retrieve_saved_meta();
    }).then(function(meta){
        Meta = meta;
        test.ok(u.isObject(Meta));
        test.ok(u.isString(Meta.name));
        test.ok(Meta.path === folder_path);
        //test.ok(Folder.file_exists(file_name));  // till not wrote.
        test.done();
    });

};

//#? todo...
ta1_delete_folder = function(test){
    // without consider the contents of the folder
    //test.expect(1);
    folder_module.retrieve_promisified_folder(_folder_path).then(function(folder) {
        meta = folder.get_meta();
        p('got meta path: ', meta.path);
        test.done();
    });
};

module.exports.group_one = {
    setUp: function (callback) {
        //this.foo = 'bar';
        callback();
    },
    tearDown: function (callback) {
        callback();
    },

    "test-1 : get all uuids" : test_get_all_uuid,
    "test-4 : get text of the 1st" : test_get_text_of_the_1st

    //"test-2 : del first msg for abc" : test_del_first_msg
    //"test-3 : tmp when other failed " : check_to_get_file_obj,
};


module.exports.file_stop = function(test){
    test.expect(1);
    test.ok(true);
    stop();
    test.done();
}


// -- the following is for hand checkings --

function check_get_uuids(_path){
    _path = _path || 'abc/test';

    var folder_path = path.dirname (_path);
    var basename    = path.basename(_path);
    p(folder_path, basename);
    folder_module.retrieve_promisified_folder(folder_path).then(function(folder){
        var list = folder.get_uuids(basename);
        //p (1, list);
        return list;
    }).then(function(uuid_list){
        p(uuid_list);
        stop();
    });
}

function check_del_file(file_path){
    var _path = file_path || 'abc/txt-15';

    var folder_path = path.dirname (_path);
    var basename    = path.basename(_path);
    p(folder_path, basename);
    folder_module.retrieve_promisified_folder(folder_path).then(function(folder){
        assert(u.isFunction(folder.delete_file_promised));
        return folder.delete_file_promised(basename);
    }).then(function(del){
        p('after del the ' + _path);
        p(del);
        stop();
    });
}

function check_pattern(path_pattern){
    var _path = path_pattern || 'abc/tx';

    var folder_path  = path.dirname (path_pattern);
    var base_pattern = path.basename(path_pattern);
    if(!base_pattern) base_pattern = '^[!.].+';
    var pat          = new RegExp(base_pattern);
    p(folder_path, base_pattern);

    folder_module.retrieve_promisified_folder(folder_path).then(function(folder){
        var uuid_list = folder.pattern_to_uuids(pat);
        p(uuid_list);
        stop();
    });
}

function delete_one_file_by_pattern(folder_path, pat){
    var Folder;
    folder_module.retrieve_promisified_folder(folder_path).then(function(folder){
        Folder = folder;
        var uuid_list = folder.pattern_to_uuids(pat);
        p(uuid_list);
        if(uuid_list.length >= 1){ return uuid_list[0];}
        else {throw 'not found any one can get deleted';}
    }).then(function(uuid){
        p(uuid);
        return Folder.delete_file_by_uuid(uuid);
    }).then(function(del){
        p('it should deleted');
        p(del);
        stop();
    });;
}


function delete_one_folder(folder_path, pat){
    folder_path = folder_path || 'abc/imgvid';
    pat         = pat         || 'f55.+';

    var Folder;
    folder_module.retrieve_promisified_folder(folder_path).then(function(folder){
        Folder = folder;
        var uuids = Folder.pattern_to_uuids(pat);
        p(uuids);

        if(uuids.length > 0){ return uuids[0];}
        else {throw 'not > 0, can get deleted';}
    }).then(function(uuid){
        p(uuid);
        Folder.delete_folder(uuid, function(err, what){
            p('ok, what you got?');
            p(err, what);
            stop();
        });
    });
}

function check_add_folder(folder_path){
    folder_path = folder_path || 'abc/tadd';
    var dir  = path.dirname (folder_path);
    var name = path.basename(folder_path);

    // Sub is added new folder
    var Folder, Meta, Sub;
    folder_module.retrieve_promisified_folder(dir).then(function(folder){
        Folder = folder;
        Meta   = Folder.get_meta();
        p('path: ', Meta.path);
        p('uuid: ', Meta.uuid);

        return Folder.add_folder(name);

        //Folder.add_folder(name);
    }).then(function(obj){
        Sub = obj;
        var new_meta = Sub.get_meta();
        p('new meta: ', new_meta);
        stop();
    });
    
}


function delete_folder(folder_path){
    folder_path = folder_path || 'abc/test-add';
    var dir  = path.dirname (folder_path);
    var name = path.basename(folder_path);

    // Sub is added new folder
    var Folder, Meta, Sub;
    folder_module.retrieve_promisified_folder(dir).then(function(folder){
        Folder = folder;
        if(! Folder.file_exists(name)){return Promise.reject('not exists: ' + folder_path);}
        assert(Folder.file_exists(name));
        assert(u.isFunction(Folder.delete_folder_promised));
        return Folder.get_uuids(name);
    }).then(function(uuids){
        assert(u.isArray(uuids));
        assert(uuids.length >= 1);
        return Folder.delete_folder_promised(uuids[0]);
    }).then(function(what){
        p('should be aws reply:\n', what);
    }).then(function(){
        ttool.stop();
    }).catch(function(err){
        p('caught what:\n', err);
        ttool.stop();
    });
}

list_file_names = function(test){
    // todo
    test.expect(1);
    folder_module.retrieve_promisified_folder(_folder_path).then(function(folder) {
        meta = folder.get_meta();
        uuid_list = Object.keys(meta.files);
    });
}

if(require.main === module){
    //check_get_uuids('abc/test');
    //check_del_file();
    check_pattern('abc/test/Mark.+');
    //delete_one_file_by_pattern('tmpab', /Home.md/);
    //delete_folder();

    //check_add_folder();
    //
    //delete_one_folder('abc', /test-add$/);
    delete_one_folder('abc/imgvid', /f55.+/);
}
