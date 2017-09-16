
const fs = require('fs');
const path = require('path');
const pug = require('pug');


function renderfile(filename, context, callback){
    //console.log(888, __dirname);

    // got a error of can not find file, make it absolute path.
    var apath = path.join(__dirname, filename);
    //console.log(888, apath);

    pug.renderFile(apath, context, callback);

    //fs.readFile(path.join(__dirname, filename), function(err, text){
    //    if(err) return callback(err);

    //    pug.
    //});
}
module.exports.render_file = renderfile;



var p = console.log;
if(require.main == module){
    renderfile('simple.pug', {title: 'oooo'}, function(err, text){
        p(text, err);
    });

    //setTimeout(process.exit, 3000);
}
