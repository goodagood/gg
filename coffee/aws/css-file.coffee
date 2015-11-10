u = require "underscore"
path = require "path"


folder_module = require "./folder-v5.js"

Goodagood_config_folder   = 'goodagood/etc'
Folder_list_css_file_name = 'folder.css'
File_info_css_file_name   = 'file.css'

p = console.log


read_css_file_of_folder = (folder_path)->
    # Read the folder css file, return a promise, the content is served as string.
    # null will give if no such file in the folder: folder.css
    folder_module.retrieve_folder(folder_path).then (folder) ->
        #p 'got folder\n', folder
        if folder.file_exists(Folder_list_css_file_name)
            #p 'folder css file exists, folder path: ', folder_path
            # This will return a promise
            return folder.read_file_by_name(Folder_list_css_file_name)
        else
            #p 'folder css file not exists: ', folder_path
            Promise.resolve(null)


filter_out_user_name = (name)->
    # As all folder in goodagood is with formation: user-name/dir-a/sub-dirs
    # So we can filter out username from folder path, if needed.
    # The return value will be 'user name' or null.

    username = name || ''
    return null if not u.isString(user_name)
    return null if u.isEmpty(user_name)

    # This is extra worries when the path starts with '/'
    while(user_name.indexOf('/') == 0)
        user_name = user_name[1..-1]

    if(user_name.indexOf('/') > 0)
        user_name = user_name.split("/")[0]
        p('In "filter out user name", user name is: ', user_name)

    return user_name

    
read_default_css_file_of_folder = (name_or_path)->
    user_name = filter_out_user_name(name_or_path)
    return Promise.resolve(null) if user_name is null or user_name is ''
    default_folder   = path.join(user_name, Goodagood_config_folder)
    read_css_file_of_folder(default_folder)


# Try to read css style for folder, current folder first, then defaults
read_folder_css = (folder_path)->
    read_css_file_of_folder(folder_path).then((css_str)->
        if css_str is null or css_str is ''
            p 'go for default css file.'
            return read_default_css_file_of_folder(folder_path)
        else
            return css_str
    )


read_css_file_for_file_info = (folder_path)->
    file_name = File_info_css_file_name

    folder_module.retrieve_folder(folder_path).then((folder) ->
        if folder.file_exists(File_info_css_file_name)
            return folder.read_file_by_name(file_name)
        else
            Promise.resolve(null)
    )


read_default_css_file_for_file_info = (name_or_path)->
    user_name = filter_out_user_name(name_or_path)
    return Promise.resolve(null) if user_name is null or user_name is ''
    default_folder = path.join(user_name, Goodagood_config_folder)
    return read_css_file_for_file_info(default_folder)


read_file_css = (folder_path)->
    read_css_file_for_file_info(folder_path).then((css_str)->
        if css_str is null or css_str is ''
            return read_default_css_file_for_file_info(folder_path)
        else
            return css_str
    )


module.exports.read_css_file_of_folder = read_css_file_of_folder
module.exports.read_default_css_file_of_folder = read_default_css_file_of_folder
module.exports.read_folder_css = read_folder_css

module.exports.read_css_file_for_file_info = read_css_file_for_file_info
module.exports.read_default_css_file_for_file_info = read_default_css_file_for_file_info
module.exports.read_file_css = read_file_css


# -- checkings -- #
tool = require "../myutils/test-util.js"

check_read_css = (name)->
    name = name || 'abc'
    read_css_file_of_folder(name).then (str)->
        p 'content should be: ', str
        tool.stop()

check_read_default_fold_css = (name)->
    name = name || 'abc'
    read_default_css_file_of_folder(name).then (str)->
        p "default css file:\n", str
        tool.stop()


check_read_file_info_css = (username)->
    username = username || 'abc' # root path of user == username
    read_css_file_for_file_info(username).then((what)->
    ).then(()->
        tool.stop()
    )

check_read_default_file_css = (user_name)->
    user_name = user_name || 'abc'
    read_default_css_file_for_file_info(user_name).then((css)->
        p css
        tool.stop()
    )




#  --- do some immediate test:
if require.main is module
  
    #check_read_css('abc')
    check_read_default_file_css()
    #check_read_default_fold_css()


    # close the process.
    #setTimeout (->
    #    process.exit 1
    #    return
    #), 3000


