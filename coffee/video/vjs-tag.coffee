# Make <video> element used by video.js, video source will be file path, not uuid
# 2015 0822

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
#   mp4_src: <source src="<%=mp4_src%>" type='video/mp4'>
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


render_video_tag = (meta)->
    context = meta || {}
    #p('context:', context)

    elements = prepare_elements_2(meta)

    try
        tpl = u.template(Video_element_html)
        html_element = tpl(elements)
    catch err
        p('render vid elements. you got me: ', err)
        return null

    return html_element



# To improve the old 'prepare_elements', add 'opt', so we can pass in things. 
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
    
    if opt? and opt.vid_path?
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




render_html = ()->
    fs.readFile(html_template_file, 'utf-8',  (err, string)->
    )


module.exports.version = 'try to make video element renderring easy, 2015 0816'
module.exports.render_video_tag = render_video_tag



## fast checkings

#chk_render_vid = ()->
#    res = render_video_tag()
#    p(res)

if require.main is module
    #
    p 'no checkings'

    #chk_render_vid();

