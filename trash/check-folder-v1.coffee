
u        = require 'underscore'
fs       = require 'fs'

s3folder = require './folder-v1.js'
tools    = require './tools-cof.js'


p      = console.log


# the folder list and a single one that can be used in tests
folder_list = ['abc', ]
#
folder_name = 'abc'

file_path = 'abc/goodagood'


a1009 = () ->
    # check make_s3folder
    s3folder.make_s3folder folder_name, (err, folder) ->
        folder.retrieve_old_folder_meta (err, meta) ->
            #m = folder.get_meta()
            p meta.file_names
            tools.exit()

#a1009()


t2nd = () ->
    s3folder.retrieve_folder(folder_name, (err, folder) ->
        p err if(err)
        p folder.get_meta()

        tools.exit()
    )

#t2nd()



get_file_a = () ->
    file_path = "abc/food.txt"
    s3folder.get_file_meta_by_path(file_path, (err, fmeta) ->
        p fmeta

        tools.exit()
    )

#get_file_a()


get_file_uuid = () ->
    fpath = 'abc/env-55'
    s3folder.get_file_uuid(fpath, (err, fmeta) ->
        p fmeta

        tools.exit()
    )

#get_file_uuid()


get_by_path = () ->
    #fpath = 'abc/env-55'
    fpath = 'abc/food.txt'
    s3folder.get_file_meta_by_path(fpath, (err, what) ->
        str = JSON.stringify(what, null, 4)

        fs.writeFile '/tmp/uuids', str, (err) ->
            #fs.writeFile '/tmp/uuids', 'fuck', (err) ->
            p err if err
            throw err
        #p err, JSON.stringify(what, null, 4)
        p "err: #{err}"
        u.each what, (e) ->
            p e.name, e.path, e.uuid
        
        tools.exit()
    )
#get_by_path()

keep = (element, names) ->
    return element if u.isEmpty names
    _meta = {}
    _meta[name] = element[name] for name in names
    _meta

build_ul = (hash) ->
      ul = "<ul> \n"
      u.each(hash, (val, key) ->
          li = '<li class="key"> <span>' + key.toString() + "</span> : "

          if (u.isArray(val))
              li += build_ul(val)
          else if(u.isObject(val))
              li += build_ul(val)
          else
              li += '<span class="value">' + val.toString() + '</span>'
          
          li += "</li>\n"
          ul += li + "\n"
      )

      ul += "</ul>\n"
      return ul
    
test_build_ul = () ->
    j = {
        a : 1
        b : 2
        c : [1,2,3]
        d : {
            da : 1,
            db : 2
        }
        e : "i am e"
    }
    p build_ul j
    tools.exit()
#test_build_ul()

file_meta_list = () ->
    #fpath = 'abc/env-55'
    fpath = 'abc/food.txt'
    s3folder.get_file_meta_by_path(fpath, (err, what) ->
        #p err, what
        p build_ul(what)

        tools.exit()
        #
    )

file_meta_list()


