var path = require('path');
var swig = require('swig');
var myconfig =   require("../config/config.js");


// Compile a file and store it, rendering it later
//var tpl = swig.compileFile('/path/to/template.html');
//console.log(tpl({ article: { title: 'Swig is fun!' }}));
swig.renderFile(path.join(myconfig.swig_views_folder_abs, 'gview.html'),
        {title : 'test',
         text  : 'haha \n haha'
        },
        function(err, text){
            console.log(text);
        });
//
// Immediately render a Swig template from a string
console.log(swig.render('{% if foo %}Hooray!{% endif %}', { locals: { foo: true }}));
