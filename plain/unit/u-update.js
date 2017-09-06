
//
// Try to file updating, for exist file.
// 0330, 2015.
//

var assert  = require("assert");
var u       = require("underscore");
var async   = require("async");
var path    = require("path");
var Promise = require("bluebird");
var fs      = require("fs");

var bucket        = require("../aws/bucket.js");
var folder_module = require("../aws/folder-v5.js");
var file_module   = require("../aws/simple-file-v3.js");
var file_types    = require("../aws/s3-file-types.js");
var update        = require("../aws/file-update.js");

var myconfig =   require("../config/config.js");
var config = require("../test/config.js");

var ttool  = require ("../myutils/test-util.js");

// folders, files used in testing //
var _test_folder_path = 'abc';
var _test_file_name   = 'test-write-20';
var _test_file_path   = 'abc/test-write-20';
var _test_user_name   = 'abc';

var _gg_folder_name  = 'goodagood';
var _new_folder_name = 'test';
var _new_folder_name_in_test = 'test';


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

// end of the headings //




// start of data
var tmp_meta_jq = {
    name: 'jq-m.html',
    size: 81087,
    lastModifiedDate: '2015-03-09T10:55:17.470Z',
    type: 'text/html',
    path: 'abc/jq-m.html',
    dir: 'abc',
    owner: 'abc',
    timestamp: 1425898517473,
    uuid: '006257ee-81dc-4f1f-a46b-383cab01883e',
    new_meta_s3key: '.gg.new/abc/006257ee-81dc-4f1f-a46b-383cab01883e',
    storage:
    { type: 's3',
        key: '.gg.file/abc/006257ee-81dc-4f1f-a46b-383cab01883e' },
    filetype: 'web',
    path_uuid: 'abc/006257ee-81dc-4f1f-a46b-383cab01883e',
    Meta_s3key: '.gg.file.meta/abc/006257ee-81dc-4f1f-a46b-383cab01883e',
    file_meta_s3key: '.gg.file.meta/abc/006257ee-81dc-4f1f-a46b-383cab01883e',
    s3_stream_href: '/ss/.gg.file/abc/006257ee-81dc-4f1f-a46b-383cab01883e',
    delete_href: '/del/abc/006257ee-81dc-4f1f-a46b-383cab01883e',
    view_href: '/viewtxt/abc/006257ee-81dc-4f1f-a46b-383cab01883e',
    what: 'I-am-goodagood-file.2014-0625.',
    permission: { owner: 'rwx', group: '', other: '' },
    'file-types': [],
    storages: [],
    html:
    { elements:
        { 'file-selector': '<label class="file-selector">\n<input type="checkbox" name="filepath[]" value="abc/006257ee-81dc-4f1f-a46b-383cab01883e" />\n\n<span class="filename">jq-m.html</span>\n</label>',
            anchor: '<a href="/ss/.gg.file/abc/006257ee-81dc-4f1f-a46b-383cab01883e"> jq-m.html</a>',
            'text-view': '<a href="/viewtxt/abc/006257ee-81dc-4f1f-a46b-383cab01883e">\n<span class="glyphicon glyphicon-zoom-in"> </span>Read\n</a>',
            remove: '<a href="/del/abc/006257ee-81dc-4f1f-a46b-383cab01883e">\n<span class="glyphicon glyphicon-remove"></span>Delete</a>',
            'path-uuid': '<a href="/fileinfo-pathuuid/abc/006257ee-81dc-4f1f-a46b-383cab01883e"> <i class="fa fa-paw"> </i> Paw-in </a>',
            'name-info': '<a href="/file-info/abc/006257ee-81dc-4f1f-a46b-383cab01883e" >jq-m.html</a>'
        },
        li: '<li class="file"><label class="file-selector">\n<input type="checkbox" name="filepath[]" value="abc/006257ee-81dc-4f1f-a46b-383cab01883e" />\n\n<span class="filename">jq-m.html</span>\n</label>&nbsp;\n<ul class="list-unstyled file-info"><li>\n<a href="/viewtxt/abc/006257ee-81dc-4f1f-a46b-383cab01883e">\n<span class="glyphicon glyphicon-zoom-in"> </span>Read\n</a>&nbsp;\n<a href="/del/abc/006257ee-81dc-4f1f-a46b-383cab01883e">\n<span class="glyphicon glyphicon-remove"></span>Delete</a>&nbsp;\n<a href="/fileinfo-pathuuid/abc/006257ee-81dc-4f1f-a46b-383cab01883e"> <i class="fa fa-paw"> </i> Paw-in </a>&nbsp;\n</li></ul></li>\n',
        li_viewer: '<li class="file"><label class="file-selector">\n<input type="checkbox" name="filepath[]" value="abc/006257ee-81dc-4f1f-a46b-383cab01883e" />\n\n<span class="filename">jq-m.html</span>\n</label>&nbsp;\n<a href="/ss/.gg.file/abc/006257ee-81dc-4f1f-a46b-383cab01883e"> jq-m.html</a>&nbsp;\n<ul class="list-unstyled file-info"><li>\n<a href="/viewtxt/abc/006257ee-81dc-4f1f-a46b-383cab01883e">\n<span class="glyphicon glyphicon-zoom-in"> </span>Read\n</a>&nbsp;\n</li></ul></li>' },
    value: { amount: 0, unit: 'GG' } 
};


var tmp_meta_mems = [
{ name: 'food.md',
    size: 1165,
    lastModifiedDate: '2015-04-03T07:25:40.567Z',
    type: 'text/x-markdown',
    path: 'abc/test/food.md',
    dir: 'abc/test',
    owner: 'abc',
    timestamp: 1428045940572,
    uuid: 'be1d2890-673b-4314-8995-e2c50ef90bd7',
    new_meta_s3key: '.gg.new/abc/test/be1d2890-673b-4314-8995-e2c50ef90bd7',
    storage:
    { type: 's3',
        key: '.gg.file/abc/test/be1d2890-673b-4314-8995-e2c50ef90bd7' },
    filetype: 'markdown',
    path_uuid: 'abc/test/be1d2890-673b-4314-8995-e2c50ef90bd7',
    Meta_s3key: '.gg.file.meta/abc/be1d2890-673b-4314-8995-e2c50ef90bd7',
    file_meta_s3key: '.gg.file.meta/abc/be1d2890-673b-4314-8995-e2c50ef90bd7',
    s3_stream_href: '/ss/.gg.file/abc/test/be1d2890-673b-4314-8995-e2c50ef90bd7',
    delete_href: '/del/abc/test/be1d2890-673b-4314-8995-e2c50ef90bd7',
    view_href: '/viewtxt/abc/test/be1d2890-673b-4314-8995-e2c50ef90bd7',
    what: 'I-am-goodagood-file.2014-0625.',
    permission: { owner: 'rwx', group: '', other: '' },
    'file-types': [],
    storages: [],
    html: {},
    value: { amount: 0, unit: 'GG' } 
},

];


// end of data


function get_metas_from_pattern(cwd, pat, callback){
    cwd = cwd || _test_folder_path;
    pat = pat || /.gg.members.*/;

    folder_module.retrieve_folder(cwd).then(function(folder){
        assert(u.isObject(folder));

        var uuid_list   = folder.pattern_to_uuids(pat); 
        var folder_meta = folder.get_meta();

        var meta_list  = u.map(uuid_list, function(uuid){
            return folder_meta.files[uuid];
        });

        callback(null, meta_list);
    });
}

function show_contents(){
    var cwd = 'abc';
    var pat = /.gg.mem.+/;
    get_metas_from_pattern(cwd, pat, function(err, metas){
        metas.sort();
        var s3keys = metas.map(function(m){return m.storage.key;});

        var funs = [];
        s3keys.forEach(function(key){
            funs.push( function(callback){
                bucket.read_file(key, function(err, str){
                    p(key, err, str);
                    callback(null, str);
                });
            });
        });

        async.series(funs, function(err, what){
            p('get what?', err, what);
            stop();
        });
    });
}


function check_update(){
    var cwd = 'abc';
    var pat = /.gg.mem.+/;
    get_metas_from_pattern(cwd, pat, function(err, metas){
        var m0 = metas[0];
        var m1 = metas[1];

        // m1 will be used to update m0's
        update.update_file(m1, function(err, what){
            if(err) p('after update file: err', err);
            //p('after update file: err what: ', err, what);

            if(m1.dir) p('m1 has dir: ', m1.dir);
            var folder_path = path.dirname(m1.path);
            p('going to delete the file: ', m1.path);
            folder_module.retrieve_folder(folder_path).then(function(folder){
                folder.delete_uuid(m1.uuid, function(err, what){
                    p('delete uuid got: ', err, what);
                    stop();
                });
            });
            //stop();
        });

    });

}

function check_unique(){
    var folder_path = 'abc/test';
    //var file_name   = '11.jpg';
    var file_name   = 'food.md';

    folder_module.retrieve_folder(folder_path).then(function(folder){
        var uniq = folder.is_name_unique(file_name);
        p('unique? : ', uniq);
        stop();
    });
}


function get_a_file_from_pattern(cwd, pat, callback){
    cwd = cwd || 'abc/test';
    pat = pat || /^links0128.+/;

    get_metas_from_pattern(cwd, pat, function(err, metas){
        //p('err metas.length', err, metas.length);
        assert(metas.length > 0);

        var m0 = metas[0]
        //p('meta 0: ', m0);
        file_types.set_file_obj_from_meta(m0, callback);
    });
}


function file_short_info(){
    var cwd = 'abc/test';
    var pat = /^food.+/;

    get_metas_from_pattern(cwd, pat, function(err, metas){
        var short_list = u.map(metas, function(m){return [m.path, m.uuid];});
        p (short_list);
        stop();
    });
}

function check_file_update(){
    var cwd = 'abc/test';
    //var pat = /^12.+/;
    var pat = /^links0128.+/;

    var sample_string = fs.readFile('/tmp/sample-string', function(err, buf){
        var str = buf.toString();
        //p('sample string:\n', str);

        get_metas_from_pattern(cwd, pat, function(err, metas){
            p('err metas.length', err, metas.length);

            var m0 = metas[0]
            var m1 = metas[1]
            p('meta 0, 1: ', m0.path, m0.timestamp, m1.timestamp);
            file_types.set_file_obj_from_meta(m0, function(err, file){
                //p('after set file obj from meta:', file.version);

                //file.update_storage(str, function(err, what){
                //    //p('after update storage, err what:\n', err, what);
                //    stop();
                //});

                // Use m1 to update m0:
                file.update_storage_a(m1.storage, function(err, what){
                    p('after update storage, err what:\n', err, what);
                    stop();
                });


            });
        });
    });
}

function get_some_metas(){
    var folder_path = 'abc/test';

    var pat1 = /links.+/;
    var pat2 = /links.+/;

    get_a_file_from_pattern(folder_path, pat1, function(err, file){
        p('try to get meta, file: \n', file.version);
        stop();
    });
}

if(require.main === module){
    //show_contents();

    //check_update();

    check_unique();
    //file_short_info();

    //get_some_metas();
    //check_file_update();
}


