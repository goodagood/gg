var util = require("util")

var list = require("./list.js")
var folder = require("./folder.js");

var p = console.log;

function c_ul(_path, owner){
    owner = owner || 'abc'
    _path = _path || 'abc'
    
    folder.retrieve_folder(_path, function(err, folder_obj){
        if(err){
            p('got err, 12:14pm ', err);
            return setTimeout(process.exit, 2000);
        }

        var meta = folder_obj.get_meta();
        //p('the meta: ', util.inspect(meta, {depth: 5}));
        //p('meta cache: ', meta.cache);
        p('meta cache renders ul: ', meta.cache.renders.ul);
        setTimeout(process.exit, 2000);
    })
}




if(require.main === module){

    c_ul();
}
