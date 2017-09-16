from collections import defaultdict


def make_tag(meta):
    '''
    '''

    kind = size = ''

    if 'size' in meta:
        size = meta['size']

    if 'type' in meta:
        kind = meta['type']
    elif 'filetype' in meta:
        kind = meta['filetype']
    else:
        kind = ''

    li = fill_li_tag(name=meta['name'],
            size=size, kind=kind)
    return li


def fill_li_tag(arg):
    ''' Render the template, all value defaults to '', but at least give
        a name to make it sensible.
    '''
    tpl = """
    <li {li_css_class}>
        {name_part}
        {size_span}
        {type_span}
        {time_span}
        {thum_span}
        {owner_span}
        {permission_span}
    </li>
    """

    tpl_vars = dict(
            name_part = '',
            li_css_class = '',
            size_span= '',
            type_span= '',
            time_span= '',
            thum_span= '',
            owner_span= '',
            permission_span= ''
            )

    tpl_vars.update(arg)

    name_part = make_name_part(arg)
    tpl_vars['name_part'] = name_part

    if 'size' in arg:
        tpl_vars['size_span'] = """
            <span class="size">{}</span>""".format(arg['size'])

    if 'type' in arg:
        tpl_vars['type_span'] = """
            <span class="type">{}</span>""".format(arg['type'])

    return tpl.format(**tpl_vars)


def make_name_part(meta):
    if 'name' not in meta:
        raise Exception('no name contained')

    tpl_url = """
        <a href="{url}">
            <span class="name {class_for_name_span}">{name}</span>
        </a>
        """

    tpl_name = """
            <span class="name {class_for_name_span}">{name}</span>
        """

    tpl_vars = dict(class_for_name_span = '')
    tpl_vars.update(meta)

    if 'url' in meta:
        return tpl_url.format(**tpl_vars)
    else:
        return tpl_name.format(**tpl_vars)



## some test and fiddles
def foo(*args, **kwargs):
    print args
    print kwargs


if __name__ == "__main__":
    ''
