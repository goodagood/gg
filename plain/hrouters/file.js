// -- under url  /file...
// to do file thing
// 2015 0922


var express = require("express");
var router  = express.Router();

var cel = require('connect-ensure-login');

var path = require("path");
var u    = require("underscore");


// For uploading
var multer = require('multer');
var upload = multer({dest: '/tmp/'}); // tmp file save to /tmp

var bucket2= require('gg-credentials').bucket;


var cwdc = require("../cwd-chain/cwd-chain.js");
var get_file = require("../aws/get-file.js");



//var css        = require('../aws/css-file.js');
//var mytemplate = require('../myutils/template.js');

//var filelist   = require('./file-list-v2.js');
//var people_ed  = require("../users/people-edit.js");

var p = console.log;



/*
 * This is going to use full path as parameter.
 * meta['saved-web-page'] :
 * {
 *      html:  The string of the html
 *      s3key: The key of the html text file in s3 storage,
 *             should has aux-path prefix
 * }
 *
 * At least one and only one of the attributes above will be used.
 */
router.get(/^\/saved-web-page\/(.+)/, function(req, res, next){
      var username; 
      if (typeof req.user !== 'undefined') username = req.user.username;

      var full_path = req.params[0];
      p('full path: ', full_path);

      if (!full_path) {
        return res.send('<h1> err, no full_path </h1>');
      }

      var filename = path.basename(full_path);

      get_file.get_1st_file_obj_with_auxpath_by_path(full_path, function(err, file){
        if (err) { return res.send("<h1> file not found by path</h1> " + full_path); }

        var meta = file.get_meta();

        if(meta['saved-web-page']){
            var saved = meta['saved-web-page'];
            if(saved.html) return res.send(meta['saved-web-page'].html);
            if(saved.s3key){
                p('to read saved s3');
                return bucket2.read_to_string(saved.s3key, function(err, str){
                    if (err) { return res.send("<h1> failed to read the object</h1> " + full_path); }

                    return res.send(str);
                });
            }
        }else{
            return res.send("<h1> no saved web-page attribute</h1> " + full_path);
        }
      });
});


router.get(/^\/upload-web-page\/(.+)/, function(req, res, next){
      var username; 
      if (typeof req.user !== 'undefined') username = req.user.username;

      var full_path = req.params[0];
      var cwd       = path.dirname (full_path);
      var filename  = path.basename(full_path);
      p(full_path, cwd);
      if(!full_path) return res.send("<h1> no file path found in the Url</h1> ");

      var cwd_chain = cwdc.cwd_chain(cwd, '/ls/');  // '/ls/' is start of the href

      var context  = {
        file_full_path: full_path,
        file_name:      filename,
        file_path_uuid: '', // not use this?
        username :      username,
        cwd : cwd,
        cwd_chain : cwd_chain,
      };

      res.render('fu-web-page.html', context);
});


router.post("/upload-web-page", 
        upload.single('html_file'),
        function(req, res, next){

            var username; 
            if (typeof req.user !== 'undefined') username = req.user.username;
            if (!username) username = 'anonymous';

            var full_path = req.body.file_full_path;
            var cwd       = path.dirname(full_path);

            p(221, username, full_path, cwd);
            p(231, req.file);
            put_local_file_as_web_page(req.file.path, full_path, function(err, what){
                p('am i put it to meta? ', err, what);

                var get_to_upload_another = path.join('/file', 'upload-web-page', full_path);
                res.redirect(get_to_upload_another);
            });
});


/*
 * Let user get plain files, such css, js
 * Not sure if it work.
 */
router.get(/^\/get\/(.+)/, function(req, res, next){
      var username; 
      if (typeof req.user !== 'undefined') username = req.user.username;

      var full_path = req.params[0];
      if(!full_path) return res.send("<h1> no file path found in the Url</h1> ");
      var cwd       = path.dirname (full_path);
      var filename  = path.basename(full_path);
      p('u f c: ', username, full_path, cwd);

      var headers = {};

      return get_file.get_1st_file_obj_by_path(full_path, function(err, file){
          if(err){
              p(404);
              res.writeHead(404, {});
              return res.end();
          }
          // res.writeHead?

          var meta = file.get_meta();
          p('meta: ', u.pick(meta, 'type', 'filetype', 'size', 'uuid'));
          headers  = make_headers_from_meta(meta);
          res.writeHead(200, headers);
          p('res.writeHead(200, headers), ok?');

          file.read_stream().pipe(res);
      });
});


//doing, 2015 1015
/*
 * The converted HTML will be stored as:
 * meta["mock-static-web-page"] :
 *   {
 *       html:  '', string, empty or null should be ok.
 *       s3key: string, stored as aws s3 object, default to utf-8 encoding.
 *   }
 */
router.get(/^\/get-with-local-files\/(.+)/, function(req, res, next){
      var username; 
      if (typeof req.user !== 'undefined') username = req.user.username;

      var full_path = req.params[0];
      p('full path: ', full_path);

      if (!full_path) return res.send('<h1> err, no full_path </h1>');

      //var filename = path.basename(full_path);

      // todo:
      var path_converter = require("../file-basic/full-path.js");
      path_converter.get_html_converted(full_path, function(err, html){
          if(err) return res.send('<h1> err, get html converted </h1>');

          res.send(html);
      });
});


router.get(/^\/md-with-local-files\/(.+)/, function(req, res, next){
      var username; 
      if (typeof req.user !== 'undefined') username = req.user.username;

      var full_path = req.params[0];
      p('full path: ', full_path);

      if (!full_path) return res.send('<h1> err, no full_path </h1>');

      //var filename = path.basename(full_path);

      var mdloc = require("../file-basic/md-with-loc.js");
      mdloc.render_md_with_local_files(full_path, function(err, html){
          if(err) return res.send('<h1> err, md with loc, 11 11 </h1>');

          res.send(html);
      });
});

/*
 * Same as the above, but convert relative links then give the html.
 */
router.get(/^\/convert-relative-pathes\/(.+)/, function(req, res, next){
      var username; 
      if (typeof req.user !== 'undefined') username = req.user.username;

      var full_path = req.params[0];
      p('full path: ', full_path);

      if (!full_path) {
        return res.send('<h1> err, no full_path </h1>');
      }

      //var filename = path.basename(full_path);

      // todo:
      var path_converter = require("../file-basic/full-path.js");
      path_converter.convert_html(full_path, function(err, html){
          if(err) return res.send('<h1> err, get html converted </h1>');

          res.send(html);
      });
});


/*
 * check this path works, /file/1031
 */
router.get("/1031", function(req, res, next){
    res.end('<h1>this is 1031</h1>');
});


/*
 * local file --> file web page
 *                s3key: aux path + '/web-page.html'
 *
 *                meta['saved-web-page'] = {s3key: s3key}
 */
function put_local_file_as_web_page(local_file_path, ggfile_path, callback){
    if(!local_file_path) return callback('no localfile given');
    if(!ggfile_path) return callback('no file path given');

    var web_page_name = 'web-page'; // The name got in s3 key.

    get_file.get_1st_file_obj_with_auxpath_by_path(ggfile_path, function(err, file){
        if(err){ p(err); p(3.888); return process.exit();}

        p('232 g1', err, u.keys(file).sort().join("\t"));
        var meta = file.get_meta();
        p(u.keys(meta).sort().join("\t"));
        p('aux path: ', meta.aux_path);

        var s3key = path.join(meta.aux_path, web_page_name);
        p('s3key: ', s3key);

        bucket2.put_file_to_s3(local_file_path, s3key, function(err, s3reply){
            if(err){ p(err); p('b 2 p f t s3'); return process.exit();}

            p('file in s3');

            meta['saved-web-page'] = {s3key: s3key};

            // update the s3 file
            file.save_file_to_folder().then(function(what){
                p('meta saved');
                return callback(null, meta['saved-web-page']);
            }).catch(callback);
        })
    });
}


function make_headers_from_meta(meta){
    headers = {server: 'goodagood/goodogood s3 static server'};

    if(meta.mimetype){
        headers['Content-Type']   = meta.mimetype;
    }else if(meta.type){
        headers['Content-Type']   = meta.type;
    }else if(meta.filetype){
        headers['Content-Type']   = meta.filetype;
    }

    if(meta.size) headers['Content-Length'] = meta.size; //
    //headers['Etag'] = meta.size; //
    //headers['Last-Modified'] = meta['lastmodified']; //

    p('mk headers from meta, 1031: ', headers);
    return headers;
}


module.exports = router;



// -- checkings


function chk_put_up(){
    local_file_path = '/tmp/v1a.html';
    ggfile_path     = 'abc/test/small3.mp4';

    put_local_file_as_web_page(local_file_path, ggfile_path, function(err, what){
        p('c 1 c p u:', err, what);

        process.exit();
    });
}


function check_linked_bucket(){
    p(u.keys(bucket2));
    process.exit();
}


if(require.main === module){
    //put_local_file_as_web_page();

    //chk_put_up();

    check_linked_bucket();
}



