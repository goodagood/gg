
/*
 * Cache file data into folder meta.
 *
 * cache: {
 *      "file-infos": {
 *          "file-name-1" : {
 *              filetype: 
 *              size:
 *              li:
 *              ...
 *          },
 *          "file-name-2" : {
 *              filetype: 
 *              size:
 *              li:
 *              ...
 *          },
 *      },
 *
 *      "file-info-pages": [ key-for-file-info-page-1, page-2, ... ],
 *
 *      "folder-renders":{
 *          "html":{
 *              owner:
 *              member:
 *              viewer:
 *              public: html-file-list-for-public,
 *          }
 *      },
 *
 *      "size-limit": 2 * 1000 * 1000, // default 2M bytes for cache size.
 *
 *      ...
 * }
 */

var path  = require("path");
var async = require("async");

var folder = require("./folder.js");
var bucket = require("../aws/bucket.js");

var p = console.log;

/*
 * If @opt['cache'] = true, cache will be updated.
 */
function render_html(for_whom, foler, opt){
}


function cache_file_meta(folder, opt, callback){

    var folder_meta = folder.get_meta();

    var prefix_of_files = path.join(folder_meta['name_space_prefix'], 'files');

    bucket.list(prefix_of_files, function(err, contents){
        if(err) return callback(err);
        p('0324 bucket list: ', contents);

        collect_file_metas(folder, function(err, metas){
            if(err) return callback(err);

            if(!folder_meta.cache) folder_meta.cache = {};
            folder_meta.cache['file-infos'] = metas;

            p('after collecti : ', err, metas);
            folder.save_meta(callback);
        });
    });
}
module.exports.cache_file_meta = cache_file_meta;


function collect_file_metas(folder, callback){

    var folder_meta = folder.get_meta();

    var prefix_of_files = path.join(folder_meta['name_space_prefix'], 'files');

    bucket.list(prefix_of_files, function(err, contents){
        if(err) return callback(err);
        p('0328 bucket list: ', contents);

        var infos = {};
        async.map(contents, function(one, one_cb){
            p('- key: ', one.Key);
            bucket.read_json(one.Key, function(err, j){
                if(err){
                    p('2 31am err, json: ', err, j);
                    return one_cb(err);
                }

                infos[j.name] = j;
                one_cb(null, j.name);
            });
        }, 
        function(err, map_rep){
            if(err){
                p('0328 2 36am async map err: ', err);
                return callback(err);
            }
            callback(null, infos);
        });
    });
}
module.exports.collect_file_metas = collect_file_metas;


function cache_one_file_to_meta(file_info, meta){
}


if(require.main === module){
    var p = console.log;

    function c_cache_fm(folder_path){
        folder_path = folder_path || "t0310y6";
        folder.retrieve_folder(folder_path, function(err, folder_obj){
            if(err) return p('e: ', err);
            //p(folder_obj);

            cache_file_meta(folder_obj, {}, function(err, cache){
                if(err) return p('e c 2016 0318 12:53am:', err);

                var folder_meta = folder_obj.get_meta();
                //p('folder meta: ', folder_meta);

                p(cache);

                setTimeout(process.exit, 10*1000);
            });
        });
    }
    c_cache_fm('t0326y6');

    //setTimeout(process.exit, 12000);
}
