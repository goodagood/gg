
/*
 * Append a text file, utf-8 by default, 
 * if more files with same name, the first get it.
 *
 * 2016 0117
 */

var path   = require("path");

var getter = require("../aws/get-file.js");

var p      = console.log;



function append_txt(file_path, text, callback){
    var cwd = path.dirname(file_path);
    var name= path.basename(file_path);

    getter.get_number_of_file_name(file_path, function(err, number, folder){
        if(err) return callback(err);

        if(number>0){
            // append to the file
            append(file_path, text, callback);
        }else{
            // new file
            if(!folder || !u.isFunction(folder.get_owner_id)) return callback("no folder obj before create log file");
            var owner_id = folder.get_owner_id();

            p('got owner id: ', owner_id);
            if(!owner_id) return callback("got no owner id before create log file");

            create(owner_id, file_path, text, callback);
        }
    });
}


function append(file_path, text, callback){
    getter.get_1st_file_obj_with_auxpath_by_path(file_path, function(err, file){
        if(err) return callback(err);

        file.read_to_string(function(err, content){
            if(err) return callback(err);

            content += text;
            file.write_s3_storage(content, function(err, write_reply){
                if(err) return callback(err);

                var meta  = file.get_meta();
                meta.size = content.length;
                meta.lastModifiedDate = Date.now();

                p('-- in append, the meta: '); p(u.keys(meta).sort().join("   "));
                p('-- in append, the meta.path: '); p(meta.path);

                // we save the file meta, with no folder updating, indev.
                file.save_meta_file(callback);
            });
        })
    });
}


var file_module = require("../aws/simple-file-v3.js");
function create(owner_id, file_path, text, callback){

    // folder.get_owner_id(name)?

    var cwd = path.dirname(file_path);
    var name= path.basename(file_path);

    file_module.write_text_file(owner_id, cwd, name, text).then(function(result){
        callback(null, result); // not sure what's result
    }).catch(callback);
}


module.exports.append_txt = append_txt;


// -- fast checkings

function c_create_log(owner_id, cwd, file_name){
    cwd  = cwd       || 'abc/tadd';
    name = file_name || 'test.log';
    id   = owner_id  || 'abc';

    var full_path = path.join(cwd, name);

    var text = Date().toString() + " this first line \r\n";

    p('going to create: ', full_path);
    create(id, full_path, text, function(err,what){
        if(err){
            p('err: ', err);
        }else{
            p('result: ', what);
        }
        process.exit();
    });
}

function c_append_log(full_path, text){
    fp   = full_path || 'abc/tadd/test.log';
    text = text      || Date().toString() + " got append. \r\r";

    append(fp, text, function(err, what){
        if(err){
            p('err: ', err);
        }else{
            p('result: ', typeof what);
        }
        process.exit();
    });
}


function c_append_create(full_path, text){
    //fp   = full_path || 'abc/tadd/test.log';
    fp   = full_path || 'abc/tadd/code.hook.log';

    text = text      || Date().toString() + " , txt got append in c append create in append-txt.js. \r\n";

    append_txt(fp, text, function(err, what){
        if(err){
            p('err: ', err);
        }else{
            p('result: ', typeof what);
        }
        process.exit();
    });
}


if(require.main === module){
    //c_create_log('abc', 'abc/tadd', 'test.log');
    //c_append_log();
    c_append_create();
}


