
// to change an array to obj, after I accidently change it to array.
// 

var u = require('underscore');
var FolderModule = require("./folder-v5.js");

if (FolderModule === undefined) console.log('--- FUCK' );
var aa = 0.1;


function back_to_obj (arr){
    // This is temperary tool to change the array
    var obj = {};
    arr.forEach(function(a){
        obj[a.uuid] = a;
    });
    return obj;
}

function get_folder(name, dir){
    // @name : the retrieved folder will be save to GLOBAL space as: name
    FolderModule.retrieve_folder(dir).then(function(folder){
        this[name] = folder;
    });
}

function retrieve_meta(name, dir){
    // @name : the retrieved meta will be save to GLOBAL space as: name
    FolderModule.retrieve_folder(dir).then(function(folder){
        var meta = folder.get_meta();
        this[name] = meta;
    });
}

function getBack(name, dir){
    FolderModule.retrieve_folder(dir).then(function(folder){
        this[name] = folder;
        folder.sort_files_by_date();
        folder.save_meta(function(err, what){
            console.log(err, what);
        });
    });
}

// check tmpab
function tmpab(){
    var dir = 'tmpab';
    FolderModule.retrieve_folder(dir).then(function(folder){
        this['tf'] = folder;
        this['tm'] = folder.get_meta();

        var o = back_to_obj(tm.files);
        tm.files = o;

        folder.sort_files_by_date();
        folder.save_meta(function(err, what){
            console.log(err, what);
        });
    });
}

tmpab();

//getBack('atf', 'abc/test');
//getBack('tf', 'tmpab');

