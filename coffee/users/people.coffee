
# Try to update aws/social.js
#   To use plain file instead of invented 'json file type'.
#
#   New file will be used to keep old things not been destroyed.

u    = require "underscore"
path = require "path"

folder_module = require "../aws/folder-v5.js"
social = require "../aws/social.js"
Promise = require("bluebird")

bucket   = require "../aws/bucket.js"
user     = require "./a.js"

p    = console.log

# The file changed to 'v1':
People_file_name   = '.gg.people.v1.json'
config_folder_name = 'goodagood'
#people_file        = path.join(config_folder_name, People_file_name)
# the path of people file: people_file_path would be path.join(user_name, people_file)


init_people_file = (username, callback)->
    # init an empty file, if file exists, it will not over-write.
    content = {
        current : [], # or recent
        friends : [],
        people  : [],
        teams   : [],
        groups  : {},
    }

    config_folder_path = path.join(username, config_folder_name)
    p('config folder path is: ', config_folder_path)

    return folder_module.retrieve_folder(config_folder_path).then( (folder)->
        #p('retrieved folder: ', typeof folder)

        meta = folder.get_meta()
        #p('folder meta path: ', meta.path)
        content.people.push(meta.owner.username) if meta.owner? and meta.owner.username?
        content.people.push(meta.owner) if(typeof meta.owner == 'string')

        if( not folder.file_exists(People_file_name))
            p('init people file : ', username)
            text = JSON.stringify(content, null, 4)
            folder.write_text_file(People_file_name, text).then((job_json)->
                callback(null, job_json)
            )
        else
            callback(null, null)
    )



make_people_manager_for_user = (Username)->
    Obj = {}
    Folder_path = path.join(Username, config_folder_name)
    Folder = null

    Empty_content = {
        current : [],
        friends : [],
        people  : [],
        teams   : [],
        groups  : {},
    }

    init_folder = ()->
        folder_module.retrieve_folder(Folder_path).then(
            (folder)->
                Folder = folder
                return Folder
        )

    is_file_initialized = (callback)->
        folder_module.retrieve_folder(Folder_path).then( (folder)->
            meta = folder.get_meta()
            #p 'in "is file ini...": ', meta.path

            exists = folder.file_exists(People_file_name)
            #p 'in "is file ini... exists": ', exists
            callback(null, exists)
        )

    is_file_initialized_async = Promise.promisify is_file_initialized

                
    get_people_file_obj = () ->
        config_folder_path = path.join(Username, config_folder_name)
        Folder.promise_to_one_file_obj(People_file_name)
            #folder_module.retrieve_folder(Folder_path).then( (folder) ->
            #    folder.get_one_file_obj People_file_name, callback
            #)

    #  We need update, not write!
    update_file = (json, callback)->
        text = JSON.stringify(json)
        get_people_file_obj().then((file)->
            meta = file.get_meta()
            bucket.write_text_file(meta.storage.key, text, (err,reply)->
                meta.timestamp = Date.now()
                Folder.add_file_save_folder(meta, callback)
            )
        )

    promise_to_update_file = Promise.promisify update_file


    know = (some_name)->
        # Am I know some_name?
        return false

    recognize = (name)->
        # recognize then: true/false
        get_json().then((j)->
            ind = j.people.indexOf(name)
            if ind < 0
                return false
            else
                return true
        )

    get_text = ()->
        throw 'no folder? when "get text"' if not Folder

        #debuging
        #meta_ = Folder.get_meta()
        #p 'debuging, folder meta path', meta_.path

        # this returns a promise:
        Folder.read_text_file(People_file_name)

    get_json = ()->
        get_text().then((text)->
            #p 'got text:\n', text
            json = JSON.parse(text)
        )

    add_people = (name)->
        get_json().then((j)->
            #p 'json in add people:\n', j
            j.people.push(name) if j.people.indexOf(name) < 0
            #j.people = u.uniq(j.people) #.
            j
        ).then((j)->
            promise_to_update_file(j)
        )

    del_people = (name)->
        get_json().then((j)->
            #p 'json in dell people:\n', j

            ind = j.people.indexOf(name)
            # return if there is no name need to del
            return j if ind < 0

            j.people.splice(ind, 1)
            j
        ).then((j)->
            promise_to_update_file(j)
        )

    add_recent = (name)->
        get_json().then((j)->
            #p 'json in add people:\n', j
            j.current.splice(0,0, name)
            j.current = u.unique(j.current)
            #j.people = u.uniq(j.people) #.
            j
        ).then((j)->
            promise_to_update_file(j)
        )

    get_recent = (number)->
        number = number || 1
        number = 1 if not u.isNumber(number)
        number = 1 if(number < 1)

        get_json().then((j)->
            return u.first(j.current, number)
        )


    _pick_some = (number)->
        #p 'in - pick some '
        number = number or 10
        a_few = []

        get_json().then((j)->
            a_few = u.first(j.current, number)
            #p 'a few? ', a_few

            # If not enough, add more from 'friends'
            if a_few? and a_few.length?
                len = a_few.length
            else
                p 'fuck, why not a few or length'
                len = 0
            if(len < number)
                more = number - len
                get_more = u.first(j.friends, more)
                if(not u.isEmpty(get_more))
                    union = u.union(a_few, get_more)
                    a_few = u.uniq(union)
                    len = a_few.length

            # If not enough, add more from 'people'
            #len = a_few.length
            if a_few? and a_few.length?
                len = a_few.length
            else
                #p 'fuck, why not a few or length'
                len = 0
            if(len < number)
                more = number - len
                get_more = u.first(j.people, more)
                if(not u.isEmpty(get_more))
                    union = u.union(a_few, get_more)
                    a_few = u.uniq(union)
                    len = a_few.length

            # make sure we have at least one, 'goodagood'
            a_few.push('goodagood') if(u.isEmpty(a_few))

            return a_few
        )


    get_a_few = (number)->
        #p 'in get a few...'
        number = number or 10
        a_few = []

        is_file_initialized_async().then((yes_)->
            if(yes_)
                #
                #p 'in get a few... yes-'
                _pick_some(number)
            else
                #p 'in get a few... else-'
                # make sure we have at least one, 'goodagood'
                if(u.isEmpty(a_few))
                    a_few.push('goodagood')
                    a_few.push('abc')
                return Promise.resolve(a_few)
        )



    Obj.init_folder = init_folder
    Obj.Folder      = Folder # This is useless
    Obj.is_file_initialized = is_file_initialized
    Obj.get_people_file_obj = get_people_file_obj
    Obj.know = know #d
    Obj.recognize = recognize
    Obj.get_json = get_json
    Obj.add_people = add_people
    Obj.del_people = del_people
    Obj.add_recent = add_recent
    Obj.get_recent = get_recent
    Obj.get_a_few  = get_a_few

    init_folder().then((f)->
        Obj.Folder = f
        return Obj
    )




# This is duplicated with 'init people file'
init_people_manager = (username, callback)->
    make_people_manager_for_user(username).then((manager)->
        manager.is_file_initialized( (err, yes_)->
            return callback(null, null) if yes_

            p 'In "init people manager", start to init people file for ', username

            init_people_file(username, callback)
            # callback get: (err, people_json)
        )
    )

promise_to_init_people_manager = Promise.promisify init_people_manager


module.exports.make_people_manager_for_user      = make_people_manager_for_user
#module.exports.promise_to_get_people_manager     = promise_to_get_people_manager
module.exports.init_people_file      = init_people_file

module.exports.init_people_manager = init_people_manager
module.exports.promise_to_init_people_manager = promise_to_init_people_manager


#module.exports.get_people_file_obj   = get_people_file_obj


#module.exports.add_people            = social.add_people
#module.exports.add_people_batch      = social.add_people_batch
#module.exports.add_current_people    = social.add_current_people
#module.exports.add_current_people_batch = social.add_current_people_batch
#module.exports.delete_current_people = social.delete_current_people
#module.exports.delete_current_people_batch = social.delete_current_people_batch
#
#module.exports.get_people_data       = social.get_people_data
#module.exports.write_people_file_obj = social.write_people_file_obj
#module.exports.get_people_list       = social.get_people_list
#module.exports.get_people_list_ul    = social.get_people_list_ul
#module.exports.get_current_people_list_ul = social.get_current_people_list_ul
#module.exports.get_current_people    = social.get_current_people


