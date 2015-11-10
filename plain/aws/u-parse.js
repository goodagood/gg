
var parse = require('./parse.js');
var fs    = require('fs');


var p     = console.log;



var sample_data = [ 
    {
        fieldname: 'ofiles',
        originalname: 's1631.png',
        encoding: '7bit',
        mimetype: 'image/png',
        destination: '/tmp/',
        filename: '0258e376dd01b2c489b5f0c020aabebf',
        path: '/tmp/0258e376dd01b2c489b5f0c020aabebf',
        size: 16632 
    },
    { 
        fieldname: 'ofiles',
        originalname: 'sa.js',
        encoding: '7bit',
        mimetype: 'application/javascript',
        destination: '/tmp/',
        filename: '42e162c01476a52cfb6b804a001d3aea',
        path: '/tmp/42e162c01476a52cfb6b804a001d3aea',
        size: 526
    } 
];
                                                                   

var before_pub = '??' ;

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



function check_process(){
    var username = 'abc';
    var cwd      = 'abc/add-2';

    parse.process_req_files(sample_data, username, cwd, function(err, what){
        p(err, what);
        process.exit();
    });
}


function fs_stat(){
    var filepath = '/tmp/man';
    fs.stat(filepath, function(err, stat){
        p(err, stat);
        process.exit();
    });
}


if(require.main === module){
    check_process();
    //fs_stat();
}

