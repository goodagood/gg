#!/usr/bin/env ruby
#

project_dir = "/home/ubuntu/workspace/gg"

fetch_cmd = "git fetch"
merge_cmd = "git merge origin/7188"

fetched = %x<cd #{project_dir}; #{fetch_cmd}>
puts fetched

merged  = %x<cd #{project_dir}; #{merge_cmd}>
puts merged

