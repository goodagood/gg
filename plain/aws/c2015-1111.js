/*
 * Trying to find all root folder meta, after REDIS cracked/flushed.
 * to find out the user name and id information to re-build user db.
 * 2015 1111
 */


var roots = [
'.gg.folder.meta/17',
    '.gg.folder.meta/19',
    '.gg.folder.meta/20',
    '.gg.folder.meta/21',
    '.gg.folder.meta/24',
    '.gg.folder.meta/25',
    '.gg.folder.meta/27',
    '.gg.folder.meta/28',
    '.gg.folder.meta/29',
    '.gg.folder.meta/30',
    '.gg.folder.meta/33',
    '.gg.folder.meta/34',
    '.gg.folder.meta/35',
    '.gg.folder.meta/36',
    '.gg.folder.meta/37',
    '.gg.folder.meta/38',
    '.gg.folder.meta/39',
    '.gg.folder.meta/40',
    '.gg.folder.meta/41',
    '.gg.folder.meta/43',
    '.gg.folder.meta/44',
    '.gg.folder.meta/45',
    '.gg.folder.meta/46',
    '.gg.folder.meta/47',
    '.gg.folder.meta/48',
    '.gg.folder.meta/49',
    '.gg.folder.meta/5',
    '.gg.folder.meta/50',
    '.gg.folder.meta/54',
    '.gg.folder.meta/55',
    '.gg.folder.meta/56',
    '.gg.folder.meta/57',
    '.gg.folder.meta/59',
    '.gg.folder.meta/60',
    '.gg.folder.meta/61',
    '.gg.folder.meta/62',
    '.gg.folder.meta/63',
    '.gg.folder.meta/64',
    '.gg.folder.meta/65',
    '.gg.folder.meta/66',
    '.gg.folder.meta/67',
    '.gg.folder.meta/68',
    '.gg.folder.meta/69',
    '.gg.folder.meta/70',
    '.gg.folder.meta/71',
    '.gg.folder.meta/72',
    '.gg.folder.meta/aa',
    '.gg.folder.meta/ab',
    '.gg.folder.meta/abc',
    '.gg.folder.meta/ac',
    '.gg.folder.meta/andrew',
    '.gg.folder.meta/anonymous',
    '.gg.folder.meta/bb',
    '.gg.folder.meta/cc',
    '.gg.folder.meta/dd',
    '.gg.folder.meta/dirty-show',
    '.gg.folder.meta/ee',
    '.gg.folder.meta/goodagood',
    '.gg.folder.meta/intro',
    '.gg.folder.meta/lth',
    '.gg.folder.meta/muji',
    '.gg.folder.meta/pptok',
    '.gg.folder.meta/test',
    '.gg.folder.meta/tmp',
    '.gg.folder.meta/tmpa',
    '.gg.folder.meta/tmpaa',
    '.gg.folder.meta/tmpab',
    '.gg.folder.meta/tmpb',
    '.gg.folder.meta/tmpc',
    '.gg.folder.meta/tmpd',
    '.gg.folder.meta/who'
];


/* start */

var u = require("underscore");
var async = require("async");

var fs = require("fs");


var bucket = require("./bucket.js");

var p = console.log;

var tmp_file = '/tmp/rfmeta';

function get_rootj(){
    async.map(roots, 
            function(s3key, callback){
                p('to get: ', s3key);
                bucket.read_json(s3key, callback);
            },
            function(err, jarray){
                fs.writeFile(tmp_file, JSON.stringify(jarray), 'utf-8', function(err, what){
                    p('wrote, ', err, what);
                    p(jarray.length);
                    process.exit();
                });

            });
}

function set_usera(){
    fs.readFile(tmp_file, 'utf-8',  function(err, text){
        var metas  = JSON.parse(text);
        p(metas.length);

        //var shorts = u.map(metas, function(m){
        //    save_user(m);
        //    var owner;
        //    if(m.owner) owner = m.owner;
        //    return [owner, m.path];
        //});

        async.map(metas, save_user, function(err, what){
            p('async rep: ', err, what);
            process.exit();
        });

        //p(shorts);

    });
}

function save_user(meta, callback){
    var m = meta;

    var owner;
    if(m.owner) owner = m.owner;

    if(/.+\?$/.test(owner)){
        p('this: ', owner, m.path);
        return callback(null, null);
    }

    var id = m.path;

    return hashuser(owner, id, callback);
}

var user = require("../users/a.js");
function hashuser(name, id, callback){
    var info = {
        username: name,
        id: id,
        password: 'kkkooo',
    }

    p(info);
    user.save_user_to_redis(info, callback);
}

   

if(require.main === module){
    //get_rootj();

    set_usera();
}
