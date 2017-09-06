
u    = require("underscore")
jade = require("jade")

myutil = require("../myutils/myutil.js")


nv = """
<<%= tag %>>
    <<%= name_tag %> <%= attributes %> > <%= name %>
    </<%=value_tag %>>
    <%= separator %>
    <<%=value_tag %> <%= value_attributes %> > <%= value %>
    </<%=value_tag %>>
</<%= tag %>>
"""

join_classes = (names, default_class_name)->
    names = names || []

    klass = []
    if u.isEmpty(names)
        klasses = [default_class_name, ]
    else
        klasses = u.union(klass, names)

    return klasses.join(' ')


render_name_value = (input)->
    # @input.name_tag_attr : put more attribute of html tag, it will be included.
    # @input.value_tag_attr :

    tag        = input.tag        or 'li'

    name       = input.name       or 'unknown?'

    nt         = input.name_tag   or 'span'
    nt_attr    = input.name_tag_attr  or ''

    nt_id      = input.name_tag_id or null
    nt_attr   += """ id="#{nt_id}" """ if nt_id

    nt_class_list = input.name_tag_class or []
    nt_class_str  = join_classes(input.name_tag_classes, 'name')
    nt_attr      += """ class="#{nt_class_str}" """

    value      = input.value      or 'unknown?'
    vt         = input.value_tag  or 'span'
    vt_attr    = input.value_tag_attr or ''

    vt_id      = input.value_tag_id or null
    vt_attr   += """ id="#{vt_id}" """ if vt_id

    vt_class_list = input.value_tag_class or []
    vt_class_str  = join_classes(input.value_tag_class, 'value')
    vt_attr      += """ class="#{vt_class_str}" """

    separator  = input.separator  or ' <span class="separator">:</span> '

    # name-value template for coffeescript interpolation:
    html = """
    <#{ tag }>
        <#{ nt } #{ nt_attr  } > #{ name }
        </#{ vt }>
        #{ separator }
        <#{ vt } #{ vt_attr } > #{ value }
        </#{vt }>
    </#{ tag }>
    """

    return html


render_boolean_value = (parts)->
    parts = parts || {}

    tag_name   = parts.tag_name   or 'div'
    id         = parts.id         or myutil.get_uuid()
    name       = parts.name       or id
    access_key = parts.access_key or null
    key_str    = """ accessKey="#{access_key}" """ if access_key

    html = """
        <#{tag_name} class="bool_checkbox">
          <label for="#{name}"> Unique file 
            <input type="checkbox"
                id="#{id}" name="#{name}"
                #{class_str}
                #{key_str}
            >
          </label>
        </#{tag_name}>
        """


# try jade,,, it's a LANGUAGE, hard to fit in it's shoes.
jkv = ()->
    str = '''
    li(id="#{id}" 'class'="#{class}") 
        span.name #{name}
        span.separator :
        span.value #{value}
    '''

    loc = {
        name:  'Name'
        value: 'Value'
        id:    'jkfdlsew'
        'class': 'what you class'
    }

    t = jade.compile(str, {pretty:true})
    p t(loc)



# try jade
nk2li = ()->

    # jade template
    jt = '''
    h1(id="#{id}") This is the title
    p  You said: every one die, #{how.way}
    p  And the fucking #{name} tutorial not telling variable interpolation.
    p
    i  end
    '''


    locals = {
        how: {way:'become old'}
        id:  'id-one'
        name:'the mother fucker'
    }

    opt = {
        pretty:true
    }

    #p(jade.render(jt, {how:how, name:'stupid jade'}))

    t = jade.compile(jt, opt)
    p t(locals)





# do some checkings

p = console.log

check_simple_nv = ()->
    input = {
        name : 'IamJohn'
        value: 'IamBoss'
    }
    p( render_name_value(input))

check_nv_opt = ()->
    input = {
        tag  : 'div'
        name : 'IamJohn'
        name_tag_id : 'i-am-name'
        name_tag_attr : 'data-name="name"'
        value: 'IamBoss'
    }
    p( render_name_value(input))


if require.main == module
    #check_nv_old()
    check_nv_opt()

    #nk2li()
    #jkv()
