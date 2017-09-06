
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


    var puuid;
    if(!puuid){
        var parts = location.pathname.split('/');
        // filter out empty
        parts = parts.filter(function(a){return !!a;});
        parts.splice(0, 1); // get rid of the first (0) 1 element.
        puuid = parts.join('/');
    }

    var File = Backbone.Model.extend({

        // Default attributes for an file.
        defaults: function(){
            return {
                name         : 'unknown?',
                path         : 'unknown?',
                path_uuid    : 'unknown?',
                file_key     : 'unknown?',
                value        : 0,
                //fid          : 'file id, path uuid?',
                thumb_key    : 'unknown?',
                thumb_width  : 1,
                thumb_height : 1,
                order        : 0, // plan to use 1 - milli-seconds
                milli        : 0, // epoch milli-seconds
                size         : -1,
                filetype     : 'unknown?',
            };
        },

        add_value: function(){
            console.log('in model, to add value, this attrs: ', this.attributes);
            var self = this;
            var json_data = {
                path_uuid: this.get('path_uuid'),
            };
            var options = {
                success: function(json){
                    // Note, add value give not model data, it give storage reply
                    console.log('add value, ok? ' + self.get('path'));
                    console.log('add value, ok?2', json);
                    if(json.err) return false;

                    var json_data = {
                        path_uuid: self.get('path_uuid'),
                    };
                    read_meta_ajax(json_data).done(function(new_json){
                        console.log('got data from read meta ajax', new_json);
                        self.set(new_json);
                        return false;
                    });
                },
                error: function(e,a,b){
                    console.log('update model fail, ' + this.get('path'));
                    return false;
                },
            }
            add_value_ajax(json_data, options);
        },
    });


    // Collection
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
            "click   div.value"   : "add_value", // to add the file value ...
            "dbclick div.value"   : "add_value", // to add the file value ...
            //"dblclick .view"  : "edit",
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
            var str = this.template(this.model.toJSON());
            //console.log('render ', str);

            this.$el.html(this.template(this.model.toJSON()));
            //this.$el.toggleClass('done', this.model.get('done'));
            //this.input = this.$('.edit');
            return this;
        },

        // Add value to the file corresponding to the model of the view
        add_value: function(e) {
            // @e: event
        
            //alert('not implemented now');
            this.model.add_value();
        },

        // Remove the item, destroy the model.
        clear: function() {
            this.model.destroy();
        },

        shift_opacity: function(value, callback){ // value 0.0-1.0, html default 1
            value = value || 1.0;
            var self = this;

            this.$el.find("img").animate({
                opacity: 0.5,
                '-webkit-border-radius': '5px',
                '-moz-border-radius': '5px',
                '-o-border-radius': '5px',
                'border-radius': '5px',
            },
            5000,
            function(){
                //$(this).attr('opacity', 1.0);
                //this.render();
                console.log('animate run?', self.model.get('path'));
                callback();
            });
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


        //d
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
            console.log('empty render');
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


    //? move to MainView?
    function init_files_from_html(){
        $("ul.file-listing-ul");
    }

    // hack the sync?

    function add_value_ajax(json_data, options){
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


// for debuging
    //window.myFile  = File;
    //window.myFiles = Files;
    //window.myfiles = files;
    //window.myFileView = FileView;
    //window.mymain   = main;

    //// prepare and checking:
    //window.fetch_file_list_json(function(err, file_list){
    //    window.replace_old_html(file_list);
    //    //window.f0 = file_list[0]; // file meta 0
    //    //window.fv0 = window.make_a_view(f0);
    //    //fv0.render();
    //    //fv0.shift_opacity(0.1, function(){
    //    //    fv0.render();
    //    //});
    //});

    function read_file_json(path_uuid){
        // read client side json of file meta information
        //
        // data for server: {
        //              'path_uuid':    file path uuid, //must
        //              ......
        // }
        if(!path_uuid){
            path_uuid = puuid;
            //var parts = location.pathname.split('/');
            //// filter out empty
            //parts = parts.filter(function(a){return !!a;});
            //parts.splice(0, 1); // get rid of the first (0) 1 element.
            //path_uuid = parts.join('/');
        }

        var param = {
            url:      'http://54.178.88.149:9090/test/file-meta-json',
            type:     'POST',
            data:     {path_uuid:path_uuid},
            dataType: 'json', // what we can get back
        };
        console.log('firing rfj');
        return $.ajax(param);
    }

    window.rfj = read_file_json().done(function(j){
        console.log('rfj done');
        window.jwhat = j;
    });

    // set file unique attribute by changing the checkbox
    $("form #submit-to-set").hide(false);
    $("form #file-unique-checkbox").change(function(e){
        var checked = $(this).is(":checked");

        console.log('checked: ', checked, checked === true || checked === false);
        set_file_unique(checked).done(function(j){
            window.junique = j;
            console.log('done and ', j);
        });
    });

    function set_file_unique(checked){
        // read client side json of file meta information
        //
        // data for server: {
        //              'path_uuid':    file path uuid, //must
        //              ......
        // }

        var param = {
            url:      'http://54.178.88.149:9090/test/set-file-unique',
            type:     'POST',
            data:     {path_uuid: puuid, unique: checked},
            dataType: 'json', // what we can get back
            // use this, else true will be string 'true'? :
            //contentType: 'application/json',
        };
        console.log('firing rfj');
        return $.ajax(param);
    }

    console.log('0401 here, near end of fi-pu.js, ok?');
});




