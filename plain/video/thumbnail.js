
var path   = require('path');
var fs     = require('fs');
var async  = require("async");
var assert = require("assert");
var ffmpeg = require("fluent-ffmpeg");

var bucket = require("../aws/bucket.js");

var get_file = require("../aws/get-file.js");

var p = console.log;


// ffmpeg('/path/to/video.avi')
// .on('filenames', function(filenames) {
//     console.log('Will generate ' + filenames.join(', '))
// })
// .on('end', function() {
//     console.log('Screenshots taken');
// })
// .screenshots({
//     // Will take screens at 20%, 40%, 60% and 80% of the video
//     count: 4,
//     folder: '/path/to/output'
// });


//d
function old_make_thumbnails_for_video(video_path, output_dir, number, callback){
    if (!u.isString(video_path)) return callback('video full path should be string');
    number = number || 4;

    ffmpeg(video_path)
    .on('filenames', function(filenames) {
        console.log('Will generate ' + filenames.join(', '))
    })
    .on('end', function() {
        console.log('Screenshots taken');
    })
    .screenshots({
        // Will take screens at 20%, 40%, 60% and 80% of the video
        count: number,
        folder: output_dir,
        filename: output_filename_pattern
    });
}


function prepare_thumb_file_info(meta){
    var output_dir = '/tmp';

    var output_filename_pattern = meta.uuid + "_%i.png";

    // put uuid into the local video file name:
    var local_video_name = meta.uuid + meta.name;
    var local_file_path  = path.join('/tmp', local_video_name);

    // %b means the base name of the video file, it has included the uuid
    var output_filename_pattern = "%b-%i.png";


    return {
        uuid :       meta.uuid,
        output_dir : output_dir,

        output_filename_pattern : output_filename_pattern,

        local_video_name : local_video_name,
        local_file_path  : local_file_path,

        output_filename_pattern : output_filename_pattern,
    };
}


/*
 * When get file meta, save a copy to local,
 * and pass information to callback on success, it will be used by the next.
 */
function save_video_to_local(meta, callback){
    var s3key = meta.storage.key;
    //p('s3 key       : ', s3key);

    var info  = prepare_thumb_file_info(meta);
    //p('info: ', info);

    bucket.read_data(s3key, function(err, data){
        if(err){
            p('1 save video to local, err: ', err);
            return callback(err);
        }
        
        //p('2,  typeof data: ', typeof data);

        fs.writeFile(info.local_file_path, data, function(err, wrote){
            if(err){
                p('1.1 save video to local after write file got, err: ', err);
                return callback(err);
            }
            return callback(err, info);
        });
    });
}


function screenshot(info, callback){
    p('in screenshot');
    //var info = prepare_thumb_file_info(file_meta);
    if (!u.isString(info.local_file_path)) return callback('video full path should be string');

    var number = info.number || 4;
    assert(u.isString(info.output_dir));
    assert(u.isString(info.output_filename_pattern));

    try{
        ffmpeg(info.local_file_path)
        .on('filenames', function(filenames) {
            //console.log('Will generate ' + filenames.join(', '))
            info.filenames = filenames;
        })
        .on('end', function() {
            console.log('Screenshots taken');
            callback(null, info);
        })
        .screenshots({
            // Will take screens at 20%, 40%, 60% and 80% of the video, for 4.
            count:    number,
            folder:   info.output_dir,
            filename: info.output_filename_pattern
        });
    }catch(err){callback(err);}
}


/* used in trying and testing */
function do_test(m, callback){
        p('meta path in do test: ', m.path);
        save_video_to_local(m, function(err, info){
            p('going to make thumbnails for video');
            screenshot(info, function(err, info){
                p('inside do test e to local: ', err, typeof info);
                callback(err, info);
            });
        });
}



/*
 * info must has: `filenames`, `uuid`, `auxpath`, `ouotput_dir`,
 * all are string.
 */
function make_thumbnail_s3keys(info){
    var filenames = info.filenames;
    var uuid      = info.uuid;

    var shorted = u.map(filenames, function(name){
        //p('to short the name: ', name);
        return name.replace(uuid, '');
    });
    info.shorted_thumbnail_filenames = shorted;

    //p("shorted");
    //p(shorted);

    var keys = u.map(shorted, function(name){
        return path.join(info.auxpath, name);
    });
    info.s3keys = keys;

    var local_thumbnails = u.map(filenames, function(name){
        //p('to get the local thumbnail file: ', name);
        return path.join(info.output_dir, name);
    });
    info.local_thumbnail_file_pathes = local_thumbnails;

    //p("local thumbnail path\n");
    //p(local_thumbnails);
    
    make_records(info);
}


/*
 * make video poster image
 * make data to be saved in file meta
 */
function make_records(info){
    p(info);
    var names = info.shorted_thumbnail_filenames;
    var s3keys = info.s3keys;

    var zipped = u.zip(names, s3keys);
    var hash   = {};
    u.each(zipped, function(pair){
        hash[pair[0]] = pair[1];
    });

    p("made the hash: \n", hash);
    info.posters = hash;
    return hash;
}


function put_to_s3(info, callback){
    // The input `info` must has `s3keys` and corresponding 
    // `local_thumbnail_file_pathes`

    var pairs   = u.zip(info.local_thumbnail_file_pathes, info.s3keys);
    //p('in put to s3, pairs');
    //p(pairs);
    var workers = u.map(pairs, function(one){
        //p('local file path: ', one[0], ' --- ', 's3key: ', one[1]);
        return function(callback){
            bucket.put_one_file(one[0], one[1], callback);
        };
    });

    async.parallel(workers, callback);
}

function rm_local_files(info, callback){
    var all_files = u.union([info.local_file_path,], info.local_thumbnail_file_pathes );
    //p("got all files that going to remove \n", all_files);

    assert(u.isArray(all_files));

    async.map(all_files,
            function(file_path, callback){
                //p('going to unlink the file: ', file_path);
                fs.unlink(file_path, callback);
            },
            callback);
}


function save_file_meta(file_meta, callback){
    get_file.get_file_by_path_uuid(file_meta.path_uuid, function(err, file){
        if(err) return callback(err);

        file.set_meta(file_meta);
        file.save_file_to_folder().then(function(saved){
            callback(null, saved);
        }).catch(callback);
    });
}


/* 
 * Make sure file meta get 'aux_path'
 */
function add_thumbnails(file_meta, callback){
    save_video_to_local(file_meta, function(err, info){
        if(err) return callback(err);

        //p('going to make thumbnails for video');
        screenshot(info, function(err, info){
            if(err) return callback(err);

            if(file_meta.aux_path){
                info.auxpath = file_meta.aux_path;
            }else{
                return callback('no aux path in file meta ' + file_meta.path);
            }

            make_thumbnail_s3keys(info); //data in info, no return value.
            file_meta.posters = info.posters;
            p('posters:'); p(file_meta.posters);

            put_to_s3(info, function(err, what){
                if(err) return callback(err);

                save_file_meta(file_meta, function(err, saved){
                    if(err) return callback(err);

                    rm_local_files(info, function(err, what){
                        if(err) return callback(err);
                        callback(null, info);
                    });
                });
            });
        });
    });
}



module.exports.prepare_thumb_file_info = prepare_thumb_file_info;
module.exports.save_video_to_local = save_video_to_local;
module.exports.screenshot = screenshot;
module.exports.add_thumbnails = add_thumbnails;

//test
module.exports.do_test = do_test;
module.exports.make_thumbnail_s3keys = make_thumbnail_s3keys;
module.exports.save_file_meta = save_file_meta;



