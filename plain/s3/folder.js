
/*
 * Redo folder object for s3 storage.
 *
 * 2016 0227
 */

var path = require("path");
var fs   = require("fs");
var u    = require("underscore");
var uuid = require("node-uuid");


//var s3prefix = require("../myutils/json-cfg.js").s3_prefix_configure();
var user_module = require("../users/a.js");
var fkeys = require("./folder-keys.js");


//var myutil   = require("../myutils/myutil.js");

/*
 * @folder_path : full path of the folder.
 */
function new_obj(folder_path, callback){

    var add_file, add_file_save_folder, add_folder, build_file_list,
        callback_folder_auxiliary_path,
        callback_milli_uuid, check_username, clear_empty_names,
        clear_file_meta, del_uuid_and_name, delete_all_uuid_recursively,
        delete_file, delete_file_by_uuid, delete_folder, delete_name,
        delete_uuid, delete_uuid_in_hash_of_file_names,
        delete_uuid_without_save, file_exists, file_identified_by_uuid,
        folder_milli_uuid, folder_uuid, get_1st_file_obj, get_file_name_array,
        get_file_obj_by_uuid, get_file_objs, get_file_objs_by_name, get_folder,
        get_folder_auxiliary_path, get_member_manager, get_meta,
        get_number_of_name, get_one_file_obj, get_owner_id, get_owner_name,
        get_recent_file_by_name, get_root_name, get_ul_renderring, get_uuids,
        init, is_name_in_meta_files, is_name_unique, is_owner, list_file_tmp,
        list_files, list_files_and_save, list_files_for_owner,
        list_files_for_viewer, lock, lock_async, locker, make_template_data,
        members, name_to_metas, name_to_uuids,
        old_build_blueimp_pic_gallery_list, old_get_file_objs_by_name,
        pattern_to_uuids, promise_to_add_file_save_folder,
        promise_to_clear_empty_names, promise_to_delete_file_by_uuid,
        promise_to_delete_name, promise_to_give_obj,
        promise_to_list_files_and_save, promise_to_one_file_obj,
        promise_to_retrieve_saved_meta, promise_to_save_meta,
        promise_to_write_meta, read_file, read_file_12_15, read_file_by_uuid,
        read_files, read_in_template, read_recent_file_by_name, read_text,
        render_template, retrieve_saved_meta, save_meta, self_render_as_a_file,
        set_attr, sort_files, sort_files_by_date, try_template, update_file,
        update_name, update_sub_folder, update_uuid_storage, user_module,
        uuid_to_delete_file_fun, uuid_to_file_obj, uuid_to_meta, write_meta,
        write_text_file, _add_extra_0929, _add_file_obj_save_folder,
        _add_file_thorough, _add_file_to_redis_list,
        _build_blueimp_pic_gallery_list, _check_in_file, _d_read_file,
        _delete_file, _dot_filter, _empty_promise, 
        _folder_css_file_name_, _get_files_by_name, _get_owner_obj,
        _get_renderring_for_public, _get_renderring_for_viewer,
        _get_short_json_repr, _get_uuids, _give_ul_renderring,
        _list_files_by_id, _member_, _meta_css_file_name_,
        _meta_smells, _new_json_file, _old_get_folder_auxiliary_path,
        _prepare_redis_file_list_key, _ready_, _rename_file, _render_all_files,
        _render_file, _render_folder, _short_clone_of_folder_meta, _sleep,
        _template_file_;


    var _folder = {}; // The object.
    var _meta   = {};

    _member_ = null;
    _ready_ = 0;
    _folder_css_file_name_ = ".gg.folder.css";
    _meta_css_file_name_ = ".gg.meta.css";
    _template_file_ = path.join(__dirname, 'folder-template.html');


    function get_meta () {
        return _meta;
    }

    _folder.get_meta = get_meta;


    function calculate_meta_s3key(callback){
        var path_ = _meta.path || folder_path;

        fkeys.make_s3key_for_folder_meta(path_, function(err, s3key){
            if(err) return callback(err);

            _meta.meta_s3key = s3key;
            callback(null, s3key);
        });
    }

    _folder.calculate_meta_s3key = calculate_meta_s3key;


    function calculate_name_space(){
        if (typeof _meta.uuid === "undefined") {
            return false;
        }
        if (! _meta.owner ) {
            return false;
        }
        if (typeof _meta.owner.name !== "string" || typeof _meta.owner.id !== "string") {
            return false;
        }
    }

    // owner: {name: string, id: string}
    function set_owner(owner){
        _meta.owner = owner;
        return _folder;
    }

    function user_can_read(username){
        return false;
    }

    _folder.user_can_read = user_can_read;


    function user_can_write(username){
        return false;
    }

    _folder.user_can_write = user_can_write;


    function user_can_do(username){
        return false;
    }

    _folder.user_can_do = user_can_do;






    return callback(null, _folder);
}
module.exports.new_obj = new_obj;




//function make_s3key_for_folder_meta_file(folder_path, callback){
//    if(!folder_path) return callback('no folder path given');
//    s3prefix('folder_meta', function(err, folder_meta_prefix){
//        if(err) return callback(err);
//
//        var s3key = path.join(folder_meta_prefix, folder_path);
//        callback(null, s3key);
//    });
//}
//module.exports.make_s3key_for_folder_meta_file = make_s3key_for_folder_meta_file;
