
var path = require('path');

var folder_module = require("../aws/folder-v5.js");
var handlebars = require("handlebars");

var chain = require("../cwd-chain/cwd-chain.js");

var lutil         = require("./utils.js");

var p = console.log;

/*
 * @parameters : 
 *   { 
 *     cwd: 'the folder path to list'
 *
 *     username:
 *     user: user json/object
 *     id:  'user id, string'
 *   }
 *   not check any thing, just list images.
 */
function ls_carousel_a(parameters, callback){
    var folder_path = parameters.cwd;

    var template_path = path.join(path.dirname(__dirname), "handlebars-views/acarousel.html");

    folder_module.retrieve_folder(folder_path).then(function(the_folder){

        var image_list = the_folder.build_blueimp_pic_gallery_list();
        var list_str = image_list.join("\n");

        chain.make_cwd_chain(folder_path, function(err, chain_tag){

            var context = {
                cwd_chain : chain_tag,
                image_list : list_str,
            };

            lutil.render_template(template_path, context, callback);

            //res.render('acarousel.html', { 
            //    cwd_chain : chain_tag,
            //    image_list : list_str,
            //});
        });
    }).catch(function(err){
        if(!the_folder) {return callback('<h1>ls carousel found no folder</h1>');}
    });
}


module.exports.ls_carousel_a = ls_carousel_a;


//-- checkings

function chk_c_a(){
    var parameters = {
        cwd: 'abc/imgvid',
    };
    ls_carousel_a(parameters, function(err, html){
        p(1, err, html);

        require ("../myutils/test-util.js").stop();
    });
}

if(require.main === module){
    chk_c_a();
}
