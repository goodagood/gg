#!/usr/bin/env ruby
#

project_dir   = "/home/ubuntu/workspace/gg"
log_file_path = "/tmp/pulljob"

branch_to_merge_from = "7188"

fetch_cmd = "git fetch"
merge_cmd = "git merge origin/#{branch_to_merge_from}"

reg = /\*.+#{branch_to_merge_from}/ 

# do fetching from origin, after cd the project directory.
fetched = %x<cd #{project_dir}; #{fetch_cmd}>
puts fetched

# check if we are not at the wrong branch 
branch_cmd = "git branch -a"
branches   = %x<#{branch_cmd}>
puts branches

if reg.match(branches)
    puts 'matched, not suppose to merge self'
    puts 'going to abort running'
    abort()
end


puts 'not finished? going to do merge'
merged  = %x<cd #{project_dir}; #{merge_cmd}>
puts merged

def append_log (msg)
    File.open(log_file_path, 'w'){|f|
        f.write(Time.new)
        f.write("\r\n")
        f.write(msg)
        f.write("\r\n" * 2)
    }
end

# to set this run every 10 minutes:
# crontab -u username -e
# */10 * * * * /path/to/this/script
