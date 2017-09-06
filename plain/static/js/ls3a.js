


$(function(){

    // Generate four random hex digits.
    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };

    // Generate a pseudo-GUID by concatenating random hexadecimal.
    function guid() {
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    };

    // another way to generate guid:
    function guida(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0,
               v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
        });
    }


    //var p = console.log;

    var File = Backbone.Model.extend({

        // Default attributes for an file.
        defaults: function(){
            return {
                name         : 'file name unknow?',
                path         : 'what_path',
                path_uuid    : 'unknown?',
                file_key     : 'unknown?',
                value        : 0,
                //fid          : 'file id, path uuid?',
                thumb_key    : 'thumb key unknown?',
                thumb_width  : 1,
                thumb_height : 1,
                order        : 0, // plan to use 1 - milli-seconds
                milli        : 0, // epoch milli-seconds
                size         : -1,
                filetype     : '',
            };
        },

        //tagName : 'li',
    });


    // Collection
    // ..The collection of todos is backed by *localStorage* instead of a remote server.
    var Files = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: File,

        // We need a connection to backend...
        //localStorage: new Backbone.LocalStorage("todos-backbone"),


        //// We need to keep the order
        //nextOrder: function() {
        //    return 'what order?';
        //},

        // Todos are sorted by their original insertion order.
        comparator: 'order'

    });


    var files = new Files();

    // The DOM element for a file item...
    var FileView = Backbone.View.extend({

        //... is a list tag.
        tagName:  "li",

        // Cache the template function for a single item.
        template: _.template($('#file-template').html()),

        // The DOM events specific to an item.
        events: {
            "click .value-adding"   : "add_value", // to add the file value ...
            "dblclick .view"  : "edit",
            //"click a.destroy" : "clear",
            //"keypress .edit"  : "updateOnEnter",
            //"blur .edit"      : "close"
        },

        // The FileView listens for changes to its model, re-rendering. Since there's
        // a one-to-one correspondence between a **File** and a **FileView** in this
        // app, we set a direct reference on the model for convenience.
        // ??
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            //this.listenTo(this.model, 'destroy', this.remove);
        },

        // Re-render the titles of the file item.
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            //this.$el.toggleClass('done', this.model.get('done'));
            //this.input = this.$('.edit');
            return this;
        },

        // Add value to the file corresponding to the model of the view
        add_value: function(e) {
            // @e: event
        
            //alert('not implemented now');
            //this.model.add_value();
        },

        // Remove the item, destroy the model.
        clear: function() {
            this.model.destroy();
        }

    });

    window.pulist = []; //for debug

    // The Application
    // ---------------

    // Our overall **MainView** is the top-level piece of UI.
    var MainView = Backbone.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the 'Main' already present in the HTML.
        el: $("div#file_list"),

        // Our template for the line of statistics at the bottom of the app.
        statsTemplate: _.template($('#stats-template').html()),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
            //"keypress #new-file":  "createOnEnter",
            //"click #clear-completed": "clearCompleted",
        },

        // At initialization we bind to the relevant events on the `files`
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting todos that might be saved in *localStorage*.
        initialize: function() {

            //this.input = this.$("#new-file");
            //this.allCheckbox = this.$("#toggle-all")[0];

            this.listenTo(files, 'add', this.addOne);
            //this.listenTo(files, 'reset', this.addAll);
            this.listenTo(files, 'all', this.render);

            this.footer = this.$('footer');
            //this.main = $('#main');

            //files.fetch();
        },


        fetch_from_ul: function(){
            var cwd = this.$el.find('ul#file-listing-ul').attr('data-cwd');
            window.ggcwd = cwd;

            this.$el.find("ul#file-listing-ul li").each(function(idx){
                var dpu = $(this).attr('data-path-uuid');

                console.log(dpu);
                if(dpu){
                    window.pulist.push(dpu); //for debug
                    var f = new File({"path_uuid": dpu});
                    files.add(f);
                    var fv= new FileView({model:f});

                    var pu_selector = 'li[data-path-uuid="' + dpu +'"]';
                    var fv_el = $(this).find(pu_selector);
                    //fv.el = fv_el;  // can we?
                }
            });
        },

        // Re-rendering the 'Main' just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function() {
        },

        // ? todo -> file
        // Add a single file item to the list by creating a view for it, and
        // appending its element to the `<ul>`.
        addOne: function(file) {
            var view = new FileView({model: file});
            this.$("#file-list").append(view.render().el);
        },

        // Add all items in the **Files** collection at once.
        addAll: function() {
            files.each(this.addOne, this);
        },

        // If you hit return in the main input field, create new **files** model,
        // persisting it to *localStorage*.
        createOnEnter: function(e) {
            if (e.keyCode != 13) return;
            if (!this.input.val()) return;

            files.create({title: this.input.val()});
            console.debug('created todos : ' + this.input.val());
            this.input.val('');
        },

        // ?
        // Clear all done file items, destroying their models.
        clearCompleted: function() {
            _.invoke(files.done(), 'destroy');
            return false;
        },


    });

    // Finally, we kick things off by creating the **MainView**.
    var main = new MainView;


    // --- for backbone sync ---
 
    // A simple module to replace `Backbone.sync` with *goodagood* file-based
    // persistence. Models have GUIDS, and saved into a JSON object. Simple
    // as that.

    // Hold reference to Underscore.js and Backbone.js in the closure in order
    // to make things work even if they are removed from the global namespace



    // ------------------------------------------------------------------
    // hack to make it use goodagood folder as storage

    // info to work with backend
    var folder = {
        //file_path : _pass_in_file_path, //?
    };
    // This is actually the data:
    var j = {};


    //? move to MainView?
    function init_files_from_html(){
        $("ul.file-listing-ul");
    }

    // hack the sync?

    function add_value(json_data, options){
        // add value to file, update server side file meta or make a file
        // to add value later.
        //
        // json_data: {
        //              'path_uuid':    file path uuid,
        //              'value':        '1', to be default
        //              'more-attribute':  string,
        //              // all string for attributes and it's value.
        //              ......
        // }

        // @options: jquery ajax options:
        //   {
        //    sucess: function
        //    error: function
        //    url: 
        //   }

        options = options || {};
        var url     = options.url     || 'http://54.178.88.149:9090/test/add-file-value';
        var success = options.success || function(){alert('success, ' + a + b + c)};
        var error   = options.error   || function(){alert('error, '   + a + b + c)};


        var param = {
            url:      url,
            type:     'POST',
            data:     json_data,
            dataType: 'json', // what we can get back

            success:  success,
            error:    error
        };
        $.ajax(param);
    }

    function update_file_meta(json_data, options){
        // update server side json file, with data: json_data.json
        //
        // json_data: {
        //              'path_uuid':    file path uuid,
        //              'attribute-1':  string,
        //              // all string for attributes and it's value.
        //              ......
        // }

        // @options: jquery ajax options:
        //   {
        //    sucess: function
        //    error: function
        //    url: 
        //   }

        options = options || {};
        var url     = options.url     || 'http://54.178.88.149:9090/test/set-file-meta';
        var success = options.success || function(){alert('success, ' + a + b + c)};
        var error   = options.error   || function(){alert('error, '   + a + b + c)};


        var param = {
            url:      url,
            type:     'POST',
            data:     json_data,
            dataType: 'json', // what we can get back

            success:  success,
            error:    error
        };

        //console.log('going to do ajax: ', param);
        $.ajax(param);
        //.done(function(a,b, c){
        //    //$("div#file_list input:checkbox").attr("checked", false);
        //    sucess(a,b,c);
        //    console.log('ajax done: ', a,b,c);
        //})
        //.fail(function(a,b,c){
        //    error(a,b,c);
        //    console.log('ajax fail: ', a,b,c);
        //});
    }

    function read_meta(json_data, options){
        // read client side json of file meta information
        //
        // json_data: {
        //              'path_uuid':    file path uuid, //must
        //              // all string for attributes and it's value.
        //              ......
        // }

        // @options: jquery ajax options:

        options = options || {};
        var url     = options.url     || 'http://54.178.88.149:9090/test/file-meta-json';
        var success = options.success || function(){alert('success, ' + a + b + c)};
        var error   = options.error   || function(){alert('error, '   + a + b + c)};


        var param = {
            url:      url,
            type:     'POST',
            data:     json_data,
            dataType: 'json', // what we can get back

            success:  success,
            error:    error
        };
        return $.ajax(param);
    }

    function read_meta_list(json_data, options){
        // read client side json of file list information
        //
        // json_data: {
        //              'folder_path':    file path uuid, //must
        //              // all string for attributes and it's value.
        //              ......
        // }

        // @options: jquery ajax options:

        options = options || {};
        var url     = options.url     || 'http://54.178.88.149:9090/test/file-meta-list-json';
        var success = options.success || function(){alert('success, ' + a + b + c)};
        var error   = options.error   || function(){alert('error, '   + a + b + c)};


        var param = {
            url:      url,
            type:     'POST',
            data:     json_data,
            dataType: 'json', // what we can get back

            success:  success,
            error:    error
        };
        return $.ajax(param);
    }


    function ggsync(method, model, options) {

        // in dev.:
        console.log('start ggsync, ', method);
        if(_.isEmpty(model)) console.log('empty model: ', model);
        if(!_.isEmpty(model)) console.log('not empty model with name and path uuid: ', model.name, model.path_uuid);

        var id = null;

        try {

            switch (method) {
                case "create":
                    console.log('create');
                    // not doing anything.
                    return false;
                    break;
                case "read":
                    console.log('read');

                    if(!model || typeof model.path_uuid === 'undefined'){
                        // this should read all file's client side json, as array
                        return read_meta_list(jdata, null, options);
                    }

                    id = model.path_uuid;
                    // to read the file's client json:
                    return read_meta(jdata, null, options);
                    break;
                case "update":
                    console.log('update');
                    // how to update?

                    break;
                case "delete":
                    console.log('delete');

                    return false;
                    break;
                case "patch":
                    console.log('patch get run');
                    break;
            }

        } catch(error) {
            console.log('catch error:\n', error);
            options.error(error);
        }
    }

    if(typeof Backbone.sync !== 'undefined') Backbone.old_sync = Backbone.sync;
    Backbone.sync = ggsync;

    // for console debugging
    //window.filesetting = file;
    //window.jdata = j;


    //return Backbone.LocalStorage; 
    //return Backbone.GGFileStorage; // change to this?



    // testing
    main.fetch_from_ul();

// for debuging
    window.myFile  = File;
    window.myFiles = Files;
    window.myfiles = files;
    window.myFileView = FileView;
    window.mymain   = main;


    //console.log('here, 318, ok?');
    //alert('ok jsa.js');
});




