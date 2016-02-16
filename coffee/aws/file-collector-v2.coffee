#
# converted from file-collector.js
#

path = require("path")
async= require("async")
u    = require("underscore")
util = require('util')
fs   = require("fs")

bucket   = require("./bucket.js")
pubsub   = require("../myutils/pubsub.js")

myconfig =  require("../config/config.js")


#redis_host = myconfig.redis_host
#redis_port = myconfig.redis_port

#secrets = require("../config/secret-dir.js")
#redis_host = secrets.conf.redis.redis_host
#redis_port = secrets.conf.redis.redis_port

#redis    = require("redis")

#client   = redis.createClient(redis_port, redis_host)

redis_basic = require("../myutils/redis-basic.js")
client = redis_basic.client



avatar   = require("../users/avatar.js")

s3folder = require("./folder-v5.js")
s3file_type = require("./s3-file-types.js")

update   = require("./file-update.js")

ttools = require('../myutils/test-util.js')
p      = console.log




# ###########################################################################
# function 'collect one file' need 2 argument: job (json) in redis, new meta
# in s3 storage with name prefix, 'myconfig.new_meta_prefix'.  
# redis task id need to be include in the s3 meta, vice versa.
#
# job : redis record
# { name : #such as new-file-meta
#   task_name : same above
#   id :
#   task_id : # same above
#   meta_s3key : # the new meta, it's object will be deleted after processing
#   username : 
#   folder :
# }
#
# 0927, 2015
#    job: {
#        task_id: 'task.a.e80bad18-82ed-4d8d-8991-7e26ab1243af',
#        new_meta_s3key: '.gg.new/abc/add-2/e80bad18-82ed-4d8d-8991-7e26ab1243af',
#        name: 'new-file-meta',
#        username: 'abc',
#        folder: 'abc/add-2',
#        id: 'task.a.e80bad18-82ed-4d8d-8991-7e26ab1243af' 
#    } 
#
#
# meta: obj in s3 storage, referred by meta_s3key in the job above
# There is a sample:
#
# { name: 'tone3',
#   path: 'abc/tone3',
#   size: 59,
#   owner: 'abc',
#   dir: 'abc',
#   timestamp: 1416365776292,
#   uuid: '0154fa8c-40d5-4727-8eb9-7edc301e043a',
#   meta_s3key: '.gg.new/abc/0154fa8c-40d5-4727-8eb9-7edc301e043a',
#   initial_key: '.gg.new/abc/0154fa8c-40d5-4727-8eb9-7edc301e043a',
#   s3key: '.gg.file/abc/0154fa8c-40d5-4727-8eb9-7edc301e043a',
#   redis_task_id : # same above 2015 0926
#
#   storage:
#   { type: 's3',
#     key: '.gg.file/abc/0154fa8c-40d5-4727-8eb9-7edc301e043a'
#   }
# }
#
# 0927, 2015
#    meta: {
#        originalname: 'sa.js',
#        size: 526,
#        mimetype: 'application/javascript',
#        encoding: '7bit',
#        type: 'application/javascript',
#        name: 'sa.js',
#        local_file: '/tmp/42e162c01476a52cfb6b804a001d3aea',
#        path: 'abc/add-2/sa.js',
#        dir: 'abc/add-2',
#        owner: 'abc',
#        timestamp: 1443258904773,
#        uuid: 'e80bad18-82ed-4d8d-8991-7e26ab1243af',
#        new_meta_s3key: '.gg.new/abc/add-2/e80bad18-82ed-4d8d-8991-7e26ab1243af',
#        storage:
#        { type: 's3',
#            key: '.gg.file/abc/add-2/e80bad18-82ed-4d8d-8991-7e26ab1243af' },
#        redis_task_id: 'task.a.e80bad18-82ed-4d8d-8991-7e26ab1243af'
#    },
#
#
# @job : json of task. not used anymore 0927 2015.
# @meta: simple meta of the new file, by uploading.
#        meta.meta_s3key is `new` meta when passed in, it need change.
#
collect_one_file = (job, meta, callback) ->
    p 'in collect one file,\njob: ', job, '\nmeta: ', meta

    folder_path = meta['dir']
    if not folder_path
        p('2016 0209 got no folder path')
        folder_path = path.dirname(mata.path)
    if folder_path.endsWith('/') # This KILL me  5 days!!
        p('2016 0209 endsWith /    path')
        folder_path = folder_path.substring(0, folder_path.length - 1)

    filename    = meta.name
    #username    = meta['owner']

    p('2016 0209, going to retrieve_folder, ', folder_path)
    s3folder.retrieve_folder(folder_path).then((folder_obj)->
        p "got folder? 2016 0209"
        return callback("not folder object", null)  unless folder_obj

        if not folder_obj.file_exists filename
            p 'do the normal job, when file not exists', meta
            return collect_new_file_meta(meta, callback)

        if(folder_obj.file_identified_by_uuid())
            p 'check 2, file id.. by uuid ', u.isFunction(folder_obj.file_identified_by_uuid)
            return collect_new_file_meta(meta, callback)

        return update.update_file(meta, (err, what)->
            p '# This would be the default behavior, update file is exists.'
            return callback(err) if err
            p 'going to rm task data'
            delete_task_tmp_meta(meta.new_meta_s3key, meta.redis_task_id, callback)
        )

    ).catch(callback)


after_runner = require("../code/after.js")
collect_new_file_meta = (file_meta, callback)->
    #p 'do the new file collecting ', file_meta.storage

    #folder_path = folder_obj.get_meta().path #??
    folder_path = file_meta['dir']

    new_file_meta_s3key = file_meta.new_meta_s3key
    redis_task_id       = file_meta.redis_task_id

    delete file_meta.new_meta_s3key
    delete file_meta.redis_task_id

    s3file_type.file_obj_from_meta file_meta, (err, file_obj) ->
        #p('1, 0926 ', err, u.isObject(file_obj))
        return callback(err, null)  if err or not file_obj

        #p "file obj has function get_meta? : ", u.isFunction(file_obj.get_meta)
        #new_file_meta = file_obj.get_meta()
        ##console.log('file meta in collect one file, 1 \n', new_file_meta)
        
        # looks some file will not save by ' s3file_type.file_obj_from_meta ... '?
        # 2015 0929
        file_obj.save_file_to_folder().then((what)->

            # 2016 0123
            # we are going to insert here to run user's code for file uploading? 2016 0116
            # user code after uploading
            # we pass a call to the runner,  didn't give/wait the callback.
            after_runner.run_folder_code_after_upload(file_obj)

            delete_task_tmp_meta  new_file_meta_s3key, redis_task_id, callback
        ).catch(callback)



# same as the above, but don't need job (json)
#  -- 'collect one file' use empty job, it has been improved. 2015 0928
collect_meta = (meta, callback) ->
    # @job : json of task
    # @meta: simple meta of the new file, by uploading.
    #        meta.meta_s3key is `new` meta when passed in, it need change.

    #folder_path = job.folder
    folder_path = path.dirname(meta.path)
    p 0.1, ' collect meta ', meta

    key = meta.meta_s3key if meta.meta_s3key? # Some old code save 'initial key' in this name. 2015,Feb.
    key = meta.initial_key if meta.initial_key? # The key meta stored in s3.
    key = meta.new_meta_s3key if meta.new_meta_s3key? # I wieldly used a lot name.

    #username = job.username
    username = meta.owner
    # got quiet a few err, because not user-name in path.
    folder_path = username if folder_path is '.'

    s3file_type.file_obj_from_meta meta, (err, file_obj) ->
        return callback(err, null)  if err
        #p "file obj has function get_meta? : ", u.isFunction(file_obj.get_meta)
        file_meta = file_obj.get_meta()
        
        #console.log('file meta in collect meta, 1 \n', file_meta)
        p('folder_path, key, username: ', folder_path, key, username)

        s3folder.retrieve_folder(folder_path).then((folder_obj) ->
            return callback("not folder object", null)  unless folder_obj
            
            #console.log('folder meta in collect one : \n', folder_obj.get_meta())
            #p('folder meta path in collect one : \n', folder_obj.get_meta().path)
            delete file_meta.initial_key
            delete file_meta.meta_s3key
            delete file_meta.s3key
            delete file_meta.Meta_s3key

            _add_file_the_old_way username, file_meta, folder_path, folder_obj, (err, user) ->
                return callback(err, user)  if err#
                p 'going to deleting, the meta only, 02 07 2:11pm '

                bucket.delete_object key, (s3err, s3reply) ->
                    return callback(s3err, s3reply)  if s3err
                    callback(null, file_obj)

        )


collect_redis = (callback)->

    # Negative will give random task:
    pubsub.find_one_task -1, (err, task_json)->
        return callback(err, task_json) if err

        task_id = task_json.task_id
        s3key   = task_json.meta_s3key #d?
        s3key   = task_json.new_meta_s3key if task_json.new_meta_s3key
        #p 's3key, in "collecyt redis": ', s3key
        #p 't..id, in "collecyt redis": ', task_id
        #p 'task json:"collecyt redis": ', task_json
        return callback('NO S3KEY? what fuck in collect redis', null) if not s3key? or not s3key

        bucket.s3_object_exists(s3key, (err, s3check)->
            #p ' headobject: ', err, s3check
            if err
                delete_redis_key task_id, (redis_err, redis_reply)->
                    return callback([err, redis_err], [s3check, redis_reply])

            if(s3check.LastModified?)
                bucket.read_json s3key, (err, meta_) ->
                    return callback(err, meta_) if err
                    return callback('meta_.name not exists? in: collect redis', null) if (not meta_.name?) #?

                    collect_meta meta_, (err, file_obj)->
                        if (err)
                            p 'err in collect redis, 0207'
                            return callback(err, file_obj)

                        #return delete_redis_key(task_id, callback)
                        return client.del task_id, callback
            else
                # no meta exists?
                p 'delete redis record any way', task_id
                return client.del task_id, callback
                #return delete_redis_key(task_id, callback)

        )
    

#d 
delete_redis_key = (key, callback)->
    p 'delete redis key: ', key
    client.del key, callback
    #

_collect_all_new_files = (username) ->
    list_new_meta_data username, (err, meta, s3key) ->
        console.log "err in collect all new files: ", err    if err
        _collect_meta_file meta, (err, rep) ->
            return console.log(err, rep)    if err
            bucket.delete_object s3key, (s3err, s3reply) ->
                console.log "it deleted ", s3key    unless s3err









_collect_one_meta_key = (s3key) ->
    s3key = s3key or "abc/goodagood/.new/82cc923e-53de-477b-a8d6-36aba71e56eb"
    bucket.read_json s3key, (err, j) ->
        
        #console.log('read json key: ', key);
        return console.log("err, bucket.read json, key, err is: ", s3key, err)    if err
        console.log s3key, j
        _collect_meta_file j, (err, user) ->
            console.log "after collect one meta, user is: ", user
            bucket.delete_object s3key, (s3err, s3reply) ->
                console.log "it deleted"







#d?
_collect_meta_file = (meta, callback) ->
    folder_path = path.dirname(meta.path)
    username = meta.owner
    s3file_type.file_obj_from_meta meta, (err, file_obj) ->
        
        #_build_file_obj(meta, function(err, file_obj)
        return callback(err, null)    if err
        file_meta = file_obj.get_meta()
        
        #console.log('file meta: ', file_meta);
        _insert_to_file_list folder_path, file_meta, (err, folder_obj) ->
            return callback(err, null)    if err
            _add_file_the_old_way username, file_meta, folder_path, folder_obj, (err, user) ->
                return callback(err, null)    if err
                callback null, user







check_new_file_meta = (job_json, callback) ->
    
    # When new file put to s3, and a task published in 'tasks' channel.
    # This check in the meta, and put file data in folder.

    #!!only comment this return ... in testing, 2016 0205
    #return  callback('the name isnt: new-file-meta') if job_json.name isnt "new-file-meta"
    console.log "job json: ", job_json, ' in check new file meta' #-
    
    # before, the job_json.meta_s3key is the new meta in .new/user-name...
    # now, changed the name to new_meta_s3key
    bucket.read_json  job_json.new_meta_s3key, (err, meta) ->
        #console.log "read the NEW file meta:" #-
        console.log err, meta, ' read json in check new file meta' #-
        #return err    if err
        return callback(err)    if err
        #write_down_job_and_meta job_json, meta, "/tmp/s448", (->)

        console.log 'going to collect one: ', job_json, meta
        collect_one_file job_json, meta, (err, what)->
            #return console.log('ERR ERR, in "check new file meta":', err) if(err)
            if(err)
                console.log('ERR ERR, in "check new file meta":', err)
                return callback('ERR ERR, in "check new file meta":' + err.toString())

            console.log('finished: ', job_json.folder)
            callback(err, what)
        




write_down_job_and_meta = (job, meta, fpath, callback) ->
    
    # Used in testing, keep the information of job(task), meta
    console.log " --- in write down job and meta, it supposed to stop and check"
    fpath = fpath or "/tmp/jm" + Date.now().toString()
    text = "job\n"
    text += JSON.stringify(job, null, 4)
    text += "\n\nmeta\n"
    text += JSON.stringify(meta, null, 4)
    fs.appendFile fpath, text, callback



_insert_to_file_list = (folder_path, file_meta, callback) ->
    s3folder.retrieve_folder folder_path, (folder) ->
        return callback("err", null)    unless folder
        folder.add_file_to_redis_list file_meta, (err, reply) ->
            console.log "add file to redis list"
            callback err, folder






# folder.add file save folder will set locker,
# so not need to do the locking thing.
# 2015 0926
_add_file_the_old_way = (username, file_meta, folder_path, folder_obj, callback) ->
    avatar.make_user_obj username, (user) ->
        
        #p(' -- in the old way, username: ', username);
        #p('arguments: ', arguments);
        #p('user attr: ', user.pass_attr(function(){}));
        #p('user object: ', user);
        #p "show flags: ", user.show_flags(->)
        user.flag_up folder_path, (ok, flag_down) ->
            #p "ok? ", ok
            if ok
                p "flag up OK"
                folder_obj.add_file_save_folder file_meta, (err, _meta) ->
                    flag_down (err, reply) ->
                        callback err, user
            else
                err =  'flag up NOT ok, do something, the file not collected.\n' +
                       file_meta.path + '\n' +
                       username
                callback(err, null)
                        









# obviously, need do job better
delete_task_tmp_meta = (s3key, job_id, callback) ->
    bucket.delete_object s3key, (s3err, s3reply) ->
        
        console.log('deleted meta file in coll. 2 0927 ', s3key);
        client.del job_id, (redis_err, redis_reply) ->
            
            console.log('deleted redis task rec', job_id);
            return callback(s3err)    if s3err
            return callback(redis_err)    if redis_err
            callback null







do_all_tasks = ->
    client.keys "task.a*", (err, reply) ->
        
        #console.log(err, reply);
        #fs.writeFile('/tmp/tl', reply.join('\n'));
        return err    if err
        u.each reply, (key) ->
            console.log "key    ", key
            test_collect_one key







test_collect_one = (key) ->
    
    # task records in redis is simple string by JSON.stringify
    key = key or "task.a.7101b570-a8ac-4e3b-a762-b53154d1c0fb"
    client.hgetall key, (err, hash) ->
        
        #console.log(err, hash);
        return err    if err
        check_new_file_meta hash






something_test = (jobjson) ->
    console.log "jobjson: ", jobjson



list_new_meta_data = (username, callback) ->
    #prefix = path.join(username, myconfig.new_meta_folder)

    # should change to new_meta_prefix? 0206
    if username
        prefix = path.join(myconfig.new_meta_prefix, username)
    else
        prefix = myconfig.new_meta_prefix

    #console.log('prefix: ', prefix)

    bucket.list prefix, (err, file_list) ->
        
        # Error
        return callback(err, file_list) if err

        return callback(err, file_list) if(callback)



do_s3_job = (s3_info, callback)->
    # @s3_info : information got from s3, list with prefix

    s3key = s3_info.Key
    bucket.read_json(s3key, (err, meta)->
        console.log('bucket read json err:', err, meta) if err#
        return callback(err, meta) if err#

        console.log('going to "collect meta":\n', meta)

        collect_meta(meta, callback)
    )


# finish all the new meta jobs for user
do_s3_jobs = (username, callback) ->
    #username = username or "abc"
    milli    = 5000
    list_new_meta_data username, (err, list) ->
        return p("fuck, work in finish...")  if err
  
        functions = []
        u.each list, (item) ->
            # push a function for each item
            functions.push(
                (cb) ->
                    do_s3_job item, (err, f) ->
                        p "done s3 job:", item.Key
                        remember = ()->
                            cb(err, item.Key)
                        setTimeout(remember, milli)
            )
  
        callback(null, ['no thing to do']) if functions.length < 1
        # do the jobs in series
        async.series(functions, callback)




module.exports.check_new_file_meta = check_new_file_meta
module.exports.collect_one_file = collect_one_file
module.exports.add_file_the_old_way = _add_file_the_old_way
module.exports.something_test = something_test

# export for testing
module.exports.collect_meta  = collect_meta
module.exports.collect_redis = collect_redis
module.exports.list_new_meta_data = list_new_meta_data
module.exports.do_s3_job = do_s3_job
module.exports.do_s3_jobs = do_s3_jobs

module.exports.delete_task_tmp_meta = delete_task_tmp_meta

# # checkings # #

# tmp data for testing, 12 03



job2 = {
    "name": "new-file-meta",
    "task_name": "new-file-meta",
    "username": "abc",
    "folder": "abc/goodagood",
    "meta_s3key": ".gg.new/abc/goodagood/a5437410-2d5a-4bb7-b860-ecfe5fe8b400",
    "id": "task.a.efbd43a5-7381-40d6-88ed-ed0b6ddab2df",
    "task_id": "task.a.efbd43a5-7381-40d6-88ed-ed0b6ddab2df"
}
#p 'fuck, this should be job2:', job2

meta2 = {
    "name": ".gg.people.v1.json",
    "path": "abc/goodagood/.gg.people.v1.json",
    "size": 112,
    "owner": "abc",
    "dir": "abc/goodagood",
    "timestamp": 1418877986342,
    "uuid": "a5437410-2d5a-4bb7-b860-ecfe5fe8b400",
    "meta_s3key": ".gg.new/abc/goodagood/a5437410-2d5a-4bb7-b860-ecfe5fe8b400",
    "initial_key": ".gg.new/abc/goodagood/a5437410-2d5a-4bb7-b860-ecfe5fe8b400",
    "s3key": ".gg.file/abc/goodagood/a5437410-2d5a-4bb7-b860-ecfe5fe8b400",
    "storage": {
        "type": "s3",
        "key": ".gg.file/abc/goodagood/a5437410-2d5a-4bb7-b860-ecfe5fe8b400"
    }
}

stop = (seconds) ->
    seconds = seconds || 0.5
    milli   = seconds * 1000 # milli-seconds
    setTimeout process.exit, milli


check_collect_one = ()->
    #p 'job2?:', job2, 'meta:\n', meta2
    collect_one_file(job2, meta2, (err, folder)->
        p 'check collect one: \n', err, folder
        stop(15)
    )

check_retrieve_the_folder = (folder_path)->
    folder_path = folder_path || 'abc/goodagood'
    s3folder.retrieve_folder(folder_path).then((folder_obj) ->
        p 'is object? : ', u.isObject(folder_obj)
        meta = folder_obj.get_meta()
        p meta
        stop()
    )


ends_with = (str, part)->
    # slice the length of 'part' from the end, it should be 'part'
    return str.slice( - part.length) is part

check_new_meta = (username) ->
    # 
    # checking metas left by time.
    #
    # from parse.js  make_basic_file_meta:
    # meta.new_meta_s3key = path.join(myconfig.new_meta_prefix, meta.dir, meta.uuid);
    #

    prefix = path.join(myconfig.new_meta_prefix, username)

    #prefix = path.join(username, myconfig.new_meta_folder)
    bucket.list prefix, (err, file_list) ->
        
        return console.log 'err: ', err    if err
        console.log('got file list' )
        #console.log err, file_list

        u.each file_list, (data) ->
            # this is a function
            key = data.Key
            omits = ['tmpab', 'goodagood', '/']
            trues = omits.map( (omit)->
                ends_with(key, omit)
            )
            return console.log('return for key: ', key) if true in trues
            
            #if(key === prefix) return; // prefix is not what we want.
            return    if path.basename(key) is path.basename(prefix) # prefix is not what we want.
            fs.appendFile "/tmp/tmpabnew", key + "    \n"
            
            #console.log('key: ', key);
            bucket.read_json key, (err, j) ->
                
                #console.log('read json key: ', key);
                if err
                    #callback err, null, key
                    return console.log("err, bucket.read json, key, err: ", key, err)
                
                console.log(key, j.name, j.path)
                fs.appendFile "/tmp/tmpabnew", util.inspect(j, {depth:null}) + "\n\n"
                #callback null, j, key    if callback

        ttools.stop(30)


check_new_metas = ()->
    list_new_meta_data(null, (err, file_list)->
        p('err, file list: ', err, file_list)

        # make functions
        funs = u.map(file_list, (s3info)->
            return (callback)->
                do_s3_job(s3info, callback)
        )

        async.series(funs, (err, what)->
            ttools.stop()
        )
    )


check_the_err = ()->
    # null is for all user
    list_new_meta_data(null, (err, file_list)->
        p('err, file list: ', err, file_list)

        f0 = file_list[0]

        do_s3_job(f0, (err, what)->
            p('do s3 job without s', err, what)
            ttools.stop()
        )
    )


check_new_config_file = ()->
    p redis_host
    p redis_port


if require.main is module
    
    #check_collect_one()
    #check_retrieve_the_folder()
    #list_new_meta_data('abc')
    #check_new_metas()
    #check_the_err()

    
    #_collect_one_meta_key();
    #_collect_all_new_files('abc');
    #do_all_tasks()
    
    #test_collect_one();
    #check_new_meta('tmpab')

    check_new_config_file()


  
