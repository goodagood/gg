var assert = require('assert');
var async  = require('async');
var u      = require('underscore');


var bucket    = require("../aws/bucket.js")
var collector = require("../aws/file-collector-v2.js");
var pubsub    = require("../myutils/pubsub.js");

var tutil = require("../myutils/test-util.js");

var data  = require("./mis-data.js");

var p    = console.log;
var stop = function() { return setTimeout(process.exit, 1000); };




// -- checkings --

// sample data

var a =
{ 
    meta: {
            originalname: 'man',
            size: 37798,
            mimetype: 'application/octet-stream',
            encoding: '7bit',
            type: 'application/octet-stream',
            name: 'man',
            local_file: '/tmp/d74bac53c521bcbe3ba491b228b346e8',
            path: 'abc/add-2/man',
            dir: 'abc/add-2',
            owner: 'abc',
            creator: 'abc',
            timestamp: 1443345448995,
            uuid: '762f19fd-5e64-48fa-9425-59c412c8a55a',
            path_uuid: 'abc/add-2/762f19fd-5e64-48fa-9425-59c412c8a55a',
            new_meta_s3key: '.gg.new/abc/add-2/762f19fd-5e64-48fa-9425-59c412c8a55a',
            storage: 
            { type: 's3',
                key: '.gg.file/abc/add-2/762f19fd-5e64-48fa-9425-59c412c8a55a'
            },
            redis_task_id: 'task.a.762f19fd-5e64-48fa-9425-59c412c8a55a' },

        job: {
            task_id: 'task.a.762f19fd-5e64-48fa-9425-59c412c8a55a',
            new_meta_s3key: '.gg.new/abc/add-2/762f19fd-5e64-48fa-9425-59c412c8a55a',
            name: 'new-file-meta',
            username: 'abc',
            folder: 'abc/add-2',
            id: 'task.a.762f19fd-5e64-48fa-9425-59c412c8a55a'
        }
};


check_collector = function(j, m) {
    // @j : simulate the job json data
    // @m : simulate the new meta data

    j = j || a.job;
    m = m || a.meta;
    //p(j,"\r\n\n"); p(m); process.exit();

    return collector.collect_one_file(j, m, function(e,r){
        p('check coll... ', e,r);
        process.exit();
    });
};


function check_rm_task_data(m){
    m        = m || a.meta;

    s3key    = m.storage.key;
    redis_id = m.redis_task_id;

    return collector.delete_task_tmp_meta(s3key, redis_id, function(e,r){
        p('check rm... ', e,r);
        process.exit();
    });
}


/*
 * This only show s3 info.
 */
function show_new_meta(name){
    // @name: username

    name = name || null;
    collector.list_new_meta_data(name, function(err, data){
        //p('err, data:\n', err, data);
        assert(!err);
        assert(u.isArray(data));
        p('length: ', data.length);

        // get one:
        var d0 = data[0];
        //p('data list zero:\n', d0);
        p('data list:\n', data);

        bucket.read_json(d0.Key, function(err, _meta){
            p('get one: err, _meta.name, uuid:\n', err, _meta.name, _meta.uuid);
            p('_meta:\n', _meta);

            stop();
        });


        //bucket.read_json(d0.Key, function(err, meta){
        //    p('get one: err, meta.name, uuid:\n', err, meta.name, meta.uuid);

        //    collector.collect_meta(meta, function(err, what){
        //        p ('c c m got: ', err, what);
        //        //stop();
        //    });

        //});
    });
}


function collect_928(name){
    // @name: username

    name = name || null;
    collector.list_new_meta_data(name, function(err, data){
        //p('err, data:\n', err, data);
        assert(!err);
        assert(u.isArray(data));
        p('length: ', data.length);

        // get one:
        var d0 = data[0];
        //p('data list zero:\n', d0);
        //p('data list:\n', data);

        async.map(data, function(one, callback){
            bucket.read_json(one.Key, function(err, meta){
                p('get one: err, meta.name, uuid:\n', err, meta.name, meta.uuid);
                p('meta:\n', meta);

                collector.collect_one_file({}, meta, function(err, what){
                    p ('c c m got: ', err, what);
                    callback(err, what);
                    //stop();
                });

            });
        }, function(err, backed){
            p('async get callbacked:');
            p(err, backed);
            stop(1);
        });
    });
}

/*
 * Give sample data, check: 
 */
function check_as_collector(){
    var sample = {
        meta: {
            originalname: '84.jpg',
            size: 580362,
            mimetype: 'image/jpeg',
            encoding: '7bit',
            type: 'image/jpeg',
            name: '84.jpg',
            local_file: '/tmp/29d4ea554cb86c569803b75e85ef9b31',
            path: 'abc/test/tindex/84.jpg',
            dir: 'abc/test/tindex',
            owner: 'abc',
            creator: 'abc',
            timestamp: 1443515818559,
            uuid: 'e7cc50f5-4e2c-4632-947f-ccceb2ac47fd',
            path_uuid: 'abc/test/tindex/e7cc50f5-4e2c-4632-947f-ccceb2ac47fd',
            new_meta_s3key: '.gg.new/abc/test/tindex/e7cc50f5-4e2c-4632-947f-ccceb2ac47fd',
            storage:
            {
                type: 's3',
                key: '.gg.file/abc/test/tindex/e7cc50f5-4e2c-4632-947f-ccceb2ac47fd' 
            },
            redis_task_id: 'task.a.e7cc50f5-4e2c-4632-947f-ccceb2ac47fd' 
        },
        job: {
            task_id: 'task.a.e7cc50f5-4e2c-4632-947f-ccceb2ac47fd',
            new_meta_s3key: '.gg.new/abc/test/tindex/e7cc50f5-4e2c-4632-947f-ccceb2ac47fd',
            name: 'new-file-meta',
            username: 'abc',
            folder: 'abc/test/tindex',
            id: 'task.a.e7cc50f5-4e2c-4632-947f-ccceb2ac47fd'
        }
    };


    p('going to check: '); p (sample.job);
    collector.check_new_file_meta(sample.job, function(err, what){
        p('after collecotr check new file meta:'); p(err, what);
        stop();
    });
}



function show_redis_tasks(){
    pubsub.find_tasks(function(err, task_ids){
        //p('finding tasks:\n', err, task_ids);
        assert(task_ids.length >= 0);

        pubsub.find_one_task(-1, function(err, what){
            p('found one task: \n', err, what);
            stop();
        });

    });
}

function check_redis_collect(){
    collector.collect_redis(function(err, what){
        p('collecting redis-: ', err, what);
        stop();
    });
}

// Used in repl
function repl_list_new_meta_data (vname, username){
    //# @vname    : string, name of the variable should get the list.
    //# @username : string, for whom to get new file meta thing.

    collector.list_new_meta_data(username, function (err, list){
        p('you get the list:\n', list);
        if(err) p('u, YOU, got err:', err);
        if(err) return this.err = err;
        this[vname] = list;
        p('name set? ', vname);
    });
}

function get_from_s3(info){

    var username = 'abc';
    collector.list_new_meta_data(username, function (err, list){
        if(err) return p('fuck e');
        var one = list.pop();
        p('this is going to be do s3 job:\n', one);
        collector.do_s3_job(one, function(err, what){
            if (err) p('get from s3, do s3 job, err, what:', err, what);
            if (!err) p('get from s3, do s3 job, SEEMS no err');
            stop();
        });
    });

}

function finish_s3_new_meta_info(username){

    username = username || 'abc';
    collector.list_new_meta_data(username, function (err, list){
        if(err) return p('fuck, work in finish...');

        var functions = [];
        u.each(list, function(item){
            functions.push(function(callback){
                collector.do_s3_job(item, function(err, f){
                    p('done s3 job:', item.Key);
                    setTimeout(function(){ callback(err, item.Key); } ,5000);
                });
            });
        });

        async.series(functions, 
            function(err, what){
                if (err) p('get from s3, do s3 job, err, what:', err, what);
                if (!err) p('get from s3, do s3 job, SEEMS no err, got what:\n', what);
                stop();
        });
    });

}

function finish_b(username){
    username = username || 'tmpab';
    //username = username || 'abc';
    collector.do_s3_jobs(username, function(err, what){
                if (err) p('get from s3, do s3 job, err, what:', err, what);
                if (!err) p('get from s3, do s3 job, SEEMS no err, got what:\n', what);
                stop();
    });
}


function collect_meta_213(meta){
    // @meta is the record in s3, for new file info.
    bucket.read_json(meta.Key, function(err, meta){
        p('get one: err, meta.name, uuid:\n', err, meta.name, meta.uuid);

        collector.collect_meta(meta, function(err, what){
            p ('c c m got: ', err, what);
            return 'haha';
        });

    });
}

function collect_all_new_meta(){
}


if(require.main === module){
    //p (1, data.fj); p( '\n', 2, data.fjm);
    //stop();

    //check_collector();
    //check_rm_task_data();

    //show_new_meta('abc');
    collect_928('abc');
    //check_as_collector();

    //show_new_meta(null);
    //show_redis_tasks();
    //check_redis_collect();
    //get_from_s3();

    //finish_s3_new_meta_info();
    //finish_b();
}


