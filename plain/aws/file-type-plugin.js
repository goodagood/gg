
var path = require('path');
var u    = require('underscore');

var p = console.log;


var plugin_folder_name = 'plugin-ft';
var plugin_folder_path = path.join(__dirname, plugin_folder_name);

//p(__dirname, plugin_folder_path);

// filter: those files name end with '-p.js'
// map: I have to use an map, this should be an bug.
var plugin_list_in_folder = require('require-all')({
    dirname     :  plugin_folder_path,
    filter      :  /.+-p\.js$/,
    map: function(name, path_){
        //p('map: ', name, path_);
        //if(!name) return path.basename(path_);
        if(!name){
            var basename = path.basename(path_);
            //p('basename: ', basename);
            return basename;
        }
        return name;
    }
    //excludeDirs :  /^\.(git|svn)$/
});


/*
 * Find possible plugin for the @file_meta, else it will return false.
 */
function find_plugin(file_meta){
    if(!file_meta) return false;

    var plugin_list = u.values(plugin_list_in_folder);
    //p('file type plugins: '); p(plugin_list_in_folder);


    /*
     * Each plugin will check whether the file meta 'can be used', it will
     * check by function 'can_be_used', every plugin need to implement this.
     * The first can be used get the return.
     */
    var first = u.find(plugin_list, function(plugin){
        if(u.isFunction(plugin.can_be_used)){
            //p('in find, got plugin ', plugin);
            //return plugin.check_file_meta(file_meta)

            if(plugin.can_be_used(file_meta)){
                return plugin;
            }
            return false;
        }
        return false;
    });
    return first;
}


module.exports.find_plugin = find_plugin;



/* // checkings // */


function chk_find_plugin(){
    var got = find_plugin();
    if(got){
        p("\n", 'found? ', got);
        p(got.can_be_used());
    }
    process.exit();
}


function check_with_video_meta(){
    var get_file      = require("./get-file.js");

    var file_path = 'abc/test/small3.mp4';

    get_file.get_1st_file_obj_by_path(file_path, function(err, file){
        if(err) return p('check video got err: ', err);

        var m = file.get_meta();
        p('meta path: ', m.path);

        // Find the plugin by the meta:
        var plug = find_plugin(m);
        if(plug){
            p('the got plugin got keys: ', u.keys(plug))
            plug.get_file_obj(m, function(err, file){
                if(err) p('5:51am, ', err);

                p(u.keys(file).sort().join(",\t "));
                p(file.version);

                process.exit();
            });
        }

    });
}


if(require.main === module){
    //p(plugin_list_in_folder);
    //process.exit();

    chk_find_plugin();

    //check_with_video_meta();
}



