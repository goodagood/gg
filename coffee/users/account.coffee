
# Try to:
#   Upgrade from users/a.js
#   Use task passing to do user account management.
#
#   Wait to do after job of folder file list get more test.
#   11-13, 2014

a = require "./a.js"
bucket   = require('../aws/bucket.js')
task = require('../myutils/job.js')

#make_account_obj = (name, callback)->

request_new_user_account = (info, callback)->

    # info is user information, it should has:
    # username 
    # password
    # repeat_password 
    # referrer 

    make_new_user_data(info)

    job = JSON.stringify info

    bucket.write_json(info.s3key, info, (err, reply)->
      if(err)
        log28('write file info to s3 ERR', [info.s3key, info])
        return callback(err, null)
      
      task.pub_task(task.channel, job, callback)
    )


make_new_user_data = (info)->

    info.what = "new-user-info"
    info.timestamp = Date.now()

    info.uuid     = myutil.get_uuid()
  
    #info.meta_s3key = path.join(username, myconfig.new_meta_folder, meta.uuid_path);
    info.s3key = path.join(myconfig.new_user_prefix, info.username)
  
    return info;
