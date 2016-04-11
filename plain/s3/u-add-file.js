
var adder = require('./add-file.js');

var folder = require("./folder.js");


const Targets = ['t0310y6',];
const p = console.log;



function c_loc_file(loc_file){
    loc_file = loc_file || '/tmp/manip';
    var target_folder_path = Targets[0];

    adder.add_local_file(loc_file, target_folder_path, function(err, alf_rep){
        p(err, alf_rep);
        setTimeout(process.exit, 2000);
    });
}


function c_loc_info(loc_file){
    loc_file = loc_file || '/tmp/manip';

    adder.loc_file_info(loc_file, function(err, what){
        p(err, what);
        setTimeout(process.exit, 2000);
    });
}


if(require.main === module){
    //c_retrieve_folder_meta();
    c_loc_file('/tmp/manbash');
    //c_loc_info('/tmp/manip');
}


