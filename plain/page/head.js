// Generated by CoffeeScript 1.8.0
(function() {
  var header_ls2, tpl;

  tpl = require("../myutils/tpl.js");

  header_ls2 = "<header>\n    <div id=\"header\" class=\"goodogood-header\">\n        <h1 class=\"logo\">\n            <span class=\"goodogood-logo\">\n                <a href=\"http://goodogood.me/\">goodogood</a>'\n            </span>\n            <span class=\"username\">\n                {{{username }}}\n            </span>\n        </h1>\n        <a class=\"to_nav\" href=\"#primary_nav\"> <i class=\"fa fa-list\"></i> Menu </a>\n    </div>\n</header>";

  module.exports.header_ls2 = header_ls2;

  module.exports.render_header_ls2 = function(contexts) {
    return tpl.render_str(header_ls2, contexts);
  };

}).call(this);