// Generated by CoffeeScript 1.8.0
(function() {
  var Video_element_html, fs, handlebars, p, path, prepare_elements_2, render_html, render_video_tag, sample_video_element, u;

  u = require('underscore');

  fs = require('fs');

  path = require('path');

  handlebars = require('handlebars');

  p = console.log;

  Video_element_html = '<video id="really-cool-video" class="video-js vjs-default-skin" controls\n    preload="auto" <%=width%> <%=height%> <%=poster%>\n    data-setup=\'{}\'>\n    <%=vid_src%>\n    <%=more_vid_src%>\n    <p class="vjs-no-js">\n        Your browser might not support Javascript, \n        This page use HTML5 video\n    </p>\n</video>';

  sample_video_element = '<video id="really-cool-video" class="video-js vjs-default-skin" controls\n    preload="auto" width="640" height="264"\n    poster="really-cool-video-poster.jpg"\n    data-setup=\'{}\'>\n\n    <source src="really-cool-video.mp4" type=\'video/mp4\'>\n    <source src="really-cool-video.webm" type=\'video/webm\'>\n\n    <p class="vjs-no-js">\n        To view this video please enable JavaScript, and consider upgrading to a web browser\n        that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>\n    </p>\n</video>';

  render_video_tag = function(meta) {
    var context, elements, err, html_element, tpl;
    context = meta || {};
    elements = prepare_elements_2(meta);
    try {
      tpl = u.template(Video_element_html);
      html_element = tpl(elements);
    } catch (_error) {
      err = _error;
      p('render vid elements. you got me: ', err);
      return null;
    }
    return html_element;
  };

  prepare_elements_2 = function(meta, opt) {
    var elements, first, poster, poster_url, s3key, vid_path;
    p("in prepare elements 2");
    elements = {
      width: '',
      height: '',
      poster: '',
      vid_src: '',
      more_vid_src: ''
    };
    s3key = meta.storage.key;
    if ((opt != null) && (opt.vid_path != null)) {
      vid_path = opt.vid_path;
    } else {
      vid_path = path.join('/ss/', s3key);
    }
    if (meta.posters) {
      poster = null;
      if (meta.posters.defaults) {
        poster = meta.posters.defaults;
      } else {
        first = u.values(meta.posters)[0];
        poster = first;
      }
      poster_url = path.join('/ss', poster);
      elements.poster = "poster=\"" + poster_url + "\" ";
    }
    if (vid_path != null) {
      if (meta.type != null) {
        elements.vid_src = "<source src=\"" + vid_path + "\" type=\"" + meta.type + "\">";
      }
    }
    p("elements: ", elements);
    return elements;
  };

  render_html = function() {
    return fs.readFile(html_template_file, 'utf-8', function(err, string) {});
  };

  module.exports.version = 'try to make video element renderring easy, 2015 0816';

  module.exports.render_video_tag = render_video_tag;

  if (require.main === module) {
    p('no checkings');
  }

}).call(this);
