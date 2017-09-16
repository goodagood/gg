
tpl  = require("../myutils/tpl.js")


# variables: username 
header_ls2 = """
<header>
    <div id="header" class="goodogood-header">
        <h1 class="logo">
            <span class="goodogood-logo">
                <a href="http://goodogood.me/">goodogood</a>'
            </span>
            <span class="username">
                {{{username }}}
            </span>
        </h1>
        <a class="to_nav" href="#primary_nav"> <i class="fa fa-list"></i> Menu </a>
    </div>
</header>
"""
module.exports.header_ls2 = header_ls2
module.exports.render_header_ls2 = (contexts)->
    tpl.render_str(header_ls2, contexts)


