
# For HTML tags used in web page.


handlebars = require('handlebars')

p = console.log


Key_value_li = '''
    <li class="key">
        <span class="key">{{{key}}}</span> :
        <span class="value">{{{value}}}</span>
    </li>
'''

File_info_li = '''
    <li class="filename"> <span>Name</span>: {{{name}}} </li>
'''


kv_li = (key, value)->
    tpl = handlebars.compile(Key_value_li)
    context = {
        key:   key
        value: value
    }

    html = tpl(context)
    return html


module.exports.kv_li = kv_li

