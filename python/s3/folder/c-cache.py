
import os

import cache_in as tmp_solution
import getter
import users_a as users

def gather_folders(root_path, folist):
    folder = getter.folder(root_path)
    folist.append(folder)

    finfos = folder.get_infos_of_ns_files()
    #print ('file infos ', finfos)
    for info in finfos:
        #print('info ', info)
        if 'type' in info:
            if info['type'] == 'folder':
                sub_path = os.path.join(root_path, info['name'])
                #print('sub path: ', sub_path)
                gather_folders(sub_path, folist) # Recursive, selfcalling

def render_one_folder(folder):
    tmp_solution.ul_from_cache(folder)
    folder.save_meta()

def render_from_cwd(cwd):
    folist = []
    gather_folders(cwd, folist)
    [render_one_folder(folder) for folder in folist]


def render_all_users():
    names = users.get_all_names()
    for name in names:
        print('going to do for: ', name)
        render_from_cwd(name)

def render_path(_path):
    folder = getter.folder(_path)
    tmp_solution.cache_render_from_ns(folder)

# recursive and twist the yield
def yield_folders(root_path):
    folder = getter.folder(root_path)
    yield folder

    finfos = folder.get_infos_of_ns_files()
    for info in finfos:
        if 'type' in info:
            if info['type'] == 'folder':
                sub_path = os.path.join(root_path, info['name'])

                # Recursive, selfcalling
                # this would be twisting
                for f in yield_folders(sub_path):
                    yield f
                # Recursive, selfcalling


if __name__ == "__main__":
    folist = []
    #render_one_folder(abc)
    #render_from_cwd('tmp')
    #gather_folders('abc', folist)
    #for fo in folist:
    #    print fo.get_meta()['name']

    #render_all_users()

    #tmp = getter.folder('tmp')
    #render_one_folder(tmp)

    ##render_path('tmp/public')
