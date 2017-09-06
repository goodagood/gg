
folder    = require('../aws/folder-v1.js')
file_list = require('./file-list-v1.js')

folder.retrieve_folder 'abc/goodagood', (err, folder_obj) ->
    file_list.ls_for_owner 'abc', folder_obj, (err, html) ->
        console.log err, html
        foo()
        exit()

exit = (time) ->
    time = time || 500
    console.log "\n --- goint to exit at #{time}"
    setTimeout(process.exit, time)

foo = () ->
    console.log '-- foo --'

