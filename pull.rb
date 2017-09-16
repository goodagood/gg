#!/usr/bin/env ruby
#

project_dir   = "/home/ubuntu/workspace/gg"
$log_file_path = "/tmp/pulljob"

branch_to_merge_from = "7188"

fetch_cmd = "git fetch"
merge_cmd = "git merge origin/#{branch_to_merge_from}"

reg = /\*.+#{branch_to_merge_from}/ 


def append_log (msg)
    file_size = File.stat($log_file_path).size
    if file_size > 32000
        File.delete($log_file_path)
    end
    
    File.open($log_file_path, 'a'){|f|
        f.write(Time.new)
        f.write("\r\n")
        f.write(msg)
        f.write("\r\n" * 2)
    }
end


# do fetching from origin, after cd the project directory.
fetched = %x<cd #{project_dir}; #{fetch_cmd}>
#puts fetched
append_log(fetched)

# check if we are not at the wrong branch 
branch_cmd = "git branch -a"
branches   = %x<#{branch_cmd}>
#puts branches
append_log(branches)

if reg.match(branches)
    #puts 'matched, not suppose to merge self'
    append_log('matched, not suppose to merge self')
    #puts 'going to abort running'
    append_log('going to abort running')

    abort()
end


#puts 'not finished? going to do merge'
append_log('not finished? going to do merge')
merged  = %x<cd #{project_dir}; #{merge_cmd}>
#puts merged
append_log(merged)


# to set this run every 10 minutes:
# crontab -u username -e
# */10 * * * * /path/to/this/script
#
# To make nodemon respect .git changes, but not node_modules
# put $HOME/nodemon.json, 
# {
#   "ignoreRoot": ["node_modules"]
# }
#
# 2016 0107
