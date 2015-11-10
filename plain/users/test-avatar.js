
var A = require('./avatar.js');

//var s3folder = require('../aws/folder.js');
var s3folder = require('../aws/folder-v4.js');

// 11-13 2014, tested
function get_user_obj_from_folder(folder_path){
    folder_path = folder_path || 'abc/goodagood';
    s3folder.retrieve_folder(folder_path, function(err, folder){
        var username = folder.get_owner_name();
        console.log(username);
        folder.get_owner_obj(function(oobj){
            console.log(oobj);
            oobj.get_attr(null, function(err,reply){
                console.log(reply);
                process.exit()
            });
            //oobj.get('username', function(err,reply){
            //    if(err) console.log(err);
            //    console.log(typeof reply);
            //    console.log(reply);
            //});
        });
        //var meta = folder.get_meta();

        //console.log(meta);
    });
}


function set_user_attr(folder_path){
    folder_path = folder_path || 'abc/goodagood';
    s3folder.retrieve_folder(folder_path, function(folder){
        var username = folder.get_owner_name();
        console.log(username);
        folder.get_owner_obj(function(oobj){
            //console.log(oobj);
            oobj.set('funny', 'yes', function(err, reply){
                console.log(reply);
            });
        });
        //var meta = folder.get_meta();

        //console.log(meta);
    });
}

function test_flag_up(username, flag_title){
    var user = A.make_user_obj(username);
    user.init(function(){
        user.flag_up(flag_title, function(ok, done){
            console.log(ok, done);

            console.log('Flag up, ok: ', ok);
            console.log('try the 2nd flag:');
            user.flag_up(flag_title, function(ok, done){
                if(!ok) console.log('second flag not OK');
            });
            console.log('Flag up, ok: ', ok, ', going to DOWN the flag.');
            if(ok) done();
        });
    });
}

//
function test_new_user_obj(username){
    A.make_user_obj(username, function(user){
        console.log(user);
        user.get_attr(null, function(err, attrs){
            console.log(err, attrs);
        });

    });
}

function test_get_attr(username){
    var user = A.make_user_obj(username);
    console.log(user);
    user.get_attr('username', function(err, reply){
        console.log(err, reply);
    });
    user.get_attr(null, function(err, reply){
        console.log(err, reply);
    });
}

function test_refresh(username){
    var user = A.make_user_obj(username);
    user.refresh(function(a){
        console.log(a);
    });
}

// to do
function test_init_flag(username){
    var user = A.make_user_obj(username);
    user.init_flag(function(a){
        console.log(a);
    });
}



if(require.main === module){
    get_user_obj_from_folder('abc');
    //test_flag_up('goodagood', 'first-flag');
    //set_user_attr();

    //test_init_flag('goodagood');
    //test_refresh('goodagood');
    //test_get('goodagood');
    //test_new_user_obj('abc');

    //setTimeout(function(){ rclient.quit(); }, 5000);  // close the redis.
    setTimeout(function(){ process.exit(); }, 15000);  // close the redis.
}
