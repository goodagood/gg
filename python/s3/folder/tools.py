
import os

from . import getter


def list_sub_pathes(_path):
    folder = getter.folder(_path)
    files  = folder.get_cache()['files']

    sub_pathes = []
    for name in files.keys():
        sub_pathes.append(os.path.join(_path, name))

    return sub_pathes


def list_tools(username, fo):
    '''
    list available tools for folder object, for webpage user.
    '''
    meta  = fo.meta
    tools = []


    if fo.control.can_be_written_by(username):
        tools.append(single_uploader(meta))

    return tools


def single_uploader(meta):
    href = os.path.join('/upload/bare-single', meta['path'])

    a = """
        <a class="folder_tool single_uploader" href="{href}" >
            single uploader
        </a>
        """.format(href=href)

    single_uploader = dict(
            name = 'single_uploader',
            url  = href,
            a    = a,
            li   = """<li class="tools item"> %s </li>"""%a
            )
    return single_uploader

