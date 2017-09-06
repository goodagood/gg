
# For handlebars renderring


fs         = require('fs')
path       = require('path')

handlebars = require('handlebars')

tpl        = require("../myutils/tpl.js")

p = console.log


Md_with_local_tpl = 'mdhtml.html'




fill_in_markdown = (template_name, context, callback)->
    context   = context or {}

    file_path = path.join(__dirname, template_name)
    tpl.render_template(file_path, context, callback)



module.exports.fill_in_markdown = fill_in_markdown


## -- checkings 


c_file_in_m = ()->
    context = {
        html_of_markdown : '<h1> i am markdown </h1>'
        ok: '--ok--'
    }
    fill_in_markdown  'mdhtml.html', context, (err, html)->
        p err, html.slice(0,300)
        fs.writeFile  '/tmp/mdtest.html', html, 'utf-8', (err, write)->
            p 'file write, ', err


if require.main == module
    #p __dirname
    c_file_in_m()
