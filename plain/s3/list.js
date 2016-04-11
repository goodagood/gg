
var u = require("underscore");

var folder = require("./folder.js");

var p = console.log;



// for owner during dev.
function list_y6m03(folder_path, callback){
    if(!u.isString(folder_path)) return callback('please give valid folder path');

    folder.retrieve_folder(folder_path, function(err, folder_obj){
        if(err){
            p('retrieve folder err 0318y6 e: ', err);
            return callback(err);
        }

        var meta = folder_obj.get_meta();

        if(meta.cache['folder-renders'].html.owner) return callback(null, meta.cache['folder-renders'].html.owner);

        callback('no html render for owner found');
    });
}
module.exports.list_y6m03 = list_y6m03;




/*
 * This give un-ordered list, an <ul> tag.
 */
function ul_for_user(name, folder_obj, callback){
    if(folder_obj.is_owner(name)){
        var meta = folder_obj.get_meta();
        if(meta.cache){
            if(meta.cache['renders']){
                if(meta.cache['renders'].ul){
                        p('going to return: ',  meta.cache['renders'].ul);
                        //return meta.cache['folder-renders'].html.owner;
                        return meta.cache['renders'].ul;
                }
            }
        }
        return `<ul><li>Are you sure there is: meta.cache['renders'].ul</ul></li>`;
    }else{
        return `<ul class="file-list" > \r\n
            <li> Right now, we can list file for owner only.</li> \r\n
            </ul> \r\n`;
    }
}
module.exports.ul_for_user = ul_for_user;


//?
function get_ul(role, folder){
    var meta = folder.get_meta();

}


var chain = require("../cwd-chain/cwd-chain.js");

/*
 * This give webpage
 */
function ls_for_user(name, folder_path, callback){
    if(!u.isString(name)) return callback('please give valid user name');
    if(!u.isString(folder_path)) return callback('please give valid folder path');

    folder.retrieve_folder(folder_path, function(err, folder_obj){
        if(err){
            p('retrieve folder err 0318y6 when ls4user: ', err);
            return callback(err);
        }

        // ul is the file list in shape of <ul> tag
        var ul = ul_for_user(name, folder_obj)
        var path_chain = chain.cwd_chain(folder_path, '/ls');

        var context = {ls_as_ul: ul, username: name, cwd: path_chain, title: 'I am testing'};

        render_webpage('./tpl/ls.html', context, callback);
        //return callback(null, ul); //indev
    });
}
module.exports.ls_for_user = ls_for_user;


var path = require("path");
var tpl = require("../myutils/tpl.js");
/*
 * @tpl_file_path is relative path.
 */
function render_webpage(tpl_file_path, context, callback){
    var abs_path = path.join(__dirname, tpl_file_path);
    p('abs path: ', abs_path);    

    tpl.render_template(abs_path, context, callback);
    //callback(null, null);
}


if(require.main === module){
    var p = console.log;

    function c_render(){
        render_webpage('./tpl/ls.html', {}, function(err, what){
            p('we are testing webpage, ', err, what);
            setTimeout(process.exit, 2*1000);
        });
    }
    //c_render();

    function c_webpage(name, folder_path){
        folder_path = folder_path || "t0310y6";
        name = name || 't0310y6';

        p('go to ls for user');
        ls_for_user(name, folder_path, function(err, html){
            p('c ls for user webpage, ', err, html);
            setTimeout(process.exit, 5*1000);
        });
    }
    //c_webpage();


    function c_list_y6m03(folder_path){
        folder_path = folder_path || "t0310y6";

        list_y6m03(folder_path, function(err, html){
            if(err) return p('c list y6m03 e: ', err);
            p(html);


            setTimeout(process.exit, 2*1000);
        });
    }
    //c_list_y6m03();

    setTimeout(process.exit, 22000);
}