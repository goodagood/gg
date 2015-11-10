
//
// test aws/members-v2.js
//
// 0420, 2015.
//

var assert  = require("assert");
var u       = require("underscore");
var async   = require("async");
var path    = require("path");
var Promise = require("bluebird");
var fs      = require("fs");

//var bucket        = require("../aws/bucket.js");
//var file_module   = require("../aws/simple-file-v3.js");
//var file_types    = require("../aws/s3-file-types.js");
//var update        = require("../aws/file-update.js"); 
//
//var myconfig =   require("../config/config.js");
//var config = require("../test/config.js");

var folder_module = require("../aws/folder-v5.js");
var a      = require("../users/a.js");
var user   = require("../users/a.js");
var all_roots = require("../users/all-roots.js");

var ttool  = require("../myutils/test-util.js");

// folders, files used in testing //
var _test_folder_path = 'abc';
var _test_file_name   = 'test-write-20';
var _test_file_path   = 'abc/test-write-20';
var _test_user_name   = 'abc';

var _gg_folder_name  = 'goodagood';
var _new_folder_name = 'test';
var _new_folder_name_in_test = 'test';


var p = console.log;

var stop = function(period) {
    var milli_seconds;
    period = period || 1;
    if (!u.isNumber(period)) {
        period = 1;
    }
    milli_seconds = period * 1000;
    return setTimeout(process.exit, milli_seconds);
};

// end of the headings //



var member = require("../aws/members-v2.js");

function check_get_member_file_s3key(){
    //var user = 'tmpe';
    //var dir  = 'tmpe/goodagood';
    //var dir  = '17/goodagood';
    //var dir  = 'abc/test';
    var dir  = 'aa/public';

    folder_module.retrieve_folder(dir).then(function(folder){
        p('in check g m f s key, folder: ', folder);
        var key = member.get_member_file_s3key(folder);
        p('member file s3 key: ', key);
        stop();
    }).catch(function(err){
        p('catch : ', err);
        stop();
    });
}

function wrt_member_file(dir){
    dir = dir || 'abc/test';

    folder_module.retrieve_folder(dir).then(function(folder){
        var key = member.get_member_file_s3key(folder);
        p('member file s3 key: ', key);

        member.write_member_json(key, {}, function(err, repl){
            p("write member file : ", err, repl);
            member.read_member_json(key, function(err, j){
                p('read back: ', j);
                stop();
            });
        });

    }).catch(function(err){
        p('catch : ', err);
        stop();
    });

}


function get_member_json(dir){
    dir = dir || 'abc/test';

    folder_module.retrieve_folder(dir).then(function(folder){
        var key = member.get_member_file_s3key(folder);
        p('member file s3 key: ', key);

        member.make_member_manager_for_folder(folder, function(err, manager){
            //p('the manager: ', manager);
            p('the manager is empty: ', u.isEmpty(manager));

            p('the json: ', manager.get_json());

            manager.add_member('andrew', function(err, what){
                manager.add_members(['tmpe', 'aa'], function(err, what){
                    manager.init(function(err, what){
                        p('after addings members, the json: ', manager.get_json());
                        stop();
                    });
                });
            });


        });

    }).catch(function(err){
        p('catch : ', err);
        stop();
    });
}


function chk_0703(dir){
    dir = dir || 'abc/test';

    folder_module.retrieve_folder(dir).then(function(folder){
        var key = member.get_member_file_s3key(folder);
        p('member file s3 key: ', key);

        member.make_member_manager_for_folder(folder, function(err, manager){
            p('the manager is empty: ', u.isEmpty(manager));

            p('the json: ', manager.get_json());

            manager.write_empty_json( function(err, what){
                p('after write empty json: ', manager.get_json());
                stop();
            });
        });

    }).catch(function(err){
        p('catch : ', err);
        stop();
    });
}

function to_check(dir, totest){
    //dir = dir || 'abc/test';
    dir = dir || 'aa/public';

    folder_module.retrieve_folder(dir).then(function(folder){
        var key = member.get_member_file_s3key(folder);
        p('member file s3 key: ', key);

        member.make_member_manager_for_folder(folder, function(err, manager){
            p('the manager is empty: ', u.isEmpty(manager));

            p('the json: ', manager.get_json());

            totest = totest || manager.get_json;

            totest(manager, function(err, what){
                if(err){
                    p('got err: ', err);
                    return stop();
                }
                manager.init(function(err, what){
                    p('after to test: ',err, manager.get_json());
                    stop();
                });
            });
        });
    }).catch(function(err){
        p('catch : ', err);
        stop();
    });
}

function check_viewer_a(manager, callback){
    manager.add_viewer('*', callback);
}

function check_member_file_exists(dir){
    //dir = dir || 'abc/test';
    dir = dir || '19/public';

    folder_module.retrieve_folder(dir).then(function(folder){
        member.member_file_exists(folder, function(err, yes){
            p('member file exists: err yes: ', err, yes);
            stop();
        });
    });
}


function check_member_manager_19_public(dir, o){
    dir = dir || '19/public';

    folder_module.retrieve_folder(dir).then(function(folder){
        member.make_member_manager_for_folder(folder, function(err, mng){
            p('make member manager for folder, in check member manager 19/public: ', err, mng);
            // to drop into REPL:
            o.folder = folder;
            o.mng = mng;
        });
    });
    return null;
}

function check_member_manager_17_public(dir, o){
    dir = dir || '17/public';

    folder_module.retrieve_folder(dir).then(function(folder){
        member.make_member_manager_for_folder(folder, function(err, mng){
            p('make member manager for folder, in check member manager 17/public: ', err, mng);

            // to drop into REPL, 17/pub and 17 folder object and it's meta:
            o.f17pub   = folder;
            o.mf17     = folder.get_meta();
            o.mng17pub = mng;
            folder_module.retrieve_folder(dir).then(function(folder){
                o.f17  = folder;
                o.mf17 = folder.get_meta();
            });
        });
    });
    return null;
}

function check_member_manager(dir, o){
    dir = dir || 'abc/public';
    o   = o   || this;

    folder_module.retrieve_folder(dir).then(function(folder){
        member.make_member_manager_for_folder(folder, function(err, mng){
            //p('make member manager for folder, in check member manager : ', err, mng);

            // to drop into REPL, 17/pub and 17 folder object and it's meta:
            o.abcpub   = folder;
            o.m        = folder.get_meta();
            o.mng      = mng;
            p('o.mng.has_viewer("ooooo"): ', o.mng.has_viewer("ooooo"));
            p('o.mng.has_member("tmp"): ', o.mng.has_member("tmp"));
        });
    });
    return null;
}


//var walker = require("../aws/walk-through.js");


/*
 * add viewer '*' to the dir.
 */
function add_viewer(dir, callback){
    //dir = dir || 'abc/public';

    p('dir: ', dir);
    folder_module.retrieve_folder(dir).then(function(folder){
        member.make_member_manager_for_folder(folder, function(err, manager){
            if(err) return callback(err);

            //p('the json: ', manager.get_json());
            manager.add_viewer('*', callback);
        });
    }).catch(callback);
}

function add_viewer_star_to_public_folders(){
    // add 'muji' folder for each user
    user.get_user_names(function(err, name_list){
        //p(err, name_list.join(', '));
        async.map(name_list, user.get_user_id, function(err, id_list){
            //p('aa add viewer to public: err, list: ', err, id_list.join(', '));

            var public_folder_pathes = u.map(id_list, function(id){
                return path.join(id, 'public');
            });
            //p('public pathes:  ', public_folder_pathes.join(', '));

            async.map(public_folder_pathes, add_viewer, function(err, what){
                p('*-ed? ', err, what);
                stop();
            });
        });
    });
}

function add_public_viewer_to_public_folders(){
    all_roots.get_all_root_ids(function(err, ids){
        if(err){
            p('err: ', err);
            stop();
        }
        p(ids.join(",\t "));

        var folder_pathes = u.map(ids, function(id){
            return path.join(id, 'public');
        });
        //p('pathes:  ', folder_pathes.join(', '));

        async.map(folder_pathes, add_viewer, function(err, what){
            p('*-ed? ', err, what);
            stop();
        });

    });
}



function check_add_viewer(dir){
    dir = dir || '62/public';
    add_viewer(dir, function(err, what){
        p(11, err, what);
        stop();
    });
}

function dir_has_public_viewer(dir, callback){
    if(!u.isString(dir)) return callback('not a path string');

    folder_module.retrieve_folder(dir).then(function(folder){
        member.make_member_manager_for_folder(folder, function(err, manager){
            if(err) return callback(err);

            //p('the json: ', manager.get_json());
            var has = manager.has_viewer('*');
            if(!has) p(has, dir);
            callback(null, has);
        });
    }).catch(callback);
}

function check_has_public_viewer(){
    all_roots.get_all_root_ids(function(err, ids){
        if(err){
            p('err: ', err);
            stop();
        }
        p(ids.join(",\t "));

        async.map(
            ids,
            function(id, callback){
                //p(id);
                var dir = path.join(id, 'public');
                dir_has_public_viewer(dir, callback);
                //callback(null, id);
            },
            function(err, results){
                p('final callback:', err, results);
                stop();
            }
        );
    });
}


if(require.main === module){
    //check_get_member_file_s3key();
    //wrt_member_file();
    //get_member_json();
    //chk_0703();
    //check_member_file_exists();

    //to_check(false, check_viewer_a);

    //add_viewer_star_to_public_folders();
    check_add_viewer();
    //check_has_public_viewer();

    //add_public_viewer_to_public_folders();
}



// -- for drop into REPL -- //

var o = {};
//check_member_manager(null, o);
//check_member_manager_19_public(null, o);
//check_member_manager_17_public(null, o);


// a signal to 'expect'
console.log("ok start interact:");
