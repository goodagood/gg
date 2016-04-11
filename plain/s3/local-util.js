
/*
 * Copied from ./s3keys.js
 */
function get_root(full_path){
    if(!full_path) return null;

    return full_path.split('/')[0];
}
module.exports.get_root = get_root;


const Default_permission = {
    owner: {
        read:    true,
        write:   true,
        execute: true,
    },
    group: {
        read:    false,
        write:   false,
        execute: false,
    },
    other: {
        read:    false,
        write:   false,
        execute: false,
    },
    member: {
        read:    true,
        write:   true,
        execute: false,
    },
    viewer: {
        read:    false,
        write:   false,
        execute: false,
    }
};
module.exports.Default_permission = Default_permission;
