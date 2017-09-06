
const client = require('./mongo.client.js');

const p = console.log;




function cgetdb(){
    var GG_Sys_Db         = 'mongodb://localhost:27017/ggsys';

    client.getdb(GG_Sys_Db, function(err, db){
        p(err, db);
    });
}


// check get_value_coll, get the collection saving values
function cvalcoll(){
    var GG_Sys_Db         = 'mongodb://localhost:27017/ggsys';

    client.get_value_coll(function(err, coll){
        p(err, coll);
    });
}


function cinsert(){
    var GG_Sys_Db         = 'mongodb://localhost:27017/ggsys';

    client.get_value_coll(function(err, coll){
        if(err){return p(err);}

        coll.insertOne({test: true, timestr: '2017 0505 0252am'}, function(err, back){
            p(back, err);
        });
    });
}


if(require.main == module){
    //cgetdb();
    //cvalcoll();
    cinsert();

    setTimeout(process.exit, 3000);
}
