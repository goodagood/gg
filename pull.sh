#!/usr/bin/bash

# fetch from repository, merge the origin/7188 branch
# suppose to restart all applications
# this should be periodically running task
# crontab should be set

cd ~/workspace/gg
git fetch
git merge origin/7188
