
def ul(json, level=0):
    ul_tpl = """
    <ul class="json {level}">
        {li_elements}
    </ul>
    """

    li_tpl = """
        <li class="name-value">
            <span class="name">
                {name}
            </span>
            <span class="value">
                {value}
            </span>
        </li>
    """

    #elements = [li_tpl.format(name=name, value=json[name]) for name in json.keys()]

    elements = []
    for k in list(json.keys()):
        v = json[k]
        if type(v) is dict and level < 5:
            ele = ul(v, level+1)
        else:
            ele = li_tpl.format(name = k, value = v)

        elements.append(ele)

    lis = "\r\n".join(elements)


    return ul_tpl.format(li_elements = lis, level='level_'+str(level))


## Use <dl> to represent name-value list:
## Use <ol> to represent array (python list):

dl_tpl = """
    <dl class="json {level}">
        {dt_dd_list}
    </dl>
"""

dt_tpl = """
    <dt>
        {name}
    </dt>
"""

dd_tpl = """
    <dd>
        {value}
    </dd>
"""

ol_tpl = """
    <ol class="sub {level}">
        {item_list}
    </ol>
"""

def dl(j):
    '''
    Make <dl> from j (json) data, j is not array, it can contains array.
    '''

    return ''


if __name__ == "__main__":
    j = {
            #"a": 'i am a',
            #"b": 'i am b',
            #'dc': 99.8,
            'db': {
                'one': 1,
                'two': 2
                },
            #'da': 32.8,
            #'e': 'eeeeeee',
            "farray": ['a', 'bb', 'dd']
            }
    a = ul(j)
    print(a)
    pass
