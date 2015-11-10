
path       = require("path")

css        = require('../aws/css-file.js')
mytemplate = require('./template.js')
filelist   = require('../hrouters/file-list-v2.js')


p = console.log
stop = (time) ->
    time = time || 500
    setTimeout process.exit, time


assemble_file_info_html = ( meta, info_html, callback) ->
    username = meta.owner
    if meta.dir?
        cwd = meta.dir
    else
        cwd = path.dirname(meta.path)
    
    css.read_file_css(cwd).then( (frame_css)->
        cwd_chain = filelist.path_to_chain(cwd)
        contexts = {
            body : {
                #user_folder_ul : ul_file_list,
                file_meta : info_html,
                cwd : cwd,
                cwd_chain : cwd_chain,
                file_name : meta.name,
            },
            header : { username : username },
            frame: {css : frame_css}
        }

        #p('user name in "assemble file info html" ', username)
        #p('cwd name in "assemble file info html" ', cwd)
        p('file meta in "assemble file info html" ', info_html)
        
        html_elements = {
            body   : 'file-info-a.html',
            header : 'goodheader.html',
            navbar : 'people-file-navtabs.html',
            script : 'file-info-a-script.html',
            frame  : 'frame-a.html',
        }
        
        mytemplate.assemble_html(html_elements, contexts,  (html) ->
            callback(html)
        )

    )
    


module.exports.assemble_file_info_html  = assemble_file_info_html
