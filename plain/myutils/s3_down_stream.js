var path = require('path');

var AWS = require('aws-sdk');  //?
var mime = require("mime")

var swig= require('swig');  //?
swig.setDefaults({cache:false});  //?

var folder_module = require("../aws/folder-v5.js");


/**
 * Export the following environment variables:
 *
 * export AWS_ACCESS_KEY_ID='AKID'
 * export AWS_SECRET_ACCESS_KEY='SECRET'
 */

// Set region for future requests.
var myconfig =   require("../config/config.js");
AWS.config.region = myconfig.region;

var secrets  =  require("../config/secret-dir.js");
var aws_conf =  secrets.conf.aws;


var request = require("request");
//var url     = require("url");
var u       = require("underscore");


// refactor the following:
var myuser = require('../myuser.js');
var myfile = require('../myfile.js');

var myutil = require('../myutils/myutil.js');

var cel = require('connect-ensure-login');

var myconfig =   require("../config/config.js");
var bucket = require('../aws/bucket.js');

var s3folder = require('../aws/folder.js');
// upgraded folder module:
var fm_v5    = require('../aws/folder-v5.js');

var log28  = require('./mylogb.js').double_log('/tmp/log28');
var p = console.log;


// 2016 04
var asker = require("plain/asker/tasks.js");



function s3_down_stream(app){


  // Made tmp fix, 12 27.  Using path_uuid
  // Changed after python, using file path. 2016 0414
  //
  app.get(/^\/viewtxt\/(.*)/, function(req, res, next){
    var file_path = req.params[0];
    console.log("In get 'viewtxt', ", file_path );

    var username;
    if(req.user){
      if(req.user.username) username = req.user.username;
    }

    asker.file_text(username, file_path, function(err, txt){
        if(err) return res.end('err, got no text?');
        if(!txt) return res.end('not text?');
        res.render('viewtxt.html', { text : txt , });
    });
  });


  // param is full file path, 2016 0414
  var keys = require("plain/s3/s3keys.js");
  app.get(/^\/dl\/(.+)/, 
    //cel.ensureLoggedIn('/login'),
    function(req, res){

      //console.log(req.params[0]);

      var _path = req.params[0];
      keys.make_file_s3key(_path, function(err, key){
        if (err)  res.end("<h1>make file s3key error.</h1>");
        if (!key) res.end("<h1>File name error.</h1>");
        res.attachment(path.basename(key));
        _s3_file_read_stream(key).pipe(res);
      });

  });

  app.get(/^\/get\/(.+)/, 
    //cel.ensureLoggedIn('/login'),
    function(req, res){
      //console.log(req.params[0]);
      var file_path = req.params[0];

      var username;
      if(req.user){
        if(req.user.username) username = req.user.username;
      }

      asker.file_meta(username, file_path, function(err, meta){
        if (err)  res.end("<h1>get. ask file meta error.</h1>");
        if (!meta) res.end("<h1>get. no File meta.</h1>");

        headers = {server: 'goodagood/goodogood server'};
        headers['Content-Type'] = meta.type || mime.lookup(meta.path);
        res.writeHead(200, headers);

        _s3_file_read_stream(meta.s3key).pipe(res);
      });
  });


  //// this make a 'tmp' file but not in /tmp
  //app.get(/^\/tmp-thumb\/(\d+)\/(\d+)\/(.+)/, 
  //  //cel.ensureLoggedIn('/login'),
  //  function(req, res, next){
  //    console.log(req.params);
  //    var width  = req.params[0];
  //    var height = req.params[1];
  //    var file_path = req.params[2];

  //    var username;
  //    if(req.user){
  //      if(req.user.username) username = req.user.username;
  //    }

  //    width  = parseInt(width);
  //    height = parseInt(height);

  //    asker.tmp_thumb(username, file_path, width, height, function(err, href){
  //      if (err)  return next(err);
  //      if (!href) return next(err);

  //      res.redirect(href);
  //    });
  //});


  // show img in /tmp glob can be used, for easy development. 2016 0423
  var tmp_img_srv = require("./tmp-img-srv.js");
  app.get(/^\/show-tmp-img\/(.+)/, 
      function(req, res, next){
        console.log(req.params);
        var file_name = req.params[0];

        tmp_img_srv.stream(file_name, req, res, next);
        //res.end('<h1>' + file_name + '</h1>');
  });


  // param is s3key
  app.get(/^\/s3key\/(.+)/, 
    //cel.ensureLoggedIn('/login'),
    function(req, res){

      var key = req.params[0];
      if (!key) return next("<h1>s3key must be offerred, error.");

      headers = {server: 'goodagood/goodogood server'};
      headers['Content-Type'] = mime.lookup(key);
      res.writeHead(200, headers);
      //res.attachment(path.basename(key));

      bucket.s3_object_read_stream(key).pipe(res);
  });


  // old before 2016 0419

  // param is s3key
  app.get(/^\/ss\/(.+)/, 
    //cel.ensureLoggedIn('/login'),
    function(req, res){

      //console.log("url for tryss regex");
      //console.log(req.url);
      //console.log(req.params[0]);

      var key = req.params[0];
      if (!key) res.end("<h1>File name error.</h1>");
      res.attachment(path.basename(key));
      bucket.s3_object_read_stream(key).pipe(res);
  });

  /*
   * param is path uuid
   * This will use file object to give a better streaming, it add complexity.
   * 2015, 0519
   */
  app.get(/^\/ss519\/(.+)/, 
    function(req, res){
      var path_uuid = req.params[0];
      if (!path_uuid) res.end("<h1>File name error, please give file path uuid.</h1>");

      folder_module.retrieve_file_by_path_uuid(path_uuid, function(err, file){
        //console.log('ss519, ', err, typeof file);
        if(err){return res.end("<h1>Err to retrieve, with file path uuid: "+ path_uuid +"</h1>");}

        var meta = file.get_meta();
        res.attachment(meta.name);
        file.read_stream().pipe(res);
      });
  });


  /*
   * try to serve a few file types, such as image, video?, html
   * 2015, 0529
   */
  app.get(/^\/direct-serve\/(.+)/, 
    function(req, res){
      var path_uuid = req.params[0];
      if (!path_uuid) res.end("<h1>File name error, please give file path uuid.</h1>");

      folder_module.retrieve_file_by_path_uuid(path_uuid, function(err, file){
        //console.log('ss519, ', err, typeof file);
        if(err){return res.end("<h1>Err to retrieve, with file path uuid: "+ path_uuid +"</h1>");}

        var meta = file.get_meta();
        //if(meta.type) res.writeHead(200, {'Content-Type': meta.type });

        p('meta type: ', meta.type);
        if(meta.type) res.set('Content-Type', meta.type );
        res.attachment(meta.name);
        file.read_file_to_buffer(function(err, buf){
          if(err){return res.end("<h1>Err to read file buf, with file path uuid: "+ path_uuid +"</h1>");}
          p('going to send buf, binary');
          //res.send('oooo', 'binary');
          //res.send(buf, 'binary');
          res.send(buf);
        });
        //file.read_stream().pipe(res);
      });
  });


  app.get(/^\/html\/(.+)/, 
    function(req, res){
      var path_uuid = req.params[0];
      if (!path_uuid) res.end("<h1>File name error, please give file path uuid.</h1>");

      folder_module.retrieve_file_by_path_uuid(path_uuid, function(err, file){
        //console.log('ss519, ', err, typeof file);
        if(err){return res.end("<h1>Err to retrieve, with file path uuid: "+ path_uuid +"</h1>");}

        var meta = file.get_meta();
        //if(meta.type) res.writeHead(200, {'Content-Type': meta.type });

        p('meta type: ', meta.type);
        //if(meta.type) res.set('Content-Type', meta.type );
        //res.attachment(meta.name);
        file.read_to_string(function(err, str){
          if(err){return res.end("<h1>Err to read file str, with file path uuid: "+ path_uuid +"</h1>");}
          p('going to send str, binary');
          //res.send('oooo', 'binary');
          //res.send(str, 'binary');
          res.send(str);
        });
        //file.read_stream().pipe(res);
      });
  });

  // same as direct-serve but use file name with full path, 0602
  // currently, it works as download.
  app.get(/^\/file-full-path\/(.+)/, 
    function(req, res){
      var full_path = req.params[0];
      if (!full_path) res.end("<h1>File name error, please give file path uuid.</h1>");

      folder_module.retrieve_first_file_obj(full_path, function(err, file){
        //console.log('ss519, ', err, typeof file);
        if(err){return res.end("<h1>Err to retrieve, with file path path: "+ full_path +"</h1>");}

        var meta = file.get_meta();
        //if(meta.type) res.writeHead(200, {'Content-Type': meta.type });

        p('meta type: ', meta.type);
        if(meta.type) res.set('Content-Type', meta.type );
        res.attachment(meta.name);
        file.read_file_to_buffer(function(err, buf){
          if(err){return res.end("<h1>Err to read file buf, with file path uuid: "+ full_path +"</h1>");}
          p('going to send buf, binary');
          //res.send('oooo', 'binary');
          //res.send(buf, 'binary');
          res.send(buf);
        });
        //file.read_stream().pipe(res);
      });
  });

  app.get(/^\/ssrkey\/(.+)/, 
    //cel.ensureLoggedIn('/login'),
    function(req, res){

      //console.log("url for tryss regex");
      //console.log(req.url);
      //console.log(req.params[0]);

      var redis_file_key = req.params[0];
      if (!redis_file_key) res.send("<h1>File name error.</h1>");

      myfile.get_file_info(redis_file_key, function(err, file_info_obj){
        var key = _check_s3_file_key(file_info_obj);
        res.attachment(path.basename(key));
        _s3_file_read_stream(key).pipe(res);
      });


      //res.render('trylist', 
      //  {user: req.user, 
      //    date:new Date().toString(), 
      //    message: req.flash('error') });
  });

  // testing 2014, 0725, redo, 2015 0601
  var chain = require("../cwd-chain/cwd-chain.js");
  app.get(/^\/acarousel\/(.*)/,
      function(req, res, next){
        var folder_path = req.params[0];

        fm_v5.retrieve_folder(folder_path).then(function(the_folder){

          var image_list = the_folder.build_blueimp_pic_gallery_list();
          var list_str = image_list.join("\n");

          chain.make_cwd_chain(folder_path, function(err, chain_tag){
            res.render('acarousel.html', { 
              cwd_chain : chain_tag,
              image_list : list_str,
            });
          });
        }).catch(function(err){
          if(!the_folder) {return res.end('get acarousel found no folder');}
        });
      });


  // gallery shows
  app.get(/^\/piccarousel\/(.*)/,
      function(req, res, next){
        var aa = 'wow';
        res.render('carousel-a.html', 
          { 
            varaa : aa,
          });
      });

  // gallery shows
  app.get(/^\/gallery\/(.*)/,
      function(req, res, next){
        var cwd = req.params[0];
        var aa = 'wow';
        bucket.build_gallery_list(cwd, function(err, the_links){
          res.render('gallery-a.html', 
            { 
              varaa : aa,
            image_links:the_links,
            });
        });
      });



  var mytemplate = require("./template.js");
  // seperate for markdown file, try styles. 01 24
  app.get(/^\/viewmd\/(.*)/, function(req, res, next){
    var path_uuid = req.params[0];
    console.log("In get 'viewmd', markdown, ", path_uuid );
    var dir       = path.dirname(path_uuid);
    fm_v5.retrieve_file_by_path_uuid(path_uuid, function(err, file_obj){
      if(err) return res.send('err 1, in get "/viewmd/" ' + path_uuid);
      var get_content = file_obj.read_to_string;
      if(typeof file_obj.render_file_content === 'function'){
        get_content = file_obj.render_file_content;
      }
      get_content(function(err, txt){
        //console.log('get file obj in view text', file_obj.get_meta());
        //console.log('--  text', txt);
        if(!txt) return res.end('not text?');
        var context = {
          text : txt,
        };
        mytemplate.render_file_to_string('view-md.html', context, function(err, html){
          res.send(html);
        });
      });

    });
  });


  app.get(/^\/gview\/(.*)/, function(req, res, next){
    // try to do a general view.  0825

    var path_uuid = req.params[0];
    if(!path_uuid) return res.send('what you give gvimew');
    fm_v5.retrieve_file_by_path_uuid(path_uuid, function(err, file_obj){
      if(err) return res.send('err 1, in get "/viewtxt/" ' + path_uuid);
      file_obj.read_to_string(function(err, txt){
        //log28('get file obj in view text', file_obj.get_meta());
        //log28('--  text', txt);
        if(!txt) txt = "no text read from the file.";
        var cwd_chain = myutil.path_chain(path.dirname(path_uuid), '/ls');
        var file_name = path.basename(path_uuid); // this is uuid now.

        swig.renderFile(path.join(myconfig.swig_views_folder_abs, 'gview.html'),
          {title : 'goodagood, general viewer',
            text  : txt,
            cwd_chain : cwd_chain,
            file_name : file_name,
          },
          function(err, html){
            //console.log('0122 2:59 gview, err, html:\n', err, html);
            res.send(html);
          });

        //res.render('viewtxt.html', { text : txt , });
      });

    });
  });



  // changed to path uuid style, 2015, 0528
  app.get(/^\/viewpic\/(.*)/, function(req, res, next){
    var path_uuid = req.params[0];
    fm_v5.retrieve_file_meta_pu(path_uuid, function(err, meta){
      var s3key = meta.storage.key;
      var img_src = path.join('/ss/', s3key);

      console.log(img_src);
      res.render('viewpic.html', 
        { 
        image_src : img_src ,
        });
    });
  });


  app.get(/^\/viewvid\/(.*)/, function(req, res, next){
    // file_path is actually changed to path_uuid, 0206
    var file_path = req.params[0];
    //s3folder.retrieve_file_meta(file_path, function(meta)
    fm_v5.retrieve_file_meta_pu(file_path, function(err, meta){
      var s3key = meta.storage.key;
      var vid_src = path.join('/ss/', s3key);
      console.log(vid_src);
      res.render('playvid.html', 
        { 
        video_src : vid_src ,
        });
    });
  });

  // testing video player, 2015 8015
  app.get(/^\/vid2\/(.*)/, function(req, res, next){
    var rvp = require("../video/render-video-player.js");

    var file_path_uuid = req.params[0];
    rvp.render_video_page_pu(file_path_uuid, function(err, html){
      if(err) return res.end(html);

      return res.end(html);
    });
  });


  // use file path as parameter, not uuid, 2015 8018
  app.get(/^\/vid3\/(.*)/, function(req, res, next){
    var rvp = require("../video/render-video-player.js");

    var file_path = req.params[0];
    rvp.render_video_page(file_path, function(err, html){
      if(err) return res.end(html);

      return res.end(html);
    });
  });


  app.get(/^\/playaudio\/(.*)/, function(req, res, next){
    // file_path is actually changed to path_uuid, 0205
    var file_path = req.params[0];
    fm_v5.retrieve_file_meta_pu(file_path, function(err, meta){
      var s3key = meta.storage.key;
      var audio_src = path.join('/ss/', s3key);
      var audio_file_name  = meta.name;
      console.log(meta);
      console.log(audio_src);
      res.render('playaudio.html', 
        { 
        audio_src : audio_src ,
        audio_file_name  : audio_file_name,
        });
    });
  });

  // totest, to be not used after  0528
  // the url parameter is redis file key
  app.get(/^\/checkgfile\/(.+)/, 
    //cel.ensureLoggedIn('/login'),
    function(req, res, next){

      console.log("url for checkgfile regex");
      console.log(req.url);
      console.log(req.params[0]);

      var redis_file_key = req.params[0];
      if (!redis_file_key) res.send("<h1>File name error.</h1>");

      myfile.get_file_info(redis_file_key, function(err, file_info_obj){
        // todo
        // check if it's folder, and list contents for the folder
        //
        if (typeof file_info_obj['isFolder'] !== 'undefined' && file_info_obj['isFolder']){
          // list the folder
          res.redirect('/folder/' + file_info_obj['redis_file_key']);
          next();
        }

        // attache the download stream
        var key = _check_s3_file_key(file_info_obj);
        res.attachment(path.basename(key));
        _s3_file_read_stream(key).pipe(res);
      });

  });



  app.get("/i-want-read", function(req, res, next){
    var href = req.query.url;
    if(!href) return res.end("<h1>err: no href</h1>");

    var reg = /^http/i;
    if(! reg.test(href)) href = 'http://' + href;

    request(href).pipe(res);
  });


  var ucp = require("../ucp/ucp0219y6.js");
  app.get(/tec-doc\/(.+)/, function(req, res, next){
    var href = req.params[0];
    if(!href) return res.end("<h1>err: no href</h1>");

    var reg = /^http/i;
    if(! reg.test(href)) href = 'http://' + href;

    //p(`in 1984 request for : ${href}, req.url: ${req.url}`);

    ucp.do_request(res, href, '/tec-doc/', function(err, done){
      // all's finished, res send. @done is string describing what happened.
    });
  });

}


function _check_s3_file_key(info){
  if (info){
    var key = info['yas3fspath'];
    var k = key.replace(/^\/public\/ggfsa\//, '');
    return k;
  }
}


function _s3_file_read_stream(key){
    var s3 = new AWS.S3();
    if (!key) key = 'abc/Acts_01_00m_00s__00m_30s.mp3';
    //var params = {Bucket: 'ggfsa', Key: key};
    var params = {Bucket: aws_conf.root_bucket, Key: key};


    // get s3 object, read the stream and pipe it to target stream?
    //var file = fs.createWriteStream('/tmp/stream-down-test-a.mp3');

    return s3.getObject(params).createReadStream();
}


function _base_name(apath){
  return path.basename(apath);
}


exports.s3_down_stream = s3_down_stream;

/* test */


if (require.main === module){
  test_clone_default_folder_file();
}



// vim: set et ts=2 sw=2 fdm=indent:
