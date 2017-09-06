// note file for simple notes, to do it from 'message-file-2.js'
//
// The old file name got as: notes-file.js, but the 's' of 'notes' looks wierd, 
// dropping it.
//
// it's an plain text file. But it render as easy and fast to writ and read.
//
// make_note_file(meta, callback)
//   - make a note file, save it to s3, callback(err, file_obj)
// get_note_file(meta, callback)
//   - retrieve a old note file, callback(err, file_obj)
//
// 0221, 2015

var u      = require('underscore');
var path   = require('path');
var util   = require('util');
var md     = require("./markdown-file.js");

var bucket = require('./bucket.js');
var ft     = require('../myutils/filetype.js');
var myutil = require('../myutils/myutil.js');


var folder5  = require("./folder-v5.js");
var simple   = require("./simple-file-v3.js");

//var json_file= require("./json-file.js");



function note_file(file_meta, pass_file_obj){
  //
  // It will be based on plain and simple file, without any other parents,
  // to be more reliable.
  // 
  // The content will be utf-8 string, and render out head part of contents
  // during listing, by default. 
  //
  // file extension would be: ".ggnotes", or ".ggn".
  // filetype would be : "goodagood-notes"
  //   if need in future it should get markdown syntax work as well.
  //
  // Meta.note : a string, default utf-8 if needed, it's contents.  This
  //   makes a separate storage not necessary for small piece of text, but
  //   do it for simple coding at first. 
  //   If there is not 'Meta.storage.key', 'Meta.note' can be used anyway.
  //
  //
  
  var Meta = file_meta;
  //Meta.filetype = 'goodagood-notes';

  //var Editor_prefix = "/edit-note";
  var Editor_prefix   = "/edit-md";
  var File_type       = "goodagood-note";
  var File_extensions = ['.ggn', '.ggnote'];

  simple.simple_s3_file_obj(Meta, function(err, fobj){
    if(err) return pass_file_obj(err, null);

    // Now, we have file object and Meta data.  Here it get modified
    // for message files:

    function get_parent_obj(){
      return fobj;
    }

    function correct_extension(ext){
      ext = ext || '.ggn';
      if(ext.search(/\$$/) !== (ext.length -1)) ext += '$';

      var pat = RegExp(ext);
      if(! pat.test(Meta.name)){
        Meta.name += File_extensions[0];
        Meta.path = path.join(path.dirname(Meta.path), Meta.name);
      }
    }

    function set_filetype(){
      Meta.filetype = File_type;
    }

    // todo: prepare html ele., render as markdown
    function set_new_meta(_meta, callback){
      Meta = _meta;
      build_meta(callback);
    }

    function build_meta(callback){
      set_filetype();
      simple.fix_file_meta(Meta);
      fobj.calculate_meta_defaults();
      //prepare_html_elements(); // parent's render will do it.

      prepare_html_elements(function(err, what){
        render_html_repr(function(err, md){
          callback(null, Meta);
        });
      });
    }

    function update_storage(str, callback){
      if(str.trim() == '') return callback('empty string in "update storage" for note', null);
      Meta.note = str;
      fobj.save_file_to_folder().then(function(asw_reply){
        callback(null, str);
      });
    }

    // need test, Sat Feb 21 06:39:35 UTC 2015
    // For notes, it naturally short in length, for most notes, it will be
    // enough to put it in a string.  In addition, if codes not change, it
    // should be ok to just use the string.  'update storage' is enough.
    function save_note_s3(callback){
      // write content to a separate s3 obj
      var error = 'error in "save content" in "note file": ' + Meta.path;

      if(Meta.storage.key){
        fobj.write_s3_storage(Meta.note, callback);
      }else{
        error = 'where to store the content? ' ;
        return callback(error, null);
      }

      callback(err, null);
    }


    function read_to_string(callback){
      // @callback is for same with other file type.
      p('in "read to string", Meta.note: ', Meta.note);
      if(callback){
        return callback(null, Meta.note);
      }

      return Meta.note;
    }


    // it pass to callback
    function prepare_html_elements(callback){
      fobj.prepare_html_elements();
      render_note_as_markdown(function(err, markdonw){
        callback(null, Meta.html);
      });
    }


    // use markdown file to render the note as markdown.
    function render_note_as_markdown(callback){
      if(!Meta.note) return callback('no note?', null);

      // make a markdown file object from Meta, then use it to render note:
      md.markdown_file_obj(Meta, function(err, md_file){
        Meta.md_renderred = md_file.render_string(Meta.note);
        callback(null, Meta.md_renderred);
      });
    }

    function short_note(){
      Meta.short_note = Meta.note.slice(0, 15);
      return Meta.short_note;
    }


    function render_html_repr(callback){
      // it past by callback
      //
      // Results will be saved to Meta.html.li
      //
      // Using font awesome.
      //

      fobj.render_html_repr();  //parent's way

      var text = Meta.note; //? Meta.note?
      if(!text) text = "WoW! note something and nothing.";

      // first, from whom:
      var li = '<li class="file ggnote">\n';
      li += Meta.html.elements["file-selector"] + "\n";
      li += '<i class="fa fa-paperclip"></i>\n';
      if ( Meta.timestamp ){
        li += util.format('<span class="timestamp" data-timestamp="%s"> %s </span>\n', 
            Meta.timestamp, Meta.timestamp);
      }
      //if ( Meta.name )     li += '<span class="note-title">' + Meta.name + '</span>\n';

      if( Meta.md_renderred ){
        li += '<div class="note-content markdown"> <span class="markdown">' + Meta.md_renderred + '</span></div>\n';
      }else{
        li += '<div class="note-content"><span class="text">' + text + '</span></div>\n';
      }

      li += '<ul class="file-info-extra"><li>'; // put others into a sub <ul>, 0515
      var remove = '<span class="remove"> <i class="fa fa-trash-o"></i>' +
        util.format('<a href="%s">', Meta['delete_href']) +
        //'<span class="glyphicon glyphicon-trash"> </span>' +
        'Delete</a></span>\n';

      li += remove;

      var editor_link    = path.join(Editor_prefix, Meta['path_uuid']);
      var editor_element = 
        '<span class="editor"> <i class="fa fa-edit"></i>' +
        util.format('<a href="%s">', editor_link) +
        'Edit</a></span>\n';
      li += editor_element;

      li += '</li></ul>';
      li += '</li>\n';

      if( !Meta.html ) Meta.html = {};

      Meta.html.li = li;
      callback(li);
      return li;
    }



    // Object with new functionalities
    var new_functions = {
      version          : 'note file, 0224',
      set_filetype     : set_filetype,
      get_parent_obj   : get_parent_obj,
      set_new_meta     : set_new_meta,
      build_meta       : build_meta,
      save_note_s3    : save_note_s3,
      prepare_html_elements    : prepare_html_elements,
      render_note_as_markdown : render_note_as_markdown,
      render_html_repr         : render_html_repr,
      update_storage   : update_storage,
      read_to_string   : read_to_string,

      short_note : short_note,
    };

    // u.extend(fobj, new_functions); //d, this will change the parent obj.
    //
    // This make new_functions get default functionalities from the parent
    // object, and keep fobj as untouched:
    u.defaults(new_functions, fobj);

    //if(typeof Meta.html.li === 'undefined')  _render_html_repr(); //?
    pass_file_obj(null, new_functions); // This is callback
  });
}


function json_note(note_json, callback){
  // @note_json : object, where 'owner' and 'note' (content) is must.
  var name = 'note';
  var cwd  = note_json.owner;
  var npath= path.join(cwd, name);

  Meta = u.defaults(note_json, {
    name : name,
    title: name,
    path : npath
  });

  note_file(Meta, function(err, note){
    if (err){ p ('what err?'); return this.err = err; }
    note.build_meta(function(err, nmeta){
      p ('err, nmeta: ', err, nmeta);

      // This gives promise!
      note.save_file_to_folder().then(function(what){
        callback(null, note);
      });
    });
  });
}


/*
 * write a note file, to work with the form post: editor.js post md-note
 *
 * meta: {
 *   title    : 
 *   text     :
 *   username : 
 *   userid   :
 *   cwd      :
 * }
 */
function write_note_0514(meta, callback){
  var name;
  // Try to make a name from meta.title:
  if (u.isString(meta.title) && meta.title.length > 0) name = meta.title.slice(0,32);
  if (name){
    name = name + '.ggnote';
  } else {
    name = "notes" + Date.now().toString() + '.ggnote';
  }
  p('the name: ', name);

  var jmeta  = u.defaults({}, meta);
  jmeta.name = name;
  jmeta.cwd  = meta.cwd;
  jmeta.owner= meta.username;
  jmeta.id   = meta.userid;
  jmeta.note = meta.text;

  jmeta.path = path.join(jmeta.cwd, jmeta.name);
  p('the meta: ', jmeta);

  note_file(jmeta, function(err, nobj){
    if (err){
      p ('what err?', err);
      callback(err, null);
    }

    nobj.build_meta (function(err, meta_){
      p ('err, meta_: ', err, meta_);
      nobj.save_file_to_folder().then(function(what){
        callback(null, nobj);
      }).catch(function(err){
        callback(err, null);
      });
    });
  });
}


// do some fast checkings //

var p = console.log;

function stop(seconds){
  seconds = seconds || 1;
  setTimeout(process.exit, seconds*1000);
}

function empty_obj(meta){
  var name = 'test-note.ggnote';

  meta = meta || {
    name   : name
    , path : 'abc/test/'  + name
    , owner: 'abc'
    , note: 'just test, at ' + (new Date()).toString()
  };
  note_file(meta, function(err, note){
    if (err){ p ('what err?'); return this.err = err; }
    note.build_meta(function(err, what){
      p ('err, element: ', err, what);
    });
    stop();
  });
}




if (require.main === module){
  empty_obj();
}

module.exports.note_file  = note_file;
module.exports.json_note  = json_note;
module.exports.make_note_file = json_note;
module.exports.get_note_file  = note_file;

module.exports.write_note_0514  = write_note_0514;

// vim: set et ts=2 sw=2 fdm=indent:
