//
// nodeunit test
//
// Test '../myutils/template.coffee/js'
//


var assert = require("assert");
var u = require("underscore");
var async = require("async");
var path = require("path");
var Promise = require("bluebird");

var fm = require("../aws/folder-v5.js");
var mytemplate = require('../myutils/template.js');

var msg_module = require("../aws/simple-msg.js");
var config = require("../test/config.js");

var tool  = require("../myutils/test-util.js");


var _folder_path    = 'abc';
var _user_name      = 'abc';
var _gg_folder_name = 'goodagood';
var _new_folder_name= 'test';

var p = console.log;


var test_render_a_file = function(test){
            test.done();

};




module.exports = {
    setUp: function (callback) {
        this.foo = 'bar';
        callback();
    },
    tearDown: function (callback) {
        stop(3); // stop in a seconds any way.
        callback();
    },

    //"test-1 : get json of 1st msg" : get_json_of_the_1st,
};


// -- checkings -- //


function render_a_css_in(){
    var file_name = "default-css.html";
    var context   = {};
    mytemplate.render_file_to_string(file_name, context, function(err, html){
        p('can we get html:\n', html);
        tool.stop();
    });
}


function assemble_v2(){

    html_files = {
       body   : 'test-body.html',
       //header : 'goodheader.html',
       //navbar : 'people-file-navtabs.html',
       script : 'test-script.html',
       frame  : 'frame-backbone.html'
    };

    contexts = {
       body: { },
       header: { },
    };

    mytemplate.assemble_html_v2(html_files, contexts).then(function(html){
        p(html);
        tool.stop();
    });
}

if(require.main === module){
    //render_a_css_in();
    assemble_v2();
}






