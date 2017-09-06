##
# Trying to transfer members of folder here.  # 1029
#
# todo: 
#     member file need: LOCK, to add member conncurrently
#     put it to task when adding/delete member
##


u       = require "underscore"
fs      = require "fs"
Promise = require "bluebird"
async   = require "async"
#path    = require "path"

s3folder = require "./folder-v5.js"
bucket   = require "./bucket.js"


p = console.log
stop = () ->
    setTimeout process.exit, 500


Members_file_name = '.gg.members.json'

Viewers_file_name = '.gg.viewers.json'

# -- The wrapper, try to use closure all the way -- #
make_members_obj = (Dir) ->
    ##
    # Module globals:
    ##
    # Folder object:
    Folder = null

    empty_content = {
        members : []
        viewers : []
    }

    # This must be done every time
    init_folder = ()->
        s3folder.retrieve_folder(Dir).then(
            (folder)->
                Folder = folder
                return Folder
        )

    folder_initialized = ()->
        return false if (u.isNull(Folder))
        return true

    show_folder = ()->
        p ('folder object in "make members obj", Dir: ' + Dir)
        p (Folder)


    # Do this one time for each folder needed
    init_members_file = ()->

        content = {
            members : []
            viewers : []
        }
        text = JSON.stringify(content)

        if Folder == null
            return throw 'have no folder object in "init members file exists"'

        check_members_file_exists().then((exists)->
            return Promise.reject('member file already exists') if exists

            Folder.write_text_file(Members_file_name, text) # this is a promise
        )


    reset_members_file = ()->
        promise_to_write_file(empty_content)

    get_file_obj = ()->
        Folder.promise_to_one_file_obj(Members_file_name).then((file)->
            #p('get file obj:\n', file)
            file
        )


    #  We need update, not write!
    write_file = (json, callback)->
        text = JSON.stringify(json)
        get_file_obj().then((file)->
            meta = file.get_meta()
            bucket.write_text_file(meta.storage.key, text, (err,reply)->
                meta.timestamp = Date.now()
                meta.lastModifiedDate = Date.now()
                Folder.add_file_save_folder(meta, callback)
            )
        )
        #//Folder.write_text_file(Members_file_name, text) # this is a promise

    promise_to_write_file = Promise.promisify write_file

    add_member = (name)->
        get_json().then((j)->
            #p 'json in add member:\n', j
            j.members.push(name) if j.members.indexOf(name) < 0
            #j.members = u.uniq(j.members) #.
            j
        ).then((j)->
            write_file(j)
        )

    add_viewer = (name)->
        get_json().then((j)->
            #p 'json in add member:\n', j
            j.viewers.push(name) if j.members.indexOf(name) < 0
            #j.members = u.uniq(j.members) #.
            j
        ).then((j)->
            write_file(j)
        )

    del_member = (name)->
        get_json().then((j)->
            #p 'json in del member:\n', j
            ind = j.members.indexOf(name)
            p 'in del member, index to delete:\n', ind
            
            # return if there is no name need to del
            return j if ind < 0

            j.members.splice(ind, 1)
            #j.members = u.uniq(j.members) #.
            p 'in del member, after delete:\n', j
            j
        ).then((j)->
            write_file(j)
        )

    has_member = (name)->
        # This is a promise, must 'then' to get the result
        get_json().then((j)->
            #p 'in has member:\n', j
            #p 'index of name is  :\n', j.members.indexOf(name)
            if j.members.indexOf(name) < 0
                return false
            else
                #p 'has'
                return true
        )


    check_members_file_exists = ()->

        if Folder == null
            return throw 'have no folder object in "check members file exists"'

        exists = Folder.file_exists(Members_file_name)

        return Promise.resolve(exists)

    
    delete_file = ()->
        folder_ = null
        s3folder.retrieve_promisified_folder(Dir).then(
            (folder)->
                folder_ = folder
                folder.get_uuids(Members_file_name)
        ).then(
            (uuid_list)->
                p 'the list in "delete file": \n', uuid_list
                if u.isArray uuid_list
                    if uuid_list.length >= 1
                        return folder_.delete_uuid_promised(uuid_list[0])
                return Promise.resolve('nothing deleted')
        )
        
    get_number_of_member_file = ()->
        uuid_list = Folder.get_uuids(Members_file_name)
        #p 'the list: \n', uuid_list
        if not u.isArray uuid_list
            throw 'not a list in "get number of member file"'
        return uuid_list.length

    # 12 16, 02 11, 
    keep_only_one_member_file = ()->
        s3folder.retrieve_folder(Dir).then(
            (folder)->
                folder.get_uuids(Members_file_name)
        ).then(
            (uuid_list)->
                p 'the list: \n', uuid_list
                if not u.isArray uuid_list
                    return Promise.resolve 'not a list in "keep only one mem.."'
                len = uuid_list.length
                if len > 1
                    # space will make len be taken as fun. such as: len - 1
                    size = len-1
                    counts = [1..size]
                    

                    # before sleep, this not work for more than 2 delete,
                    # should be writing conflicts.
                    # sleep is temp solution, not tested.
                    tool  = require("../myutils/test-util.js")
                    # Map it to 'delete file' function list:
                    funs = [2..len].map( (num)->
                        tool.promise_to_sleep(15).then(()->
                            delete_file()
                        ).then((what)->
                            callback(null, what)
                        )
                    )
                    p 'funs: ', funs
                    async.series funs
        )
         

    get_text = ()->
        throw 'no folder? when "get text"' if not Folder

        # this returns a promise:
        Folder.read_text_file(Members_file_name)

    get_json = ()->
        get_text().then((text)->
            json = JSON.parse(text)
        )

    #refresh_read_json = ()->
        


    show_members_file = ()->
        s3folder.retrieve_folder(Dir).then(
            (folder)->
                #p 'in show mem...'
                folder.read_text_file(Members_file_name)
        ).then(
            (str)->
                # to do the show:
                p 'The file contents:\n', str
                str
        )

    is_owner = (name) ->
        right = Folder.is_owner(name)
        return Promise.resolve(right)


    # to test
    has_viewer = (viewer_name) ->
        # This is a promise, must 'then' to get the result
        get_json().then((j)->
            #p 'in has viewer:\n', j
            #p 'index of name is  :\n', j.viewers.indexOf(name)

            # "*", the star means everyone can view:
            return true if(j.viewers.indexOf('*') > 0)

            if j.viewers.indexOf(viewer_name) < 0
                return false
            else
                #p 'has'
                return true
        )

    check_user_role = (name, callback)->
        # A stupid way to check user's role,
        # asychronous promise code make things awkword.

        Determined = false
        is_owner(name).then((is_owner)->
            #p 'see, if is owner: ', is_owner
            if(is_owner)
                Determined = true
                return callback(null, 'owner')
        ).then((what)->
            if(Determined)
                return Determined
            else
                #p('i did not return,', 1)
                return has_member(name)
        ).then( (has_member)->
            return Determined if(Determined)

            if has_member
                #p('i did not return,', 2)
                Determined = true
                callback(null, 'member')
        ).then((what)->
            return Determined if(Determined)
            #p('checking if is viewer,', 3)
            return has_viewer(name)
        ).then((has_viewer)->
            return Determined if Determined
            if has_viewer
                #p('you are viewer,', 4)
                Determined = true
                callback(null, 'viewer')
        ).then((what)->
            return Determined if Determined
            return callback(null, 'who-known') if not Determined
        )


    _obj_ = {
        folder            : Folder
        init_folder       : init_folder
        folder_initialized: folder_initialized
        init_members_file : init_members_file
        show_members_file : show_members_file
        check_members_file_exists : check_members_file_exists
        get_number_of_member_file : get_number_of_member_file

        is_owner    : is_owner
        has_viewer  : has_viewer
        add_viewer  : add_viewer

        keep_only_one_member_file : keep_only_one_member_file
        delete_file       : delete_file
        get_json          : get_json
        add_member        : add_member
        del_member        : del_member
        get_file_obj      : get_file_obj
        has_member        : has_member

        check_user_role   : check_user_role

        reset_members_file: reset_members_file

        # exposed during test
        show_folder : show_folder
    }
    return _obj_


promised_member_obj = (dir)->
    obj = make_members_obj(dir)
    Promise.resolve(obj)

retrieve_member_obj = (dir)->
    Member_obj = null
    promised_member_obj(dir).then(
        (obj)->
            Member_obj = obj
            Member_obj.init_folder()
    ).then(
        (folder)->
            return Member_obj
    )


    #  // added from 'team-folder', all folders need these functionalities
    #  // question this is necessary for all folder? 0920
    #
    #  function _init_members_file(){
    #    meta.is_team_folder = true;
    #    //var file_name = '.members.json';
    #    var content = [];
    #    //if(meta.owner && meta.owner.username) owner_name = meta.owner.username;
    #    if(meta.owner && meta.owner.username) content.push(meta.owner.username);
    #    _new_json_file(members_file_name, content);
    #  }
    #
    #  function _add_members(name_list, callback){
    #    if( ! _is_file_exists(members_file_name)) _init_members_file();
    #    if( !u.isArray(name_list) ) return callback(null);
    #
    #    _get_file_obj(members_file_name, function(member_file_obj){
    #      member_file_obj.get_json(function(j){
    #        j = u.union(j, name_list);
    #        //if(j.indexOf(member_name) < 0) j.push(member_name);
    #        console.log(j);
    #        member_file_obj.write_json(j);
    #        _add_file_obj_save_folder(member_file_obj, function(){
    #          if(callback) callback();
    #        });
    #        //_add_file(member_file_obj.get_meta());
    #        //_save_meta();
    #      });
    #    });
    #  }
    #
    #
    #  function _delete_members(name_list, callback){
    #    _get_file_obj(members_file_name, function(member_file_obj){
    #      member_file_obj.get_json(function(j){
    #        j = u.difference(j, name_list);
    #        //console.log('_delete members', j);
    #        member_file_obj.write_json(j);
    #        _add_file_obj_save_folder(member_file_obj, function(){
    #          if(callback) callback(j);
    #        });
    #      });
    #    });
    #  }
    #
    #  
    #
    #  function _get_all_members(callback){
    #    //if( ! _is_file_exists(members_file_name)) _init_members_file();
    #    if( ! _is_file_exists(members_file_name)) return callback(null);
    #
    #    _get_file_obj(members_file_name, function(member_file_obj){
    #      member_file_obj.get_json(callback);
    #    });
    #  }
    #
    #  function _has_member(username, callback){
    #    if(typeof meta.is_team_folder === 'undefined') return callback(false);
    #    if(!meta.is_team_folder)                       return callback(false);
    #    if( ! _is_file_exists(members_file_name))      return callback(false);
    #
    #    _get_file_obj(members_file_name, function(member_file_obj){
    #      if(!member_file_obj) return callback(false);
    #      member_file_obj.get_json(function(j){
    #        //log28('member file get json', j);
    #        //log28('j is arry', u.isArray(j));
    #        if(!u.isArray(j)) return callback(false);
    #        if(j.indexOf(username) >=0) return callback(true);
    #        if(j.indexOf('*') >= 0) return callback(true);
    #        return callback(false);
    #      });
    #    });
    #  }
    #
    #  ----
    #
    #  function _init_viewers_file(){
    #    meta.is_open_folder = true;
    #    var content = [];
    #    _new_json_file(viewers_file_name, content);
    #    //meta.
    #  }
    #
    #  function _add_viewers(name_list, callback){
    #    if( ! _is_file_exists(viewers_file_name)) _init_viewers_file();
    #    if( !u.isArray(name_list) ) return callback(null);
    #
    #    _get_file_obj(viewers_file_name, function(viewer_file_obj){
    #      viewer_file_obj.get_json(function(j){
    #        j = u.union(j, name_list);
    #        //console.log(j);
    #        viewer_file_obj.write_json(j);
    #        _add_file_obj_save_folder(viewer_file_obj, function(){
    #          if(callback) callback(j);
    #        });
    #      });
    #    });
    #  }
    #
    #  function _delete_viewers(name_list, callback){
    #    if( ! _is_file_exists(viewers_file_name)) _init_viewers_file();
    #
    #    _get_file_obj(viewers_file_name, function(viewer_file_obj){
    #      viewer_file_obj.get_json(function(j){
    #        j = u.difference(j, name_list);
    #        //console.log('_delete viewers', j);
    #        viewer_file_obj.write_json(j); //?
    #        _add_file_obj_save_folder(viewer_file_obj, function(){
    #          if(callback) callback();
    #        });
    #      });
    #    });
    #  }
    #
    #
    #  function _get_all_viewers(callback){
    #    if( ! _is_file_exists(viewers_file_name)) _init_viewers_file();
    #
    #    _get_file_obj(viewers_file_name, function(viewer_file_obj){
    #      viewer_file_obj.get_json(callback);
    #    });
    #  }
    #
    #  function _has_viewer(username, callback){
    #    if(typeof meta.is_open_folder === 'undefined') return callback(false);
    #    if(!meta.is_open_folder)                       return callback(false);
    #    if( ! _is_file_exists(viewers_file_name))      return callback(false);
    #
    #    _get_file_obj(viewers_file_name, function(viewer_file_obj){
    #      viewer_file_obj.get_json(function(j){
    #        if(!u.isArray(j))           return callback(false);
    #        if(j.indexOf(username) >=0) return callback(true);
    #        if(j.indexOf('*') >= 0)     return callback(true);
    #
    #        return callback(false);
    #      });
    #    });
    #  }



module.exports.make_members_obj = make_members_obj
module.exports.promised_member_obj = promised_member_obj

module.exports.retrieve_member_obj = retrieve_member_obj


# # checkings: # #
p = console.log
stop = () ->
    setTimeout process.exit, 500

# testing parameters
test_folder_name  = 'abc'
_test_folder_name = 'abc'


check_show_the_file = (dir)->
    dir = dir || test_folder_name

    Mobj = null
    retrieve_member_obj(dir).then(
        (mobj)->
            Mobj = mobj
            mobj.check_members_file_exists()
    ).then(
        (exists)->
            p "exists: #{exists}"
            throw 'members file not exists' if not exists
    ).then( ()->
        Mobj.show_members_file()
    ).then(stop)



check_init_folder = (dir)->
    #make_members_obj(dir)
    promised_member_obj(dir).then(
        (mobj)->
            p '1 member object: ', mobj
            mobj
    ).then(
        (mobj)->
            mobj.init_folder()
    ).then(
        (folder)->
            p '3 folder:'
            folder
    ).then(
        (f)->
            fm = f.get_meta()
            p 'name: ', fm.name
            p 'uuid: ', fm.uuid

    ).then( stop)


test_member_file_exists = (dir)->
    #
    dir = dir || test_folder_name

    #promised_member_obj(dir).then(
    retrieve_member_obj(dir).then(
        (mobj)->
            mobj.check_members_file_exists()
    ).then(
        (exists)->
            p "exists: #{exists}"
    ).then(stop)
    

check_init_member_f = (dir)->
    dir = dir || test_folder_name

    member_obj = null
    retrieve_member_obj(dir).then(
        (mobj)->
            member_obj = mobj
            mobj.init_members_file()
    ).then(
        (what)->
            p 'you got what: ', what
    ).then(
        ()->
            member_obj.check_members_file_exists()
    ).then(
        (exists)->
            p "exists: #{exists}"
    ).then(stop)

check_delete = (dir)->
    dir = dir || test_folder_name

    member_obj = null
    retrieve_member_obj(dir).then(
        (obj)->
            member_obj = obj
            obj.delete_file()
            #p obj
    ).then(
        (what)->
            p 1, ' ', what
    ).then(
        ()->
            stop()
    )

check_reset = (dir)->
    dir = dir || test_folder_name

    member_obj = null
    retrieve_member_obj(dir).then(
        (mobj)->
            member_obj = mobj
            mobj.reset_members_file()
    ).then(
        (what)->
            p 'you got what in "check reset": ', what
    ).then(stop)

# do the self checkings:
if require.main is module
    #check_delete()
    #check_init_member_f()
    check_reset()
    #
    #check_init_folder(test_folder_name)
    #test_member_file_exists('abc')
    #check_how_many_members_file()
    #check_show_the_file()

# todos:
# testing functions about viewers
