
var path = require('path');
var fs   = require('fs');


var hb_dir = path.join(path.dirname(__dirname) + '/handlebars-views');

var p = console.log;


/*
 * Note: Chinese lang code is: 'zh'
 * tpl_file_name should have EXTENSION.
 */
function render_lang(req, res, next, tpl_file_name, context, callback){
    var lang_code = 'en';
    if(typeof req.user !== 'undefined' && typeof req.user.lang === 'string'){
        lang_code = req.user.lang;
    }else if(req.locale){
        lang_code = req.locale;
    }else{
        ; //
    }

    var lang_file_name = calculate_lang_file_name(tpl_file_name, lang_code);
    var abs_lang_file_name = path.join(hb_dir, lang_file_name);

    p('tpl file name:', tpl_file_name, 'lang code: ', lang_code, 'abs lang file name: ', abs_lang_file_name);
    fs.exists(abs_lang_file_name, function(yes){
        if(yes){
            res.render(lang_file_name, context, callback);
        }else{
            // may be same as before:
            res.render(tpl_file_name,  context, callback);
        }
    });

}


// template file name has no path, it's same as original res.render(file_name)
function calculate_abs_lang_file_name(tpl_file_name, lang_code){
    var lang_file_name = calculate_lang_file_name(tpl_file_name, lang_code);

    var abs_lang_file_name = path.join(hb_dir, lang_file_name);
    return abs_lang_file_name;
}


/*
 * It would be: file-name-lang_code.extension
 * for example: login.html -> login-cn.html
 */
function calculate_lang_file_name(tpl_file_name, lang_code){
    var extension, reg_ext, base;
    var lang_file_name = tpl_file_name;

    // change the file name ONLY it's NOT english:
    if(lang_code !== 'en'){
        var extension = path.extname(tpl_file_name);

        var reg_ext   = RegExp(extension + '$', 'i');
        var base      = tpl_file_name.replace(reg_ext, '');

        lang_file_name = base + '-' + lang_code + extension;
    }

    return lang_file_name;
}

function file_exists(tpl_file_name, lang_code, callback){
    var lang_file_name = calculate_lang_file_name(tpl_file_name, lang_code);
    p('lang file name: ', lang_file_name);

    var abs_lang_file_name = path.join(hb_dir, lang_file_name);

    fs.exists(abs_lang_file_name, callback);
}


module.exports.render_lang = render_lang;

//-- checkings --//

function chk_exists(file_name){
    file_name = file_name || 'ls.html';
    file_exists(file_name, 'zh', function(yes, what){
        p('exists? ', yes);
    });
}

if(require.main === module){
    //p(hb_dir);

    chk_exists();
}


