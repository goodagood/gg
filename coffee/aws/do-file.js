
var folder_module = require('./folder-v5.js');


function add_file(folder_path, file_name){
    folder_module.retrieve_folder(folder_path).then(function(folder){
        p ('folder: \n', folder);
    });
}


// -- do some fast checking -- //
//

if(require.main === module){
    add_file('abc/add-2/', 'tmp-a');
}


