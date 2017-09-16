
var path = require('path');
var fs   = require('fs');

var secret = require("./secret-dir.js");

const Name_Password_File = "sample-name-password.json"



const Full_Path = path.join(secret.locations.credential_dir, Name_Password_File);


function get_sample_username_password(callback){
    fs.readFile(Full_Path, 'utf-8', function(err, str){
        if(err) return callback(err);

        try{
            var j = JSON.parse(str);
            callback(null, j);
        }catch(E){
            callback(E);
        }
    });
}
module.exports.get_sample_username_password = get_sample_username_password;



if(require.main === module){
    var p = console.log;

    function chk_get_password(){
        get_sample_username_password(function(err, what){
            p(err, what);
        });
    }

    chk_get_password();
    p("\n");
    
}
