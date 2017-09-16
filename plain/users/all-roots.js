
/*
 * Get all user ids and prepared room ids.
 */


var u     = require("underscore");
var async = require("async");

var user  = require("./a.js");
var phome = require("../aws/prepare-home.js");

var p = console.log;

/*
 * get array of ids, contains two parts: exists users and prepared root folders
 */
function get_all_root_ids(callback){
    //var pairs  = [];
    var allids = [];

    user.get_user_names(function(err, name_list){
        if(err) return callback(err, null);

        async.map(name_list,
            function(name, callback){
                //p('going to get user id for: ', name);
                user.get_user_id(name, function(err, id){
                    if(err) return callback(err);

                    //p( i++ , ' in: name, id: ', name, id);
                    //pairs.push([name, id]);
                    allids.push(id);
                    //p('ok? ');
                    return async.nextTick(function(){
                        return callback(null, id);
                    });
                });
            },
            function(err, what){
                if(err) return callback(err);
                //p('after async, err, what: ', err, typeof what, u.isArray(what));

                phome.list_ids(function(err, id_list){
                    if(err) return callback(err);

                    //p(22, err, typeof id_list);
                    allids = u.union(allids, id_list);
                    //p('ids: ', id_list.join(",\t"));
                    callback(null, allids);
                });
            }
        );
    });
}


module.exports.get_all_root_ids = get_all_root_ids;


// checkings //

function get_all(){
    get_all_root_ids(function(err, list){
        p('haha', "\n", err, typeof list);
        if(!err){
            p(list.sort().join(",\t "));
        }
        process.exit();
    });
}

if(require.main === module){
    get_all();
}
