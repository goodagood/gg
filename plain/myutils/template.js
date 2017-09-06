/* 
 * Tools to do template renderring.
 *
 * Use underscore.js to render template file to string, and mix string to big
 * HTML.
 *
 * Nearly all template engine expose limits and syntaxes, all get it quirks.
 *
 * To save to be stupid.  What I need is: templates can has basics: HTML
 * settings, most scripts and css used by all.  Then, parts can be done and
 * assembled to make a whole page. 
 *
 * I used handlebars.js with express.js before, but, it easy to give each
 * template a file.  They repeat a lot.  
 *
 * I want basic can be done once for all, no repeating style.
 *
 */

var u = require('underscore');
var path = require('path');
var fs = require('fs');
var Promise = require("bluebird");

var myconfig =   require("../config/config.js");

// Get the folder name, (absolute path), where underscore template files in.
var _u_template_dir_name = myconfig.underscore_template_path;
// the dir for underscore templates is in parent dir.
var _parent_folder = path.dirname(__dirname);
var template_folder = path.join(_parent_folder, _u_template_dir_name);

var p = console.log;

//var mylog = require('./mylogb.js')('/tmp/log28');

function render_file_to_string(filename, context, callback){
  // 
  // @filename: file name, don't miss extension.
  //              contain no 'root' of template files, for example:
  //              template-file.html
  //              some/path/to/template/folder will be set by configuration.
  // 

  var file_path = path.join(template_folder, filename);
  fs.readFile(file_path, {encoding:'utf-8'}, function(err, string){

    if (err){ callback(err, null); return; }

    try{
      var temp = u.template(string);
      var result = temp(context);
    }catch (err){
      return callback(err, null);
    }
    callback(null, result);
    //console.log(result);
  });
}

var promise_to_render_file_to_string = Promise.promisify(render_file_to_string);


/*
 * Sync version of render_file_to_string.
 */
function render_file_to_string_sync(filename, context, callback){
  var content_string = fs.readFileSync(
      path.join(template_folder, filename),
      {encoding:'utf-8'});
  //console.log(string);
  var temp = u.template(content_string);
  var result = temp(context);
  return result;
}


function test_render_file_to_string(){
  var context = {
    no_escaped : '<p> no escaped </p>',
    escaped    : '<p> suppose to be escaped </p>',
    something  : '<p> suppose to be escaped </p>',
    aa : 'this is aa',
    bb : 'this is bb',
  };
  render_file_to_string('test-a.html', context, function(err, string){
    console.log(string);
  });
  //render_file_to_string('test-a.html', {aa:111, bb:22});
}


function assemble(context, callback){
  var defaults = {
    title : "",
    header : "",
    navbar : "",
    body : "",
    footer : "",
  }
  //context = u.defaults(context, defaults);
  context = u.extend(defaults, context );
  render_file_to_string('basic.html', context, function(err, string){
    callback(err, string);
  });
}


function test_assemble(){
  var context = {title: 'this is tiel'};
  assemble(context, function(err, string){
    console.log(string);
  });
}


function navbar(context, callback){
  var defaults = {
    cwd : "",
  }
  context = u.defaults(context, defaults);
  render_file_to_string('navbar-a.html', context, function(err, string){
    callback(err, string);
  });
}


function test_navbar(){
  //var context = {cwd: 'cwd/what'};
  var context = {};
  navbar(context, function(err, string){
    console.log(string);
  });
}

function assemble_html(html_elements, contexts, callback){
  // @callback get html
  // make default contexts
  u.defaults(contexts, {
    css    : {},
    header : {},
    navbar : {},
    body   : {},
    script : {},
    footer : {},
    frame  : {},
  });

  // make default template files
  u.defaults(html_elements, {
    body   : 'file-list.html',
    header : 'goodheader.html',
    navbar : 'people-file-navtabs.html',
    script : 'file-list-script.html',
    footer : 'footer.html',
    frame  : 'frame-a.html',
  });

  render_file_to_string( html_elements.body, contexts.body, function(err, body){
    render_file_to_string( html_elements.header, contexts.header, function(err, header){
      render_file_to_string( html_elements.navbar, contexts.navbar, function(err, navbar){
        render_file_to_string( html_elements.script, contexts.script, function(err, script){

            render_file_to_string( html_elements.footer, contexts.footer, function(err, footer){

              var context_final = u.defaults(contexts.frame, 
                {
                  body:body, 
                  //css : '<link rel="stylesheet" href="/static/css/first.css">',
                  header:header,
                  navbar:navbar, 
                  footer:footer,
                  script:script, });

              render_file_to_string(html_elements.frame, context_final, function(err, html){
                callback(html);
              });

            });

        });
      });
    });
  });

}

// put it with promise:
function assemble_html_v1(html_elements, contexts, callback){
  // This return a promise.
  // make default contexts
  u.defaults(contexts, {
    css    : {},
    header : {},
    navbar : {},
    body   : {},
    script : {},
    footer : {},
    frame  : {}, //put an in-html css in frame, the css is string, 11-19
  });

  // make default template files
  u.defaults(html_elements, {
    body   : 'file-list.html',
    header : 'goodheader.html',
    navbar : 'people-file-navtabs.html',
    script : 'file-list-script.html',
    footer : 'footer.html',
    frame  : 'frame-a.html',
  });

  var tmp = {};
  return promise_to_render_file_to_string(html_elements.body, contexts.body).then(
    function(body){ tmp.body = body; }
  ).then(
    function(){
      promise_to_render_file_to_string(html_elements.header, contexts.header).then(
        function(header){ tmp.header = header; }
      );
    }
  ).then(
    function(){
      promise_to_render_file_to_string(html_elements.navbar, contexts.navbar).then(
        function(navbar){ tmp.navbar = navbar; }
      );
    }
  ).then(
    function(){
      promise_to_render_file_to_string(html_elements.script, contexts.script).then(
        function(script){ tmp.script = script; }
      );
    }
  ).then(
    function(){
      promise_to_render_file_to_string(html_elements.footer, contexts.footer).then(
        function(footer){ tmp.footer = footer; }
      );
    }
  ).then(
    function(){
      var context_final = u.defaults(
        contexts.frame,
        {
          body  : tmp.body, 
          header: tmp.header,
          navbar: tmp.navbar, 
          footer: tmp.footer,
          script: tmp.script, 
        });

      return promise_to_render_file_to_string(html_elements.frame, context_final);

    }
  );
}


// add css_file based on v1
function assemble_html_v2(html_files, contexts, callback){
  // This return a promise.
  // make default contexts
  u.defaults(contexts, {
    header : {},
    css    : {},
    script : {},
    navbar : {},
    body   : {},
    footer : {},
    frame  : {}, //put an in-html css in frame, the css is string, 11-19
  });

  // make default template files
  u.defaults(html_files, {
    header : 'goodheader.html',
    css    : 'default-css.html',         // The file contains css links.
    script : 'file-list-script.html',
    navbar : 'people-file-navtabs.html',
    body   : 'default-body.html',
    footer : 'footer.html',
    frame  : 'frame-a.html',
  });

  var tmp = {};
  return promise_to_render_file_to_string(html_files.body, contexts.body).then(
    function(body){ tmp.body = body; }
  ).then(function(){
    // adding client side template, it's _ template too
    return promise_to_add_client_template(html_files, contexts);
  }).then(function(){
    //p ('template:\n', contexts.frame);
    return promise_to_render_file_to_string(html_files.header, contexts.header);
  }).then(function(header){
    tmp.header = header;
  }).then(function(){
    return promise_to_render_file_to_string(html_files.navbar, contexts.navbar);
  }).then( function(navbar){
    tmp.navbar = navbar;
  }).then(function(){
    return promise_to_render_file_to_string(html_files.css, contexts.css);
  }).then(function(css){
    tmp.css = css;
  }).then(function(){
    return promise_to_render_file_to_string(html_files.script, contexts.script);
  }).then(function(script){
    tmp.script = script;
    //console.log('the script:\n', tmp.script);
  }).then(function(){
    return promise_to_render_file_to_string(html_files.footer, contexts.footer);
  }).then(function(footer){
    tmp.footer = footer;
  }).then(function(){
      var context_final = u.defaults(
        contexts.frame,
        {
          body  : tmp.body, 
          header: tmp.header,
          navbar: tmp.navbar, 
          footer: tmp.footer,
          css   : tmp.css,
          script: tmp.script
        });

      //console.log ('cont finan\n', context_final);
      return promise_to_render_file_to_string(html_files.frame, context_final);

  });
}

function add_client_template(html_files, contexts, callback){
  if(! u.has(html_files, 'template') ||  u.isEmpty(html_files.template)){
    return callback(null, null);
  }

  var file_name = html_files.template;

  var file_path = path.join(template_folder, file_name);
  fs.readFile(file_path, {encoding:'utf-8'}, function(err, string){

    if (err){
      return callback(err, null);
    }

    contexts.frame['template'] = string;
    callback(null, contexts);
    //console.log(result);
  });

}

var promise_to_add_client_template = Promise.promisify(add_client_template);


module.exports.render_file_to_string = render_file_to_string;
module.exports.navbar = navbar;
module.exports.assemble = assemble;
module.exports.assemble_html = assemble_html;
module.exports.assemble_html_v1 = assemble_html_v1; // then bug
module.exports.assemble_html_v2 = assemble_html_v2;


if (require.main === module){
  //console.log(template_folder);
  //console.log(__dirname);
  //console.log(__filename);

  //test_render_file_to_string();
  //test_assemble();
  test_navbar();
}

// vim: set et ts=2 sw=2 fdm=indent:
