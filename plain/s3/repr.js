
/*
 * folder representation things.
 */


var ofolder = require("./folder.js");

var meta_cache = require("./folder-cache.js");
var render = require("./folder-render.js");

var p = console.log;

function cache_and_render(folder, callback){
    var folder_meta = folder.get_meta();

    meta_cache.collect_file_metas(folder, function(err, cmetas){
        if(err) return callback(err);

        if(!folder_meta.cache) folder_meta.cache = {};
        folder_meta.cache['file-infos'] = cmetas;

        var ul = render.add_up_li(folder);
        var meta = folder.get_meta();

        if(!folder_meta.cache['folder-renders']) folder_meta.cache['folder-renders'] = {html: {}};
        meta.cache['folder-renders']['html']['owner'] = ul;

        p('c n r, going to save meta');

        folder.save_meta(callback);
    });
}



if(require.main === module){

    function check_a(folder_path){
        folder_path = folder_path || "t0310y6";

        ofolder.retrieve_folder(folder_path, function(err, folder){
            if(err) return p('1, e: ', err);

            cache_and_render(folder, function(err, cr_rep){
                if(err) return p('2, e: ', err);
                p('need test 0327 : ', cr_rep);

                setTimeout(process.exit, 10*1000);
            });
        });

    }
    check_a('t0326y6/public');

    setTimeout(process.exit, 12000);
}
