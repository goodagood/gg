
# folder-v2, folder-v3 should not be used. 
#
# One thing is happening: the folder get changed by others. 11 15, 2014

u       = require "underscore"
Promise = require "bluebird"
path    = require "path"
async   = require "async"

bucket  = require('./bucket.js')
s3file  = require "./simple-file-v1.js"

myconfig   =  require("gg-credentials").config
old = require "./folder-v1.js"

p = console.log

promised_make_s3folder   = Promise.promisify old.make_s3folder
promised_retrieve_folder = Promise.promisify old.retrieve_folder

# ! global datas:
meta = {}
obj  = {}
ready= 0
_folder_css_file_name = ".gg.folder.css"
_meta_css_file_name   = ".gg.meta.css"


make_s3folder_v4 = (folder_path, callback) ->
    promised_retrieve_folder(folder_path).then(
        (folder) ->
            # do things to modify the folder object:
            # ...

            _modify_folder_object(folder)

            # put it module global:
            meta = folder.get_meta()
            obj  = folder
            ready= 1
            return obj
    ).catch(
        (err) ->
            throw err
    )



_modify_folder_object = (_obj) ->
    _obj.get_file_obj_by_uuid  = _get_file_obj_by_uuid
    _obj.get_file_objs_by_name = _get_file_objs_by_name
    _obj.get_uuids             = _get_uuids
    _obj.read_file_by_name     = _read_file

    _obj.read_text_file        = _read_file
    _obj.write_text_file       = _write_text_file


_read_file = (filename)->
    throw 'global objects must be ready.' if ready < 1

    return new Promise( (resolve, reject)->
        obj.get_file_objs_by_name(filename, (err, objs)->
            if objs.length >= 1
                file = objs[0]
                file.read_to_string( (str)->
                    resolve(str)
                )
            else
                reject(err)
        )
    )
    

_write_text_file = (filename, text)->
    throw 'global objects must be ready.' if ready < 1

    file_meta = {
        name : filename
        path : path.join(meta.path, filename)
        size : text.length
        owner: meta.owner
    }
    m = s3file.fix_file_meta(file_meta)
    return new Promise( (resolve, reject)->
        s3file.new_plain_file(text, m, (err, what)->
            if err
                reject(err)
            else
                resolve(what)
        )

    )
    #s3file.new_plain_file(text, file_meta, callback)




_get_file_obj_by_uuid = (uuid) ->
    throw 'global objects must be ready: obj, meta, ready' if ready < 1

    throw "no such uuid in meta.files #{uuid}" if( not meta.files[uuid] )

    file_meta = meta.files[uuid]
    s3file.promised_simple_s3_file_obj(file_meta).then(
        (file_obj) ->
            file_obj
    )

_uuid_to_file_obj = (uuid, callback) ->
    file_meta = meta.files[uuid]
    s3file.simple_s3_file_obj(file_meta, callback)


_get_uuids = (name) ->
    #p "meta in get uuids: ", meta
    uuid_list = meta.file_names[name]
    return uuid_list


_get_file_objs_by_name = (name, callback) ->
    # one name can give a list of file objects.
    throw 'global objects must be ready: obj, meta, ready' if ready < 1

    uuid_list = _get_uuids(name)
    throw "no file found by #{name}" if( not uuid_list )
    
    async.map(uuid_list, _uuid_to_file_obj, callback)

# Modify the old, retrieve only one.
retrieve_file_obj = (file_path, callback) ->
    folder_path = path.dirname(file_path)
    filename    = path.basename(file_path)
    #console.log(folder_path, filename)
    
    make_s3folder_v4(folder_path).then(
        (folder) ->
            folder.get_file_objs_by_name(filename, (err, objs)->
                if objs.length >= 1
                    callback(err, objs[0])
                else
                    callback(err, null)
            )
    )

promised_retrieve_file_obj = (file_path, callback) ->
    folder_path = path.dirname(file_path)
    filename    = path.basename(file_path)
    #console.log(folder_path, filename)
    
    make_s3folder_v4(folder_path).then(
        (folder) ->
            return new Promise(resolve, reject) ->
                folder.get_file_objs_by_name(filename, (err, objs)->
                    if objs.length >= 1
                        #callback(err, objs[0])
                        resolve(objs[0])
                    else
                        #callback(err, null)
                        reject(err)
                )
    )


# ------------------------------------------
# 
# Try not to modify the old, but add a name.
# Use the plain closure and object:
make_s3folder_v4a = (folder_path, callback) ->
    # callback not USED!

    _meta_  = {}
    _obj_   = {}
    _ready_ = 0
    _folder_css_file_name_ = ".gg.folder.css"
    _meta_css_file_name_   = ".gg.meta.css"



    # -- inner function definitions:

    read_file = (filename)->
        throw 'global objects must be _ready_.' if _ready_ < 1
        #p 'read file here'

        return new Promise( (resolve, reject)->
            get_file_objs_by_name(filename, (err, objs)->
                if objs.length >= 1
                    file = objs[0]
                    file.read_to_string( (str)->
                        resolve(str)
                    )
                else
                    reject(err)
            )
        )
        
    read_files = (filename)->
        throw 'global objects must be _ready_.' if _ready_ < 1
        #p 'read file here'

        return new Promise( (resolve, reject)->
            get_file_objs_by_name(filename, (err, objs)->

                # a function to read content from the file object:
                read_one = (file_obj, callback)->
                    file_obj.read_to_string (str)->
                        if str
                            callback(null, str)
                        else
                            callback('err happen?', null)

                async.map objs, read_one, (err, file_contents)->
                    if err
                        reject(err)
                    else
                        resolve(file_contents)

            )
        )

    # doing
    read_file_by_uuid = (uuid)->
        throw 'global objects must be _ready_.' if _ready_ < 1
        p 'read file here'

        get_file_obj_by_uuid(uuid).then(
            (file)->
                return new Promise( (resolve)->
                    file.read_to_string  (str)->
                        resolve(str)
                    
                )
        )
        


    write_text_file = (filename, text)->
        throw 'global objects must be _ready_.' if _ready_ < 1

        file_meta = {
            name : filename
            path : path.join(_meta_.path, filename)
            size : text.length
            owner: _meta_.owner
        }
        m = s3file.fix_file_meta(file_meta)
        return new Promise( (resolve, reject)->
            s3file.new_plain_file(text, m, (err, what)->
                if err
                    reject(err)
                else
                    resolve(what)
            )

        )




    get_file_obj_by_uuid = (uuid) ->
        throw 'global objects must be ready: _obj_, _meta_, _ready_' if _ready_ < 1

        throw "no such uuid in _meta_.files #{uuid}" if( not _meta_.files[uuid] )

        file_meta = _meta_.files[uuid]
        s3file.promised_simple_s3_file_obj(file_meta).then(
            (file_obj) ->
                file_obj
        )

    uuid_to_file_obj = (uuid, callback) ->
        file_meta = _meta_.files[uuid]
        s3file.simple_s3_file_obj(file_meta, callback)


    get_uuids = (name) ->
        #p "_meta_ in get uuids: ", _meta_
        uuid_list = _meta_.file_names[name]
        return uuid_list


    get_file_objs_by_name = (name, callback) ->
        # one name can give a list of file objects.
        throw 'global objects must be ready: obj, _meta_, ready' if _ready_ < 1

        uuid_list = get_uuids(name)
        throw "no file found by #{name}" if( not uuid_list )
        
        async.map(uuid_list, uuid_to_file_obj, callback)


    # Delete uuid and optionally 'name' from meta data
    _del_uuid_and_name = (uuid, name)->
        file_meta = _meta_.files[uuid]
        name = name || file_meta.name
        p '-- in del uuid and ... ', name
        delete _meta_.files[uuid] if _meta_.files[uuid]

        delete _meta_.file_uuids[uuid]
        delete _meta_.files[uuid]

        fn  = _meta_.file_names[name]
        return if not fn
        idx = fn.indexOf(uuid)
        p "fn, idx: ", fn, idx
        fn.splice(idx, 1) if idx?
        delete _meta_.file_names[name] if fn.length < 1


    delete_file_by_uuid = (uuid, callback)->

        #p "delete file by uuid: ", uuid

        #file_meta = _meta_.files[uuid]
        #return callback('no file meta got', null) if not file_meta
        #filename  = file_meta.name

        get_file_obj_by_uuid(uuid).then(
            (obj)->
                obj.delete_s3_storage()
        )

        _del_uuid_and_name(uuid)

        #p "delete file by uuid, filename: ", filename
        #delete _meta_.file_uuids[uuid]
        #delete _meta_.files[uuid]
        #fn = _meta_.file_names[filename]
        #idx= fn.indexOf(uuid)
        #p "fn, idx: ", fn, idx
        #fn.splice(idx, 1)
        #delete _meta_.file_names[filename] if fn.length < 1

        _obj_.build_file_list ()->
            _obj_.save_meta(callback)

    promise_to_delete_uuid = Promise.promisify delete_file_by_uuid

    _sleep = (seconds)->
        seconds = seconds || 1
        return new Promise (resolve)->
            setTimeout(resolve, seconds*1000)

    _empty_promise = new Promise(
        (resolve, reject)->
    )

    delete_name = (name)->
        uuids = _meta_.file_names[name]
        #p "del name: #{name} get uuids: ", uuids
        if not uuids? or not uuids or u.isEmpty uuids or uuids.length == 0
            return _empty_promise
        
        #for id in uuids
        while uuids.length > 0
            id = uuids[0]

            r = promise_to_delete_uuid(id).then(
                ()->
                    _sleep()
            ).catch(
                (err)->
                    # do nothing, try to continue
            )
        return r

    clear_empty_names = ()->
        p Object.keys _meta_.file_names
        for key in Object.keys _meta_.file_names
            p 'here: ', key
            uuids = _meta_.file_names[key]
            p "del key: #{key} get uuids: ", uuids
            if not uuids? or not uuids or u.isEmpty uuids or uuids.length == 0
                p 'try to delete: ', key
                delete _meta_.file_names[key] #if u.isEmpty uuids # useless after things right

        _obj_.build_file_list ()->
            _obj_.save_meta(callback)

    promise_to_clear_empty_names = Promise.promisify clear_empty_names


    build_fun = (uuid)->
        fun = (callback)->
            if not callback?
                callback = ()->
            p 'going to delete one.'
            delete_file_by_uuid(uuid, callback)

        return fun


    # Give a name, this try to delete all the files with the name.
    # The name should not contain path.
    # This use callback function, it makes logic easier.
    delete_file = (name, callback)->
        #p 'delete file ... files file_names file_uuids'
        uuids = _meta_.file_names[name]
        #p 'get uuids: ', uuids
        return callback("get no uuids for #{name}", null) if not uuids
        return callback("uuids has no 'length' for #{name}", null) if not uuids.length?

        funs = uuids.map(build_fun)
        async.series(funs, callback)

    list_files_and_save = (callback)->
        _obj_.build_file_list ()->
            _obj_.save_meta((err, meta)->
                callback(err, home_folder)
            )
    promise_to_list_files_and_save = Promise.promisify list_files_and_save

    # redo the fun

    _short_clone_of_folder_meta = (input_meta)->
        to_delete = ['files', 'file_uuids', 'file_names', 'renders']
        out_meta = JSON.parse(JSON.stringify(input_meta))
        to_delete.forEach (n)->
            delete  out_meta[n]
        return out_meta


    #add_folder = (name, callback)->
    #    #
    #    # Add folder of 'name', the folder will be created.
    #    # Do give a callback, callback(err, the-new-folder-obj).
    #    #
    #    folder_path = path.join(meta.path, name) # The abspath
    #    opt_ = {
    #        name : name,
    #        path : folder_path,
    #        uuid : myutil.get_uuid(),
    #        'parent-dir' : meta.path, # meta is of who adding the folder
    #        timestamp  : Date.now(),
    #        owner      : meta.owner,
    #        permission : {owner:'rwx', group:'', other:''},
    #        html: {},
    #    }

    #    build_new_folder(opt_).then(
    #        (new_folder_obj)->
    #            new_folder_obj.promise_to_list_files_and_save()
    #    ).then(
    #        ()->
    #            # The new folder saved, now add the new folder to the CURRENT folder:
    #            new_meta = _short_clone_of_folder_meta(new_folder_obj.get_meta())
    #            _add_file new_meta, ()->

    #                _save_meta  (err, what)->
    #                    callback(err, new_folder_obj)

    #    )
    #    # # to do : it's still callback

                

        

    #_promised_add_folder = Promise.promisify(_add_folder)



    # #

    modify_folder_object = (obj) ->
        obj.get_file_obj_by_uuid  = get_file_obj_by_uuid
        obj.get_file_objs_by_name = get_file_objs_by_name
        obj.get_uuids             = get_uuids
        obj.read_file_by_name     = read_file
        obj.read_files_by_name    = read_files
        obj.read_file_by_uuid     = read_file_by_uuid

        obj.delete_file           = delete_file
        obj.delete_name           = delete_name
        obj.delete_file_by_uuid   = delete_file_by_uuid
        obj.promise_to_delete_uuid= promise_to_delete_uuid

        obj.read_text_file        = read_file
        obj.write_text_file       = write_text_file

        obj.clear_empty_names     = clear_empty_names
        obj.promise_to_clear_empty_names = promise_to_clear_empty_names
        obj.promise_to_list_files_and_save = promise_to_list_files_and_save

    # -- end of inner function definitions.


    # return a promise:
    dir = null
    return promised_retrieve_folder(folder_path).then(
        (folder) ->
            # do things to modify the folder object: # ...

            modify_folder_object(folder)

            # put it module global:
            _obj_   = folder
            _meta_  = folder.get_meta()
            _ready_ = 1
            return _obj_
    ).then(
        (_obj_)->
            members = require "./members.js"
            dir = path.dirname(_meta_.path)
            _obj_.members_obj = members.make_members_obj(dir)
            return _obj_
    )

# --- end of make_s3folder_v4a ---


#doing
build_new_folder_and_save = (opt, callback)->
    make_s3folder_v4a(opt.path).then(
        (folder)->
            folder.init(opt)
            folder
    ).then(
        (folder)->
            folder.self_render_as_a_file()
            #folder.save_meta(callback)
            folder
    )

#doing
build_new_folder = (opt, callback)->
    make_s3folder_v4a(opt.path).then(
        (folder)->
            folder.init(opt)
            folder
    )


#doing 11 15
init_home_folder_11_15 = (username)->
    s3key = path.join(myconfig.meta_file_prefix, username)

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

    build_new_folder(folder_opt).then(
        (folder)->
            p 1
            Home = folder
            Home.promised_add_folder('goodagood')
    ).then(
        (g)->
            p 2
            Goodagood = g
            gm = g.get_meta()
            p 'goodagood meta: ', gm
            Goodagood.promised_add_folder('message')
    ).then(
        (msg)->
            p 3
            p 'msg obj: ', Object.keys(msg).sort()
            Goodagood.promised_add_folder('etc')
    ).then(
        ()->
            Goodagood.promise_to_list_files_and_save()

            #return new Promise( (resolve, reject)->
            #    Goodagood.build_file_list( ()->
            #        Goodagood.save_meta((err,obj)->
            #            if err
            #                reject()
            #            else
            #                resolve(Goodagood)
            #        )
            #    )
            #)
    ).then(
        ()->
            Home.promised_add_folder('public')
    ).then(
        ()->
            Home.promise_to_list_files_and_save()
    )
    ## build file list, save.


module.exports.old = old

module.exports.make_s3folder_v4  = make_s3folder_v4
module.exports.make_s3folder_v4a = make_s3folder_v4a

module.exports.retrieve_file_obj = retrieve_file_obj
module.exports.init_home_folder_11_15  = init_home_folder_11_15 #?
module.exports.build_new_folder_and_save  = build_new_folder_and_save #?

##
#- Keep the old things:
##

module.exports.make_s3folder = old.make_s3folder

module.exports.get_file_meta_by_path = old.get_file_meta_by_path

module.exports.retrieve_folder = old.retrieve_folder
module.exports.retrieve_folder_meta = old.retrieve_folder_meta
#module.exports.retrieve_file_obj    = old.retrieve_file_obj #
module.exports.retrieve_file_meta = old.retrieve_file_meta
module.exports.delete_file        = old.delete_file
module.exports.get_sorted_message_list_as_ul = old.get_sorted_message_list_as_ul
module.exports.init_home_folder              = old.init_home_folder
module.exports.init_home_folder_0927 = old.init_home_folder_0927
module.exports.get_file_uuid         = old.get_file_uuid
module.exports.get_file_meta_by_uuid = old.get_file_meta_by_uuid

