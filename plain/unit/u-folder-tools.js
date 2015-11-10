var assert = require('assert');
var async  = require('async');
var u      = require('underscore');
var path   = require('path');


var bucket    = require("../aws/bucket.js")
var folder5   = require("../aws/folder-v5.js");
var ftools    = require("../aws/folder-tools.js");

var tutil = require("../myutils/test-util.js");


var p    = console.log;
var stop = function() { return setTimeout(process.exit, 1000); };


function test_rw_note(test){
}


// -- checkings --

// before:
function empty_obj(meta){
  meta = meta || {
    name : 'testing.ggnote'
    , path : 'abc/test'
    , owner: 'abc'
    , note: 'just test, at ' + (new Date()).toString()
  };
  note.note_file(meta, function(err, nobj){
    if (err){ p ('what err?'); return this.err = err; }
    //nobj.prepare_html_elements(function(err, elements)
    nobj.build_meta (function(err, meta_){
        p ('err, meta_: ', err, meta_);
        tutil.stop();
    });
  });
}


// 0514
var user_module = require("../users/a.js");
function path_to_relative(meta){
  meta = meta || {
    name : 'testing.ggnote'
    , relative_path: 'public'
    , owner: 'ap'
    , note: 'should i get a file type: note? ' + (new Date()).toString()
  };

  user_module.get_user_id(meta.owner, function(err, id){
      meta.path = path.join(id, meta.relative_path, meta.name);
      p('the meta: ', meta);

      note.note_file(meta, function(err, nobj){
        if (err) return p ('what err?', err);

        //nobj.prepare_html_elements(function(err, elements)
        nobj.build_meta (function(err, meta_){
            p ('err, meta_: ', err, meta_);
            tutil.stop();
        });
      });


      //stop();
  });
}


function check_json_note(){
    var name = 'note';
    var owner= 'abc';
    var dir  = 'abc/test';

    var meta = {
        name : name,
        path : path.join(dir, name),
        owner: owner,
        note: 'note, msg, style, pp, keep running?'
    };

    note.json_note(meta, function(err, what){
        p('check json note, got:\n err \n', err);
        //p('check json note, got:\n err, what, \n', err, what);
        stop();
    });
}


function find_note(cwd){
    cwd = cwd || 'abc/test';
    var pat = /^note.+/;
    folder5.retrieve_files_by_pattern(cwd, pat, function(err, files){
        p('file objs: ', err, files.length);
        var f = files[0];
        p('f version: ', f.version); //still get simple file. 9:19
        var m = f.get_meta();
        p('filetype: ', m.filetype);
        //m.filetype = "goodagood-note";

        //f.save_file_to_folder().then(function(what){
        //    p('after save, got what:\n', what);
        //    stop();
        //});


        f.read_to_string(function(err, str){
            p('the string: ', str);
            stop();
        });
    });
}


function find_note_metas(cwd){
    cwd = cwd || 'abc/test';
    var pat = /^note.+/;
    folder5.retrieve_metas_by_pattern(cwd, pat, function(err, metas){
        p('file metas: ', err, metas.length);
        //u.each(metas, function(m){
        //    p(m.name, '\t', m.path, m.note);
        //});
        stop();
    });
}


function check_write_0514(meta){
    meta = meta || {
        title   : 'test by drop into REPL, write note 0514'
        , text  : 'node.js _debug_ : <https://nodejs.org/api/debugger.html> <br>' + (new Date()).toString()
        , cwd   : '39/public'
        , username: 'ap'
        , userid: '39' //must be string, even for number
    };
    /* meta: {
     *   title    : 
     *   text     :
     *   username : 
     *   userid   :
     *   cwd      :
     * }
     */
    note.write_note_0514(meta, function(err, note_obj){
        if(err) o.err4write_note = err;

        p('after write note 0514: ', err, note_obj);
        p('go checking');
        stop();
    });
}


// 0516


if(require.main === module){
}


// -- dropping -- //

// before May.
function drop_note_obj_to_repl(meta, o){
  var name = 'testing.ggnote';

  meta = meta || {
    name   : name
    , path : 'abc/test/sub0503/'  + name
    , owner: 'abc'
    , note: 'just test, at ' + (new Date()).toString()
  };
  o = o || this; //The object get the variables.

  note.note_file(meta, function(err, n){
    if (err){ p ('what err?'); return this.err = err; }
    n.set_new_meta(meta, function(err, what){
      p ('err, element: ', err, what);
      o.note = n;
      o.meta  = n.get_meta();
      o.fobj  = n.get_parent_obj();
      o.pmeta = o.fobj.get_meta();
    });

  });
}


function drop_a_note_0514(meta, o){
    meta = meta || {
        name   : 't-link.ggnote'
        , path : 'ap/public'
        , relative_path: 'public'  // without the root dir name
        , owner: 'ap'
        , note : 'node.js _debug_ : <https://nodejs.org/api/debugger.html> <br>' + (new Date()).toString()
    };

    user_module.get_user_id(meta.owner, function(err, id){
        meta.path = path.join(id, meta.relative_path, meta.name);
        p('the meta: ', meta);

        note.note_file(meta, function(err, nobj){
            if (err) return p ('what err?', err);

            //nobj.prepare_html_elements(function(err, elements)
            nobj.build_meta (function(err, meta_){
                p ('err, meta_: ', err, meta_);
                o.note  = nobj;
                o.meta  = nobj.get_meta();
                o.pobj  = nobj.get_parent_obj();
                o.pmeta = o.pobj.get_meta();
                nobj.save_file_to_folder().then(function(what){
                    o.res_4_save = what;
                    p('check to see if o is populated.');
                }).catch(function(err){
                    o.err4_save = err;
                });
            });
        });


    });
}

function drop_write_note_0514(meta, o){
    meta = meta || {
        title   : 'test by drop into REPL, write note 0514'
        , text  : 'node.js _debug_ : <https://nodejs.org/api/debugger.html> <br>' + (new Date()).toString()
        , cwd   : '39/public'
        , username: 'ap'
        , userid: '39' //must be string, even for number
    };
    /* meta: {
     *   title    : 
     *   text     :
     *   username : 
     *   userid   :
     *   cwd      :
     * }
     */
    note.write_note_0514(meta, function(err, note_obj){
        if(err) o.err4write_note = err;

        p('after write note 0514: ', err, note_obj);
        o.note = note_obj;
        o.meta = note_obj.get_meta();
        p('go checking');
    });
}

//var o = {}; drop_note_obj_to_repl(false, o);
//var simple_meta = u.omit(o.meta, 'files', 'html', 'renders');
//var o = {}; drop_a_note_0514(false, o);
//var o = {}; drop_write_note_0514(false, o);

