/*
 * Refacting, 2015 1021.
 *
 * This will replace ./config-mj.js and the current using ../config-mj.js
 *
 * The configuration should be splitted by their usage.
 */

var config = {};
module.exports = config;


// a list to contain usernames, serves as current container:
config.current_user_name_roll = 'user.name.roll';
// a list of all containers:
config.user_name_roll_of_roll = 'user.name.roll.of.roll';
config.user_id_max = 1403770226; // epoc seconds now.


// pattern to serving local file
config.gglocal_pattern = /\/gglocal\//i;


/* log file setting */
config.logfile = '/tmp/logfile';


// most default folders get ".g" prefix.
// Plan to put all of this to folder: 'goodagood_' ...
// 2015 1108, change to folder: .gg
config.default_folders = ['.gpublic', '.getc', '.gvid', '.gmsg', '.gtmp', '.gpic', '.gmusic'  ];
config.default_gg_folder = '.gg';
config.default_gg_sub_folders = ['public', 'etc'];

config.user_home_structure_file = ".gg/etc/home-structure.json"; //d

config.default_folder_options = {
  //owner : user_info.username,
  permission : 700,
  name       : "home",
  parent_key : '',
  '.ggwhat'  : "folder_option",
  abspath    : '',
  links      : 0
};
// 
//config.default_folders_opts = {isFolder:true, parentFolder:'depends'}
config.default_files = ['/.getc/ggdefaults', ];



config.underscore_template_path = "u_templates";

config.meta_file_ext = ".gmeta";  // deprecated, to use meta_file_prefix

config.meta_file_prefix = ".meta/";   //d use prefix for file/folder
config.folder_meta_prefix = ".gg.folder.meta/";
config.folder_info_prefix = ".gg.folder.info/";

config.file_meta_prefix = ".gg.file.meta/";

config.raw_file_prefix = ".gg.file/";
config.new_meta_prefix = ".gg.new/";
config.new_user_prefix = ".gg.new-user/";

config.raw_files_folder = '.files'; //d?
config.event_folder = '.gg/event';
//config.message_folder = '.gg/message';
config.message_folder = 'gg/message'; //2016 0126

config.meta_folder = '.gg/.metas'; //d
config.new_meta_folder = '.gg/.new'; //d

config.thumbnail_prefix = ".thumbnails/";

config.income_folder = ".gg/.in";
config.folder_option_file_name = ".folder_option.json";

config.s3_stream_prefix = '/ss/';
config.folder_list_prefix = '/ls/'; //'/list3/';

config.iamfolder = 'I-am-goodagood-s3-folder.2014-0620.';
config.iamlink = 'I-am-goodagood-s3-link-file.2014-0620.';

config.IamFolder = 'I-am-goodagood-folder.2014-0625.';
config.IamLink  = 'I-am-goodagood-link.2014-0625.';
config.IamFile  = 'I-am-goodagood-file.2014-0625.';

config.IamUserInfo  = 'I-am-goodagood-user-information.0305-2015.';

config.redis_folder_file_list_prefix = 'folder.file.list.'; //d

config.muji_root = '/home/ubuntu/workspace/muji';
config.swig_views_folder = 'swig-views';
config.swig_views_folder_abs =  '/home/ubuntu/workspace/muji/plain/swig-views';

config.value_folder = '.gg/.gg.value';
config.value_adding_file_name = 'value-adding.json';
config.comment_file_prefix = 'comment-';

config.direct_file_prefix = 'direct_gg_files'; // add easy files, 2015-0521
config.direct_obj_prefix = 'direct_objs';
config.file_auxiliary_prefix = 'file_aux';
config.folder_auxiliary_prefix = 'folder_aux';

