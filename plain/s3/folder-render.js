
var u = require("underscore");

var folder  = require("./folder.js");
var writter = require("./folder-writter.js");

var p = console.log;




function render(folder_path, callback){
    if(!u.isString(folder_path)) return callback('please give valid folder path');

    folder.retrieve_folder(folder_path, function(err, folder_obj){
        if(err){
            p('retrieve folder err 0318y6 e: ', err);
            return callback(err);
        }

        var ul = add_up_li(folder_obj);

        var meta = folder_obj.get_meta();

        if(!meta.cache['folder-renders']) meta.cache['folder-renders'] = {html: {}};
        meta.cache['folder-renders']['html']['owner'] = ul;

        folder_obj.save_meta(callback);
        //callback(null, ul);

    });
}
module.exports.render = render;


function add_up_li(folder_obj){
    var meta = folder_obj.get_meta();
    var infos;
    if(meta.cache && meta.cache['file-infos']) infos = meta.cache['file-infos'];
    if(!infos || u.isEmpty(infos)) return `<ul class="file-list" data-path="${meta.path}">\r\n
        <li> No file or file info not cached (found when add up li).</li>
        </ul>`;

    // If there are file infos, we build up list
    var ul = `<ul class="file-list" data-path="${meta.path}">\r\n`;

    u.each(infos, function(info){
        if(info.li) return ul += info.li + "\r\n";

        info.li = writter.default_li(info); //try not do this
        return ul += info.li + "\r\n";
    });

    return ul += '</ul>' + "\r\n";
}
module.exports.add_up_li = add_up_li;


if(require.main === module){
    var p = console.log;

    function c_render(folder_path){
        folder_path = folder_path || "t0310y6";

        render(folder_path, function(err, t_render){
            if(err) return p('e: ', err);
            p('test, y6 0318 5:56am, a: ', t_render);


            setTimeout(process.exit, 10*1000);
        });
    }
    c_render('t0326y6');

    //setTimeout(process.exit, 12000);
}
