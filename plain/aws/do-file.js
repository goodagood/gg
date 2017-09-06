
var u = require('underscore');


var folder_module = require('./folder-v5.js');

var p = console.log;


function add_file(folder_path, file_meta){
    // @folder_path not ends with '/'
    folder_module.retrieve_folder(folder_path).then(function(folder){
        p ('folder: \n', folder); stop();
    });
}


function makeFileAdder(folder_path, file_meta){

    var Name = file_meta.name;
    var Folder;

    function get_folder(){ return Folder; }

    function is_file_exists(file_name){
        file_name = file_name || Name;
        return Folder.file_exists(file_name);
    }

    // file obj should has opt?
    function get_opt(){
        // only if there is an old file with same name, we can get it's option.

        //folder_module.retrieve_first_file_obj(
        if(! is_file_exists()) return null;

        Folder.promise_to_one_file_obj(Name).then(function(f){
            var meta = f.get_meta();
            var opt = null;
            if( typeof meta.options !== 'undefined'){
                opt  = meta.options;
            }
            return opt;
        });
    }

    function add_file(){
        // @folder_path not ends with '/'
        folder_module.retrieve_folder(folder_path).then(function(folder){
            p ('folder: \n', folder); stop();
        });
    }

    // must return the promise to save the undefine get return.
    return folder_module.retrieve_folder(folder_path).then(function(folder){
        Folder = folder; // put the folder outside.

        return {
            add_file : add_file
            , get_folder : get_folder
            , is_file_exists : is_file_exists
        };
    });

}


// -- do some fast checking -- //
//

function stop(seconds){
    seconds = seconds || 1;
    setTimeout(
            function(){
                process.exit();
            }
            , seconds * 1000
            );
}

function check_adder(){
    var folder_path = 'abc/add-2';
    var file_meta   = {some: 'some thing'};
    makeFileAdder(folder_path, file_meta).then(function(a){
        //p('what: ', a);
        var name = 'du55';
        var yes_ = a.is_file_exists(name);
        p(" file  exists? ", name, yes_);

        return a;
    }).then(function(a){
        var folder = a.get_folder();
        //p('folder:\n', folder);
        var meta = folder.get_meta();
        var files_array = u.values(meta.files);
        var names = u.pluck(files_array, 'name');
        p ('names: \n', names);

        p (folder.file_exists('du55'));

    }).then(function(){
        stop();
    });
}

if(require.main === module){
    check_adder();
}


