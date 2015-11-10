
tpl = require("../myutils/tpl.js")

File_list_a = """

    <ul id="file-listing-ul" class="folder-list list-unstyled <%= user_role %>" data-cwd="<%= folder_path %>">
        <%= file_list %>
    </ul>

"""


render_file_list = (context, callback)->
    tpl.u_render_str(File_list_a, context, callback)




module.exports.render_file_list = render_file_list


# checkings #

p = console.log

chk_r = ()->
    context = 
        file_list : ''
        user_role : ''
        folder_path : ''

    render_file_list(context, (err, ul)->
        p err, ul
        process.exit()
    )

if require.main is module
    chk_r()
