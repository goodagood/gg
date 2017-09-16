
//var fm = require("../aws/folder-v5.js");

var p = console.log;


/* this will return the sub folder obj if it's exists */
function add_if_not_exists(folder, sub_folder_name){
    if(folder.file_exists(sub_folder_name)){
        //get it
        p('we are going to get the folder, ', sub_folder_name);
        return folder.get_folder(sub_folder_name); // a promise
    }else{
        // add it
        p('we are going to SET the folder, ', sub_folder_name);
        return folder.add_folder(sub_folder_name);
    }
}


module.exports.add_if_not_exists = add_if_not_exists;

//fm.retrieve_folder(
