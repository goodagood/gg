
/*
 * This give un-ordered list, an <ul> tag.
 */
function ul_for_user(name, folder_obj, callback){
    if(folder_obj.is_owner(name)){
        return give_owner_ul(folder_obj);
    }else{
        return `<ul class="file-list" > \r\n
            <li> Right now, we can list file for owner only.</li> \r\n
            </ul> \r\n`;
    }
}
module.exports.ul_for_user = ul_for_user;


function give_owner_ul(folder_obj){
    var meta = folder_obj.get_meta();
    if(meta.cache){
        if(meta.cache['folder-renders']){
            if(meta.cache['folder-renders'].html){
                if(meta.cache['folder-renders'].html.owner){
                    p('going to return: ',  meta.cache['folder-renders'].html.owner);
                    return meta.cache['folder-renders'].html.owner;
                }
            }
        }
    }
    return `<ul><li>Are you sure there is: meta.cache['folder-renders'].html.owner</ul></li>`;
}


