var u      = require('underscore');
var path   = require('path');

var bucket = require('./bucket.js');
var ft     = require('../myutils/filetype.js');
var myutil = require('../myutils/myutil.js');

var myconfig =   require("../config/config.js");
var render   = require("./render-b.js");
var image    = require("./image.js");

var s3folder = require("./folder-v5.js");
var s3file   = require("./simple-file-v3.js");


function markdown_file_obj(file_meta, pass_file_obj){
  //
  // For markdown file object.
  //
  // 0722
  //
  
  var Meta = file_meta;
  //var Obj;

  s3file.simple_s3_file_obj(Meta, function(err, fobj){

    function _render_html_repr(){
      //
      // Results will be saved to Meta.html.li, it represent the file in 
      // web page
      //

      prepare_html_elements();

      // file selector
      var li = '<li class=\"file\">'
      li += Meta.html.elements["file-selector"] + "&nbsp;\n"
      li += Meta.html.elements["anchor"] + "&nbsp;\n"
      li += '<span class="glyphicon glyphicon-star"></span>&nbsp;\n'  // for testing.
      li += "<ul class=\"list-unstyled file-info\"><li>\n"

      li += Meta.html.elements["viewer"] + "&nbsp;\n"
      li += Meta.html.elements["editor"] + "&nbsp;\n"
      li += Meta.html.elements["path-uuid"] + "&nbsp;\n"
      li += Meta.html.elements["remove"] + "&nbsp;\n"

      li    += '<a href="' + Meta.s3_stream_href + '" >' + Meta.name + '</a>\n' ;
      //li    += '<a href="/view/' + Meta.path + '" >' + '&nbsp; view' + '</a>\n' ;
      li    += '<a href="/view/' + Meta.path + '" >' + '&nbsp; view' + '</a>\n' ;

      var remove = [' <a href="', Meta['delete_href'], '"> <span class="glyphicon glyphicon-remove"> </span></a>'].join('');
      li += remove + '\n';

      li += "</li></ul></li>"

      // old:

      


      if( !Meta.html ) Meta.html = {};
      Meta.html["li"] = li
      return li;
    }


    function prepare_html_elements(){
      fobj.prepare_html_elements(); // call parent method.

      var ele = Meta.html.elements;
      // url:
      var viewer_url = '';
      if(typeof Meta.path_uuid !== 'undefined'){
        viewer_url = path.join("/viewmd/", Meta.path_uuid);
      }else{
        var dir = path.dirname(Meta.path);
        Meta.path_uuid = path.join(dir, Meta.uuid);
        viewer_url = path.join("/viewmd/", dir,  Meta.uuid);
      }
      ele.viewer = '<a class="viewer" href="' + viewer_url + '">Viewer</a>';


      var editor_url = path.join("/edit-md/", Meta.path_uuid);
      ele.editor = '<a class="editor" href="' + editor_url + '">Editor</a>';
    }


    var marked = require('marked');
    var color  = require('highlight.js');
    // need test, 01 22
    function render_content(callback){
      fobj.read_to_string(function(err, str){

        marked.setOptions({
          highlight : function(code){
            return color.highlightAuto(code).value;
          },
          //... more options
        });

        callback(null, marked(str));
      });
    }

    function render_string(str){
        marked.setOptions({
          highlight : function(code){
            return color.highlightAuto(code).value;
          },
          //... more options
        });

        return marked(str);
    }


    function render_file_content(callback){
      var path_chain = myutil.path_chain(Meta.dir, "/ls/"); // '/ls/' is start of the href
      path_chain += Meta.name;
      var path_html = '<div class="path_chain"> <span> File: </span>' + path_chain + '</div><hr />\n';
      render_content(function(err, html){
        var content = path_html + html;
        callback(null, content);
      });
    }



    //function _clone_content_to_user(user_name, callback){
    //  // Can we use the parent method, 
    //  // when the method will be over-rided after a while?
    //  // Can we do it this way:
    //  // fobj._clone_content_to_user(....)
    //  //
    //  var tgt_meta  = {};

    //  var fid  = myutil.get_uuid();
    //  var new_name = fid + path.extname(Meta.name); 

    //  var tgt_s3key = path.join(user_name, '.files', new_name );

    //  var tgt_storage = {type:'s3', key: tgt_s3key};

    //  tgt_meta.storage   = tgt_storage;
    //  bucket.copy_file(Meta.storage.key, tgt_s3key); //This has no callback

    //  // For thumbnail, only default thumbnail
    //  tgt_meta['thumbnail-s3key'] = image.make_thumb_key_from_file_key(tgt_meta.storage.key);
    //  bucket.copy_file(Meta['thumbnail-s3key'], tgt_meta['thumbnail-s3key']); //This has no callback

    //  callback(tgt_meta);
    //}


    // Object with new functionalities
    var new_functions = {
      version          : 'markdown file',
      render_html_repr : _render_html_repr,
      render_content   : render_content,
      render_string    : render_string ,
      render_file_content   : render_file_content
      //clone_content_to_user : _clone_content_to_user,
    };

    //u.extend(Obj, new_functions);
    u.defaults(new_functions, fobj);
    pass_file_obj(null, new_functions); // This callback pass out the image file object.
  });

}

function new_md_obj_to_s3(meta, callback){
  markdown_file_obj(meta, function(err, obj){
    obj.set_meta(meta);
    obj.calculate_meta_defaults();
    obj.render_html_repr();
    obj.save_meta_file(function(err, what){
      if (err){
        return callback(err, null);
      }else{
        return callback(err, obj);
      }
    });
  });
}

module.exports.markdown_file_obj = markdown_file_obj;
module.exports.new_md_obj_to_s3  = new_md_obj_to_s3;


if (require.main === module){
}


// vim: set et ts=2 sw=2 fdm=indent:
