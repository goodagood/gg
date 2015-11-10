
/*
 * Use empty {} as empty folder,
 * currently, 2014-0529, not going to put files in the structure.
 *
 * NOTE: when initialize the file of user home structure, it will be:
 *   {
 *     _username_ : default_user_home_structure,
 *   }
 * so, the folder path is: _username_/path/of/folder/
 * thus, keep consistent to the style of s3 file keys.
 * 2014 0530
 */
var default_user_home_structure = {
    'goodagood' : {
        'etc'    : {},
        'public' : {},
        'people' : {},
        'friends': {},
    },
    //...
};


module.exports = default_user_home_structure;

