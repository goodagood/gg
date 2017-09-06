/*
 * full-path menas: 'fullfil' the relative 'path', I did regret the name the
 * 2nd day.
 *
 * If HTML contains relative pathes, such as: href, src attributes.
 * We need to convert it to full path,
 * so the converted html can be displayed by browsers.
 * 2015 1015
 */

var path = require("path");

var get_file = require("../aws/get-file.js");
var bucket   = require("../aws/bucket.js");

var bucket2  = require("gg-credentials").bucket; //d

var p = console.log;


/* 
 * convert local file in the html text to full path
 * 2015 1015
 */
function convert_relative_pathes_in_file(pathuuid, callback){
    get_file.get_file_obj_with_auxpath_by_pathuuid(pathuuid, function(err, file){
        if (err) { return callback("failed to get the file object. " + pathuuid); }

        transfer_relative_pathes(file, callback);
    });
}


/* 
 * @file: file object
 */
function transfer_relative_pathes(file, callback){
        if (!file) { return callback("file obj needed to transfer rela.... " + pathuuid); }

        file.read_to_string(function(err, text){
            if (err) { return callback("failed read to string" + pathuuid); }

            var meta = file.get_meta();
            var cwd;
            if(meta['dir']){
                cwd = meta['dir'];
            }else{
                cwd = path.dirname(meta['path']);
            }
            p(1, '1018 1449', cwd);

            var convert_path_in_html = require("./html-path.js");
            var html = convert_path_in_html.transfer_html(text, cwd, '/file/get/');
            p(2.2, '1557am', html.length, html.slice(0,300));

            calculate_s3key_for_converted(file, null, function(err, s3key){
                if(err) return callback('calculate err, s3key: ' + err);

                p('the s3key: ', s3key);

                save_converted_html_and_file(file, html, s3key, callback);  //todo
            });
        });
}




var Name_of_relative_path_converted = 'relative_path_converted_html';


/*
 * parameters get both @file and @file_meta because i think it will happen
 * both way.
 */
function calculate_s3key_for_converted(file, file_meta, callback){
    if(file)      meta = file.get_meta();
    if(file_meta) meta = file_meta();

    var s3key;
    if(meta.aux_path){
        p('meta.aux_path'); p(meta.aux_path);
        s3key = path.join(meta.aux_path, Name_of_relative_path_converted);
        return callback(null, s3key);
    }

    if(file){
        return file.callback_file_auxiliary_path(function(err, aux_path){
            if(err) return callback('2015 1015 got aux path err: ' + err);

            s3key = path.join(aux_path, Name_of_relative_path_converted);
            return callback(null, s3key);
        });
    }

    // if it comes here, something wrong
    return callback('what is wrong? in s3key for converted, file.js');
}


function save_converted_html_and_file(file, html, s3key4html, callback){
    var meta = file.get_meta();

    bucket2.write_text_file(s3key4html, html, function(err, s3reply){
        if(err) return callback(err); //...

        meta['html_with_converted_local_pathes'] = {
            s3key: s3key4html,
        };

        file.save_file_to_folder()
        .then(function(what){
            return callback(null, html);
        })['catch'](callback);
    });
}


function get_html_converted(file_full_path, callback){
    get_file.get_1st_file_obj_with_auxpath_by_path(file_full_path, function(err, file){
        if (err) { return callback("<h1> file not found by path</h1> " + file_full_path); }

        //return callback(null, 'html...testing...');
        var meta = file.get_meta();

        if(meta['html_with_converted_local_pathes']){
            var html_converted = meta['html_with_converted_local_pathes'];
            if(html_converted.html) return callback(null, html_converted.html);
            if(html_converted.s3key){
                p('to read html_converted.. s3');
                return bucket.read_to_string(html_converted.s3key, function(err, str){
                    if (err) { return callback("<h1> failed to read the object</h1> " + file_full_path); }

                    return callback(null, str);
                });
            }
        }else{
            p('else');
            //p('u.keys(meta)'); p(u.keys(meta));
            p(meta.path);
            p(meta.path_uuid);
            return convert_relative_pathes_in_file(meta.path_uuid, function(err, html){
                if (err) { return callback("failed to convert the html with local path" + file_full_path); }
                return callback(null, html);
            });
        }
    });
}


// to check, 2015 1018
function convert_html(file_full_path, callback){
    get_file.get_1st_file_obj_with_auxpath_by_path(file_full_path, function(err, file){
        if (err) { return callback("file not found by path, 2015 1018 1339pm" + file_full_path); }

        var meta = file.get_meta();

        //p('u.keys(meta)'); p(u.keys(meta));
        p(meta.path); p(meta.path_uuid);

        return convert_relative_pathes_in_file(meta.path_uuid, function(err, html){
            if (err) { return callback("failed to convert the html with local path" + file_full_path); }
            return callback(null, html);
        });
    });
}


module.exports.get_html_converted = get_html_converted;

// export for checking
module.exports.calculate_s3key_for_converted = calculate_s3key_for_converted;
module.exports.save_converted_html_and_file = save_converted_html_and_file;
module.exports.convert_relative_pathes_in_file = convert_relative_pathes_in_file;

module.exports.convert_html = convert_html;
module.exports.transfer_relative_pathes = transfer_relative_pathes;

