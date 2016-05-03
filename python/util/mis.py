
import uuid

def getuuid():
    return str(uuid.uuid4())

def getroot(_path):
    return _path.split('/')[0]

def simple_li(file_meta):
    '''
    '''
    #print('simple li ', file_meta)
    tpl = """
    <li class="{kind}">
        <span class="name">{name}</span>
        <span class="size">{size}</span>
        <span class="type">{kind}</span>
    </li>
    """

    kind = size = ''

    if 'size' in file_meta:
        size = file_meta['size']

    if 'type' in file_meta:
        kind = file_meta['type']
    elif 'filetype' in file_meta:
        kind = file_meta['filetype']
    else:
        kind = ''

    li = tpl.format(name=file_meta['name'],
            size=size, kind=kind)
    return li

