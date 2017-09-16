
/*
 * Replacing folder-writter.js ?
 *
 * 2016 0324
 */


var path = require("path");

var bucket = require('../aws/bucket.js');

var p = console.log;


/*
 *
 */
function insert_name(folder, file, callback){
    var file_meta = file.get_meta();
    var folder_meta = folder.get_meta();

    var picked = pick_file_meta(file_meta);

    // write the file meta to: name space/files/file-name.extension
    p('before get key 1 ', folder_meta['name_space_prefix'], 'files', file_meta.name);
    var key = path.join(folder_meta['name_space_prefix'], 'files', file_meta.name);
    p('going to write json, 2016 0317 23:14 ', picked);

    bucket.write_json(key, picked, function(err, s3rep){
        if(err) return callback(err);

        // add a event
        key = path.join(folder_meta['name_space_prefix'], 'events', Date.now().toString(), file_meta.name);
        var event = {"title": "file meta added", "time": Date.now(), "file-name": file_meta.name};
        bucket.write_json(key, picked, callback);
    });
}
module.exports.insert_name = insert_name;


/*
 * For easy listing files in a folder, file should prepare <li>,
 * folder collect file <li> as element of <ul> list.
 */
function pick_file_meta(file_meta){
    var keys = ['name', 'size', 'owner', 'filetype', 'type', 'permission', 'timestamp', 'li'];
    var required_meta = u.pick(file_meta, keys);

    if(!required_meta.li) required_meta.li = default_li(required_meta);

    return required_meta;
}


function default_li(meta){
    if(!meta.name) throw new Error('please give a name at least');
    if(meta.type && meta.type === 'folder'){
        var li = `<li class="folder"> <span class="name"> ${meta.name} </span>`;
    }else{
        var li = `<li class="file"> <span class="name"> ${meta.name} </span>`;
    }

    if(meta.size)
        li += `<span class="size"> ${meta.size} </span>`;
    if(meta.filetype && meta.filetype !== 'unknow')
        li += `<span class="type"> ${meta.filetype} </span>`;

    return li + "</li>";
}
module.exports.default_li = default_li;
