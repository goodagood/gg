
var marked = require('marked');
var color  = require('highlight.js');
var fs     = require('fs');


var a = marked(' __o__, *hi*, some one.')
//console.log(a);

marked.setOptions({
    highlight : function(code){
        return color.highlightAuto(code).value;
    }
});

fs.readFile('/tmp/hl.md', function(err, mdbuff){
    console.log (typeof mdbuff);
    //console.log (mdbuff.toString());
    if(err) return console.log('err:\n', err);
    var str = mdbuff.toString();
    var md = marked(str);
    console.log(md);
    fs.writeFile('/tmp/hl.html', md, function(){});
});
