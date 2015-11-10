# For a better video player: html/js page renderring
# 2015 0815

u  = require('underscore')
fs = require('fs')
path = require('path')


handlebars = require('handlebars')

p = console.log;

# required variables: width, height, mp4_src, webm_src
#   width:   width="640",
#   height:  height="264",
#   poster:  poster="wher-the-video/can-be/get"
#   vid_src: <source src="<%=mp4_src%>" type='video/mp4'>
#   more_vid_src: <source src="<%=mp4_src%>" type='video/mp4'>
Video_element_html = '''
    <video id="really-cool-video" class="video-js vjs-default-skin" controls
        preload="auto" <%=width%> <%=height%> <%=poster%>
        data-setup='{}'>
        <%=vid_src%>
        <%=more_vid_src%>
        <p class="vjs-no-js">
            Your browser might not support Javascript, 
            This page use HTML5 video
        </p>
    </video>
'''

sample_video_element = '''
    <video id="really-cool-video" class="video-js vjs-default-skin" controls
        preload="auto" width="640" height="264"
        poster="really-cool-video-poster.jpg"
        data-setup='{}'>

        <source src="really-cool-video.mp4" type='video/mp4'>
        <source src="really-cool-video.webm" type='video/webm'>

        <p class="vjs-no-js">
            To view this video please enable JavaScript, and consider upgrading to a web browser
            that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
        </p>
    </video>
'''


render_video_element = (meta)->
    context = meta || {}
    #p('context:', context)

    elements = prepare_elements(meta)

    ## to be replaced by the following function:
    # return render_video_js_video_tag(elements)
    try
        tpl = u.template(Video_element_html)
        html_element = tpl(elements)
    catch err
        p('render vid elements. you got me: ', err)
        return null

    return html_element


# The name got confusing with the above 'render video element' which use meta
# to render the html <video> element.  This one use context, no concern about
# meta to context conversion.
# 2015 0915
render_video_js_video_tag = (context)->
    try
        tpl = u.template(Video_element_html)
        html_element = tpl(context)
    catch err
        p('render v j v t. you got me: ', err)
        return null

    return html_element


# This is the old, when we don't care different video client, and file deliver.
prepare_elements = (meta)->
    p "in prepare elements"
    #p meta
    #p meta.storage
    #p u.pick meta, 'path', 'path_uuid', 'posters', 'aux_path', 'filetype'

    s3key = meta.storage.key
    #vid_src = path.join('/ss/', s3key)
    vid_src = path.join('/file-full-path/', meta.path)

    elements = {
       width:   'width="640"',
       height:  'height="264"',
       poster:  'poster="wher-the-video/can-be/get"'
       vid_src: '<source src="the source of the video" type="video/mp4">'
       more_vid_src: ''
    }

    if meta.posters
        poster = null
        if meta.posters.defaults
            poster = meta.posters.defaults
        else
            first = u.values(meta.posters)[0];
            poster = first

        poster_url = path.join('/ss', poster)
        elements.poster = """poster="#{poster_url}" """

    if vid_src?
        if meta.type?
            elements.vid_src = """<source src="#{vid_src}" type="#{meta.type}">"""


    p "elements: ", elements
    return elements


# To improve prepare_elements, add 'opt', so we can pass in things. 
# Currently, only vid_path, which should be different for path and uuid style.
#
# sample attribute of the elements:
#    width:   'width="640"',
#    height:  'height="264"',
#    poster:  'poster="wher-the-video/can-be/get"'
#    vid_src: '<source src="the source of the video" type="video/mp4">'
#    more_vid_src: ''
prepare_elements_2 = (meta, opt)->
    p "in prepare elements 2"

    # An sample elements
    elements = {
       width:   '',
       height:  '',
       poster:  '',
       vid_src: '',
       more_vid_src: ''
    }

    # Then we populate the elements in need:
    s3key = meta.storage.key
    
    if opt.vid_path?
        vid_path = opt.vid_path
    else
        # I tried to use this one, deliver file with file path, not uuid, 
        # so the extension is kept in the url, and it works:
        #vid_path = path.join('/file-full-path/', meta.path)

        vid_path = path.join('/ss/', s3key)

    if meta.posters
        poster = null
        if meta.posters.defaults
            poster = meta.posters.defaults
        else
            first = u.values(meta.posters)[0];
            poster = first

        poster_url = path.join('/ss', poster)
        elements.poster = """poster="#{poster_url}" """

    if vid_path?
        if meta.type?
            elements.vid_src = """<source src="#{vid_path}" type="#{meta.type}">"""

    p "elements: ", elements
    return elements



# d
render_html = ()->
    fs.readFile(html_template_file, 'utf-8',  (err, string)->
    )


#

module.exports.version = 'try to make video element renderring easy, 2015 0816'
module.exports.render_video_js_video_tag = render_video_js_video_tag
module.exports.render_video_element = render_video_element



## fast checkings

chk_render_vid = ()->
    res = render_video_element()
    p(res)

if require.main is module
    #
    #p 'no checkings'

    chk_render_vid();

