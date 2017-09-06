/*
 * Trying to move to hrouters
 * 2015 0925
 */

//var myuser = require('./myuser.js');
//var myfile = require('./myfile.js');

var formidable = require('formidable'),
    util = require('util');

var u = require('underscore');

//var passport = require('passport');
var bucket = require('./aws/bucket.js');
//var meta = require('./aws/meta.js');

var myutil = require('./myutils/myutil.js');

// logger
//var mylog = require('./mylog.js');
var fs = require('fs');

var myconfig =   require("../config/config.js");
var upload_dir = myconfig.formidable_upload_dir;

var path = require('path');
var mv = require('mv');

var cel = require('connect-ensure-login');

//var user_path = require('./myutils/upath.js');
var mytemplate = require('./myutils/template.js');

var folder_module     = require('./aws/folder-v5.js');
//var meta     = require('./aws/meta.js');

var myparse = require('./aws/parse.js');
//var winston = require('./myutils/wlog.js').winston;

var log28 = require('./myutils/mylogb.js').double_log('/tmp/log28');
var p     = console.log;


function myupload(app){




  // to replace 'upload', 'fupload', 2014 0530
  app.get(/\/upfile\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      //console.log("update upload ...");
      //console.log(req.user);

      var username = ''; 
      if (typeof req.user !== 'undefined') username = req.user.username;

      var cwd = req.params[0];

      var cwd_chain = myutil.path_chain(cwd, '/ls/');  // '/ls/' is start of the href

      var for_body  = { username : username, cwd : cwd, cwd_chain : cwd_chain, message : '', };
      var contexts = {
        body:for_body,
        header:{username:username}
      };
      var html_elements = {
        frame : 'upload-frame.html',
        header: "ls2header.html",
        body:'upfile-main.html',
        navbar: "ls2nav.html", // this is empty nav file.
        script:'upfile-script.html',
        css: 'empty.html'
      };

      mytemplate.assemble_html_v2(html_elements, contexts).then(function(html){
        res.send(html);
      });

  });


  app.post(/\/upfile\/(.*)/, 
      cel.ensureLoggedIn('/login'),
      function(req, res){
          // <!-- This COST me a lot time:  enctype="multipart/form-data"  --> 

          var username = req.user.username; 
          if (typeof username === 'undefined' || !username) username = 'anonymous';

          // cwd will not have 'username' prefix, NO, it can have?
          var cwd = req.params[0];
          if ( typeof cwd === 'undefined' || cwd === ''  ){ 
              //console.log("\n cwd RESET \n"); console.log(req.body); console.log(cwd);
              cwd = username;
          }

          //file_process(req, username, cwd);  // 'file-precess' doing nothing 0731
          parse_form(req, function(err, fields, files){
              if(err) log28('upload err', err);  //?
              // Currently, formidable (~1.0.15) puts files in form-name, and
              // it can be single file or an array

              // file might be array, or single file.
              myparse.accept_files(username, files, cwd, function(){});

          });

          res.redirect('/upfile/' + cwd);  // to self
          //res.redirect('/ls/' + cwd);
  });


  // lsb, bup is tring to use blueimp file uploader.
  app.get(/\/lsb\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res, next){
      var cwd = req.params[0];
      var cwd_chain = myutil.path_chain(cwd, '/ls/');  // '/ls/' is start of the href
      res.render('bb/index.html', {cwd:cwd, cwd_chain:cwd_chain});
    });


  // get will try to get file list. ref: 
  // D../softwares/jss/jQ...Upload/server/my-express/app.js, 0215, 2015.
  app.get(/\/bup\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res){
      //
      // return json {files: [....]}
      //

      // <!-- This COST me a lot time:  enctype="multipart/form-data"  --> 

      var username = req.user.username; 
      if (typeof username === 'undefined' || !username) username = 'anonymous';

      var cwd = req.params[0];
      if ( typeof cwd === 'undefined' || cwd === ''  ){ 
        //console.log("\n cwd RESET \n"); console.log(req.body); console.log(cwd);
        cwd = username;
      }

      folder_module.retrieve_folder(cwd).then( function(folder){
        if( !folder ) return res.json({});

        var files = folder.get_meta().files;

        var blueimp_file_list = [];
        blueimp_file_list = make_blueimp_file_list(files);

        //var cwd_chain = path_chain(cwd, '/list-msg/');  // '/list2/' is start of the href
        res.json({files: blueimp_file_list});

      });

  });


  // get post from blueimp client side.
  app.post(/\/bup\/(.*)/, 
    cel.ensureLoggedIn('/login'),
    function(req, res){
    // <!-- This COST me a lot time:  enctype="multipart/form-data"  --> 

    var username = req.user.username; 
    if (typeof username === 'undefined' || !username){
      p('what if not username? in post /bup');
      return res.redirect('/login');
      //username = 'anonymous';
    }

    // cwd will not have 'username' prefix, NO, it can have?
    var cwd = req.params[0];
    if ( typeof cwd === 'undefined' || cwd === ''  ){ 
      //console.log("\n cwd RESET \n"); console.log(req.body); console.log(cwd);
      cwd = username;
    }

    blue_parse(req, username, cwd, function(err, json){
      if(err) p('fuck "blue parse" gives (err, json):', err, json);
      p('post /bup is going to do: res.json, where it is {file: json}, json=', json);
      res.json({files: json});
    });
  });


  app.get(/\/del\/(.*)/,
    cel.ensureLoggedIn('/login'),
    function(req, res){

      var username = req.user.username; 
      if (typeof username === 'undefined' || !username) username = 'anonymous';

      // path_uuid will have 'username' prefix
      var path_uuid = req.params[0];
      if ( typeof path_uuid === 'undefined' || path_uuid === '' || path_uuid === username  ){ 
        return res.redirect('/ls/' + path.dirname(path_uuid));
      }

      folder_module.delete_path_uuid(path_uuid, function(){
        res.redirect('/ls/' + path.dirname(path_uuid));
      });

    });


  app.delete(/\/del\/(.*)/,
    cel.ensureLoggedIn('/login'),
    function(req, res){

      var username = req.user.username; 
      if (typeof username === 'undefined' || !username) username = 'anonymous';

      // path_uuid will have 'username' prefix
      var path_uuid = req.params[0];
      if ( typeof path_uuid === 'undefined' || path_uuid === '' || path_uuid === username  ){ 
        return res.json({files:[{anything: false}]}); //?any thing
      }

      folder_module.retrieve_file_by_path_uuid(path_uuid, function(err, file){
        if (err) return res.json({files:[{anything: false}]}); //?any thing
        var meta = file.get_meta();

        folder_module.delete_path_uuid(path_uuid, function(err){
          if (err) return res.json({files:[{anything: false}]}); //?any thing
          var o = {}; 
          o[meta.name] = true;
          res.json({'files':[o,]}); //required by blueimp?
        });
      });

    });
}

//function parse_upload(req){
//  // parse a file upload
//  var form = new formidable.IncomingForm();
//
//  form.on('fileBegin', function (name, file) {
//    //mylog.info("on fileBegin : " + name );
//    //mylog.info("name : " + util.inspect(name));
//    //mylog.info("file : " + util.inspect(file));
//  }).on('field', function (name, value) {
//    //mylog.info("on field"); // test
//    //mylog.info("name : " + util.inspect(name));
//    //mylog.info("value : " + util.inspect(value));
//    //if (name === 'redirect') {
//    //    redirect = value;
//    //}
//  }).on('file', function (name, file) {
//    //mylog.info("on file"); // test
//    //mylog.info("name : " + util.inspect(name));
//    //mylog.info(" -- file : " + util.inspect(file));
//  }).on('aborted', function () {
//    //mylog.info("on aborted");
//  }).on('error', function (e) {
//    mylog.info("on error");
//    mylog.info(e);
//  }).on('progress', function (bytesReceived, bytesExpected) {
//    //mylog.info("on progress");
//    //mylog.info( " [ " + bytesReceived + "/" + bytesExpected + " ]");
//  }).on('end', function(){
//    //console.log(" event: end ");
//  });
//
//  form.parse(req, function(err, fields, files) {
//    //mylog.info("\nform parse begin, show the form: \n");
//    //mylog.info( Date() );
//    //mylog.warn(util.inspect(form));
//
//    //console.log(files);
//    for (var f in files){
//      //console.log(files[f].name);
//      //console.log(files[f].path);
//      //
//
//      user_path.check_path_move_home(req.user.username, files[f]);
//      //console.log("myuser add file key,  -- parse file");
//     
//      //myuser.add_file_key(req.user.username, files[f]);
//
//      //console.log(" files[f]: ");  // use the square parenthe..
//      //console.log(files[f]);
//    }
//  });
//}


function parse_and_s3stream(req, cwd){
  // parse a file upload
  var form = new formidable.IncomingForm();

  form.on('fileBegin', function (name, file) {
    //console.log("on fileBegin : " + name );
    //console.log("name : " + util.inspect(name));
    //console.log("file : " + util.inspect(file));
  }).on('field', function (name, value) {
    //console.log("on field"); // test
    //console.log("name : " + util.inspect(name));
    //console.log("value : " + util.inspect(value));
    //if (name === 'redirect') {
    //    redirect = value;
    //}
  }).on('file', function (name, file) {
    //console.log("on file"); // test
    //console.log("name : " + util.inspect(name));
    //console.log(" -- file : " + util.inspect(file));
  }).on('aborted', function () {
    //console.log("on aborted");
  }).on('error', function (e) {
    //console.log("on error");
    //console.log(e);
  }).on('progress', function (bytesReceived, bytesExpected) {
    //console.log("on progress");
    //console.log( " [ " + bytesReceived + "/" + bytesExpected + " ]");
  }).on('end', function(){
    //console.log("--  event: end ");
  });

  //console.log('\n -- here 2\n');
  //console.log(cwd);
  form.parse(req, function(err, fields, files) {
    //console.log("\n -- form parse begin, show the form: \n");
    //console.log("\nform parse begin, show the form: \n");
    //console.log( Date() );
    //mylog.warn(util.inspect(form));

    //console.log(files);
    for (var f in files){
      //console.log(files[f].name);
      //console.log(files[f].path);
      //

      //console.log("\n -- ready to put file: file[f], show the file: \n");
      //console.log(files[f]);
      bucket.put_file(files[f], cwd);
      // file_type_hook(file_obj);
      bucket.process_image_by_ext(files[f], function(err, out_file_info){
        console.log('image process callback, out_file_info\n');
        console.log(out_file_info);  // wrong!!
        var thumb_folder = path.join(cwd, '/.thumbnails/');
        console.log('thumb_folder: ', thumb_folder);
        bucket.folder_exists( thumb_folder, function(exists){
          if (exists){ 
            bucket.put_file(out_file_info, thumb_folder);
          }else{
            console.log('folder not exists');
            bucket.make_thumbnail_folder(thumb_folder, function(err){
              console.log(out_file_info, thumb_folder);
              bucket.put_file(out_file_info, thumb_folder);
            });
          }
        });

      });

      //console.log(" files[f]: ");  // use the square parenthe..
      //console.log(files[f]);
    }
  });
}


// used in the current, Feb.14, 2015.
function parse_form(req, callback){
  // parse a file upload
  var form = new formidable.IncomingForm();
  form.multiples = true;

  //console.log('\n -- here 2\n');
  //console.log(cwd);
  form.parse(req, function(err, fields, files_things) {
    p('"parse form" in upload.js , parsed ..', files_things);

    var files;
    if (files_things['files[]']){
      files = files_things['files[]'];
    }else{
      files = files_things.ofiles;
    }

    callback(err, fields, files);
  });
}


// to be used in post come from blueimp client side.
function blue_parse(req, username, cwd, callback){
  
    blue_post_form(req, username, cwd, callback);
    //d:
    //parse_form(req, function(err, fields, files){
    //    myparse.accept_files(username, files, cwd, function(err, metas){
    //      if(err) return callback(err, metas);
    //      p ('blue parse, accept files. metas \n', metas);
    //      var attr = select_attributes_for_blueimp(metas);

    //      callback(null, attr);
    //    });
    //});
}



function make_blueimp_file_list(files){
  // @files : the list of files, same as in folder.files

  var blueimp_file_list = [];
  var uuids = u.keys(files);

  uuids.forEach(function(id){
    var file = files[id];
    var info = select_attributes_for_blueimp(file);

    blueimp_file_list.push(info);
  });

  return blueimp_file_list;
}

function select_attributes_for_blueimp(file){
  // @file : object of file information, all data.
    var info = {
      name :  file.name,
      size : file.size,
      url  : file.s3_stream_href,
      deleteType : 'DELETE',
      deleteUrl  : file.delete_href,
      //thumbnailUrl : '' 
    };

    // for thumbnail:
    if(file.thumb && file.thumb.defaults && 
      file.html && file.html.elements && file.html.elements["thumb-src"]){
      info.thumbnailUrl = file.html.element["thumb-src"];
    }else if(file.what === myconfig.IamFile){
      info.thumbnailUrl = "/static/img/file8080.jpg";
    }else if(file.what === myconfig.IamFolder){
      info.thumbnailUrl = "/static/img/folder8080.jpg";
    }

    return info;
}


function file_process(req, username, cwd){
  parse_form(req, function(err, fields, files){
    myparse.handin(req, username, cwd, files);
  });
}


function _calculate_current_dir(req){
  // calculate current directory:
  var current_dir = '';
  if(req.user.username){
    current_dir = req.user.username;
  }
  var fid = req.params.folderid;
  if(typeof fid !== 'undefined' && fid){
    current_dir = path.join(current_dir, req.params.folderid);
  }
  //console.log('current_dir');
  //console.log(current_dir);
  return current_dir;
}


exports.myupload = myupload;

// vim: set et ts=2 sw=2 fdm=indent:


// hacking these codes
var minFileSize = 1;
var maxFileSize = 3 * 1000 * 1000 * 1000;  // ~3G?
var maxPostSize = maxFileSize;
var acceptFileTypes = /.+/;
var tmpDir = '/tmp';

function blue_post_form(req, username, cwd, callback) {
  //var handler = this,
  var tmpFiles = [],
      files = [],
      map = {},
      counter = 1,
      redirect;

  var job_number = 0;
  var finish = function () {
    job_number -= 1;
    if (!job_number) {
      p ('finish and callback in "blue post form"');
      callback(null, files);
    }

  };

  var form = new formidable.IncomingForm();
  form.multiples = true;
  form.uploadDir = tmpDir;

  form.on('fileBegin', function (name, file) {
    //p ('on fileBegin: file: \n', file);
    //d?:
    tmpFiles.push(file.path);
    job_number += 1;

    //var fileInfo = new FileInfo(file, handler.req, true);
    var fileInfo = new FileInfo(file, req, true);
    fileInfo.safeName();
    map[path.basename(file.path)] = fileInfo;
    //files.push(fileInfo);
  }).on('field', function (name, value) {
    if (name === 'redirect') {
      redirect = value;
    }
  }).on('file', function (name, file) {
    p ('on file:\n', file);

    var fileInfo = map[path.basename(file.path)];
    fileInfo.size = file.size;
    if (!fileInfo.validate()) {
      fs.unlink(file.path);
      return;
    }
    myparse.accept_file(username, file, cwd, function(err, meta){
      //p('got a meta, after "accept file":\n', meta);
      var info = select_attributes_for_blueimp(meta);
      files.push(info);
      finish();
      //job_number -= 1;
      //p('pushed a file info:\n', info);
    });  //?ww
    //fs.renameSync(file.path, options.uploadDir + '/' + fileInfo.name);
    //if (options.imageTypes.test(fileInfo.name)) {
    //  p ('we got image: ' + fileInfo.name);
    //  Object.keys(options.imageVersions).forEach(function (version) {
    //    counter += 1;
    //    var opts = options.imageVersions[version];
    //    imageMagick.resize({
    //      width: opts.width,
    //      height: opts.height,
    //      srcPath: options.uploadDir + '/' + fileInfo.name,
    //      dstPath: options.uploadDir + '/' + version + '/' + fileInfo.name
    //    }, finish);
    //  });
    //}
  }).on('aborted', function () {
    tmpFiles.forEach(function (file) {
      fs.unlink(file);
    });
  }).on('error', function (e) {
    console.log(e);
  }).on('progress', function (bytesReceived) {
    if (bytesReceived > maxPostSize) {
      //handler.req.connection.destroy();
      req.connection.destroy();
    }
  //}).on('end', finish).parse(handler.req);
  }).on('end', function(){p('on end');}).parse(req);
}

var FileInfo = function (file) {
  this.name = file.name;
  this.size = file.size;
  this.type = file.type;
  this.deleteType = 'DELETE';
};

FileInfo.prototype.validate = function () {
    if (minFileSize && minFileSize > this.size) {
        this.error = 'File is too small';
    } else if (maxFileSize && maxFileSize < this.size) {
        this.error = 'File is too big';
    } else if (!acceptFileTypes.test(this.name)) {
        this.error = 'Filetype not allowed';
    }
    return !this.error;
};

FileInfo.prototype.safeName = function () {
    // Prevent directory traversal and creating hidden system files:
    this.name = path.basename(this.name).replace(/^\.+/, '');
    // Prevent overwriting existing files:
    //while (_existsSync(options.uploadDir + '/' + this.name)) {
    //while (fs.existsSync(options.uploadDir + '/' + this.name)) {
    //    this.name = this.name.replace(nameCountRegexp, nameCountFunc);
    //}
};

// no need
//FileInfo.prototype.initUrls = function (req) {
//    if (!this.error) {
//        var that = this;
//        var baseUrl =  'http:' + '//' ;
//        if (req.headers) {
//          baseUrl += req.headers.host + options.uploadUrl;
//        }else{
//          baseUrl += 'localhost:' + myport.toString() + options.uploadUrl;
//        }
//        this.url = this.deleteUrl = baseUrl + encodeURIComponent(this.name);
//        Object.keys(options.imageVersions).forEach(function (version) {
//            //if (_existsSync(
//            if (fs.existsSync( options.uploadDir + '/' + version + '/' + that.name)) {
//                that[version + 'Url'] = baseUrl + version + '/' + encodeURIComponent(that.name);
//            }
//        });
//    }
//};






