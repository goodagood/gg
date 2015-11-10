
/*
 * Who (user) get folder's file list.
 * Check user and give a list of files.
 *
 */


var u = require('underscore');

var folder_module = require("./folder-v5.js");

var p = console.log;


function sorted_li_tags(folder) {
    var meta = folder.get_meta();
    var lis = ""; //file as li tags

    var files = u.values(meta.files);
    var sorted_files = u.sortBy(files, function(file_meta){
        if(!file_meta.timestamp) return 0;

        return 1 - file_meta.timestamp;
    });

    u.each(sorted_files, function(file) {
        if (file.html != null) {
            if (file.html.li != null) {
                if (file.name.indexOf(".gg") !== 0) {
                    return lis += file.html.li;
                }
            }
        }
    });
    lis += "\n";
    return lis;
}


function get_file_metas_in_reverse_time_order(cwd, callback){
    if(!cwd) return callback('need a path, in aws/get-file-list, file meta reverse...');

    folder_module.retrieve_folder(cwd).then(function(folder){
        folder_sort_file_metas_in_reverse_time_order(folder, callback);
    }).catch(callback);
}


function folder_sort_file_metas_in_reverse_time_order(folder, callback){
        var meta = folder.get_meta();
        //p(meta.path, 'folder path, debugging');

        var files = u.values(meta.files);
        //p(u.isArray(files), ' is array?');
        //p('files.length: ', files.length);
        //p(files[0].path, 'files[0].path');

        var sorted_files = u.sortBy(files, function(file_meta){
            if(!file_meta.timestamp) return 0;
            //p('milli ',  1 - file_meta.timestamp);
            return 1 - file_meta.timestamp;
        });

        //p('sorted files ', sorted_files);
        //p('sorted files ', u.map(sorted_files, function(f){return f.path}));
        callback(null, sorted_files);
}



/*
 * If some one, not even a registerred user, asks from file meta list:
 *   check the role of the name: owner, member, viewer or 'public',
 *   give the list acccording to the role, and folder's settings.
 */
function get_file_metas_for_some_one(name, cwd, callback){
    folder_module.retrieve_folder(cwd).then(function(folder){
        check_role(folder, name, function(err, role){
            if(err) return callback(err, role);

            //p('role is a string');
            get_file_metas_by_role(folder, role, function(err, meta_list){
                //p('in get file metas for role acc...');
                return callback(err, meta_list);
            });
        });
    }).catch(callback);
}


/*
 * roles:
 *   'owner', 'member', 'viewer', 'public'
 */
var member2 = require("./members-v2.js");
function check_role(folder, name, callback){
    if( folder.is_owner(name) ) return callback(null, 'owner');

    member2.make_member_manager_for_folder(folder, function(err, mng){
        if(err) return callback(err);

        if(mng.has_member(name)) return callback(null, 'member');
        if(mng.has_viewer(name)) return callback(null, 'viewer');

        return callback(null, 'public');
    });
    //return callback(null, null);
}


function get_file_metas_by_role(folder, role, callback){
    switch(role){
        case "owner":
            //get_file_metas_for_owner(folder, callback);
        case "member":
            folder_sort_file_metas_in_reverse_time_order(folder, callback);
            //get_file_metas_for_member(folder, callback);
            //get_file_metas_in_reverse_time_order(cwd, callback){
            //list for owner
            break;
        case "viewer":
            // rewinded to same as member, tmp solution, 0722, 2015.
            get_file_metas_for_viewer(folder, callback);
            break;
        default:
            // MUST be change when we can seperate viewer, public
            //get_file_metas_for_public(folder, callback);
            //
    }

    //return callback(null, null);
}


/*
 * staff, mocking the real functionalities, to be replaced.
 */
var get_file_metas_for_owner,
    get_file_metas_for_member,
    //get_file_metas_for_viewer,
    get_file_metas_for_public;

get_file_metas_for_owner  =
get_file_metas_for_member =
//get_file_metas_for_viewer =
get_file_metas_for_public =
function(folder, callback){
    return callback(null, []);
}


/*
 * A tmp solution, mainly for user's public folder
 */
function get_file_metas_for_viewer(folder, callback){
    folder_sort_file_metas_in_reverse_time_order(folder, callback);
}




/*
 * convert a file meta list to HTML <ul> element, each file as an <li>
 */
function render_meta_list(metas, callback){
    var html = "\n" + '<ul class="file-list">' + "\n";

    u.each(metas, function(file) {
        if (file.html != null) {
            if (file.html.li != null) {
                if (file.name.indexOf(".gg") !== 0) {
                    return html += file.html.li;
                }
            }
        }
    });
    html += "\n</ul>\n";
    return html;
}


function list_files(who, cwd, callback){
    get_file_metas_for_some_one(who, cwd, function(err, metas){
        if(err) return callback(err);

        //p(11, err, u.isArray(metas));
        var html_ul = render_meta_list(metas);
        return callback(null, html_ul);
    });
}


/*
 * To give basic file information.
 */
function basic_file_meta_list(who, cwd, callback){
    get_file_metas_for_some_one(who, cwd, function(err, list){
        if(err) return callback(err);

        p("check b\n", err, u.isArray(list));
        p('list length: ', list.length);

        var basic = u.map(list, function(file_meta){
            return u.omit(file_meta, 'html', 'parent-dir', 'dir',
                'permission', //? add this after permission is ok
                'folder-meta-s3key',
                'storage', 'what',
                'storages',
                'Meta_s3key', 'new_meta_s3key',
                'milli_uuid',
                'file-types'
                );
        });

        //var basic = list;

        callback(null, basic);
    });
}


module.exports.list_files = list_files;
module.exports.get_file_metas_for_some_one = get_file_metas_for_some_one;
//module.exports.get_file_metas_by_role = get_file_metas_by_role;
module.exports.check_role = check_role;

module.exports.basic_file_meta_list = basic_file_meta_list;

// checkings //


function chk_a(){
    var cwd = 'abc/test';

    get_file_metas_in_reverse_time_order(cwd, function(err, metas){
        p(1, err);
        //p('metas', metas);
        var nametime = u.map(metas, function(f){return [f.name, f.timestamp];});
        p(2, nametime);
        process.exit();
    });
}


/*
 * when writting get file metas for some one
 */
function check_get_file_metas(){
    var cwd = 'abc/test';
    //var name= 'gogo';
    //var name= 'tmp';
    var name= 'aa';

    get_file_metas_for_some_one(name, cwd, function(err, list){
        p("check b\n", err, u.isArray(list));
        p('list length: ', list.length);
        p('list 0, 1: ', list[0], list[1]);
        process.exit();
    });

    //folder_module.retrieve_folder(cwd).then(function(folder){
    //}).catch(function(e){p("e\n", e);});
}


function check_folder_sort_metas(){
    var cwd = 'abc/public';
    var username = 'aa';
    folder_module.retrieve_folder(cwd).then(function(folder){
        folder_sort_file_metas_in_reverse_time_order(folder, function(err, metas){
            p(1, err, metas.length);
            var shorts = u.map(metas, function(m){return [m.timestamp, m.path ];});
            p('shorts:', "\n", shorts);
            process.exit();
        });
    }).catch(function(e){
        p("e: \n", e);
    });
}


function check_a_list(){
    //var who = 'aa';
    var who = 'abc';
    //var cwd = 'abc/public';
    var cwd = 'abc/test';

    list_files(who, cwd, function(err, list){
        p(err, typeof list);
        p("the ul\n", list.slice(0,500));
        process.exit();
    });
}


/*
 *  Check get list of basic file info
 */
function check_file_basics(){
    var who = 'abc';
    var cwd = 'abc/test';

    basic_file_meta_list(who, cwd, function(err, list){
        p(err, typeof list);
        p("the length: ", list.length);
        p("the first :\n ", list[0]);
        p("the 2nd:\n ",  list[1]);
        process.exit();
    });
}





if (require.main === module) {
    //p('checkings');
    //chk_a();
    //check_get_file_metas();
    check_file_basics();

    //check_folder_sort_metas();

    //check_a_list();
}


