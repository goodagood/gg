
u       = require "underscore"
#Promise = require "bluebird"
path    = require "path"
assert  = require "assert"
async   = require "async"

folder_module = require "./folder-v5.js"

myconfig =  require("../config/config.js")
user    = require('../users/a.js')
people  = require("../users/people.js")

myuser = require('../myuser.js')


p = console.log
stop = (seconds) ->
    seconds = seconds || 1
    milli_sec = seconds * 1000
    setTimeout(process.exit, milli_sec)


# build folders,
# init files: people, member, folder.css, file.css
init_home_folder_12_18 = (username)->
    # s3key not used:
    s3key = path.join(myconfig.meta_file_prefix, username) #? meta_file_prefix?

    folder_opt = {}
    folder_opt['path'] = username
    folder_opt['name'] = username # Don't forget these two.
    folder_opt['parent-dir'] = ''
    folder_opt.owner = username
    folder_opt.permission = {owner: 'rwx', other:'', group:''}
    folder_opt['create-timestamp'] = Date.now()  #mili-seconds
    folder_opt['timestamp'] = Date.now()  #stamp when modified

    Home = null
    Goodagood = null

    folder_module.build_new_folder(folder_opt).then( (folder)->
        #p 1
        Home = folder
        Home.add_folder('goodagood')
    ).then( (g)->
        #p 2
        Goodagood = g
        gm = g.get_meta()
        #p 'goodagood meta: ', gm
        Goodagood.add_folder('message')
    ).then( (msg)->
        #p 3
        #p 'msg obj: ', Object.keys(msg).sort()
        Goodagood.add_folder('etc')
    ).then( ()->
        Goodagood.promise_to_list_files_and_save()

    ).then( ()->
        Home.add_folder('public')
    ).then( ()->
        Home.promise_to_list_files_and_save()
    )
    ## build file list, save.


init_one_home = (username)->
    username = username || 'aa'

    return init_home_folder_12_18(username).then((what)->
        #p 'after got home: \n', what
        return people.promise_to_init_people_manager(username)
    )



find_name_home = (username, callback)->
    # To find user name  and home folder exists

    Meta = null
    myuser.is_name_occupied(username, (err, occupied)->
        (console.log "user name, #{username}, not exist?") if(not occupied)
        return callback("user name, #{username}, not exist?", null) if(not occupied)
        folder_module.is_folder_exists(username, (err, exists)->
            (console.log "user, #{username}, home folder not exist?") if(not exists)
            return callback("user, #{username}, home folder not exist?", null) if(not exists)

            folder_module.retrieve_folder(username).then((folder)->
                Meta = folder.get_meta()
                smell = 0
                smell += 1 if not Meta.name
                smell += 1 if not Meta.path
                smell += 1 if not Meta.renders?
                smell += 1 if not Meta.files?
                smell += 1 if not Meta.uuid?

                smell += 1 if Meta.error

                # there is no ternary statement in coffeescript
                err = if smell > 0 then 'something wrong' else null
                callback(err, folder)

            )
        )
    )


show_name_tangle = (meta)->
    p "meta.meta_s3key #{meta.path}"
    p "meta.folder_meta_s3key #{meta.path}"


check_home_folder = (username)->
    # simply check name, home, public, ... exists.

    Home = null

    #Goodagood = null

    find_name_home(username, (err, folder)->
        #p "got #{username}'s home folder: \n", folder if not err
        p "got #{username}'s home folder, err? : ",  err
        stop() if err

        Home = folder
        Err  = null

        # make sure goodagood exists:
        name = path.join(username, 'goodagood')
        folder_module.is_folder_exists(name, (err, yes_)->
            return Err = err if not yes_
            p "folder: #{name} exists."

            msg = path.join(name, 'message')
            folder_module.is_folder_exists(msg, (err, yes_)->
                return Err = err if not yes_
                p "folder: #{msg} exists."
            )

            etc = path.join(name, 'etc')
            folder_module.is_folder_exists(etc, (err, yes_)->
                return Err = err if not yes_
                p "folder: #{etc} exists."
            )

            #name = path.join(username, 'public')
        )


    stop(10)
    )


    #folder_module.build_new_folder(folder_opt).then( (folder)->
    #    #p 1
    #    Home = folder
    #    Home.add_folder('goodagood')
    #)
        #.then( (g)->
    #    #p 2
    #    Goodagood = g
    #    gm = g.get_meta()
    #    #p 'goodagood meta: ', gm
    #    Goodagood.add_folder('message')
    #).then( (msg)->
    #    #p 3
    #    #p 'msg obj: ', Object.keys(msg).sort()
    #    Goodagood.add_folder('etc')
    #).then( ()->
    #    Goodagood.promise_to_list_files_and_save()

    #).then( ()->
    #    Home.add_folder('public')
    #).then( ()->
    #    Home.promise_to_list_files_and_save()
    #)
    # ## build file list, save.



module.exports.init_home_folder    = init_home_folder_12_18
module.exports.init_one_home    = init_one_home


# -- checkings -- #


check_init_one_home = (username)->
    username = username || 'ab'
    init_one_home(username).then(()->
        stop()
    )

    
user = require "../users/a.js"

init_many_home = (include, exclude)->
    # include, exclude: array
    include = include || []
    exclude = exclude || []

    user.get_user_names(  (err, names)->
        assert(u.isArray(names))

        list = u.union(names, include)
        list = u.difference(list, exclude)
        list = u.uniq(list)
        #p "err, names: ", err, names
        #p "err, list: ", err, list.sort()

        # build function list:
        fun_list = list.map(
            (name)->
                fun = (callback)->
                    init_one_home(name).then( (what)->
                        callback(null, what)
                    )
                return fun
        )

        #p 'fun list: ', fun_list
        #stop()

        async.series(fun_list, ()->
            stop()
        )

    )




if(require.main == module)
    #
    #check_init_one_home('ac')
    #init_many_home(['aa'], ['abc'])

    check_home_folder('tmpab')


