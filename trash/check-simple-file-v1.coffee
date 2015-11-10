
u      = require "underscore"
path   = require "path"
simple = require "./simple-file-v1.js"

s3folder = require "./folder-v1.js"

p = console.log
stop = () ->
    setTimeout process.exit, 500


# prepare a file meta:

#file = simple.simple_s3_file_obj



test_meta =
    "name": "env-55"
    "size": 1815
    "lastModifiedDate": "2014-10-11T18:40:52.793Z"
    "type": "application/octet-stream"
    "path": "abc/env-55"
    "timestamp": 1413052852794
    "uuid": "f0d8d089-73f8-4471-b748-bbcf1fd9e647"
    "s3key": ".gg.file/abc/env-55"
    "meta_s3key": ".gg.file.meta/abc/f0d8d089-73f8-4471-b748-bbcf1fd9e647"
    #...
    
test_meta_2 =
    "name"  : "test-1015"
    "path"  : "abc/test-1015"
    "owner" : "abc"
    #...

a_1020 = () ->
    # this makes a text file based on test_meta_2
    m = simple.fix_file_meta(test_meta_2)
    t = "I am testing, #{Date.now()}"
    simple.new_plain_file(t, m, (err, json) ->
        p err, json
    )
    #p m
    stop()
#run:
#a_1020()


putup_a_image = () ->

    _meta =
        local_file : "/home/ubuntu/tmp/Uruguay-OKs-Plan.jpg"
        name  : "ub.jpg"
        dir   : "abc"
        owner : "abc"
    _meta.path = path.join(_meta.dir, _meta.name)

    meta = simple.fix_file_meta(_meta)
    file_path = meta.local_file

    simple.put_local_file(file_path, meta, (err, json) ->
        p err, json
    )
    stop()
#run:
#putup_a_image()

    

check_local_plain = () ->
    # meta data for a local plain(text) file:
    _meta =
        local_file : "/home/ubuntu/tmp/ma.js"
        name  : "plain_1"
        dir   : "abc"
        owner : "abc"
    _meta.path = path.join(_meta.dir, _meta.name)

    meta = simple.fix_file_meta(_meta)
    file_path = meta.local_file
    simple.put_local_file(file_path, meta, (err, json) ->
        p err, json
    )
    stop()
#run:
#check_local_plain()


get_simple_file = () ->
    s3folder.retrieve_folder('abc', (err, folder) ->
        p err, folder.get_meta()
        stop()
    )

#run:
#get_simple_file()
    


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
    

file_meta_list = () ->
    #--
    # To show file meta as UL tag
    #--

    #fpath = 'abc/env-55'
    fpath = 'abc/food.txt'
    s3folder.get_file_meta_by_path(fpath, (err, what) ->
        #p err, what
        #p build_ul(what)

        p "what is array: ", u.isArray(what)
        sample_meta = what[0]
        p 'sample meta[name] : ', sample_meta["name"]
        stop()
        #
    )
#file_meta_list()

pass_sample_file_meta = (fpath, callback) ->
    #--
    # This is to give a meta.  Be careful one file name can give meta array.
    # The file name can be set in the follow:
    #--

    #fpath = 'abc/env-55'
    fpath = fpath || 'abc/food.txt'

    s3folder.get_file_meta_by_path(fpath, (err, what) ->
        #p err, what
        #p build_ul(what)

        p "what is array: ", u.isArray(what)
        sample_meta = what[0]
        callback(null, sample_meta)
        #p 'sample meta[name] : ', sample_meta["name"]
        #stop()
        #
    )

pass_sample_file_meta(null, (err, _meta) ->
    p _meta
    stop()
)
    

a1025a = () ->
    fpath = 'abc/food.txt'
    pass_sample_file_meta(fpath, (err, _meta) ->
        # this is the meta we are going to use in checking:
        #p _meta

        simple.simple_s3_file_obj(_meta, (err, obj) ->
            p obj.convert_meta_to_ul()
        )
        stop()
    )

#a1025a()

