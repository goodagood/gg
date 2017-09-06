
var folder_module = require("./folder-v5.js");


function set_default_listor(cwd, listor_type, callback){
    var meta;

    folder_module.retrieve(cwd).then(function(folder){
        meta = folder.get_meta();

        if(!meta.listor) meta.listor = {};
        meta.listor["default"] = listor_type;
        return folder.promise_to_save_meta();
    }).then(function(){
        return callback(null, meta);
    })["catch"](callback);
}


module.exports.set_default_listor = set_default_listor;

