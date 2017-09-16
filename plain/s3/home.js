
const async = require("async");
const bb    = require("bluebird");
const path  = require("path");

var folder = require("./folder.js");
var tool   = require("./folder-tool.js");
var dadder = require("./add-folder.js");

var p = console.log;

/*
 * @owner: string, username
 */
function new_root(owner, callback){
    if(!owner) return callback('We need to know the username of the owner');

    var folder_path = owner;

    // The root dir name is same as owner's name
    folder.new_obj(owner, function(err, obj){
        if(err) return callback(err);

        //p(err, obj);
        //p(obj.get_meta());
        obj.set_owner(owner);
        obj.calculate_basic_meta(function(err, meta){
            if(err) return callback(err);

            //p('after calculate_basic_meta, ', err, meta);
            //if(!meta.path) meta.path = owner;

            obj.save_meta(function(err, s3rep){
                if(err) return callback(err);

                callback(null, obj);
            });
        });
    });
}


function new_root_if_not_exists(owner, callback){
    if(!owner) return callback('We need to know the username of the owner');

    tool.is_folder_exists(owner, function(err, exists){
        if(exists){
            p(`home: ${owner} EXISTS.`);
            return folder.retrieve_folder(owner, callback);
        }else{
            p(`build new root: ${owner}.`);
            new_root(owner, callback);
        }
    });
}


var wait_new_root_any_way = bb.promisify(new_root_if_not_exists);


// no action if it exists
var wait_add_sub_folder = bb.promisify(dadder.add_sub_folder);


/*
 * step by step root/home building/testing
 * 2016 Mar. ~20, 25
 *
 * build folders, and callback with the root (owner's name) folder obj:
 *
 * @owner : string of user name.
 *
 * folders:
 *   owner/
 *   owner/gg/
 *   owner/public/
 *   owner/muji/
 */
function ss_root(owner, callback){
    var root;

    return wait_new_root_any_way(owner)
    .then(function(R){
        root = R;
        return wait_add_sub_folder(root, 'gg');
    })
    .then(function(gg){
        return wait_add_sub_folder(root, 'muji');
    })
    .then(function(muji){
        return wait_add_sub_folder(root, 'public');
    })
    .then(function(pub){
        return callback(null, root);
    })
    .catch(function(err){
        return callback(err);
    });
}


//-- checkings

function c_wait_root(name){
    name = name || 't0322y6';

    wait_new_root_any_way(name).then(function(root){
        p('wait root: ', root);
    }).catch(function(err){
        p('err cought in wait root: ', err);
    });

}


function c_ss_root(name){
    `Check step by step root building`

    name = name || 't0326y6';

    ss_root(name, function(err, root){
        if(err) return p('c ss root got err: ', err);
        p('c ss root get meta: ', root.get_meta());
        setTimeout(process.exit, 5*1000);
    });
}


function c_new_root(name){
    name = name || 't0326y6';
    new_root(name, function(err, what){
        p('checking new root : ', err, what);
        process.exit();
    });
}


if(require.main === module){
    //c_new_root('t0322y6');

    c_ss_root('t0326y6');
    //c_wait_root();

    setTimeout(process.exit, 33*1000);
}
