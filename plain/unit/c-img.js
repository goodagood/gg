
// 
// reset image renderring for abc/imgvid
//

var Promise, assert, check_init_folder, check_member_file_exists, members, p,
    path, u;

var assert = require("assert");
var async  = require("async");
var u = require("underscore");
var path = require("path");
//var Promise = require("bluebird");

var image = require("../aws/image-file-v2.js");

var folder_module = require("../aws/folder-v5.js");
var tool  = require("../myutils/test-util.js");

var p = console.log;

var _test_folder_path = 'abc';
var _test_user_name   = 'abc';

//var test_only_one_members_file = function(test){
//    test.expect(1);
//    var dir = _test_folder_path;
//
//    var member_obj;
//    members.retrieve_member_obj(dir).then( function (obj){
//        member_obj = obj;
//        var number = member_obj.get_number_of_member_file();
//        //p(1);
//        //#p obj
//        return number;
//    }).then(function (number){
//        //p(2);
//        test.ok(number == 1);
//        //test.ok(true);
//    }).then(function(){
//        //p(3);
//        test.done();
//    });
//};
//
//test_get_json = function(test){
//    test.expect(4);
//    //p ('testing "get json"');
//
//    members.retrieve_member_obj(_test_folder_path).then( function (obj){
//        Mobj = obj;
//        test.ok(u.isObject(Mobj));
//
//        return Mobj.get_json();
//    }).then(function(j){
//        //p (j);
//        test.ok(u.isObject(j));
//        test.ok(u.isArray(j.members));
//        test.ok(u.isArray(j.viewers));
//        test.done();
//    });
//}
//
//
//test_add_member_3 = function(test){
//    //test.expect(2);
//    //p ('testing "add memb"');
//    var member_name = 'abc'
//    var member_name_2 = 'abc.who.know'
//
//    var dir = _test_folder_path;
//    var Mobj;
//    //test.ok(true);
//    //test.done();
//    members.retrieve_member_obj(dir).then( function (obj){
//        Mobj = obj;
//        test.ok(u.isObject(Mobj));
//
//        p('got first ok in "test add member"');
//        return Mobj.add_member(member_name);
//    }).then(function(){
//        test.done();
//    });
//
//    //.then(function(what){
//    //    return Mobj.get_json();
//    //}).then(function(j){
//    //    p ('get j, after added one:', j);
//    //}).then(function(){
//    //    return Mobj.has_member(member_name);
//    //}).then(function(has){
//    //    //p('has member : ', has);
//    //    test.ok(has);
//    //    return Mobj.add_member(member_name_2);
//    //}).then(function(){
//    //    return Mobj.has_member(member_name_2);
//    //}).then(function(has){
//    //    p('3: ', has);
//    //    test.ok(has);
//    //    test.done();
//    //});
//};
//
//test_del_member = function(test){
//    //test.expect(2);
//    p ('testing "del memb"');
//    var member_name_2 = 'abc.who.know';
//
//
//    var Mobj;
//    members.retrieve_member_obj(_test_folder_path).then( function (obj){
//        Mobj = obj;
//        test.ok(u.isObject(Mobj));
//        return Mobj;
//    }).then(function(){
//        return Mobj.add_member(member_name_2);
//    }).then(function(){
//        p('going to sleep 15 seconds, to wait member file writing, after add', member_name_2);
//        return tool.promise_to_sleep(15);
//    }).then(function(){
//        return Mobj.get_json();
//    }).then(function(j){
//        //p('get j, after add in del member testing:', j);
//    }).then(function(){
//        return Mobj.has_member(member_name_2);
//    }).then(function(has){
//        //p('3: ', has);
//        test.ok(has);
//    }).then(function(){
//        return Mobj.del_member(member_name_2);
//    }).then(function(){
//        p('going to sleep 15 seconds, to wait member file writing, after del ', member_name_2);
//        return tool.promise_to_sleep(15);
//    }).then(function(what){
//        //p(4, 'get what: ', what);
//        return Mobj.has_member(member_name_2);
//    }).then(function(has){
//        //p('5: ', has);
//        test.ok(!has);
//        test.done();
//    });
//};
//
//test_get_folder = function(test){
//    test.expect(4);
//    p ('testing "get folder"');
//
//    var Mobj;
//    members.retrieve_member_obj(_test_folder_path).then( function (obj){
//        Mobj = obj;
//        test.ok(u.isObject(Mobj));
//        return Mobj;
//    }).then(function(o){
//        return Mobj.get_file_obj();
//    }).then(function(file){
//        //p('t get folder\n');
//        //p('t get folder\n', file);
//        var meta = file.get_meta();
//        return meta;
//    }).then(function(meta){
//    //    p ('get meta in "test get folder":', meta);
//        test.ok(u.isObject(meta));
//        test.ok(u.isString(meta.path));
//        test.ok(true);
//        test.done();
//    });
//};
//
//
//
//// !!
//test_weird_fails = function(test){
//    //test.expect(2);
//    //p ('testing "add memb"');
//    var member_name = 'abc'
//    var member_name_2 = 'abc.who.know'
//
//    var dir = _test_folder_path;
//    var Mobj;
//    members.retrieve_member_obj(dir).then( function (obj){
//        Mobj = obj;
//        test.ok(u.isObject(Mobj));
//
//        return Mobj.add_member(member_name);
//    }).then(function(what){
//        return Mobj.get_json();
//    }).then(function(j){
//        p ('get j, after added one:', j);
//    }).then(function(){
//        return Mobj.has_member(member_name);
//    }).then(function(has){
//        //p('has member : ', has);
//        test.ok(has);
//        return Mobj.add_member(member_name_2);
//    }).then(function(){
//        return Mobj.has_member(member_name_2);
//    }).then(function(has){
//        p('3: ', has);
//        test.ok(has);
//        test.done();
//    });
//};
//
//
//t21_get_manager_from_folder = function(test){
//    //test.expect(4);
//    p ('testing "manager from folder"');
//
//    var Mobj;
//
//    folder_module.retrieve_folder(_test_folder_path).then(function(folder){
//        return folder.get_member_manager();
//    }).then( function (obj){
//        Mobj = obj;
//        test.ok(u.isObject(Mobj));
//        return Mobj;
//    }).then(function(o){
//        return o.get_json();
//    }).then(function(j){
//        test.ok(u.isObject(j));
//        test.ok(! u.isNull(j));
//        test.ok(u.isArray(j.viewers));
//        p('json: ', j);
//    }).then(function(){
//        test.done();
//    });
//}
//
//module.exports.test_one = {
//    setUp: function (callback) {
//        //this.foo = 'bar';
//        //members.retrieve_member_obj(_test_folder_path).then( function (obj){
//        //    Mobj = obj;
//        //    setTimeout(callback, 500);
//        //    //callback();
//        //});
//
//        callback();
//    },
//    tearDown: function (callback) {
//        p ('- in tearDown');
//        callback();
//    },
//
//    "test1 : only one member file" : test_only_one_members_file,
//    "test2 : get json" : test_get_json,
//    "test3 : add member" : test_add_member_3,
//    "test4 : get folder" : test_get_folder,
//    "test5 : del member" : test_del_member,
//
//    "test2.1 : get manager from folder" : t21_get_manager_from_folder,
//
//};
//
//
//module.exports.last = function(test){
//    test.expect(1);
//    test.ok(true);
//    stop();
//    test.done();
//}
//
//
//// -- The rest is for checking:
//
//
//var p    = console.log;
//var stop = function(seconds) {
//    var seconds = seconds || 1;
//    var milli_sec = seconds * 1000;
//    setTimeout(process.exit, milli_sec);
//};
//
//
//test_check_members_file_exists = function(dir) {
//    dir = dir || _test_folder_path;
//    members.retrieve_member_obj(dir).then(function(mobj) {
//        return mobj.check_members_file_exists();
//    }).then(function(exists) {
//        return p("exists: " + exists);
//    }).then(stop);
//};
//
//
//check_how_many_members_file = function(dir){
//    dir = dir || _test_folder_path;
//
//    var member_obj = null;
//    retrieve_member_obj(dir).then(function (obj){
//        member_obj = obj;
//        return obj;
//        //p obj
//    }).then(function(){
//        return member_obj.keep_only_one_member_file();
//    }).then(function (){
//        stop();
//    });
//}
//
//
//check_init_folder = function(dir) {
//    return members.retrieve_member_obj(dir).then(function(mobj) {
//        p('1 member object: ', mobj);
//        return mobj;
//    }).then(function(mobj) {
//        return mobj.init_folder();
//    }).then(function(folder) {
//        p('3 folder:');
//        return folder;
//    }).then(function(f) {
//        var fm;
//        fm = f.get_meta();
//        p('name: ', fm.name);
//        return p('uuid: ', fm.uuid);
//    }).then(stop);
//};
//
//show_member_file = function(dir) {
//    dir = dir || _test_folder_path;
//    members.retrieve_member_obj(dir).then(function(mobj) {
//        //p('1 member object: ', mobj);
//        return mobj.show_members_file();
//    }).then(function(member_file_txt){
//        return p('mem..f..txt:\n', member_file_txt);
//    }).then(function(){
//        stop();
//    }).catch(function(what){
//        p('-- catch: what show?', what);
//        stop();
//    });
//}
//
//
//check_get_manager_from_folder = function(_path){
//    _path = _path || _test_folder_path;
//    p ('checking "manager from folder"');
//
//    var Mobj;
//
//    folder_module.retrieve_folder(_path).then(function(folder){
//        return folder.get_member_manager();
//    }).then( function (obj){
//        Mobj = obj;
//        return Mobj;
//    }).then(function(o){
//        return o.get_json();
//    }).then(function(j){
//        p('json: ', j);
//    }).then(function(){
//        stop();
//    });
//}
//
//
//check_find_user_role = function(_path){
//    _path = _path || _test_folder_path;
//
//    var _user_name = 'abc';
//    var _user_name = 'aa';
//    p ('checking "find user role"');
//
//    var Mobj;
//
//    folder_module.retrieve_folder(_path).then(function(folder){
//        return folder.get_member_manager();
//    }).then( function (obj){
//        Mobj = obj;
//        return Mobj;
//    }).then(function(o){
//        return o.check_user_role(_user_name, function(err, role){
//            p('checking user role of ', _user_name);
//            p('-- role: ', role);
//            stop();
//        });
//    }).then(function(role){
//    }).then(function(){
//        //stop();
//    });
//}
//
//
//function number_check_0211(test){
//    var dir = _test_folder_path;
//
//    var member_obj;
//    members.retrieve_member_obj(dir).then( function (obj){
//        member_obj = obj;
//        var number = member_obj.get_number_of_member_file();
//        //p(1);
//        p('member obj:\n', obj);
//        return number;
//    }).then(function (number){
//        p(number);
//        if(number > 1) return member_obj.keep_only_one_member_file();
//        return number;
//        //assert(number == 1);
//    }).then(function(what){
//        p ('get what after try to keep only one?\n', what);
//    }).then(function(){
//        //p(3);
//        tool.stop();
//    });
//};

// checkings

function img_212(){
    var img_folder = 'abc/imgvid';

    var Folder, Meta;
    var Files; // array

    folder_module.retrieve_folder(img_folder).then(function(folder){
        Folder = folder;
        Meta = folder.get_meta();
        Files = u.values(Meta.files);

        this.imgvid = Folder;
        this.imeta  = Meta;
        this.ifiles = Files;

        var pathes = u.pluck(Files, 'path');
        p('pathes:\n', pathes);

        async.map(Files
            , function(info, callback){
                var m = u.pick(info, 'name', 'path', 'uuid',
                    'type', 'what', 'owner', 'storage', 'thumb', 
                    'filetype', 'size');
                //p(m.thumb);
                renew_meta(m, function(err, meta){
                    Folder.add_file(meta);
                    p(meta.html.elements, meta.html.li);
                    callback(null, meta);
                });
            }
            , function(err, metas){
                Folder.save_meta(function(err, reply){
                    p('err, metas.length:\n', err, metas.length);
                    tool.stop();
                });
            }
        );

    }).then(function(){
    });
}

function renew_meta(m, callback){
    image.new_image_file_obj(m, function(err, obj){
        obj.calculate_meta_defaults();
        //obj.upgrade_to_s3storage_collection()

        obj.render_html_repr();

        //#callback(err, obj)
        obj.save_meta_file(  function(err, reply){
            if(err) callback(err, reply);
            var meta = obj.get_meta();
            callback(null, meta);
        });
    });
}

//img_212();

// Beside testing , here do some checking:
if (require.main === module){
    img_212();
}

