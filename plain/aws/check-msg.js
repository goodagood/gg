
var Promise, assert, async, config, fm, folder_path, gg_folder_name,
    new_folder_name, p, path, stop, u, user_name;

assert = require("assert");
u = require("underscore");
async = require("async");
path = require("path");
Promise = require("bluebird");

fm = require("../aws/folder-v5.js");

config = require("../test/config.js");


_folder_path    = 'abc';
_user_name      = 'abc';
_gg_folder_name = 'goodagood';
_new_folder_name= 'test';


p = console.log;

stop = function(period) {
    var milli_seconds;
    period = period || 1;
    if (!u.isNumber(period)) {
        period = 1;
    }
    milli_seconds = period * 1000;
    return setTimeout(process.exit, milli_seconds);
};


get_txt_of_the_1st_msg = function(){
    _folder_path = 'abc/goodagood/message';
    var Folder;
    fm.retrieve_promisified_folder(_folder_path).then(function(folder) {
        Folder = folder;
        meta = folder.get_meta();
        uuid_list = Object.keys(meta.files);
        return uuid_list;
    }).then(function(list){
        //p('list: ', list);
        return list[0];
    }).then(function(first){
        // 'first' is the first uuid of msg file.
        //p('the first uuid: ', first);

        Folder.uuid_to_file_obj(first, function(err, file){
            //p('get the file obj: \n',err,  file);

            var info = file.get_meta();
            p('the first file name: ', info.name);

            file.get_msg_text(function(err, txt){
                p ('text of the msg:\n', txt);
                stop();
            });

            //file.fetch_msg_json(function(err,json){
            //    p('json: ', json);
            //    file.get_msg_text(function(err, txt){
            //        p ('text of the msg: ', txt);
            //    });
            //});
        });

    });
};


if(require.main === module){
    get_txt_of_the_1st_msg();
}
