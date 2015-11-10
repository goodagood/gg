#
# suppose to make string manipulation a little easier by coffeescript
#

u = require "underscore"
p = console.log




image_file_li_tpl_str = """
    <li class="file video-file">
        <input type="checkbox" name="path_uuid[]" value="<%=path_uuid%>" />

        <span class="label label-success"></span>
            <span class="glyphicon glyphicon-facetime-video"></span>
            <%=name%>

            <a class="fileinfo-link" href="/fileinfo-pathuuid/<%=path_uuid%>">
                <%=name%>
            </a>

        <a href="<%= delete_href%>"> <span class="glyphicon glyphicon-trash"> </span>delete</a>
        <ul class="list-unstyled">
            <li>
                <a href="/viewvid/<%=path_uuid%>">
                    <span class="glyphicon glyphicon-play"></span>play</a>
            </li>


          <li> <% Date(parseInt(timestamp)) %> </li>
        </ul>
    </li>
    
"""


render_li = (meta)->
    # required attributes:
    # name, path_uuid, delete_href timestamp

    defaults =
        name : '?'
        path_uuid : '?'
        delete_href : '?'
        timestamp : 0

    shorts = u.pick(meta, 'name', 'path_uuid', 'delete_href', 'timestamp')
    shorts = u.defaults(shorts, defaults)
    p('shorts: ', shorts)
    try
        li_tpl = u.template image_file_li_tpl_str
        li = li_tpl(shorts)
    catch e
        p('e: ', e)
        li = '<i>??</i>'
    
    #p('li: ', li)
    return li



module.exports.render_li = render_li

## fast checkings


if require.main is module
    #
    p 'no checkings'
